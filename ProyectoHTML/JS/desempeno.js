let graficaPuntaje;
let graficaDificultad;

//cargar un evento clicl n.addEventListener(¨Keydown, event¨)

window.onload = function () { 
    const ctx1 = document.getElementById('graficaPuntaje').getContext('2d'); // lo identifca con canvas en HTML
    const ctx2 = document.getElementById('graficaTiempo').getContext('2d');

    graficaPuntaje = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Puntaje',
                data: [],
                borderColor: '#933ff4',
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
                backgroundColor: ['#9c45e9', '#8f32e0', '#5f02b0']
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
};

async function cargarDatos() {
    const correo = document.getElementById("correo").value.trim();// cortar los espacios al momento que escribe el correo

    if (!correo) {
        alert("Ingresa un correo");
        return;
    }

    try {
        const response = await fetch(`https://ygtfxb3dtnzrhhgw4sixxcynsq0qnzpw.lambda-url.us-east-1.on.aws/busqueda-jugador-correo/${encodeURIComponent(correo)}`);

        if (response.ok === false) { //algo em falla en esta seccion
            console.log("No se encontró el alumno");
            return;
        }


        const data = await response.json();

        actualizarGraficas(data);
        actualizarTablaLogros(data.logros);

    } catch (error) {
        console.error(error);
        alert("Error al intener leer los datos");
    }
}

function actualizarGraficas(data) {

    if (data.partidas.length === 0) {
        graficaPuntaje.data.labels = [];
        graficaPuntaje.data.datasets[0].data = [];
        graficaPuntaje.update();

        graficaDificultad.data.datasets[0].data = [0, 0, 0];
        graficaDificultad.update(); // basicmanete aciliza los datos, o mas bien no conserva los datos del correo anterior 

        return;
    }

    const fechas = [];
    const puntajes = [];

    for (let i = 0; i < data.partidas.length; i++) {
                     //new Date taransofrma fehcaHora a una fecha hr
        fechas.push(new Date(data.partidas[i].fechaHora).toLocaleDateString()); //toLocalDataString es un metodo que cmmbia la hr a una nomral
        puntajes.push(data.partidas[i].puntaje);
    }

    graficaPuntaje.data.labels = fechas;
    graficaPuntaje.data.datasets[0].data = puntajes;
    graficaPuntaje.update();

    let conteo = {
        facil: 0,
        medio: 0,
        dificil: 0
    };

    for (let i = 0; i < data.partidas.length; i++) {
        const d = data.partidas[i].dificultad.toLowerCase();

        if (d === "facil") conteo.facil++;
        else if (d === "medio") conteo.medio++;
        else if (d === "dificil") conteo.dificil++;
    }

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

    if (logros.length === 0) {
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