 fetch('https://5fnoeikzkocxvy3zixmnjss3xi0ffnsc.lambda-url.us-east-1.on.aws/informacion-general')
            .then(res => res.json())
            .then(data => {
                const contenedor = document.querySelector('.contenedor-scroll');
                contenedor.innerHTML = '';

                for (let idJugador in data) {
                    const jugador = data[idJugador];
                    contenedor.innerHTML += `
                        <h2>${jugador.alias}</h2>
                        <p>Correo: ${jugador.correo}</p>
                        <p>Año de nacimiento: ${jugador.anioNacimiento}</p>
                        <p>Nivel alcanzado: ${jugador.nivelAlcanzado}</p>
                        <h3>Partidas</h3>
                        <ul>
                            ${jugador.partidas.map(p => `
                                <li>Fecha: ${p.fechaHora} | Puntaje: ${p.puntaje} | Tiempo: ${p.tiempo}</li>
                            `).join('')}
                        </ul>
                        <h3>Logros</h3>
                        <ul>
                            ${jugador.logros.map(l => `
                                <li><b>${l.nombre}</b>: ${l.descripcion} (${l.fechaDesbloqueo})</li>
                            `).join('')}
                        </ul>
                        <hr>
                    `;
                }
            })
            .catch(err => console.error('Error:', err));