    fetch('https://ygtfxb3dtnzrhhgw4sixxcynsq0qnzpw.lambda-url.us-east-1.on.aws/informacion-general')
        .then(res => res.json())
        .then(data => {                  // esdta es una froma de decile a java que busque un elemto con esta clase
            const contenedor = document.querySelector('.contenedor-scroll');
            contenedor.innerHTML = ''; //limpiar lo que habia antes de cada contenedor para evitar dupliacdos

            for (let idJugador in data) {
                const jugador = data[idJugador];

                let partidasHTML = '';
                for (let p of jugador.partidas) {
                   const fecha = new Date(p.fechaHora).toLocaleDateString('es-MX');
                    partidasHTML += `<li>Fecha: ${fecha} | Puntaje: ${p.puntaje} | Tiempo: ${p.tiempo}</li>`;
                }

                let logrosHTML = '';
                for (let l of jugador.logros) {
                    const fechaLogro = new Date(l.fechaDesbloqueo).toLocaleDateString('es-MX');
                    logrosHTML += `<li><b>${l.nombre}</b>: ${l.descripcion} (${fechaLogro})</li>`;
                }
                                           // el contenedor.innerHTMl me aydua a eviatr que se dupliquen datos, al borrar lo anterio y volver a subir la tabla
                contenedor.innerHTML += `  
                    <h2>${jugador.alias}</h2>
                    <p>Correo: ${jugador.correo}</p>
                    <p>Año de nacimiento: ${jugador.anioNacimiento}</p>
                    <p>Nivel alcanzado: ${jugador.nivelAlcanzado}</p>
                    <h3>Partidas</h3>
                    <ul>${partidasHTML}</ul>
                    <h3>Logros</h3>
                    <ul>${logrosHTML}</ul>
                    <hr>
                `;
            }
        })
        .catch(err => console.error('Error:', err));
            //li (list item)
            //ul unordered list 
            