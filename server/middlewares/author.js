const jwt = require('jsonwebtoken');

let authorizationToken = (req, res, next)=> {
	let token = req.get('token'); // Requerimos el token que se encuentra en el header de HTTP para podeer validarlo

	jwt.verify( token, process.env.SEED_TOKEN, (err, decodeData)=>{ // Usamos jwt.verify que es un metodo que tiene esa libreria para verificar si el token sigue siendo el correcto en la pagina de /usuarios
		if (err) {													// El token fue creado al momento de hacer signin en nuestra app
			return res.status(401).json({
				ok: false,
				err
			});
		}

		req.usuario = decodeData.usuario; // Creamos una instancia en el require llamada usuario para pasarle los datos del usuario que obtuvimos al DECODIFICAR el token
		next();
	});
};

// Front-end verification
let imgToken = (req, res, next)=>{
	let token = req.query.token;

	jwt.verify(token, process.env.SEED_TOKEN, (err, decodedData)=>{
		if(err){
			return res.status(401).json({
				ok: false,
				err
			})
		}

		req.usuario = decodedData;
		next();
	})
}

let authorizationAdmin = (req, res, next)=> {
	usuario = req.usuario;
	role = usuario.role;

	if ( role !== 'ADMIN_ROLE' ) {
		return res.json({
			ok: false,
			message: 'El usuario no es un administrador'
		})
	}

	next();
}

module.exports = {
	authorizationToken,
	authorizationAdmin,
	imgToken
}