const mongoose = require('mongoose');

// Define o schema para o modelo de usuário
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// Cria o modelo de usuário baseado no schema
const User = mongoose.model('User', userSchema);

// Exporta o modelo
module.exports = User;