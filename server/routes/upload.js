const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

app.use(fileUpload()); // Los archivos que se vayan a cargar se almacenan dentro de este middleware

app.put('/upload/:tipo/:id', (req, res)=>{
	let tipo = req.params.tipo;
	let id = req.params.id;

	if (!req.files) {
		return res.status(400).json({
			ok: false,
			err: {
				message: 'No se ha seleccionado ningun archivo'
			}
		})
	}

	// Validar tipo
	let tiposValidos = ['productos', 'usuarios'];
	if (tiposValidos.indexOf(tipo) < 0) {
		return res.status(400).json({
			ok: false,
			err: {
				message: 'Los tipos no son validos'
			}
		})
	}

	let file = req.files.file;
	let splitFile = file.name.split('.');
	let ext = splitFile[splitFile.length - 1];
	ext = ext.toString();
	ext = ext.toLowerCase();

	// Extensiones permitidas
	let validExtensions = ['png', 'jpg', 'gif', 'jpeg'];

	if (validExtensions.indexOf(ext) < 0) {
		return res.status(400).json({
			ok: false,
			err: {
				message: 'Extension del archivo no es valida',
				extension: ext
			}
		})
	}

	if(tipo === 'usuarios'){
		Usuario.find({ _id: id }, (err, userDB)=>{
			if(err){
				return res.status(500).json({
					ok: false,
					err
				})
			}
	
			let fileName = `${ userDB[0].nombre }-${ new Date().getMilliseconds() }.${ ext }`;
	
			file.mv(`server/uploads/${tipo}/${fileName}`, (err)=>{ // Nuestra imagen se mueve al directorio especificado
				if (err) {
					return res.status(500).json({
						ok: false,
						err
					});
				}
		
				// Subiendo nuestra foto desde express a nuestra base de datos Mongo
				userPic(id, res, fileName);
			})
		})
	} else {
		Producto.find({ _id: id }, (err, productoDB)=>{
			if(err){
				return res.status(500).json({
					ok: false,
					err
				})
			}

			let fileName = `${ productoDB[0].nombre }-${ new Date().getMilliseconds() }.${ ext }`;

			file.mv(`server/uploads/${tipo}/${fileName}`, (err)=>{
				if(err){
					return res.status(500).json({
						ok: false,
						err
					})
				}

				productPic(id, res, fileName)
			})
		})
	}
});

function userPic(id, res, fileName) {
	let updatePic = {
		img: fileName
	}

	Usuario.findOneAndUpdate({ _id: id }, updatePic, (err, oldUsuario)=>{
		if (err) {
			unlinkFile(fileName, 'usuarios');
			return res.status(500).json({
				ok: false,
				err
			});
		}

		unlinkFile(oldUsuario.img, 'usuarios');

		res.json({
			ok: true,
			usuario: oldUsuario,
			newImg: fileName
		})
	});
}

function productPic(id, res, fileName){
	let updatePic = {
		img: fileName
	}

	Producto.findOneAndUpdate({ _id: id }, updatePic, (err, oldProduct)=>{
		if(err) {
			unlinkFile(fileName, 'productos');
			return res.status(500).json({
				ok: false,
				err
			})
		}

		unlinkFile( oldProduct.img, 'productos' );

		res.json({
			ok: true,
			producto: oldProduct,
			newImg: fileName
		})
	})
}

function unlinkFile( picName, collection ){
	let pathImg = path.resolve( __dirname, `../uploads/${ collection }/${ picName }` )

	if( fs.existsSync(pathImg) ){ // Devuelve true o false si existe el path
		fs.unlinkSync(pathImg); // Elimina el archivo pasandole la ruta por parametro
	}
}

module.exports = app;