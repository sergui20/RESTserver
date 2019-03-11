const jwt = require('jsonwebtoken');

let authorizationToken = (req, res, next)=> {
	let token = req.get('token');

	jwt.verify( token, process.env.SEED_TOKEN, (err, decodeData)=>{
		if (err) {						
			return res.status(401).json({
				ok: false,
				err
			});
		}

		req.usuario = decodeData.usuario;
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
