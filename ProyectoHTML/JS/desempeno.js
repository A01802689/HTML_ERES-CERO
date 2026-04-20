  let chartLineas = null;
        let chartBarras = null;
        let chartCircular = null;


        async function buscarJugador() {
            const correo = document.getElementById('inputCorreo').value.trim();
            const errorEl = document.getElementById('error');
            errorEl.textContent = '';


            if (!correo) {
                errorEl.textContent = 'Escribe un correo.';
                return;
            }


            try {
                const res = await fetch(`https://ygtfxb3dtnzrhhgw4sixxcynsq0qnzpw.lambda-url.us-east-1.on.aws/busqueda-jugador-correo/${correo}`);
                const data = await res.json();


                if (data.error) {
                    errorEl.textContent = data.error;
                    document.getElementById('contenido').style.display = 'none';
                    return;
                }


                const idJugador = Object.keys(data)[0];
                const jugador = data[idJugador];


                mostrarInfo(idJugador, jugador);
                mostrarGraficas(jugador.partidas);
                mostrarLogros(jugador.logros);


                document.getElementById('contenido').style.display = 'block';


            } catch (err) {
                errorEl.textContent = 'Error al conectar con el servidor.';
            }
        }


        function mostrarInfo(id, jugador) {
            document.getElementById('idJugador').textContent = id;
            document.getElementById('alias').textContent = jugador.alias;
            document.getElementById('correo').textContent = jugador.correo;
            document.getElementById('anio').textContent = jugador.anioNacimiento;
            document.getElementById('nivel').textContent = jugador.nivelAlcanzado;
        }


        function mostrarGraficas(partidas) {
            // Gráfica de Líneas
            const labelsLineas = partidas.map((p, i) => `Partida ${i + 1}`);
            const puntajes = partidas.map(p => p.puntaje);


            if (chartLineas) chartLineas.destroy();
            chartLineas = new Chart(document.getElementById('graficaLineas'), {
                type: 'line',
                data: {
                    labels: labelsLineas,
                    datasets: [{
                        label: 'Puntaje',
                        data: puntajes,
                        borderColor: '#e94560',
                        backgroundColor: 'rgba(233,69,96,0.2)',
                        tension: 0.3,
                        fill: true,
                    }]
                },
                options: {
                    plugins: { legend: { labels: { color: '#eee' } } },
                    scales: {
                        x: { ticks: { color: '#eee' }, grid: { color: '#0f3460' } },
                        y: { ticks: { color: '#eee' }, grid: { color: '#0f3460' } }
                    }
                }
            });


            // Gráfica de Barras
            const dificultades = { facil: 0, media: 0, dificil: 0 };
            partidas.forEach(p => {
                const d = p.dificultad?.toLowerCase();
                if (d === 'facil' || d === 'fácil')             dificultades.facil++;
                else if (d === 'media' || d === 'medio')        dificultades.media++;
                else if (d === 'dificil' || d === 'difícil')    dificultades.dificil++;
            });


            if (chartBarras) chartBarras.destroy();
            chartBarras = new Chart(document.getElementById('graficaBarras'), {
                type: 'bar',
                data: {
                    labels: ['Fácil', 'Media', 'Difícil'],
                    datasets: [{
                        label: 'Partidas',
                        data: [dificultades.facil, dificultades.media, dificultades.dificil],
                        backgroundColor: ['#e94560', '#e94560', '#e94560'],
                    }]
                },
                options: {
                    plugins: { legend: { labels: { color: '#eee' } } },
                    scales: {
                        x: { ticks: { color: '#eee' }, grid: { color: '#0f3460' } },
                        y: { ticks: { color: '#eee', stepSize: 1 }, grid: { color: '#0f3460' } }
                    }
                }
            });


            // Gráfica Circular
            const tiempoPorDia = {};
            partidas.forEach(p => {
                const dia = new Date(p.fechaHora).toLocaleDateString('es-MX');
                tiempoPorDia[dia] = (tiempoPorDia[dia] || 0) + p.tiempo;
            });


            const colores = ['#e94560','#f5a623','#4caf50','#2196f3','#9c27b0','#00bcd4'];


            if (chartCircular) chartCircular.destroy();
            chartCircular = new Chart(document.getElementById('graficaCircular'), {
                type: 'pie',
                data: {
                    labels: Object.keys(tiempoPorDia),
                    datasets: [{
                        data: Object.values(tiempoPorDia),
                        backgroundColor: colores.slice(0, Object.keys(tiempoPorDia).length),
                    }]
                },
                options: {
                    plugins: { legend: { labels: { color: '#eee' } } }
                }
            });
        }


        function mostrarLogros(logros) {
            const lista = document.getElementById('listaLogros');
            lista.innerHTML = '';


            if (logros.length === 0) {
                lista.innerHTML = '<p style="color:#aaa">Sin logros aún.</p>';
                return;
            }


            logros.forEach(l => {
                const fecha = new Date(l.fechaDesbloqueo).toLocaleDateString('es-MX');
                lista.innerHTML += `
                    <div class="logro-item">
                        <div>
                            <span class="logro-nombre">${l.nombre}</span>
                            <p style="font-size:13px; color:#aaa">${l.descripcion}</p>
                        </div>
                        <span class="logro-fecha">${fecha}</span>
                    </div>
                `;
            });
        }
