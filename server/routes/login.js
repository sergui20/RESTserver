const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

const app = express();

app.post('/login', (req, res)=>{
	let body = req.body;

	Usuario.findOne({ email: body.email }, (err, userDB)=>{ //finOne busca un documento especifico en nuestra base de datos
		if (err) {
			return res.status(500).json({
				ok: false,
				err
			});
		}

		if ( !userDB ) {
			return res.status(400).json({
				ok: false,
				err: {
					message: 'Usuario o contrasena incorrectos'
				}
			});
		}

		if ( !bcrypt.compareSync( body.password, userDB.password ) ) { // Comparando si la contrasena es la misma al de los usuarios de nuestra base de datos usando una libreria que tiene como metodo compareSync
			return res.status(400).json({
				ok: false,
				err: {
					message: 'Usuario o contrasena incorrectos'
				}
			});
		}

		let token = jwt.sign({ // Generamos un token con los datos del usuario que buscamos arriba, le agregamos un SEED que es una clave secreta, y una fecha de expiracion
			usuario: userDB
		}, process.env.SEED_TOKEN, { expiresIn: process.env.TOKEN_EXPIRE }) // expiresIn tiene como parametros(segundos, minutos, horas, dias)

		res.json({
			ok: true,
			usuario: userDB,
			token
		});
	})
})

module.exports = app;