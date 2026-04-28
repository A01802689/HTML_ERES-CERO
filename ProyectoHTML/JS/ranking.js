
        fetch('https://ygtfxb3dtnzrhhgw4sixxcynsq0qnzpw.lambda-url.us-east-1.on.aws/ranking-historico')
            .then(res => res.json())
            .then(datos => {
                const tabla = document.getElementById('tabla-historico');
                           // tr es table row 
                for (let fila of datos) {
                    tabla.innerHTML += `<tr>      
                        <td>${fila.posicion}</td>
                        <td>${fila.alias}</td>
                        <td>${fila.puntaje}</td>
                        <td>${fila.correo}</td>
                    </tr>`;
                }
            });


      fetch('https://ygtfxb3dtnzrhhgw4sixxcynsq0qnzpw.lambda-url.us-east-1.on.aws/ranking-semanal')
            .then(res => res.json())
            .then(datos => {
                const tabla = document.getElementById('tabla-semanal');

                for (let fila of datos) {  // las tildes invertidas me ahorra el colocarle + en cda parte y me deja unir todo
                    tabla.innerHTML += `<tr> 
                        <td>${fila.posicion}</td>
                        <td>${fila.alias}</td>
                        <td>${fila.puntaje}</td>
                        <td>${fila.correo}</td>
                    </tr>`;
                }
            });
