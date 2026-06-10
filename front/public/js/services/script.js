(function () {
    // Elementos del DOM
    const loginForm = document.getElementById('loginForm');
    const cedulaField = document.getElementById('cedulaInput');
    const claveField = document.getElementById('claveInput');
    const rememberCheck = document.getElementById('rememberCheckbox');
    const helpLink = document.getElementById('helpAccessLink');
    const toastEl = document.getElementById('liveToastMsg');

    // Verificar que todos los elementos existan
    if (!loginForm || !cedulaField || !claveField || !rememberCheck || !helpLink || !toastEl) {
        console.error('❌ Error: No se encontraron todos los elementos del formulario');
        console.log('Elementos encontrados:', {
            loginForm: !!loginForm,
            cedulaField: !!cedulaField,
            claveField: !!claveField,
            rememberCheck: !!rememberCheck,
            helpLink: !!helpLink,
            toastEl: !!toastEl
        });
        return;
    }

    console.log('✅ Sistema del Trencito Puerto Azul inicializado correctamente');

    // Función para mostrar mensaje tipo toast
    function showMessage(msg, isError = false) {
        if (!toastEl) return;
        toastEl.textContent = msg || "🚂 Puerto Azul · Conectando al sistema";
        if (isError) {
            toastEl.style.background = "rgba(220, 70, 60, 0.95)";
        } else {
            toastEl.style.background = "rgba(31, 63, 166, 0.95)";
        }

        toastEl.classList.add('show');
        setTimeout(() => {
            toastEl.classList.remove('show');
        }, 3000);
    }

    // Función de validación para cédula y clave
    function validateForm(cedula, clave) {
        if (!cedula.trim() || !clave.trim()) {
            showMessage("❌ Por favor, completa la cédula y la clave de acceso.", true);
            return false;
        }

        const cleanCedula = cedula.trim().replace(/\s/g, '');
        if (!/^\d+$/.test(cleanCedula)) {
            showMessage("📇 La cédula debe contener solo números (ejemplo: 31707565)", true);
            return false;
        }

        if (cleanCedula.length < 6) {
            showMessage("⚠️ La cédula debe tener al menos 6 dígitos.", true);
            return false;
        }

        if (clave.trim().length < 4) {
            showMessage("🔐 La clave de acceso debe tener al menos 4 caracteres.", true);
            return false;
        }

        return true;
    }

    // Manejar submit del formulario
    async function onSubmit(e) {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }
        console.log('📝 Formulario enviado');

        const cedulaVal = cedulaField.value;
        const claveVal = claveField.value;

        if (validateForm(cedulaVal, claveVal)) {
            const btn = document.getElementById('submitBtn');
            // if (btn) btn.disabled = true;

            showMessage("🚂✨ ¡Bienvenido! Conectando al sistema del Trencito Puerto Azul.", false);

            try {
                const URL = 'http://localhost:8080/api/v1/users/login/';
                const payload = {
                    body: {
                        cedula: cedulaVal,
                        clave: claveVal
                    }
                };

                const response = await fetch(URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error('Credenciales inválidas o error en el servidor');
                }

                const usuario = await response.json();
                console.log('Login exitoso:', usuario);
                sessionStorage.setItem('usuarioLogueado', JSON.stringify(usuario));

                if (rememberCheck.checked) {
                    try {
                        localStorage.setItem('puertoAzul_rememberMe', 'true');
                        localStorage.setItem('puertoAzul_lastUser', cedulaVal.substring(0, 4) + '****');
                        console.log('💾 Sesión guardada en localStorage');
                    } catch (err) {
                        console.error('Error al guardar en localStorage:', err);
                    }
                } else {
                    localStorage.removeItem('puertoAzul_rememberMe');
                    localStorage.removeItem('puertoAzul_lastUser');
                }

                console.log(`✅ Acceso exitoso con cédula: ${cedulaVal}`);

                setTimeout(() => {
                    if (usuario.rol === 'ADMINISTRADOR') {
                        window.location.href = 'pages/mapaadmin.html';
                    } else if (usuario.rol === 'OPERADOR') {
                        window.location.href = 'pages/mapaoperador.html';
                    } else if (usuario.rol === 'VIP') {
                        window.location.href = 'pages/mapavip.html';
                    } else {
                        window.location.href = 'pages/mapasocio.html';
                    }
                }, 1000);

            } catch (error) {
                showMessage("❌ Error: " + error.message, true);
                // if (btn) btn.disabled = false;
            }
        }
    }

    // Restaurar preferencia "Recordar sesión" si estaba activa
    try {
        const storedRemember = localStorage.getItem('puertoAzul_rememberMe');
        if (storedRemember === 'true') {
            rememberCheck.checked = true;
            setTimeout(() => {
                showMessage("🔁 Sesión recordada · ingresa tus credenciales.", false);
            }, 500);
            console.log('🔁 Preferencia de sesión recordada cargada');
        }
    } catch (e) {
        console.error('Error al leer localStorage:', e);
    }

    // Evento de envío
    loginForm.addEventListener('submit', onSubmit);
    console.log('🎯 Event listener de submit añadido');

    // Link de ayuda
    if (helpLink) {
        helpLink.addEventListener('click', (e) => {
            e.preventDefault();
            showMessage("📞 Comunícate con la administración del Club Puerto Azul al correo: soporte@puertoazul.com", false);
            console.log('🆘 Link de ayuda clickeado');
        });
    }

    // Efecto de tecla enter en los campos
    const handleEnter = (e) => {
        if (e.key === 'Enter' && (document.activeElement === cedulaField || document.activeElement === claveField)) {
            e.preventDefault();
            console.log('⏎ Tecla Enter presionada, enviando formulario');
            onSubmit(e);
        }
    };

    document.addEventListener('keypress', handleEnter);
    console.log('✅ JavaScript del Trencito Puerto Azul funcionando correctamente');
})();