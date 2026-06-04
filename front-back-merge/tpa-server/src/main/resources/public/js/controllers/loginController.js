import { AuthService } from '../services/AuthService.js';

export const LoginController = {
    init() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.onSubmit.bind(this));
        }

        const helpLink = document.getElementById('helpAccessLink');
        if (helpLink) {
            helpLink.addEventListener('click', this.onHelpClick.bind(this));
        }

        this.restoreRememberMe();
    },

    async onSubmit(e) {
        e.preventDefault();
        
        const cedulaField = document.getElementById('cedulaInput');
        const claveField = document.getElementById('claveInput');
        const rememberCheck = document.getElementById('rememberCheckbox');

        const cedula = cedulaField.value;
        const clave = claveField.value;

        if (!this.validateForm(cedula, clave)) return;

        this.showMessage("🚂✨ ¡Bienvenido! Conectando al sistema del Trencito Puerto Azul.", false);

        try {
            const usuario = await AuthService.login(cedula, clave);
            
            if (rememberCheck.checked) {
                localStorage.setItem('puertoAzul_rememberMe', 'true');
            } else {
                localStorage.removeItem('puertoAzul_rememberMe');
            }

            this.redirectByUserRole(usuario);
        } catch (error) {
            this.showMessage("❌ Error: " + error.message, true);
        }
    },

    validateForm(cedula, clave) {
        if (!cedula.trim() || !clave.trim()) {
            this.showMessage("❌ Por favor, completa la cédula y la clave de acceso.", true);
            return false;
        }
        return true;
    },

    redirectByUserRole(usuario) {
        setTimeout(() => {
            const routes = {
                'ADMINISTRADOR': 'mapaadmin.html',
                'OPERADOR': 'mapaoperador.html',
                'VIP': 'mapavip.html'
            };
            window.location.href = routes[usuario.rol] || 'mapasocio.html';
        }, 1000);
    },

    showMessage(msg, isError = false) {
        const toastEl = document.getElementById('liveToastMsg');
        if (!toastEl) return;

        toastEl.textContent = msg;
        toastEl.style.background = isError ? "rgba(220, 70, 60, 0.95)" : "rgba(31, 63, 166, 0.95)";
        toastEl.classList.add('show');
        
        setTimeout(() => {
            toastEl.classList.remove('show');
        }, 3000);
    },

    onHelpClick(e) {
        e.preventDefault();
        this.showMessage("📞 Soporte: soporte@puertoazul.com", false);
    },

    restoreRememberMe() {
        const rememberCheck = document.getElementById('rememberCheckbox');
        if (rememberCheck && localStorage.getItem('puertoAzul_rememberMe') === 'true') {
            rememberCheck.checked = true;
        }
    }
};

// Initialize if we are on the login page
if (document.getElementById('loginForm')) {
    LoginController.init();
}
