import { authService } from '../services/authService.js';

const loginForm = document.getElementById('loginForm');
const mensajeError = document.getElementById('mensajeError');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // 🔍 Extraemos los valores usando .value
    const cedula = document.getElementById('cedula').value;
    const clave = document.getElementById('clave').value;

    try {
        // Llamamos al servicio para validar
        const usuario = await authService.login(cedula, clave);
        
        console.log('Login exitoso:', usuario);
        
        // Guardamos al usuario en la memoria del navegador (SessionStorage)
        sessionStorage.setItem('usuarioLogueado', JSON.stringify(usuario));

        // 🔀 Redirección según el rol
        redirigirSegunRol(usuario.rol);

    } catch (error) {
        // Si hay error, mostramos el mensaje rojo del HTML
        mensajeError.style.display = 'block';
        mensajeError.innerText = error.message;
    }
});

function redirigirSegunRol(rol) {
    if (rol === 'ADMINISTRADOR' || rol === 'OPERADOR') {
        window.location.href = 'administrador.html';
    } else {
        window.location.href = 'socio.html';
    }
}