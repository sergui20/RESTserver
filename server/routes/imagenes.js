const express = require('express');
const fs = require('fs');
const path = require('path');

const { imgToken } = require('../middlewares/author')

const app = express();

app.get('/imagen/:tipo/:img', imgToken, (req, res)=>{
    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImg = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);

    console.log(fs.existsSync(pathImg));

    if(!fs.existsSync(pathImg)){
        let noImagePath = path.resolve(__dirname, `../assets/no-image.jpg`);
        return res.sendfile(noImagePath);
    }

    res.sendfile(pathImg);
})

module.exports = app;
