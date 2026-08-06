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
  },
  {
    id: 3,
    title: "Escenario PBQ 3: Mitigación de Evasión y Comunicaciones C2 (APT Scenario)",
    instructions: "Asocie la evidencia técnica identificada en el host/red con el control o contramedida táctica correspondiente.",
    draggables: [
      { id: "item-ndr", control: "NDR", text: "Inspección NDR / Análisis de Entropía Temporal" },
      { id: "item-driver", control: "BLOCKLIST", text: "Driver Blocklist (HVCI / Credential Guard)" },
      { id: "item-ram", control: "INSPECTION", text: "Inspección de Memoria (AMSI / Process Injection)" },
      { id: "item-isolation", control: "ISOLATION", text: "Aislamiento de Host (Host Isolation)" }
    ],
    zones: [
      { key: "beaconing", label: "Conexiones HTTPS salientes en intervalos exactos de 15 min (C2):" },
      { key: "byovd", label: "Carga de driver vulnerable para deshabilitar el agente EDR (BYOVD):" },
      { key: "fileless", label: "Inyección de código malicioso residente solo en RAM (Fileless):" }
    ],
    solution: {
      'beaconing': 'NDR',
      'byovd': 'BLOCKLIST',
      'fileless': 'INSPECTION'
    }
  },
  {
    id: 4,
    title: "Escenario PBQ 4: Aseguramiento de Infraestructura Inalámbrica Corporativa",
    instructions: "Seleccione los mecanismos de autenticación y cifrado requeridos para mitigar accesos no autorizados y Rogue APs en la red Wi-Fi.",
    draggables: [
      { id: "item-wpa3-ent", control: "WPA3_ENT", text: "WPA3-Enterprise (802.1X + EAP-TLS)" },
      { id: "item-radius", control: "RADIUS", text: "Servidor RADIUS / AAA" },
      { id: "item-preshared", control: "PSK", text: "WPA2-Personal (Pre-Shared Key)" },
      { id: "item-captive", control: "CAPTIVE", text: "Captive Portal con Aislamiento de Clientes" }
    ],
    zones: [
      { key: "wifi_corp", label: "Red Wi-Fi Empleados (Autenticación basada en certificados digitales):" },
      { key: "wifi_guests", label: "Red Wi-Fi Visitantes (Acceso temporal aislado de la red LAN):" }
    ],
    solution: {
      'wifi_corp': 'WPA3_ENT',
      'wifi_guests': 'CAPTIVE'
    }
  },
  {
    id: 5,
    title: "Escenario PBQ 5: Gestión de Certificados Digitales y Cadena de Confianza PKI",
    instructions: "Asigne la solución tecnológica correcta para garantizar la validación de certificados y evitar interrupciones por revocación.",
    draggables: [
      { id: "item-ocsp", control: "OCSP_STAPLING", text: "OCSP Stapling (Mitigación de latencia y privacidad)" },
      { id: "item-crl", control: "CRL", text: "Certificate Revocation List (CRL)" },
      { id: "item-csr", control: "CSR", text: "Certificate Signing Request (CSR)" },
      { id: "item-ca-root", control: "ROOT_CA", text: "Root CA Offline" }
    ],
    zones: [
      { key: "cert_revocation", label: "Prueba de validez del certificado sin consultar la CA en cada petición:" },
      { key: "ca_protection", label: "Componente de la PKI que debe mantenerse desconectado:" }
    ],
    solution: {
      'cert_revocation': 'OCSP_STAPLING',
      'ca_protection': 'ROOT_CA'
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

function initPbqNav() {
    const navContainer = document.getElementById('pbq-selector');
    if (!navContainer) return;
    
    navContainer.innerHTML = pbqData.map((pbq, index) => 
        `<button class="btn-nav ${index === 0 ? 'active' : ''}" data-index="${index}">PBQ ${pbq.id}</button>`
    ).join('');

    navContainer.querySelectorAll('.btn-nav').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            switchPbq(index);
        });
    });
}

function switchPbq(index) {
    currentPbqIndex = index;
    document.querySelectorAll('.btn-nav').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
    loadPbq(index);
}

function loadPbq(index) {
    const pbq = pbqData[index];
    
    const feedbackPanel = document.getElementById('feedback-panel');
    feedbackPanel.className = 'feedback-panel hidden';

    document.getElementById('pbq-title').innerText = pbq.title;
    document.getElementById('pbq-instructions').innerText = pbq.instructions;

    const dragContainer = document.getElementById('draggable-container');
    dragContainer.innerHTML = pbq.draggables.map(item => 
        `<div class="draggable" draggable="true" id="${item.id}" data-control="${item.control}">${item.text}</div>`
    ).join('');

    const targetPanel = document.getElementById('target-panel');
    targetPanel.innerHTML = `<h3>Zonas de Arquitectura</h3>` + pbq.zones.map(zone => 
        `<div class="drop-zone" data-zone="${zone.key}">
            <span class="zone-label">${zone.label}</span>
            <div class="slot" id="slot-${zone.key}"></div>
         </div>`
    ).join('');

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

            if (draggableElement && slot) {
                if (slot.children.length > 0) {
                    document.getElementById('draggable-container').appendChild(slot.children[0]);
                }
                slot.appendChild(draggableElement);
            }
        });
    });
}

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
        feedbackPanel.innerHTML = `<strong>¡Resultado Perfecto! (${score}/${total})</strong><br>Alineación correcta según el marco de CompTIA Security+.`;
    } else {
        feedbackPanel.classList.add('error');
        feedbackPanel.innerHTML = `<strong>Evaluación Incorrecta (${score}/${total})</strong><ul>${feedbackDetails.map(item => `<li>${item}</li>`).join('')}</ul>`;
    }
}