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

    const sqlSelect2 =
        "SELECT idJugador, fechaHora, puntaje, tiempo FROM PARTIDA;";
    const [rows2] = await conexion.query(sqlSelect2);

    for (let row of rows2) {
        resultado[row.idJugador].partidas.push({
            fechaHora: row.fechaHora,
            puntaje: row.puntaje,
            tiempo: row.tiempo,
        });
        //console.log(resultado[row.idJugador].partidas);
    }

    const sqlSelect3 =
        "SELECT jl.idJugador as idJugador, jl.fechaDesbloqueo as fechaDesbloqueo, " +
        "l.idLogro as idLogro, l.nombre as nombre, l.descripcion as descripcion " +
        "FROM JUGADOR_LOGRO jl " +
        "JOIN LOGRO l ON jl.idLogro = l.idLogro;";
    const [rows3] = await conexion.query(sqlSelect3);

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

export default {
    crearConexion,
    obtenerDatosJugador,
    obtenerRankingHistorico,
    obtenerRankingSemanal,
    obtenerInformacionGeneral,
};
