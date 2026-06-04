const AUTH_URL = 'http://localhost:8080/api/v1/users/login/';

export const AuthService = {
    async login(cedula, clave) {
        const payload = {
            body: {
                cedula: cedula,
                clave: clave
            }
        };

        const response = await fetch(AUTH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Credenciales inválidas');
        }

        const usuario = await response.json();
        sessionStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
        return usuario;
    },

    logout() {
        sessionStorage.clear();
        window.location.href = '../index.html';
    },

    getUsuarioLogueado() {
        const user = sessionStorage.getItem('usuarioLogueado');
        return user ? JSON.parse(user) : null;
    }
};
