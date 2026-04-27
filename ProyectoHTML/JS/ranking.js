
        fetch('https://ygtfxb3dtnzrhhgw4sixxcynsq0qnzpw.lambda-url.us-east-1.on.aws/ranking-historico')
            .then(res => res.json()) // cada then recive la info del anteriro 
            .then(datos => {
                const tabla = document.getElementById('tabla-historico');
                datos.forEach(fila => {
                    //tr que es table row td y table data
                    
                    tabla.innerHTML += `<tr>  
                        <td>${fila.posicion}</td>
                        <td>${fila.alias}</td>
                        <td>${fila.puntaje}</td>
                        <td>${fila.correo}</td>
                    </tr>`;
                });
            });


        fetch('https://ygtfxb3dtnzrhhgw4sixxcynsq0qnzpw.lambda-url.us-east-1.on.aws/ranking-semanal')
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

