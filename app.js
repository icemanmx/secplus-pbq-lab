// Banco de datos de PBQs (Escalable a N preguntas)
const pbqData = [
  {
    id: 1,
    title: "Escenario PBQ 1: Selección e Implementación de Controles en Red Perimetral",
    instructions: "Arrastre los controles de seguridad y dispositivos adecuados desde la sección de recursos hacia las zonas de arquitectura correspondientes.",
    draggables: [
      { id: "item-waf", control: "WAF", text: "WAF (Web Application Firewall)" },
      { id: "item-ngfw", control: "NGFW", text: "NGFW (Next-Gen Firewall)" },
      { id: "item-mfa", control: "MFA", text: "MFA (Multi-Factor Auth)" },
      { id: "item-jump", control: "JUMPBOX", text: "Jump Server / Bastion Host" },
      { id: "item-dlp", control: "DLP", text: "DLP (Data Loss Prevention)" }
    ],
    zones: [
      { key: "dmz", label: "DMZ (Servidores Web Públicos - HTTP/HTTPS):" },
      { key: "perimeter", label: "Perímetro de Red / Borde (Filtrado Capa 4/7):" },
      { key: "management", label: "Acceso de Administración Remota a Subredes Internas:" }
    ],
    solution: {
      'dmz': 'WAF',
      'perimeter': 'NGFW',
      'management': 'JUMPBOX'
    }
  },
  {
    id: 2,
    title: "Escenario PBQ 2: Posicionamiento Táctico de NIPS y Firewall de Borde",
    instructions: "Ubique los dispositivos de seguridad en las interfaces del Default Gateway según la arquitectura recomendada para mitigar tráfico masivo e inspeccionar salida.",
    draggables: [
      { id: "item-fw-ext", control: "FW_EXT", text: "Firewall Perimetral (Filtro L3/L4)" },
      { id: "item-nips-int", control: "NIPS", text: "NIPS (Inline Inspection L7)" },
      { id: "item-nids-pass", control: "NIDS", text: "NIDS (Passive Sensor)" },
      { id: "item-waf-2", control: "WAF", text: "WAF (Web Application Firewall)" }
    ],
    zones: [
      { key: "wan_interface", label: "Interfaz Externa del Gateway (Hacia Internet):" },
      { key: "lan_interface", label: "Interfaz Interna del Gateway (Hacia la LAN):" }
    ],
    solution: {
      'wan_interface': 'FW_EXT',
      'lan_interface': 'NIPS'
    }
  }
];

let currentPbqIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    initPbqNav();
    loadPbq(currentPbqIndex);

    document.getElementById('btn-submit').addEventListener('click', evaluateCurrentPbq);
    document.getElementById('btn-reset').addEventListener('click', () => loadPbq(currentPbqIndex));
});

// Renderizar botones de navegación entre PBQs
function initPbqNav() {
    const navContainer = document.getElementById('pbq-selector');
    if (!navContainer) return;
    
    navContainer.innerHTML = pbqData.map((pbq, index) => 
        `<button class="btn-nav ${index === 0 ? 'active' : ''}" onclick="switchPbq(${index})">PBQ ${pbq.id}</button>`
    ).join('');
}

function switchPbq(index) {
    currentPbqIndex = index;
    document.querySelectorAll('.btn-nav').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
    loadPbq(index);
}

// Cargar la PBQ dinámicamente en el DOM
function loadPbq(index) {
    const pbq = pbqData[index];
    
    // Ocultar feedback anterior
    const feedbackPanel = document.getElementById('feedback-panel');
    feedbackPanel.className = 'feedback-panel hidden';

    // Setear Textos
    document.getElementById('pbq-title').innerText = pbq.title;
    document.getElementById('pbq-instructions').innerText = pbq.instructions;

    // Renderizar Draggables
    const dragContainer = document.getElementById('draggable-container');
    dragContainer.innerHTML = pbq.draggables.map(item => 
        `<div class="draggable" draggable="true" id="${item.id}" data-control="${item.control}">${item.text}</div>`
    ).join('');

    // Renderizar DropZones
    const targetPanel = document.getElementById('target-panel');
    targetPanel.innerHTML = `<h3>Zonas de Arquitectura</h3>` + pbq.zones.map(zone => 
        `<div class="drop-zone" data-zone="${zone.key}">
            <span class="zone-label">${zone.label}</span>
            <div class="slot" id="slot-${zone.key}"></div>
         </div>`
    ).join('');

    // Rebindear Eventos de Drag & Drop
    attachDragAndDropEvents();
}

function attachDragAndDropEvents() {
    const draggables = document.querySelectorAll('.draggable');
    const dropZones = document.querySelectorAll('.drop-zone');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', draggable.id);
            draggable.classList.add('dragging');
        });
        draggable.addEventListener('dragend', () => draggable.classList.remove('dragging'));
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            
            const id = e.dataTransfer.getData('text/plain');
            const draggableElement = document.getElementById(id);
            const slot = zone.querySelector('.slot');

            if (slot.children.length > 0) {
                document.getElementById('draggable-container').appendChild(slot.children[0]);
            }
            slot.appendChild(draggableElement);
        });
    });
}

// Evaluación Dinámica por Pregunta
function evaluateCurrentPbq() {
    const pbq = pbqData[currentPbqIndex];
    const dropZones = document.querySelectorAll('.drop-zone');
    const feedbackPanel = document.getElementById('feedback-panel');

    let score = 0;
    let total = Object.keys(pbq.solution).length;
    let feedbackDetails = [];

    dropZones.forEach(zone => {
        const zoneKey = zone.getAttribute('data-zone');
        const slot = zone.querySelector('.slot');
        const placedElement = slot.children[0];

        if (placedElement) {
            const placedControl = placedElement.getAttribute('data-control');
            if (placedControl === pbq.solution[zoneKey]) {
                score++;
            } else {
                feedbackDetails.push(`Error en [${zoneKey.toUpperCase()}]: Se colocó '${placedControl}', pero la solución requiere '${pbq.solution[zoneKey]}'.`);
            }
        } else {
            feedbackDetails.push(`La zona [${zoneKey.toUpperCase()}] está vacía.`);
        }
    });

    feedbackPanel.classList.remove('hidden', 'success', 'error');
    if (score === total) {
        feedbackPanel.classList.add('success');
        feedbackPanel.innerHTML = `<strong>¡Resultado Perfecto! (${score}/${total})</strong><br>Alineación correcta según el estándar de CompTIA Security+.`;
    } else {
        feedbackPanel.classList.add('error');
        feedbackPanel.innerHTML = `<strong>Evaluación Incorrecta (${score}/${total})</strong><ul>${feedbackDetails.map(item => `<li>${item}</li>`).join('')}</ul>`;
    }
}