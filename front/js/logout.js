document.addEventListener('DOMContentLoaded', () => {
    let logoutBtn = document.querySelector('.btn-logout');
    const createdButton = !logoutBtn;
    if (!logoutBtn) {
        logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn-logout';
        logoutBtn.innerHTML = '<img class="logout-icon" src="assets/door-icon.svg" alt="Salir"><span>Salir</span>';
    }

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay logout-modal';
    modalOverlay.style.display = 'none';
    modalOverlay.innerHTML = `
        <div class="modal-card">
            <h3>Confirmar cierre de sesión</h3>
            <p class="modal-description">¿Estás seguro de que deseas cerrar sesión?</p>
            <div class="modal-actions-horizontal">
                <button class="btn-modal-black" type="button">Cancelar</button>
                <button class="btn-modal-confirm-blue" type="button">Aceptar</button>
            </div>
        </div>
    `;

    const cancelBtn = modalOverlay.querySelector('.btn-modal-black');
    const confirmBtn = modalOverlay.querySelector('.btn-modal-confirm-blue');

    const toggleModal = (show) => {
        modalOverlay.style.display = show ? 'flex' : 'none';
    };

    logoutBtn.onclick = () => {
        toggleModal(true);
    };

    cancelBtn.onclick = () => {
        toggleModal(false);
    };

    if (confirmBtn) {
        confirmBtn.onclick = async () => {
            sessionStorage.clear();

            const candidatePaths = [
                `${window.location.origin}/front/inicsesion.html`,
                `${window.location.origin}/inicsesion.html`,
                'inicsesion.html'
            ];

            for (const path of candidatePaths) {
                try {
                    const response = await fetch(path, { method: 'HEAD', cache: 'no-store' });
                    if (response.ok) {
                        window.location.href = path;
                        return;
                    }
                } catch (error) {
                    // ignora y prueba la siguiente ruta
                }
            }

            window.location.href = 'inicsesion.html';
        };
    }

    if (createdButton) document.body.appendChild(logoutBtn);
    document.body.appendChild(modalOverlay);
});