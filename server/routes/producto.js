const express = require('express');
const _ = require('underscore');

const Producto = require('../models/producto');
const { authorizationToken } = require('../middlewares/author');

const app = express();

//Obtener todos productos
app.get('/productos', authorizationToken, (req, res)=> {
	Producto.find({ disponible: true })
		.populate('usuario', 'nombre email')
		.populate('categoria', 'descripcion')
		.exec((err, productosDB)=>{
			if (err) {
				return res.status(500).json({
					ok: false,
					err
				})
			}

			console.log(productosDB.length)

			if (productosDB.length === 0) {
				return res.status(400).json({
					ok: false,
					message: 'La base de datos esta vacia'
				})
			}

			Producto.countDocuments({ disponible: true }, (err, totalProducts)=> {
				if (err) {
					return res.status(500).json({
						ok: false,
						err
					})
				}

				res.json({
					ok: true,
					productos: productosDB,
					totalProducts
				})
			})
		})
});

// Obtener un producto por ID
app.get('/productos/:id', authorizationToken, (req, res)=> {
	let id = req.params.id;

	Producto.find({ _id: id })
		.populate('usuario', 'nombre email')
		.populate('categoria', 'nombre')
		.exec((err, productoDB)=>{
			if (err) {
				return res.status(500).json({
					ok: false, 
					err
				})
			}

			if (!productoDB) {
				return res.status(400).json({
					ok: false,
					err: {
						message: 'No se ha encontrado el producto'
					}
				})
			}

			res.json({
				ok: true,
				producto: productoDB
			})
		})
});

//Buscar productos
app.get('/productos/buscar/:termino', authorizationToken, (req, res)=>{
	let termino = req.params.termino;

	let regex = new RegExp(termino, 'i');

	Producto.find({nombre: regex})
		.populate('categoria', 'nombre')
		.exec((err, productosDB)=>{
			if (err) {
				return res.status(500).json({
					ok: false,
					err
				})
			}

			res.json({
				ok: true,
				productos: productosDB
			})
		})
});

// Crear un nuevo producto
app.post('/productos', authorizationToken, (req, res)=>{
	let body = req.body;

	let producto = new Producto({
		usuario: req.usuario._id,
		nombre: body.nombre,
		precioUni: body.precioUni,
		descripcion: body.descripcion,
		disponible: body.disponible,
		categoria: body.categoria
	});

	producto.save((err, productoDB)=>{
		if (err) {
			return res.status(500).json({
				ok: false,
				err
			})
		}

		res.status(201).json({
			ok: true,
			producto: productoDB
		})
	})
});

// Actualizar un producto
app.put('/productos/:id', authorizationToken, (req, res)=>{
	let id = req.params.id;
	let body = req.body;
	let update = _.pick(body, ['nombre', 'precioUni', 'categoria', 'disponible', 'descripcion']);

	Producto.findOneAndUpdate({ _id: id }, update, { new: true }, (err, productUpdated)=>{
		if (err) {
			return res.status(500).json({
				ok: false,
				err
			})
		}

		if (!productUpdated) {
			return res.status(400).json({
				ok: false,
				err: {
					message: 'No se ha encontrado el producto'
				}
			})
		}

		res.json({
			ok: true,
			producto: productUpdated
		})
	})
});

// Borrar un producto
app.delete('/productos/:id', authorizationToken, (req, res)=>{
	let id = req.params.id;

	let unavailable = {
		disponible: false
	}

	Producto.findOneAndUpdate({ _id: id }, unavailable, { new: true }, (err, deletedProduct)=>{
		if (err) {
			return res.status(500).json({
				ok: false,
				err
			})
		}

		if (!deletedProduct) {
			return res.status(400).json({
				ok: false,
				err: {
					message: 'No se ha encontrado el producto'
				}
			})
		}

		res.json({
			ok: true,
			producto: deletedProduct,
			mensaje: 'Se ha eliminado el producto'
		})
	})
});

module.exports = app;