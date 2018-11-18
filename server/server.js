require('./config/config'); // Defining the port, it can be and environment port or a localhost port

const express = require('express'); // A web infraestructure
const mongoose = require('mongoose'); // To model our aplication data

const app = express(); // Declaring express function

app.use(express.urlencoded({ extended: false })) // Middleware: URL enconding converts characters into a format that can be transmitted over the internet
app.use(express.json()) //Middleware: Use json format 

app.use(require('./routes/index')); //Configuracion global de rutas

mongoose.connect(process.env.URLDB, (err, res)=>{ // To connect our server to our database
	if (err) throw err;

	console.log('Base de datos online');
})

app.listen(process.env.PORT, ()=> { //Listening on a specific port
	console.log(`Escuchando en el puerto ${process.env.PORT}`);
});