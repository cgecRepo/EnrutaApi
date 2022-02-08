const express = require('express');
const bodyParser = require('body-parser');
const { text } = require('body-parser');
const path = require('path')

const app = express();

// Puerto
const port = 3001;

// middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(bodyParser.text(text))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT");
  
    next();
  
  });

// settings
app.set('port', port)
app.use(bodyParser.urlencoded({extended: false}))

//static files
app.use(express.static(path.join(__dirname, './public')))

// routes
app.use('/api', require('./routes/api'));
app.use('/upload', require('./routes/upload'));

// Server
app.listen(app.get('port'), () => {
    console.log('Server on port: ' + app.get('port'))
});