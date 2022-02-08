const router = require('express').Router();
const fileUpload = require('express-fileupload');
const mysql = require('mysql');
const fs = require('fs');
const { send } = require('process');

var dbConn = require('../public/dbconfig.js');
const { isBuffer } = require('util');

function uploadMedidores(fileName) {
    const filePath = './src/public/files/textos/' + fileName
    console.log(filePath)
    fs.readFile(filePath, 'utf8', function (err, data) {
        // console.log(data)

        // Separamos cada linea convirtiendolas en elementos de un arreglo
        const lines = data.split("\r\n")
        // console.log(lines)

        for (const line in lines) {

            // Separamos cada parte de la linea convirtiendolas en elementos de un arreglo
            const atributos = lines[line].split("\t")

            // console.log(atributos[2])
            // atributos[2].split("\r")[0]

            if (atributos[0] && atributos[1] && atributos[2].split("\r")[0]) {
                const sql = "INSERT INTO unidad_del_medidor (medidor, unidad, codigo) VALUES (?, ?, ?)"
                dbConn.query(sql, [atributos[0], atributos[1], atributos[2]], (err, rows, fields) => {
                    if (err) {
                        console.log("Failed to insert new medidores: " + err)
                        res.sendStatus(500)
                        return
                    }
                })
            }
        }
    });
}

router.use(fileUpload());

// UNIDAD DEL MEDIDOR

router.post('/medidores', async (req, res, next) => {
    try {
        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            var file = req.files["medidores"];
            console.log(req.files);
            const filePath = './src/public/files/textos/' + file.name

            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            await file.mv(filePath);

            // Upload to database
            uploadMedidores(file.name)

            //send response
            res.send(file.name + ' is uploaded');
            console.log("Request successed")
        }
    } catch (err) {
        console.log(err)
        res.send('err');
    }
});

// REPARTO

router.post('/medidorreparto', (req, res) =>{
    const {fecha_hora, numero_cliente, numero_medidor, longitud, latitud, altitud, usuarios_id, clave_contrato} = req.body

    console.log(req.body)

    if(fecha_hora && numero_cliente && numero_medidor && longitud > -400 && latitud > -400 && altitud > -400 && usuarios_id && clave_contrato){
        const sql = "INSERT INTO reparto (fecha_hora, numero_cliente, numero_medidor, longitud, latitud, altitud, usuarios_id, clave_contrato) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        dbConn.query(sql, [fecha_hora, numero_cliente, numero_medidor, longitud, latitud, altitud, usuarios_id, clave_contrato], (err, rows, fields) => {
            if(err){
                console.log("No se pudo insertar el medidor " + err)
                res.send(err)
                return
            }

            console.log("Request successed")
            res.send(req.body);
        })
    }else{
        console.log("Algun dato esta incorrecto")
        res.send(Error)
    }

});

// USUARIOS

router.post('/usuario', (req, res) =>{
    const {nombre, contraseña, celular, numero_empleado, agencia} = req.body

    if(nombre && contraseña){
        const sql = "INSERT INTO usuarios (nombre, contraseña, celular, numero_empleado, agencia) VALUES (?, ?, ?, ?, ?)"
        dbConn.query(sql, [nombre, contraseña, celular, numero_empleado, agencia], (err, rows, fields) => {
            if(err){
                console.log("No se pudo insertar el usuario " + err)
                res.send('err');
                return
            }

            console.log("Request successed")
            res.send(req.body);
        })
    }else{
        res.send(Error)
    }

});

// LECTURA REMOTA

router.post('/lecturaremota/', (req, res) =>{

    fs.appendFile('src/public/files/uploadRequestLog', JSON.stringify(req.query) + '\n', function (err) {
        if(err) throw err;
        console.log('saved')
    })

    console.log(req.query)

    const { id, HoraRecep, DatoCrudo, Lectura, Hor1, Hor2, Hor3, Hor4, Hor5, Hor6, Factor, Al_Fuga, Al_FInverso, Al_Recepcion, Sel_Temp, Bateria } = req.query

    var {Temperatura} = req.query
    Temperatura = (Temperatura * 2) -10

    if(id){
        const sql = "INSERT INTO lectura_remota (id_device, HoraRecep, DatoCrudo, Lectura, Hor1, Hor2, Hor3, Hor4, Hor5, Hor6, Factor, Al_Fuga, Al_FInverso, Al_Recepcion, Sel_Temp, Bateria, Temperatura) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        dbConn.query(sql, [id, HoraRecep, DatoCrudo, Lectura, Hor1, Hor2, Hor3, Hor4, Hor5, Hor6, Factor, Al_Fuga, Al_FInverso, Al_Recepcion, Sel_Temp, Bateria, Temperatura], (err, rows, fields) => {
            if(err){
                console.log("No se pudo insertar la lectura, id del lector: " + id + "\n" + err)
                res.send("No se pudo insertar la lectura, id del lector: " + id + "\n" + err);
                return
            }

            console.log("Request successed")
            res.send("Se completo la peticion");
        })
    }else{
        res.send(Error)
    }

});

// LECTURAS INDUSTRIALES

router.post('/lecturasindustriales/:id', async (req, res) =>{
    console.log('Entra')
    try {
        if (!req.files && !req.body) {
            console.log('No hay archivos')
            console.log(req.body)
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            var files = null
            if(!req.files){
                files = req.body
            }else{
                files = req.files
            }

            console.log(files)

            const date = new Date()
            var fecha = date.toISOString().split("T")[0].split("-")
            var dia = "01"

            if(fecha[2] >= 9 && fecha[2] < 22){
                dia = "15"
            }

            var fecha = fecha[0] + fecha[1] + dia
            
            console.log("La fecha es:")
            console.log(fecha)

            const path = './src/public/files/lecturasIndustriales/' + fecha

            if(!fs.existsSync(path)){
                fs.mkdir(path, () => {
                    console.log("Se creo el directorio: " + path)
                })
            }

            var imageIndex = 1
            // Iteramos por cada imagen que se agregara
            for(var fileName in files){

                //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
                var file = files[fileName];

                // Se deberia de agregar a la direccion la fecha de manera que quede entre images y el nombre del archivo
                const filePath = path + "/" + req.params.id + " (" + imageIndex + ")." + file.name.split(".")[1]
    
                //Use the mv() method to place the file in upload directory (i.e. "uploads")
                await file.mv(filePath);

                imageIndex += 1
            }

            // Guardamos la lectura
            fs.appendFile(path + "/lecturas.txt", req.params.id + ": " + req.query.lectura + "\n", function (err) {
                if(err) throw err;
                console.log('saved')
            })



            //send response
            res.send("Files were succesfully upload");
            console.log("Request successed")
        }
    } catch (err) {
        console.log(err)
        res.send('err');
    }
});

module.exports = router;