const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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
});

// Configuraciones de google

async function verify( token ) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });

  const payload = ticket.getPayload();

  return {
  	nombre: payload.name,
  	email: payload.email,
  	img: payload.picture,
  	google: true
  }
}

app.post('/google', async (req, res)=>{
	let tokenID = req.body.idtoken;

	let googleUser = await verify(tokenID)
		.catch(err => {
			return res.status(403).json({
				ok: false,
				err
			});
		});

	Usuario.findOne({ email: googleUser.email }, (err, userDB)=> {
		if (err) {
			return res.status(500).json({
				ok: false,
				err
			});
		}

		if (userDB) {
			if (userDB.google === false) {
				return res.status(400).json({
					ok: false,
					err: {
						message: 'Debe usar su autenticacion normal'
					}
				});
			} else {
				let token = jwt.sign({
				usuario: userDB
				}, process.env.SEED_TOKEN, { expiresIn: process.env.TOKEN_EXPIRE })
				
				return res.json({
					ok: true,
					usuario: userDB,
					token
				})
			}
		} else {
			// Si el usuario no existe en nuestra base de datos
			let usuario = new Usuario();

			usuario.nombre = googleUser.nombre;
			usuario.email = googleUser.email;
			usuario.img = googleUser.img;
			usuario.google = true;
			usuario.password = ':)';

			usuario.save( (err, userDB) =>{
				if (err) {
					return res.status(500).json({
						ok: false,
						err
					});
				};

				let token = jwt.sign({
				usuario: userDB
				}, process.env.SEED_TOKEN, { expiresIn: process.env.TOKEN_EXPIRE })
				
				return res.json({
					ok: true,
					usuario: userDB,
					token
				})
			})
		}

	});
});

module.exports = app;