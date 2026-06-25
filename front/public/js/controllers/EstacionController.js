import { MapaService } from '../services/MapaService.js';
import { MapaController } from './MapaController.js';

export const EstacionController = {
    stationToDeleteId: null,

    abrirModalCrearEstacion() {
        const input = document.getElementById('newStationNameInput');
        if (input) input.value = '';
        const errMsg = document.getElementById('createStationErrorMsg');
        if (errMsg) errMsg.style.display = 'none';
        window.alternarModal('createStationModal', true);
    },

    iniciarCrearEstacion() {
        const nameInput = document.getElementById('newStationNameInput');
        const errMsg = document.getElementById('createStationErrorMsg');
        const name = nameInput ? nameInput.value.trim() : '';

        if (!name) {
            if (errMsg) { errMsg.textContent = 'Ingrese un nombre válido.'; errMsg.style.display = 'block'; }
            return;
        }

        // Validar duplicado localmente
        const duplicado = Object.values(MapaController.stationData).some(
            s => s.name && s.name.toLowerCase() === name.toLowerCase()
        );
        if (duplicado) {
            if (errMsg) { errMsg.textContent = 'Ya existe una estación con ese nombre.'; errMsg.style.display = 'block'; }
            return;
        }

        MapaController.isCreatingStation = true;
        document.getElementById('map').style.cursor = 'crosshair';
        window.alternarModal('createStationModal', false);
    },

    // ─── Eliminar Estación ──────────────────────────────────────────────────────

    async abrirModalEliminarEstacion() {
        const listContainer = document.getElementById('deleteStationList');
        if (!listContainer) return;

        listContainer.innerHTML = '<p style="text-align:center; color:#6b7280; padding:12px;">Cargando estaciones...</p>';
        window.alternarModal('deleteStationModal', true);

        try {
            const estaciones = await MapaService.obtenerEstaciones();
            listContainer.innerHTML = '';

            if (!estaciones || estaciones.length === 0) {
                listContainer.innerHTML = '<p style="text-align:center; color:#6b7280; padding:12px;">No hay estaciones registradas.</p>';
                return;
            }

            estaciones.forEach(est => {
                const div = document.createElement('div');
                div.className = 'station-delete-item';
                div.innerHTML = `
                    <span>${est.nombre}</span>
                    <input type="radio" name="stationToDelete" value="${est.id}">
                `;
                div.onclick = () => {
                    div.querySelector('input').checked = true;
                    this.stationToDeleteId = est.id;
                };
                listContainer.appendChild(div);
            });
        } catch (err) {
            console.error('Error al cargar estaciones para eliminar:', err);
            listContainer.innerHTML = '<p style="text-align:center; color:#ef4444; padding:12px;">Error al cargar estaciones. Verifica la conexión al servidor.</p>';
        }
    },


    async abrirModalSeleccionarEstacionParaEditar() {
        const listContainer = document.getElementById('editStationList');
        if (!listContainer) return;

        listContainer.innerHTML = '<p style="text-align:center; color:#6b7280; padding:12px;">Cargando estaciones...</p>';
        window.alternarModal('selectEditStationModal', true);

        try {
            const estaciones = await MapaService.obtenerEstaciones();
            listContainer.innerHTML = '';

            if (!estaciones || estaciones.length === 0) {
                listContainer.innerHTML = '<p style="text-align:center; color:#6b7280; padding:12px;">No hay estaciones registradas.</p>';
                return;
            }

            estaciones.forEach(est => {
                const div = document.createElement('div');
                div.className = 'station-delete-item';
                div.innerHTML = `
                    <span>${est.nombre}</span>
                    <input type="radio" name="stationToEdit" value="${est.id}">
                `;
                div.onclick = () => {
                    div.querySelector('input').checked = true;
                    this.abrirModalSeleccionCampo(est.id, est.nombre);
                };
                listContainer.appendChild(div);
            });
        } catch (err) {
            console.error('Error al cargar estaciones para editar:', err);
            listContainer.innerHTML = '<p style="text-align:center; color:#ef4444; padding:12px;">Error al cargar estaciones. Verifica la conexión al servidor.</p>';
        }
    },


    abrirModalSeleccionCampo(id, nombre) {
        const selectedIdInput = document.getElementById('selectedEditStationId');
        if (selectedIdInput) selectedIdInput.value = id;

        // Mostrar el nombre de la estación en el modal de elección
        const nameLabel = document.getElementById('chooseFieldStationName');
        const stationNombre = nombre || (MapaController.stationData[id] && MapaController.stationData[id].name) || '—';
        if (nameLabel) nameLabel.textContent = stationNombre;

        window.alternarModal('chooseFieldModal', true);
        window.alternarModal('selectEditStationModal', false);
    },

    seleccionarCampoYEditar(campo) {
        const selectedIdInput = document.getElementById('selectedEditStationId');
        if (!selectedIdInput) return;
        const id = selectedIdInput.value;
        if (!id) return;
        window.alternarModal('chooseFieldModal', false);
        if (campo === 'ubicacion') {
            MapaController.iniciarEditarUbicacion(id);
        } else {
            this.abrirModalEditarEstacion(id);
        }
    },




    async confirmarEliminarEstacion() {
        const selected = document.querySelector('input[name="stationToDelete"]:checked');
        if (!selected) return;

        const id = selected.value;
        try {
            await MapaService.eliminarEstacion(id);
            if (MapaController.leafletMarkers[id]) {
                MapaController.map.removeLayer(MapaController.leafletMarkers[id]);
                delete MapaController.leafletMarkers[id];
                delete MapaController.stationData[id];
            }
            window.alternarModal('deleteStationModal', false);
        } catch (err) {
            console.error(err);
        }
    },

    abrirModalEditarEstacion(id) {
        const est = MapaController.stationData[id];
        if (!est) return;

        const nameInput = document.getElementById('editStationNameInput');
        const editIdInput = document.getElementById('editStationIdInput');
        const currentNameLabel = document.getElementById('editStationCurrentName');
        const errorMsg = document.getElementById('editStationErrorMsg');

        if (nameInput) nameInput.value = '';
        if (editIdInput) editIdInput.value = id;
        if (currentNameLabel) currentNameLabel.textContent = est.name || '—';
        if (errorMsg) errorMsg.style.display = 'none';

        window.alternarModal('editStationModal', true);
    },


    async guardarEdicionEstacion() {
        const nameInput = document.getElementById('editStationNameInput');
        const editIdInput = document.getElementById('editStationIdInput');
        const errorMsg = document.getElementById('editStationErrorMsg');
        if (!editIdInput) return;

        const id = editIdInput.value;
        const nombre = nameInput ? nameInput.value.trim() : '';

        if (!nombre) {
            if (errorMsg) {
                errorMsg.textContent = 'Ingrese un nombre válido para la estación.';
                errorMsg.style.display = 'block';
            }
            return;
        }

        // Verificar que no exista otra estación con el mismo nombre (ignorando la actual)
        const nombreLower = nombre.toLowerCase();
        const duplicado = Object.entries(MapaController.stationData).some(
            ([stId, stData]) => stId !== id && stData.name && stData.name.toLowerCase() === nombreLower
        );
        if (duplicado) {
            if (errorMsg) {
                errorMsg.textContent = 'Ya existe una estación con ese nombre.';
                errorMsg.style.display = 'block';
            }
            return;
        }

        // Ocultar error si todo OK
        if (errorMsg) errorMsg.style.display = 'none';

        const payload = { nombre };

        try {
            const updated = await MapaService.actualizarEstacion(id, payload);
            MapaController.stationData[id].name = updated.nombre;
            MapaController.stationData[id].coords = [updated.latitude, updated.longitude];
            if (MapaController.leafletMarkers[id]) {
                MapaController.leafletMarkers[id].setLatLng([updated.latitude, updated.longitude]);
                const el = MapaController.leafletMarkers[id].getElement();
                if (el) {
                    const tooltip = el.querySelector('.tooltip');
                    if (tooltip) tooltip.innerText = updated.nombre;
                    const badge = el.querySelector('.badge');
                    if (badge) badge.id = `badge-${id}`;
                }
            }
            window.alternarModal('editStationModal', false);
        } catch (err) {
            console.error(err);
            if (errorMsg) {
                errorMsg.textContent = 'No se pudo actualizar la estación. Intente de nuevo.';
                errorMsg.style.display = 'block';
            }
        } finally {
            MapaController.isEditingLocation = false;
            const mapEl = document.getElementById('map');
            if (mapEl) mapEl.style.cursor = '';
            const message = document.getElementById('locationEditMessage');
            if (message) message.style.display = 'none';
        }
    }
};

window.EstacionController = EstacionController;
window.abrirModalCrearEstacion = EstacionController.abrirModalCrearEstacion.bind(EstacionController);
window.iniciarCrearEstacion = EstacionController.iniciarCrearEstacion.bind(EstacionController);
window.abrirModalEliminarEstacion = EstacionController.abrirModalEliminarEstacion.bind(EstacionController);
window.confirmarEliminarEstacion = EstacionController.confirmarEliminarEstacion.bind(EstacionController);
window.abrirModalEditarEstacion = EstacionController.abrirModalEditarEstacion.bind(EstacionController);
window.guardarEdicionEstacion = EstacionController.guardarEdicionEstacion.bind(EstacionController);
window.abrirModalSeleccionarEstacionParaEditar = EstacionController.abrirModalSeleccionarEstacionParaEditar.bind(EstacionController);
window.abrirModalSeleccionCampo = EstacionController.abrirModalSeleccionCampo.bind(EstacionController);
window.seleccionarCampoYEditar = EstacionController.seleccionarCampoYEditar.bind(EstacionController);
