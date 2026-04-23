import express from "express";
import cors from "cors";
import db from "./EresCero_DB.mjs";

const app = express();
const port = process.env.PORT ?? 8080;
const ipAddress = process.env.HOSTNAME ?? "localhost";

app.use(cors());

app.use(express.json());

app.get("/datos-jugador/:idJugador", async (req, res) => {
    const idJugador = req.params.idJugador;
    let conexion;

    try {
        conexion = await db.crearConexion();
        const resultado = await db.obtenerDatosJugador(conexion, idJugador);
        res.json(resultado);
    } catch (err) {
        const { name, message } = err;
        res.json({ name, message });
    } finally {
        if (conexion) {
            await conexion.end();
        }
    }
});

app.get("/ranking-historico", async (req, res) => {
    let conexion;

    try {
        conexion = await db.crearConexion();
        const resultado = await db.obtenerRankingHistorico(conexion);
        res.json(resultado);
    } catch (err) {
        const { name, message } = err;
        res.json({ name, message });
    } finally {
        if (conexion) {
            await conexion.end();
        }
    }
});

app.get("/ranking-semanal", async (req, res) => {
    let conexion;

    try {
        conexion = await db.crearConexion();
        const resultado = await db.obtenerRankingSemanal(conexion);
        res.json(resultado);
    } catch (err) {
        const { name, message } = err;
        res.json({ name, message });
    } finally {
        if (conexion) {
            await conexion.end();
        }
    }
});

app.get("/informacion-general", async (req, res) => {
    let conexion;

    try {
        conexion = await db.crearConexion();
        const resultado = await db.obtenerInformacionGeneral(conexion);
        res.json(resultado);
    } catch (err) {
        const { name, message } = err;
        res.json({ name, message });
    } finally {
        if (conexion) {
            await conexion.end();
        }
    }
});

app.get("/busqueda-jugador-correo/:correo", async (req, res) => {
    let conexion;
    const correo = req.params.correo;

    try {
        conexion = await db.crearConexion();
        const resultado = await db.obtenerDesempenoIndividual(conexion, correo);

        res.json(resultado);
    } catch (err) {
        const { name, message } = err;
        res.json({ name, message });
    } finally {
        if (conexion) {
            await conexion.end();
        }
    }
});

app.post("/registro", async (req, res) => {
    let conexion;

    try {
        conexion = await db.crearConexion();
        const resultado = await db.registrarUsuario(conexion, req.body);

        res.status(200).json({
            idJugador: resultado,
            alias: req.body.alias,
        });
    } catch (err) {
        //const { name, message } = err;
        //res.status(400).json({ name, err.message });
        res.status(400).json({
            error: err.message,
        });
    } finally {
        if (conexion) {
            await conexion.end();
        }
    }
});

app.post("/login", async (req, res) => {
    let conexion;

    try {
        conexion = await db.crearConexion();
        const resultado = await db.iniciarSesion(conexion, req.body);

        if (!resultado) {
            res.status(400).json({
                error: "Cuenta no encontrada",
            });
        } else {
            res.json({
                idJugador: resultado,
                alias: req.body.alias,
            });
        }

        res.json(resultado);
    } catch (err) {
        const { name, message } = err;
        res.json({ name, message });
    } finally {
        if (conexion) {
            await conexion.end();
        }
    }
});

app.post("/partida", async (req, res) => {
    let conexion;

    try {
        conexion = await db.crearConexion();
        const resultado = await db.subirPartida(conexion, req.body);
        res.json(resultado);
    } catch (err) {
        const { name, message } = err;
        res.json({ name, message });
    } finally {
        if (conexion) {
            await conexion.end();
        }
    }
});

app.post("/logro", async (req, res) => {
    let conexion;

    try {
        conexion = await db.crearConexion();
        const resultado = await db.asignarLogro(conexion, req.body);
        res.json(resultado);
    } catch (err) {
        const { name, message } = err;
        res.json({ name, message });
    } finally {
        if (conexion) {
            await conexion.end();
        }
    }
});

app.post("/aspecto", async (req, res) => {
    let conexion;

    try {
        conexion = await db.crearConexion();
        const resultado = await db.asignarAspecto(conexion, req.body);
        res.json(resultado);
    } catch (err) {
        const { name, message } = err;
        res.json({ name, message });
    } finally {
        if (conexion) {
            await conexion.end();
        }
    }
});

app.listen(port, () => {
    if (process.env.AWS_LAMBDA_FUNCTION_NAME === undefined) {
        app.listen(port, () => {
            console.log(`Server listening at http://${ipAddress}:${port}`);
        });
    }
});

export default app;
