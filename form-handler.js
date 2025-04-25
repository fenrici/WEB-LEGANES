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
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Mostrar mensaje de carga
            formStatus.style.display = 'block';
            formStatus.style.backgroundColor = '#f8f9fa';
            formStatus.textContent = 'Enviando formulario...';
            
            // Recopilar datos del formulario
            const formData = new FormData(form);
            
            // Imprimir datos para depuración
            console.log('Enviando formulario a:', form.action);
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
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
                    // Redirigir manualmente a la página de gracias
                    window.location.href = form.querySelector('input[name="_next"]').value;
                } else {
                    // Mostrar error
                    formStatus.style.backgroundColor = '#f8d7da';
                    formStatus.textContent = 'Hubo un problema al enviar el formulario. Por favor, inténtalo de nuevo.';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                formStatus.style.backgroundColor = '#f8d7da';
                formStatus.textContent = 'Error de conexión. Por favor, inténtalo de nuevo.';
            });
        });
    }
}); 