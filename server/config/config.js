// Puerto
process.env.PORT = process.env.PORT || 3000; // process.env.PORT define si el puerto esta o bien en el entorno o localmente

// Entorno

process.env.NODE_ENV = process.env.NODE_ENV || 'dev'; // Hice una instancia llamada NODE_ENV y dependiendo si esta en el entorno o localmente se define un valor


// Base de datos

let urlDB;

if (process.env.NODE_ENV === 'dev') {
	urlDB = 'mongodb://localhost:27017/cafe'; // Si estamos trabajando en desarrollo o localmente esta sera la URL que nos llevara a nuestra base de datos local
} else {
	urlDB = process.env.MONGO_URL; // Si estamos ya en produccion o en el entorno, la URL sera la de mLab
}								   // MONGO_URL es una instancia definida en el entorno de heroku para no mostrar nuestro usuario y contrasena en produccion	

process.env.URLDB = urlDB; // Esta sera la URL que usaremos en mongoose.connect para conectarnos ya local o globalmente.

// Token config

process.env.TOKEN_EXPIRE = 60 * 60 * 24 * 30; // Creamos variables de entorno para no mostrarlas al publico
process.env.SEED_TOKEN = process.env.SEED_TOKEN || 'secret-SMlocal'; // Declaramos una variable global para nuestro SEED