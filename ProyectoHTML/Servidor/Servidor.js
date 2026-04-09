const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Halo360#Hola',
    database: 'erescero'
});

db.connect((err) => {
    if (err) {
        console.log('Error conectando a MySQL:', err);
        return;
    }
    console.log('Conectado a MySQL');
});

// Ranking histórico
app.get('/ranking-historico', (req, res) => {
    db.query(`
        SELECT rh.posicion, j.alias, rh.puntaje 
        FROM ranking_historico rh
        JOIN jugador j ON rh.idJugador = j.idJugador
        ORDER BY rh.posicion ASC
    `, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Ranking semanal
app.get('/ranking-semanal', (req, res) => {
    db.query(`
        SELECT rs.posicion, j.alias, rs.puntaje 
        FROM ranking_semanal rs
        JOIN jugador j ON rs.idJugador = j.idJugador
        ORDER BY rs.posicion ASC
    `, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));