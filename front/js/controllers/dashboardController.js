// dashboardController.js 🎮

// 1. El Portero: Revisa la sesión apenas carga la página 💂‍♂️
function verificarSesion() {
    const datosGuardados = sessionStorage.getItem('usuarioLogueado');

    if (!datosGuardados) {
        // Si no hay nadie en la memoria, directo al login
        alert("Acceso denegado. Por favor, inicia sesión.");
        window.location.href = '../index.html';
        return;
    }

    const usuario = JSON.parse(datosGuardados);
    console.log("Sesión activa para: " + usuario.cedula);
}

// Ejecutamos la verificación automáticamente
verificarSesion();

// 2. Botón Salir: Limpia todo y nos expulsa 🚪
const btnSalir = document.getElementById('btnSalir');

if (btnSalir) {
    btnSalir.addEventListener('click', () => {
        sessionStorage.removeItem('usuarioLogueado');
        window.location.href = '../index.html';
    });
}