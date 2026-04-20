import mysql from "mysql2/promise";

async function crearConexion() {
    return await mysql.createConnection({
        host: process.env.MYSQL_HOST ?? "localhost",
        user: process.env.MYSQL_USER ?? "root",
        password: process.env.MYSQL_PASSWORD ?? "",
        database: "EresCero",
    });
}

async function obtenerDatosJugador(conexion, idJugador) {
    let sqlSelect =
        "SELECT idJugador, alias, anioNacimiento, nivelAlcanzado FROM JUGADOR WHERE idJugador = ?";
    const [rows] = await conexion.query(sqlSelect, [idJugador]);
    let row = rows[0];
    if (row) {
        return {
            idJugador: row.idJugador,
            alias: row.alias,
            correo: row.correo,
            anioNacimiento: row.anioNacimiento,
            nivelAlcanzado: row.nivelAlcanzado,
        };
    }
}

async function obtenerRankingHistorico(conexion) {
    const sqlSelect = "SELECT rh.posicion as posicion, j.alias as alias," +
        "rh.puntaje as puntaje, j.correo as correo " +
        "FROM RANKING_HISTORICO rh " +
        "JOIN JUGADOR j ON rh.idJugador = j.idJugador " +
        "ORDER BY rh.posicion ASC";
    const [rows] = await conexion.query(sqlSelect);
    return rows;
}

async function obtenerRankingSemanal(conexion) {
    const sqlSelect = "SELECT rs.posicion as posicion, j.alias as alias," +
        "rs.puntaje as puntaje, j.correo as correo " +
        "FROM RANKING_SEMANAL rs " +
        "JOIN JUGADOR j ON rs.idJugador = j.idJugador " +
        "ORDER BY rs.posicion ASC";
    const [rows] = await conexion.query(sqlSelect);
    return rows;
}

async function obtenerInformacionGeneral(conexion) {
    let resultado = {};
    const sqlSelect1 =
        "SELECT idJugador, alias, anioNacimiento, nivelAlcanzado, correo FROM JUGADOR;";
    const [rows1] = await conexion.query(sqlSelect1);

    const sqlSelect2 =
        "SELECT idJugador, fechaHora, puntaje, tiempo FROM PARTIDA;";
    const [rows2] = await conexion.query(sqlSelect2);

    const sqlSelect3 =
        "SELECT jl.idJugador as idJugador, jl.fechaDesbloqueo as fechaDesbloqueo, " +
        "l.idLogro as idLogro, l.nombre as nombre, l.descripcion as descripcion " +
        "FROM JUGADOR_LOGRO jl " +
        "JOIN LOGRO l ON jl.idLogro = l.idLogro;";
    const [rows3] = await conexion.query(sqlSelect3);

    for (let row of rows1) {
        resultado[row.idJugador] = {
            alias: row.alias,
            anioNacimiento: row.anioNacimiento,
            nivelAlcanzado: row.nivelAlcanzado,
            correo: row.correo,
            partidas: [],
            logros: [],
        };
    }

    for (let row of rows2) {
        resultado[row.idJugador].partidas.push({
            fechaHora: row.fechaHora,
            puntaje: row.puntaje,
            tiempo: row.tiempo,
        });
        //console.log(resultado[row.idJugador].partidas);
    }

    for (let row of rows3) {
        resultado[row.idJugador].logros.push({
            fechaDesbloqueo: row.fechaDesbloqueo,
            idLogro: row.idLogro,
            nombre: row.nombre,
            descripcion: row.descripcion,
        });
        //console.log(row);
        //console.log(resultado[row.idJugador].logros);
    }

    return resultado;
}

async function obtenerDesempenoIndividual(conexion, correo) {
    let sqlSelect =
        "SELECT idJugador, correo, alias, anioNacimiento, nivelAlcanzado FROM JUGADOR WHERE correo = ?";
    const [rows1] = await conexion.query(sqlSelect, [correo]);
    let row1 = rows1[0];

    let resultado = {};
    if (row1) {
        resultado[row1.idJugador] = {
            alias: row1.alias,
            correo: row1.correo,
            nivelActual: row1.nivelAlcanzado,
            anioNacimiento: row1.anioNacimiento,
            partidas: [],
            logros: [],
        };
        const sqlSelect2 = "SELECT p.fechaHora as fechaHora, " +
            "p.puntaje as puntaje, p.tiempo as tiempo " +
            "FROM PARTIDA p " +
            "JOIN JUGADOR j ON p.idJugador = j.idJugador " +
            "WHERE j.idJugador = ?";
        const [rows2] = await conexion.query(sqlSelect2, [row1.idJugador]);

        const sqlSelect3 = "SELECT jl.fechaDesbloqueo as fechaDesbloqueo, " +
            "l.idLogro as idLogro, l.nombre as nombre, l.descripcion as descripcion " +
            "FROM JUGADOR j " +
            "JOIN JUGADOR_LOGRO jl ON j.idJugador = jl.idJugador " +
            "JOIN LOGRO l ON jl.idLogro = l.idLogro " +
            "WHERE j.idJugador = ?";
        const [rows3] = await conexion.query(sqlSelect3, [row1.idJugador]);

        for (let row of rows2) {
            resultado[row1.idJugador].partidas.push({
                fechaHora: row.fechaHora,
                puntaje: row.puntaje,
                tiempo: row.tiempo,
                dificultad: row.dificultad,
            });
        }
        for (let row of rows3) {
            resultado[row1.idJugador].logros.push({
                fechaDesbloqueo: row.fechaDesbloqueo,
                idLogro: row.idLogro,
                nombre: row.nombre,
                descripcion: row.descripcion,
            });
        }
    } else {
        resultado["message"] =
            "No se ha encontrado un usuario con este correo.";
    }

    return resultado;
}

async function registrarUsuario(conexion, body) {
    const sqlCall = "CALL RegistrarUsuario(?,?,?,?)";
    const [resultado] = await conexion.query(
        sqlCall,
        [body.alias, body.correo, body.nip, body.anioNacimiento],
    );

    return resultado[0];
}

//async function iniciarSesion(conexion, body) {
//  const sqlSelect = "SELECT IniciarSesion(?,?)";
//  const [resultado] = await conexion.query(sqlSelect, [body.correo, body.nip]);
//
//  return resultado[0][`IniciarSesion('${body.correo}',${body.nip})`];
//}

async function iniciarSesion(conexion, body) {
  const sqlSelect = "SELECT IniciarSesion(?,?)";
  const [resultado] = await conexion.query(sqlSelect, [body.alias, body.nip]);

  return resultado[0][`IniciarSesion('${body.alias}',${body.nip})`];
}

async function subirPartida(conexion, body) {
    const sqlInsert =
        "INSERT INTO PARTIDA(idJugador,fechaHora,puntaje,dificultad,tiempo)" +
        "VALUES(?,?,?,?,?);";

    const [resultado] = await conexion.execute(
        sqlInsert,
        [
            body.idJugador,
            body.fechaHora,
            body.puntaje,
            body.dificultad,
            body.tiempo,
        ],
    );

    return resultado[0];
}

export default {
    crearConexion,
    obtenerDatosJugador,
    obtenerRankingHistorico,
    obtenerRankingSemanal,
    obtenerInformacionGeneral,
    obtenerDesempenoIndividual,
    registrarUsuario,
    iniciarSesion,
    subirPartida,
};
