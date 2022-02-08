const { Router } = require('express');
const router = Router();
const mysql = require('mysql');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver')

var dbConn = require('../public/dbconfig.js');
const { features } = require('process');
const { brotliCompress } = require('zlib');
const { resolve } = require('path');

// API

// Medidores
router.get('/medidores', (req, res) => {

    dbConn.query("SELECT * FROM unidad_del_medidor", (err, rows, fields) => {
        if (err) {
            console.log("Failed to query for users: " + err)
            res.sendStatus(500)
            return
        }

        console.log("Request successed")
        res.json(rows)
    })
});

router.get('/medidor/:id', (req, res) => {

    const medidorId = req.params.id;
    const queryString = "SELECT * FROM unidad_del_medidor WHERE id = ?"

    dbConn.query(queryString, [medidorId], (err, rows, fields) => {
        if (err) {
            console.log("Failed to query for users: " + err)
            res.sendStatus(500)
            return
        }

        console.log("Request successed")
        res.send(rows)
    })
});

router.get('/medidores/medidor/:medidor', (req, res) => {

    const medidor = req.params.medidor;
    const queryString = "SELECT * FROM unidad_del_medidor WHERE medidor = ?"

    dbConn.query(queryString, [medidor], (err, rows, fields) => {
        if (err) {
            console.log("Failed to query for users: " + err)
            res.sendStatus(500)
            return
        }

        console.log("Request successed")
        res.send(rows)
    })
});

router.get('/medidores/unidad/:unidad', (req, res) => {

    const unidad = req.params.unidad;
    const queryString = "SELECT * FROM unidad_del_medidor WHERE unidad = ?"

    dbConn.query(queryString, [unidad], (err, rows, fields) => {
        if (err) {
            console.log("Failed to query for users: " + err)
            res.sendStatus(500)
            return
        }

        console.log("Request successed")
        res.send(rows)
    })
});

router.get('/medidores/codigo/:codigo', (req, res) => {

    const codigo = req.params.codigo;
    const queryString = "SELECT * FROM unidad_del_medidor WHERE codigo = ?"

    dbConn.query(queryString, [codigo], (err, rows, fields) => {
        if (err) {
            console.log("Failed to query for users: " + err)
            res.sendStatus(500)
            return
        }

        console.log("Request successed")
        res.send(rows)
    })
});

// REPARTO

router.get('/medidoresreparto', (req, res) => {

    dbConn.query("SELECT * FROM reparto", (err, rows, fields) => {
        if (err) {
            console.log("Failed to query for reparto: " + err)
            res.sendStatus(500)
            return
        }

        console.log("Request successed")
        res.json(rows)
    })
});

router.get('/medidoresreparto/:usuarios_id', (req, res) => {

    const usuarios_id = req.params.usuarios_id;
    const queryString = "SELECT * FROM reparto WHERE usuarios_id = ?"

    dbConn.query(queryString, [usuarios_id], (err, rows, fields) => {
        if (err) {
            console.log("Failed to query for medidorreparto: " + err)
            res.sendStatus(500)
            return
        }

        console.log("Request successed")
        res.send(rows)
    })
});

// Usuarios

router.get('/usuarios', (req, res) => {

    dbConn.query("SELECT * FROM usuarios", (err, rows, fields) => {
        if (err) {
            console.log("Failed to query for users: " + err)
            res.sendStatus(500)
            return
        }

        console.log("Request successed")
        res.json(rows) 
    })
});

router.get('/usuario', (req, res) => {
    
    const nombre = req.query.nombre;
    const contraseña = req.query.contraseña;
    const queryString = "SELECT * FROM usuarios WHERE nombre = ? AND contraseña = ?"
    
    dbConn.query(queryString, [nombre, contraseña], (err, rows, fields) => {
        if(err){
            console.log("Failed to query for users: " + err)
            res.sendStatus(500)
            return
        }

        const users = rows.map((row) => {
            return {
                id: row.id,
                nombre: row.nombre
            }
        })

        res.send(users)
    })
});

// Lectura remota

router.get('/lecturaremota', (req, res) => {

    dbConn.query("SELECT * FROM lectura_remota", (err, rows, fields) => {
        if (err) {
            console.log("Failed to query for users: " + err)
            res.sendStatus(500)
            return
        }

        console.log("Request successed")
        res.json(rows) 
    })
});


// Lecturas Indsutriales    ---------------------------------------------------------------------

function zipDirectory(sourceDir, outPath) {
    const archive = archiver('zip', { zlib: { level: 9 }});
    const stream = fs.createWriteStream(outPath);
  
    return new Promise((resolve, reject) => {
      archive
        .directory(sourceDir, false)
        .on('error', err => reject(err))
        .pipe(stream)
      ;
  
      stream.on('close', () => resolve());
      archive.finalize();
    });
  }

router.get('/lecturasindustriales/imagenes', async (req, res) => {
    const date = new Date()
    var fecha = date.toISOString().split("T")[0].split("-")
    var dia = "01"

    if(fecha[2] >= 9 && fecha[2] < 22){
        dia = "15"
    }

    var fecha = fecha[0] + fecha[1] + dia

    const path = './src/public/files/lecturasIndustriales/' + fecha
    
    zipDirectory(path, path).then(()=> {
        res.download(path + '.zip')
    });
    
});

module.exports = router;