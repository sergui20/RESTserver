const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const app = express();

const { authorizationToken, authorizationAdmin } = require('../middlewares/author');

app.get('/usuario', authorizationToken, (req, res)=> {
	let from = req.query.from || 0;
	from = Number(from);

	let limit = req.query.limit || 5;
	limit = Number(limit);

	Usuario.find({ status: true })
	.skip(from)
	.limit(limit)
	.exec( (err, usuarios) => {
		if (err) {
			return res.status(400).json({
				ok:false,
				err
			});
		}

		Usuario.count({ status: true }, (err, totalUsers)=>{

			res.json({
				ok: true,
				usuarios,
				totalUsers
			})
		})

	})
});

app.post('/usuario', [authorizationToken, authorizationAdmin], (req, res)=> {
	let body = req.body;

	let usuario = new Usuario({
		nombre: body.nombre,
		email: body.email,
		password: bcrypt.hashSync(body.password, 10),
		role: body.role
	});

	usuario.save( (err, usuarioDB) => {
		if (err) {
			return res.status(400).json({
				ok:false,
				err
			});
		}

		res.json({
			ok:true, 
			usuario: usuarioDB
		})
	});
});
 
app.put('/usuario/:id', [authorizationToken, authorizationAdmin], (req, res)=> {
	let id = req.params.id;
	console.log(req.body)
	let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'status']);
/*
	delete body.password;
	delete body.google;
*/
	Usuario.findOneAndUpdate({ _id: id} , body, { new: true, runValidators:true }, (err, usuarioDB)=>{
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

app.delete('/usuario/:id', [authorizationToken, authorizationAdmin], (req, res)=> {
	let body = req.body;
	let statusUser = {
		status: false
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

module.exports = app;
