const express = require('express');

let { authorizationToken, authorizationAdmin } = require('../middlewares/author');

let app = express();

let Categoria = require('../models/categorias');

// Mostrar todas las categorias
app.get('/categoria', authorizationToken, (req, res)=> {
	Categoria.find({})
		.sort('descripcion')
		.populate('usuario', 'nombre email')
		.exec((err, categorias)=> {
			if (err) {
				return res.status(400).json({
					ok: false,
					err
				});
			}

			res.json({
				ok: true,
				categorias
			})
		});

});

// Mostrar una categoria por ID
app.get('/categoria/:id', authorizationToken, (req, res)=> {
	let id = req.params.id;

	Categoria.find({ _id: id }, (err, categoriaDB)=> {
		if (err) {
			return res.status(500).json({
				ok: false,
				err
			})
		}

		if (!categoriaDB) {
			return res.status(400).json({
				ok: false,
				err: {
					message: 'Categoria no encontrada'
				}
			})
		}

		res.json({
			ok: true,
			categoria: categoriaDB
		})
	})
});

// Crear una nueva categoria
app.post('/categoria', authorizationToken, (req, res)=> {
	let body = req.body;

	let categoria = new Categoria({
		descripcion: body.descripcion,
		usuario: req.usuario._id
	});

	categoria.save( (err, categoriaDB)=>{
		if (err) {
			return res.status(500).json({
				ok: false,
				err
			});
		}

		if (!categoriaDB) {
			return res.status(400).json({
				ok: false,
				err
			});
		}


		res.json({
			ok: true,
			categoria: categoriaDB
		})
	})
});

// Actualiza una categoria
app.put('/categoria/:id', authorizationToken, (req, res)=> {
	let id = req.params.id;
	let descCategoria = {
		descripcion: req.body.descripcion
	};

	Categoria.findOneAndUpdate({ _id: id }, descCategoria, { new: true }, (err, categoriaDB)=> {
		if (err) {
			return res.status(500).json({
				ok: false,
				err
			})
		}

		if (!categoriaDB) {
			return res.status(400).json({
				ok: false,
				err: {
					message: 'Categoria no encontrada'
				}
			})
		}

		res.json({
			ok: true,
			categoria: categoriaDB
		})
	})
});

// Eliminar una categoria
app.delete('/categoria/:id', [authorizationToken, authorizationAdmin], (req, res)=> {
	let id = req.params.id; 

	Categoria.findOneAndDelete({ _id: id }, (err, oldCategoria)=> {
		if (err) {
			return res.status(500).json({
				ok: false,
				err
			})
		}

		if (!oldCategoria) {
			return res.status(400).json({
				ok: false,
				err : {
					message: 'Error al buscar la categoria'
				}
			})
		}

		res.json({
			ok: true,
			categoria: oldCategoria
		})
	})
});


module.exports = app;
