require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());

const User = require('./src/models/User')

app.get("/", (req, res) => {
    res.status(200).json({msg: "api iniciada"})
});

app.post('/auth/register', async (req, res) => {
    const {username, email, password} = req.body;

    if(!username){
        return res.status(422).json({msg: "O nome de usuário é obrigatório"})
    }

    if(!email){
        return res.status(422).json({msg: "O email é obrigatório"})
    }

    if(!password){
        return res.status(422).json({msg: "A senha é obrigatório"})
    }

    const userExists = await User.findOne({email: email});

    if (userExists){
        return res.status(422).json({msg: "E-mail já cadastrado"})
    }

    const salt = await bcrypt.genSalt(12);
    password_hash = await bcrypt.hash(password, salt);

    const user = new User({
        username,
        email,
        password,
    });

    try{
        await user.save()
        res.status(201).json({msg: "usuario criado com sucesso"})

    }catch(err){
        res.status(500).json({msg: err.message})
    }
    
});

const mongo_uri = process.env.MONGO_URI;

mongoose.connect(mongo_uri).then(() => {
    console.log('conectado ao mongodb')
}).catch((err) => console.error(err));

app.listen(3000, () => {
    console.log("Server iniciado na porta 3000");
});