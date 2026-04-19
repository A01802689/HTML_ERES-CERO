
        fetch('https://5fnoeikzkocxvy3zixmnjss3xi0ffnsc.lambda-url.us-east-1.on.aws/ranking-historico')
            .then(res => res.json())
            .then(datos => {
                const tabla = document.getElementById('tabla-historico');
                datos.forEach(fila => {
                    
                    tabla.innerHTML += `<tr>
                        <td>${fila.posicion}</td>
                        <td>${fila.alias}</td>
                        <td>${fila.puntaje}</td>
                        <td>${fila.correo}</td>
                    </tr>`;
                });
            });

        // Ranking semanal
        fetch('https://5fnoeikzkocxvy3zixmnjss3xi0ffnsc.lambda-url.us-east-1.on.aws/ranking-semanal')
            .then(res => res.json())
            .then(datos => {
                const tabla = document.getElementById('tabla-semanal');
                datos.forEach(fila => {
                    tabla.innerHTML += `<tr>
                        <td>${fila.posicion}</td>
                        <td>${fila.alias}</td>
                        <td>${fila.puntaje}</td>
                        <td>${fila.correo}</td>
                    </tr>`;
                });
            });

