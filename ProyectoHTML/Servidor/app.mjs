import express from "express";
import cors from "cors";
import db from "./EresCero_DB.mjs";

const app = express();
const port = process.env.PORT ?? 8080;
const ipAddress = process.env.HOSTNAME ?? "localhost";

app.use(express.json());

app.get("/ranking-historico", async (req, res) => {
    let conexion;

    try {
        conexion = await db.crearConexion();
        const resultado = await obtenerRankingHistorico(conexion);
        res.json(resultado);
    } catch (err) {
        const { name, message } = err;
        res.json({ name, message });
    } finally {
        if (conexion) {
            await conexion.end;
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
