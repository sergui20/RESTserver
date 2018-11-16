const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore'); // Libreria que nos permite manipular objetos y mas cosas de una forma mas facil
const Usuario = require('../models/usuario');
const app = express();

app.get('/usuario', (req, res)=> {
	let from = req.query.from || 0;
	from = Number(from);

	let limit = req.query.limit || 5;
	limit = Number(limit);

	Usuario.find({ status: true }) // Buscando en la base de datos los documentos con status = true
	.skip(from) // Sirve para saltarse y empezar desde un numero que le pasamos por parametro
	.limit(limit) // El limite para buscar los datos de los usuarios
	.exec( (err, usuarios) => {
		if (err) {
			return res.status(400).json({ //Handling the error with json format, and showing it to the client
				ok:false,
				err
			});
		}

		Usuario.count({ status: true }, (err, totalUsers)=>{ // Contando los documentos con status = true

			res.json({
				ok: true,
				usuarios,
				totalUsers
			})
		})

	})
});

app.post('/usuario', (req, res)=> {
	let body = req.body;

	let usuario = new Usuario({
		nombre: body.nombre,
		email: body.email,
		password: bcrypt.hashSync(body.password, 10), // Encriptando nuestra contrasena con un hash de una sola via y con 10 vueltas
		role: body.role
	});

	usuario.save( (err, usuarioDB) => { // Saving our document usuario to the database, then it returns an error and a result, which is what we are saving to our DB
		if (err) {
			return res.status(400).json({ //Handling the error with json format, and showing it to the client
				ok:false,
				err
			});
		}

		res.json({ //Showing the response to the client with json format
			ok:true,
			usuario: usuarioDB
		})
	});
});

app.put('/usuario/:id', (req, res)=> {
	let id = req.params.id;
	console.log(req.body)
	let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'status']); // Elegimos las instancias del documento que si pueden serv cambiadas
/*
	delete body.password;
	delete body.google;
*/
	Usuario.findOneAndUpdate({ _id: id} , body, { new: true, runValidators:true }, (err, usuarioDB)=>{ // finOneAndUpdate actualiza el documentos y tiene los parametors (condicion, update, options, callback)
		if (err) { 
			return res.status(400).json({
				ok: false,
				err
			});
		}

		res.json({
			ok: true,
			usuario: usuarioDB
		});
	})

});

app.delete('/usuario/:id', (req, res)=> {
	let id = req.params.id;
	let body = req.body;
	let statusUser = {
		status: false // No quiero borrar el usuario, mas bien cambiarlo de estado
	};

	Usuario.findOneAndUpdate({ _id: id }, statusUser, { new:true }, (err, removedUser)=>{
		if (err) {
			return res.status(400).json({
				ok: false,
				err
			});
		}

		res.json({
			ok: true,
			removedUser
		})
	})
});

module.exports = app; //Exporting the app function, with the instances defined above