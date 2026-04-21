let graficaPuntaje;
let graficaDificultad;

window.onload = function () {
    const ctx1 = document.getElementById('graficaPuntaje').getContext('2d');
    const ctx2 = document.getElementById('graficaTiempo').getContext('2d');

    graficaPuntaje = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Puntaje',
                data: [],
                borderColor: '#f43f5e',
                borderWidth: 2
            }]
        },
        options: {
    scales: {
        x: {
            ticks: {
                color: '#ffffff' 
            }
        },
        y: {
            ticks: {
                color: '#ffffff' 
            }
        }
    }
}
    });

   
    graficaDificultad = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ["Fácil", "Media", "Difícil"],
            datasets: [{
                label: 'Partidas',
                data: [0, 0, 0],
                backgroundColor: ['#e94560', '#e0324f', '#b00d02']
            }]
        }
    });
};

async function cargarDatos() {
    const correo = document.getElementById("correo").value.trim();

    if (!correo) {
        alert("Ingresa un correo");
        return;
    }

    try {
        const url = `https://5fnoeikzkocxvy3zixmnjss3xi0ffnsc.lambda-url.us-east-1.on.aws/busqueda-jugador-correo/${encodeURIComponent(correo)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("No se encontró el alumno");
        }

        const data = await response.json();

        actualizarGraficas(data);
        actualizarTablaLogros(data.logros);

    } catch (error) {
        console.error(error);
        alert("Error al obtener datos");
    }
}

function actualizarGraficas(data) {


    if (!data.partidas || data.partidas.length === 0) {
        graficaPuntaje.data.labels = [];
        graficaPuntaje.data.datasets[0].data = [];
        graficaPuntaje.update();

        graficaDificultad.data.datasets[0].data = [0, 0, 0];
        graficaDificultad.update();

        return;
    }


    const fechas = data.partidas.map(p =>
        new Date(p.fechaHora).toLocaleDateString()
    );

    const puntajes = data.partidas.map(p => p.puntaje);

    graficaPuntaje.data.labels = fechas;
    graficaPuntaje.data.datasets[0].data = puntajes;
    graficaPuntaje.update();


    let conteo = {
        facil: 0,
        medio: 0,
        dificil: 0
    };

    data.partidas.forEach(p => {
        const d = p.dificultad.toLowerCase();

        if (d === "facil") conteo.facil++;
        else if (d === "medio") conteo.medio++;
        else if (d === "dificil") conteo.dificil++;
    });

    graficaDificultad.data.datasets[0].data = [
        conteo.facil,
        conteo.medio,
        conteo.dificil
    ];

    graficaDificultad.update();
}

function actualizarTablaLogros(logros) {

    const tbody = document.querySelector("#tablaLogros tbody");
    tbody.innerHTML = "";

    if (!logros || logros.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4'>Sin logros</td></tr>";
        return;
    }

    logros.forEach(l => {
        const fila = `
            <tr>
                <td>${l.idLogro}</td>
                <td>${l.nombre}</td>
                <td>${l.descripcion}</td>
                <td>${new Date(l.fechaDesbloqueo).toLocaleDateString()}</td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });
}