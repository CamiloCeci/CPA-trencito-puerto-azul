import { RutaService } from '../services/RutaService.js';
import { MapaController } from './MapaController.js';

export const RutaController = {
    rutaToDeleteId: null,

    // ─── Crear Ruta ─────────────────────────────────────────────────────────────

    abrirModalCrearRuta() {
        const inputNombre = document.getElementById('newRutaNameInput');
        const inputIds = document.getElementById('newRutaIdsInput');
        const errMsg = document.getElementById('createRutaErrorMsg');

        if (inputNombre) inputNombre.value = '';
        if (inputIds) inputIds.value = '';
        if (errMsg) errMsg.style.display = 'none';

        window.alternarModal('createRutaModal', true);
    },

    async iniciarCrearRuta() {
        const nameInput = document.getElementById('newRutaNameInput');
        const idsInput = document.getElementById('newRutaIdsInput');
        const errMsg = document.getElementById('createRutaErrorMsg');

        const nombre = nameInput ? nameInput.value.trim() : '';
        const idsText = idsInput ? idsInput.value.trim() : '';

        if (!nombre) {
            this.mostrarError(errMsg, 'Ingrese un nombre válido para la ruta.');
            return;
        }

        const validacion = this.validarIdsEstaciones(idsText);
        if (!validacion.valido) {
            this.mostrarError(errMsg, validacion.mensaje);
            return;
        }

        try {
            await RutaService.crearRuta(nombre, validacion.ids);
            this.mostrarMensaje(errMsg, 'Ruta creada exitosamente.', true);
            setTimeout(() => {
                window.alternarModal('createRutaModal', false);
                if (errMsg) errMsg.style.display = 'none';
            }, 1500);
        } catch (error) {
            this.mostrarMensaje(errMsg, error.message, false);
        }
    },

    // ─── Eliminar Ruta ──────────────────────────────────────────────────────────

    async abrirModalEliminarRuta() {
        const listContainer = document.getElementById('deleteRutaList');
        if (!listContainer) return;

        listContainer.innerHTML = '<p style="text-align:center; color:#6b7280; padding:12px;">Cargando rutas...</p>';
        window.alternarModal('deleteRutaModal', true);

        try {
            const rutas = await RutaService.obtenerRutas();
            listContainer.innerHTML = '';

            if (!rutas || rutas.length === 0) {
                listContainer.innerHTML = '<p style="text-align:center; color:#6b7280; padding:12px;">No hay rutas registradas.</p>';
                return;
            }

            rutas.forEach(ruta => {
                const div = document.createElement('div');
                div.className = 'station-delete-item'; // Reutilizamos estilo
                div.innerHTML = `
                    <span>${ruta.nombre} ${ruta.activa ? '(Activa)' : ''}</span>
                    <input type="radio" name="rutaToDelete" value="${ruta.id}">
                `;
                div.onclick = () => {
                    div.querySelector('input').checked = true;
                    this.rutaToDeleteId = ruta.id;
                };
                listContainer.appendChild(div);
            });
        } catch (err) {
            console.error('Error al cargar rutas para eliminar:', err);
            listContainer.innerHTML = '<p style="text-align:center; color:#ef4444; padding:12px;">Error al cargar rutas. Verifica la conexión al servidor.</p>';
        }
    },

    async confirmarEliminarRuta() {
        const selected = document.querySelector('input[name="rutaToDelete"]:checked');
        if (!selected) return;

        const errMsg = document.getElementById('deleteRutaErrorMsg');
        const id = selected.value;
        try {
            await RutaService.eliminarRuta(id);
            this.mostrarMensaje(errMsg, 'Ruta eliminada exitosamente.', true);
            setTimeout(() => {
                window.alternarModal('deleteRutaModal', false);
                if (errMsg) errMsg.style.display = 'none';
            }, 1500);
        } catch (err) {
            console.error(err);
            this.mostrarMensaje(errMsg, 'Error al eliminar la ruta: ' + err.message, false);
        }
    },

    // ─── Editar Ruta ────────────────────────────────────────────────────────────

    async abrirModalSeleccionarRutaParaEditar() {
        const listContainer = document.getElementById('editRutaList');
        if (!listContainer) return;

        listContainer.innerHTML = '<p style="text-align:center; color:#6b7280; padding:12px;">Cargando rutas...</p>';
        window.alternarModal('selectEditRutaModal', true);

        try {
            const rutas = await RutaService.obtenerRutas();
            listContainer.innerHTML = '';

            if (!rutas || rutas.length === 0) {
                listContainer.innerHTML = '<p style="text-align:center; color:#6b7280; padding:12px;">No hay rutas registradas.</p>';
                return;
            }

            rutas.forEach(ruta => {
                const div = document.createElement('div');
                div.className = 'station-delete-item';
                div.innerHTML = `
                    <span>${ruta.nombre}</span>
                    <input type="radio" name="rutaToEdit" value="${ruta.id}">
                `;
                div.onclick = () => {
                    div.querySelector('input').checked = true;
                    this.abrirModalEditarRuta(ruta);
                };
                listContainer.appendChild(div);
            });
        } catch (err) {
            console.error('Error al cargar rutas para editar:', err);
            listContainer.innerHTML = '<p style="text-align:center; color:#ef4444; padding:12px;">Error al cargar rutas.</p>';
        }
    },

    abrirModalEditarRuta(ruta) {
        const idInput = document.getElementById('editRutaIdInput');
        const nameInput = document.getElementById('editRutaNameInput');
        const idsInput = document.getElementById('editRutaIdsInput');
        const errMsg = document.getElementById('editRutaErrorMsg');

        if (idInput) idInput.value = ruta.id;
        if (nameInput) nameInput.value = ruta.nombre;
        
        // Obtener ids de las estaciones en orden
        const estacionesIds = ruta.estaciones ? ruta.estaciones.map(e => e.estacion.id).join(', ') : '';
        if (idsInput) idsInput.value = estacionesIds;
        
        if (errMsg) errMsg.style.display = 'none';

        window.alternarModal('selectEditRutaModal', false);
        window.alternarModal('editRutaModal', true);
    },

    async guardarEdicionRuta() {
        const idInput = document.getElementById('editRutaIdInput');
        const nameInput = document.getElementById('editRutaNameInput');
        const idsInput = document.getElementById('editRutaIdsInput');
        const errMsg = document.getElementById('editRutaErrorMsg');

        const id = idInput ? idInput.value : null;
        const nombre = nameInput ? nameInput.value.trim() : '';
        const idsText = idsInput ? idsInput.value.trim() : '';

        if (!id) return;

        if (!nombre) {
            this.mostrarError(errMsg, 'Ingrese un nombre válido para la ruta.');
            return;
        }

        const validacion = this.validarIdsEstaciones(idsText);
        if (!validacion.valido) {
            this.mostrarError(errMsg, validacion.mensaje);
            return;
        }

        try {
            await RutaService.editarRuta(id, nombre, validacion.ids);
            this.mostrarMensaje(errMsg, 'Ruta editada exitosamente.', true);
            setTimeout(() => {
                window.alternarModal('editRutaModal', false);
                if (errMsg) errMsg.style.display = 'none';
            }, 1500);
        } catch (error) {
            this.mostrarMensaje(errMsg, error.message, false);
        }
    },

    // ─── Elegir Ruta Activa ─────────────────────────────────────────────────────

    async abrirModalElegirRutaActiva() {
        const listContainer = document.getElementById('activeRutaList');
        if (!listContainer) return;

        listContainer.innerHTML = '<p style="text-align:center; color:#6b7280; padding:12px;">Cargando rutas...</p>';
        window.alternarModal('activeRutaModal', true);

        try {
            const rutas = await RutaService.obtenerRutas();
            listContainer.innerHTML = '';

            if (!rutas || rutas.length === 0) {
                listContainer.innerHTML = '<p style="text-align:center; color:#6b7280; padding:12px;">No hay rutas registradas.</p>';
                return;
            }

            rutas.forEach(ruta => {
                const div = document.createElement('div');
                div.className = 'station-delete-item';
                div.innerHTML = `
                    <span>${ruta.nombre} ${ruta.activa ? '<span style="color:#10b981; font-weight:bold;">(Activa)</span>' : ''}</span>
                    <input type="radio" name="rutaToActivate" value="${ruta.id}">
                `;
                div.onclick = () => {
                    div.querySelector('input').checked = true;
                };
                listContainer.appendChild(div);
            });
        } catch (err) {
            console.error('Error al cargar rutas:', err);
            listContainer.innerHTML = '<p style="text-align:center; color:#ef4444; padding:12px;">Error al cargar rutas.</p>';
        }
    },

    async confirmarRutaActiva() {
        const selected = document.querySelector('input[name="rutaToActivate"]:checked');
        if (!selected) return;

        const errMsg = document.getElementById('activeRutaErrorMsg');
        const id = selected.value;
        try {
            await RutaService.activarRuta(id);
            this.mostrarMensaje(errMsg, 'Ruta activada exitosamente.', true);
            setTimeout(() => {
                window.alternarModal('activeRutaModal', false);
                if (errMsg) errMsg.style.display = 'none';
            }, 1500);
        } catch (err) {
            console.error(err);
            this.mostrarMensaje(errMsg, 'Error al activar la ruta: ' + err.message, false);
        }
    },

    // ─── Utilidades ─────────────────────────────────────────────────────────────

    validarIdsEstaciones(idsText) {
        if (!idsText) {
            return { valido: false, mensaje: 'Debe ingresar las IDs de las estaciones.' };
        }

        // Verificar formato (sólo números, comas y espacios)
        if (!/^[\d,\s]+$/.test(idsText)) {
            return { valido: false, mensaje: 'Formato inválido. Use sólo números y comas.' };
        }

        const idsArray = idsText.split(',').map(s => s.trim()).filter(s => s !== '');
        
        if (idsArray.length < 2) {
            return { valido: false, mensaje: 'La ruta debe tener al menos 2 estaciones.' };
        }

        if (idsArray[0] !== idsArray[idsArray.length - 1]) {
            return { valido: false, mensaje: 'La primera y última estación deben ser iguales (ciclo).' };
        }

        const estacionesExistentes = Object.keys(MapaController.stationData).map(Number);
        const ids = idsArray.map(Number);

        // Verificar si los IDs corresponden a estaciones reales
        for (const id of ids) {
            if (!estacionesExistentes.includes(id)) {
                return { valido: false, mensaje: `El ID de estación ${id} no existe o es inválido.` };
            }
        }

        return { valido: true, ids };
    },

    mostrarMensaje(errEl, mensaje, esExito = false) {
        if (errEl) {
            errEl.textContent = mensaje;
            errEl.className = esExito ? 'success-text-modal' : 'error-text-modal';
            errEl.style.display = 'block';
        } else {
            alert(mensaje);
        }
    },

    mostrarError(errEl, mensaje) {
        this.mostrarMensaje(errEl, mensaje, false);
    }
};

window.RutaController = RutaController;
window.abrirModalCrearRuta = RutaController.abrirModalCrearRuta.bind(RutaController);
window.iniciarCrearRuta = RutaController.iniciarCrearRuta.bind(RutaController);
window.abrirModalEliminarRuta = RutaController.abrirModalEliminarRuta.bind(RutaController);
window.confirmarEliminarRuta = RutaController.confirmarEliminarRuta.bind(RutaController);
window.abrirModalSeleccionarRutaParaEditar = RutaController.abrirModalSeleccionarRutaParaEditar.bind(RutaController);
window.abrirModalEditarRuta = RutaController.abrirModalEditarRuta.bind(RutaController);
window.guardarEdicionRuta = RutaController.guardarEdicionRuta.bind(RutaController);
window.abrirModalElegirRutaActiva = RutaController.abrirModalElegirRutaActiva.bind(RutaController);
window.confirmarRutaActiva = RutaController.confirmarRutaActiva.bind(RutaController);
