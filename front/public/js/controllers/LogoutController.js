import { AuthService } from '../services/AuthService.js';

export const LogoutController = {
    init() {
        const logoutBtn = document.querySelector('.btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.toggleLogoutModal(true));
        }

        const confirmBtn = document.querySelector('.btn-modal-confirm-blue');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                AuthService.logout();
            });
        }

        const cancelBtn = document.querySelector('.logout-modal .btn-modal-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.toggleLogoutModal(false));
        }
    },

    toggleLogoutModal(show) {
        const modal = document.querySelector('.logout-modal');
        if (modal) modal.style.display = show ? 'flex' : 'none';
    },

    redirigirAInicioSesion() {
        sessionStorage.clear();
        window.location.href = '../index.html';
    }

};

// Exponer funciones al objeto global window para su uso en onclick de HTML
window.redirigirAInicioSesion = LogoutController.redirigirAInicioSesion;
window.toggleLogoutModal = (show) => LogoutController.toggleLogoutModal(show);

LogoutController.init();
