import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

async function crearConexion() {
    return await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Halo360#Hola',
        database: 'erescero'
    });
}

app.get('/ranking-historico', async (req, res) => {
    let conexion;
    try {
        conexion = await crearConexion();
        const [resultado] = await conexion.query(`
            SELECT rh.posicion, j.alias, rh.puntaje, j.correo
            FROM ranking_historico rh
            JOIN jugador j ON rh.idJugador = j.idJugador
            ORDER BY rh.posicion ASC
        `);
        res.json(resultado);
    } catch (err) {
        const { name, message } = err;
        res.json({ name, message });
    } finally {
        if (conexion) await conexion.end();
    }
});

app.get('/ranking-semanal', async (req, res) => {
    let conexion;
    try {
        conexion = await crearConexion();
        const [resultado] = await conexion.query(`
            SELECT rs.posicion, j.alias, rs.puntaje, j.correo
            FROM ranking_semanal rs
            JOIN jugador j ON rs.idJugador = j.idJugador
            ORDER BY rs.posicion ASC
        `);
        res.json(resultado);
    } catch (err) {
        const { name, message } = err;
        res.json({ name, message });
    } finally {
        if (conexion) await conexion.end();
    }
});

app.get('/informacion-general', async (req, res) => {
    let conexion;
    try {
        conexion = await crearConexion();
        let resultado = {};

        const [rows1] = await conexion.query(
            "SELECT idJugador, alias, anioNacimiento, nivelAlcanzado, correo FROM JUGADOR;"
        );
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

        const [rows2] = await conexion.query(
            "SELECT idJugador, fechaHora, puntaje, tiempo FROM PARTIDA;"
        );
        for (let row of rows2) {
            resultado[row.idJugador].partidas.push({
                fechaHora: row.fechaHora,
                puntaje: row.puntaje,
                tiempo: row.tiempo,
            });
        }

        const [rows3] = await conexion.query(
            "SELECT jl.idJugador, jl.fechaDesbloqueo, " +
            "l.idLogro, l.nombre, l.descripcion " +
            "FROM JUGADOR_LOGRO jl " +
            "JOIN LOGRO l ON jl.idLogro = l.idLogro;"
        );
        for (let row of rows3) {
            resultado[row.idJugador].logros.push({
                fechaDesbloqueo: row.fechaDesbloqueo,
                idLogro: row.idLogro,
                nombre: row.nombre,
                descripcion: row.descripcion,
            });
        }

        res.json(resultado);
    } catch (err) {
        const { name, message } = err;
        res.json({ name, message });
    } finally {
        if (conexion) await conexion.end();
    }
});


app.get('/jugador-por-correo/:correo', async (req, res) => {
    const correo = req.params.correo;
    let conexion;
    try {
        conexion = await crearConexion();
        let resultado = {};
        const [rows1] = await conexion.query(
            "SELECT idJugador, alias, anioNacimiento, nivelAlcanzado, correo FROM JUGADOR WHERE correo = ?;",
            [correo]
        );


        if (rows1.length === 0) {
            res.json({ error: "No se encontró ningún jugador con ese correo" });
            return;
        }


        const jugador = rows1[0];
        resultado[jugador.idJugador] = {
            alias: jugador.alias,
            anioNacimiento: jugador.anioNacimiento,
            nivelAlcanzado: jugador.nivelAlcanzado,
            correo: jugador.correo,
            partidas: [],
            logros: [],
        };


        const idJugador = jugador.idJugador;

        const [rows2] = await conexion.query(
            "SELECT idJugador, fechaHora, puntaje, tiempo, dificultad  FROM PARTIDA WHERE idJugador = ?;",
            [idJugador]
        );
        for (let row of rows2) {
            resultado[idJugador].partidas.push({
                fechaHora: row.fechaHora,
                puntaje: row.puntaje,
                tiempo: row.tiempo,
                dificultad: row.dificultad,
            });
        }



        const [rows3] = await conexion.query(
            "SELECT jl.idJugador, jl.fechaDesbloqueo, " +
            "l.idLogro, l.nombre, l.descripcion " +
            "FROM JUGADOR_LOGRO jl " +
            "JOIN LOGRO l ON jl.idLogro = l.idLogro " +
            "WHERE jl.idJugador = ?;",
            [idJugador]
        );
        for (let row of rows3) {
            resultado[idJugador].logros.push({
                fechaDesbloqueo: row.fechaDesbloqueo,
                idLogro: row.idLogro,
                nombre: row.nombre,
                descripcion: row.descripcion,
            });
        }


        res.json(resultado);
    } catch (err) {
        const { name, message } = err;
        res.json({ name, message });
    } finally {
        if (conexion) await conexion.end();
    }
});


app.listen(port, () => console.log(`Servidor corriendo en puerto ${port}`));

export default app;