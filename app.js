document.addEventListener('DOMContentLoaded', () => {
    const draggables = document.querySelectorAll('.draggable');
    const dropZones = document.querySelectorAll('.drop-zone');
    const btnSubmit = document.getElementById('btn-submit');
    const btnReset = document.getElementById('btn-reset');
    const feedbackPanel = document.getElementById('feedback-panel');

    // Mapeo oficial de solución (SY0-701 Objetivos 1.2, 3.2, 4.5)
    const CORRECT_SOLUTION = {
        'dmz': 'WAF',          // Aplicaciones Web en DMZ frente a XSS/SQLi
        'perimeter': 'NGFW',   // Inspección profunda de tráfico y control de puertos Layer 4/7
        'management': 'JUMPBOX'// Bastión de administración para aislar entornos y accesos de gestión
    };

    // Eventos Drag and Drop
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', draggable.id);
            draggable.classList.add('dragging');
        });

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
        });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            
            const id = e.dataTransfer.getData('text/plain');
            const draggableElement = document.getElementById(id);
            const slot = zone.querySelector('.slot');

            // Si la zona ya tiene un elemento, regresarlo al contenedor principal
            if (slot.children.length > 0) {
                document.getElementById('draggable-container').appendChild(slot.children[0]);
            }

            slot.appendChild(draggableElement);
        });
    });

    // Evaluación Táctica
    btnSubmit.addEventListener('click', () => {
        let score = 0;
        let total = Object.keys(CORRECT_SOLUTION).length;
        let feedbackDetails = [];

        dropZones.forEach(zone => {
            const zoneKey = zone.getAttribute('data-zone');
            const slot = zone.querySelector('.slot');
            const placedElement = slot.children[0];

            if (placedElement) {
                const placedControl = placedElement.getAttribute('data-control');
                if (placedControl === CORRECT_SOLUTION[zoneKey]) {
                    score++;
                } else {
                    feedbackDetails.push(`Error en zona [${zoneKey.toUpperCase()}]: Se colocó '${placedControl}', pero la arquitectura oficial requiere '${CORRECT_SOLUTION[zoneKey]}'.`);
                }
            } else {
                feedbackDetails.push(`La zona [${zoneKey.toUpperCase()}] se encuentra vacía.`);
            }
        });

        // Mostrar Panel de Resultados
        feedbackPanel.classList.remove('hidden', 'success', 'error');
        if (score === total) {
            feedbackPanel.classList.add('success');
            feedbackPanel.innerHTML = `<strong>¡Resultado Perfecto! (${score}/${total})</strong><br>Has alineado correctamente la arquitectura de controles según el marco CompTIA Security+ SY0-701.`;
        } else {
            feedbackPanel.classList.add('error');
            feedbackPanel.innerHTML = `<strong>Evaluación Incorrecta (${score}/${total})</strong><br>Revisa los siguientes puntos tácticos:<br><ul>${feedbackDetails.map(item => `<li>${item}</li>`).join('')}</ul>`;
        }
    });

    // Reinicio del Estado
    btnReset.addEventListener('click', () => {
        const draggableContainer = document.getElementById('draggable-container');
        draggables.forEach(draggable => {
            draggableContainer.appendChild(draggable);
        });
        feedbackPanel.classList.add('hidden');
    });
});