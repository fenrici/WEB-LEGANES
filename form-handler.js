// Configurar la URL de redirección de Formspree solo si estamos en GitHub Pages o Netlify
document.addEventListener('DOMContentLoaded', function() {
    // Buscar el campo de redirección
    const nextInput = document.querySelector('input[name="_next"]');
    if (nextInput) {
        // Construir una URL absoluta basada en la URL actual
        const baseUrl = window.location.href.split('/').slice(0, -1).join('/') + '/';
        nextInput.value = baseUrl + 'gracias.html';
        console.log('URL de redirección configurada:', nextInput.value);
    }

    // Manejo del formulario
    const form = document.getElementById('application-form');
    const formStatus = document.getElementById('form-status');
    
    if (form) {
        // Crear un evento personalizado para el envío exitoso del formulario
        const formSubmitEvent = new CustomEvent('formSubmit:success');
        
        // Reemplazar el comportamiento nativo de submit
        form.addEventListener('submit', function(e) {
            // Evitar el envío del formulario por defecto
            e.preventDefault();
            
            // Verificar si el formulario ya fue validado por form-validation.js
            const isValidated = form.getAttribute('data-validated') === 'true';
            
            // Si no hay validación externa o ya fue validado correctamente
            if (isValidated || !window.formValidationActive) {
                // Mostrar mensaje de carga
                if (formStatus) {
                    formStatus.style.display = 'block';
                    formStatus.style.backgroundColor = '#f8f9fa';
                    formStatus.textContent = 'Enviando formulario...';
                }
                
                // Recopilar datos del formulario
                const formData = new FormData(form);
                
                // Imprimir datos para depuración
                console.log('Enviando formulario a:', form.action);
                for (let pair of formData.entries()) {
                    console.log(pair[0] + ': ' + pair[1]);
                }
                
                // Deshabilitar el botón de envío para evitar múltiples envíos
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = true;
                    const originalText = submitButton.innerHTML;
                    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
                    
                    // Restaurar el botón después de 10 segundos si algo sale mal
                    setTimeout(() => {
                        if (document.contains(submitButton) && submitButton.disabled) {
                            submitButton.disabled = false;
                            submitButton.innerHTML = originalText;
                        }
                    }, 10000);
                }
                
                // Hacer la petición a Formspree
                fetch(form.action, {
                    method: form.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    console.log('Status de respuesta:', response.status);
                    return response.json();
                })
                .then(data => {
                    console.log('Respuesta completa:', data);
                    if (data.ok) {
                        // Disparar evento de éxito
                        document.dispatchEvent(formSubmitEvent);
                        
                        // Redirigir manualmente a la página de gracias
                        window.location.href = form.querySelector('input[name="_next"]').value;
                    } else {
                        // Mostrar error
                        if (formStatus) {
                            formStatus.style.backgroundColor = '#f8d7da';
                            formStatus.textContent = 'Hubo un problema al enviar el formulario. Por favor, inténtalo de nuevo.';
                        }
                        
                        // Restaurar el botón de envío
                        if (submitButton) {
                            submitButton.disabled = false;
                            submitButton.innerHTML = originalText || 'Enviar Solicitud';
                        }
                        
                        console.error('Error en el envío:', data.error);
                    }
                })
                .catch(error => {
                    console.error('Error de conexión:', error);
                    
                    if (formStatus) {
                        formStatus.style.backgroundColor = '#f8d7da';
                        formStatus.textContent = 'Error de conexión. Por favor, inténtalo de nuevo.';
                    }
                    
                    // Restaurar el botón de envío
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.innerHTML = originalText || 'Enviar Solicitud';
                    }
                });
            }
        });
    }
    
    // Comprobamos si venimos de un envío exitoso (para el mensaje de éxito)
    if (window.location.search.includes('success=true')) {
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.innerHTML = '<i class="fas fa-check-circle"></i> ¡Formulario enviado con éxito!';
        document.body.appendChild(successMsg);
        
        // Eliminamos el parámetro de la URL para no mostrar el mensaje en recargas
        if (window.history && window.history.replaceState) {
            const url = window.location.href.replace(/[\?&]success=true/, '');
            window.history.replaceState({}, document.title, url);
        }
        
        // Eliminamos el mensaje después de 5 segundos
        setTimeout(() => {
            if (document.contains(successMsg)) {
                successMsg.remove();
            }
        }, 5000);
    }
}); 