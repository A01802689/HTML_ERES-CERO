import mysql from "mysql2/promise";

async function crearConexion() {
    return await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
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
    const sqlSelect =
        "SELECT rh.posicion as posicion, j.alias as alias, rh.puntaje as puntaje " +
        "FROM RANKING_HISTORICO rh " +
        "JOIN JUGADOR j ON rh.idJugador = j.idJugador " +
        "ORDER BY rh.posicion ASC";
    const [rows] = await conexion.query(sqlSelect);
    return rows;
}

async function obtenerRankingSemanal(conexion) {
    const sqlSelect =
        "SELECT rs.posicion as posicion, j.alias as alias, rs.puntaje as puntaje " +
        "FROM RANKING_SEMANAL rs " +
        "JOIN JUGADOR j ON rs.idJugador = j.idJugador " +
        "ORDER BY rs.posicion ASC";
    const [rows] = await conexion.query(sqlSelect);
    return rows;
}

export default {
    crearConexion,
    obtenerDatosJugador,
    obtenerRankingHistorico,
    obtenerRankingSemanal,
};
