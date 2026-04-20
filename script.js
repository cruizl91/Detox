const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQwBGeDAks-N3P1UsOK2JiKfg2SnIkRMA-OfifUWM5qM_LeKVwYenmpvaYaVMXtsgKqsqCKG30d2bwF/pub?output=csv';

const menu = [
    { d: "Día 1", am: "3 huevos revueltos con mantequilla", pm: "Pollo al horno con repollo" },
    { d: "Día 2", am: "2 huevos fritos + queso", pm: "Carne molida con zapallito" },
    { d: "Día 3", am: "Omelet de espinaca", pm: "Atún con ensalada verde" },
    { d: "Día 4", am: "Huevos con vienesas", pm: "Pollo con mayo y acelga" },
    { d: "Día 5", am: "3 huevos con mayo casera", pm: "Hamburguesas con repollo" },
    { d: "Día 6", am: "Huevos revueltos con carne", pm: "Pescado al horno con verdes" },
    { d: "Día 7", am: "3 huevos fritos con palta", pm: "Chuleta con apio" },
    { d: "Día 8", am: "Omelet de jamón y queso", pm: "Carne molida con verdes" },
    { d: "Día 9", am: "3 huevos con mantequilla", pm: "Pollo al jugo con lechuga" },
    { d: "Día 10", am: "2 huevos fritos + jamón", pm: "Atún con mayo y pepino" },
    { d: "Día 11", am: "3 huevos duros + mayo", pm: "Pechuga de pollo con repollo" },
    { d: "Día 12", am: "Omelet de puro queso", pm: "Trutro de pollo con repollo" },
    { d: "Día 13", am: "Huevos con chorizo", pm: "Atún con ensalada mixta" },
    { d: "Día 14", am: "3 huevos con mantequilla", pm: "Asado/Bistec con apio" },
    { d: "Día 15", am: "Omelet final", pm: "Proteína + Ensalada verde" }
];

function renderMenu() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    grid.innerHTML = menu.map(item => `
        <div class="day-card bg-white p-4 rounded-xl shadow-sm snap-start min-w-[250px] border border-gray-200">
            <span class="text-[#075af5] font-bold text-[10px] uppercase tracking-wider">${item.d}</span>
            <div class="mt-3 space-y-2">
                <p class="text-xs text-gray-700"><strong>Desayuno:</strong> ${item.am}</p>
                <p class="text-xs text-gray-700"><strong>Almuerzo:</strong> ${item.pm}</p>
            </div>
        </div>
    `).join('');
}

let weightChart;

async function loadData() {
    try {
        const response = await fetch(CSV_URL + '&t=' + new Date().getTime());
        const data = await response.text();
        const separador = data.includes(';') ? ';' : ',';
        const rows = data.split('\n').slice(1); 
        const labels = [];
        const weights = [];

        rows.forEach(row => {
            if(!row.trim()) return;
            const cols = row.split(separador);
            if (cols.length >= 3) {
                let pesoLimpio = cols[2].replace(/"/g, '').trim().replace(',', '.');
                let pesoParseado = parseFloat(pesoLimpio);
                if (!isNaN(pesoParseado)) {
                    let fechaCruda = cols[1].replace(/"/g, '').trim();
                    labels.push(fechaCruda.split(' ')[0]); 
                    weights.push(pesoParseado);
                }
            }
        });
        updateDashboard(labels, weights);
    } catch (error) {
        console.error('Error cargando los datos:', error);
    }
}

function updateDashboard(labels, weights) {
    if (weights.length === 0) return;
    const inicial = weights[0];
    const actual = weights[weights.length - 1];
    const perdidos = (inicial - actual).toFixed(1);
    const elInicial = document.getElementById('pesoInicial');
    const elActual = document.getElementById('pesoActual');
    const elPerdidos = document.getElementById('kilosPerdidos');
    if(elInicial) elInicial.textContent = `${inicial} kg`;
    if(elActual) elActual.textContent = `${actual} kg`;
    if(elPerdidos) elPerdidos.textContent = perdidos >= 0 ? `${perdidos} kg` : `+${Math.abs(perdidos).toFixed(1)} kg`;
    renderChart(labels, weights);
}

function renderChart(labels, weights) {
    const canvas = document.getElementById('weightChart');
    if (!canvas) return; 
    if (weightChart) weightChart.destroy();
    weightChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Peso (kg)',
                data: weights,
                borderColor: '#075af5',
                backgroundColor: 'rgba(7, 90, 245, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#075af5',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
                x: { grid: { display: false }, ticks: { font: { size: 10 } } }
            }
        }
    });
}

window.onload = () => {
    renderMenu();
    loadData();
};