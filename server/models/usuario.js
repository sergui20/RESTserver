const mongoose = require('mongoose'); //To model our application DATA
const uniqueValidator = require('mongoose-unique-validator'); //A plugin to validate unique fields an to handle some errors within the database

let validRoles = {
	values: ['ADMIN_ROLE', 'USER_ROLE'],
	message: '{VALUE} no es un role valido'
};

let Schema = mongoose.Schema; //It is the configuration object for a Mongoose model

let usuarioSchema = new Schema({ //Defining our model
	nombre: {
		type: String,
		required: [true, 'El nombre es necesario']
	},
	email: {
		type: String,
		unique: true,
		required:[true, 'El correo es necesario']
	},
	password: {
		type:String,
		required: [true, 'La contrasena es obligatoria']
	},
	img: {
		type: String,
		required: false
	},
	role: {
		type: String,
		default: 'USER_ROLE',
		enum: validRoles
	},
	status: {
		type: Boolean,
		default: true
	},
	google: {
		type: Boolean,
		default: false
	}
});

usuarioSchema.methods.toJSON = function () { //Esto seria un Middleware segun yo.
	let user = this;
	let userObject = user.toObject();
	delete userObject.password;

	return userObject;
}

usuarioSchema.plugin(uniqueValidator, {message: '{PATH} debe de ser unico'}); //usuarioSchema is a plugin which validates unique fields within a Mongoose schema

module.exports = mongoose.model('Usuario', usuarioSchema); // Exporting our usuarioSchema with the name Usuario, both are clases with properties defined above