const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, "E-mail inválido"],
    },
    password: {
        type: String,
        required: true,
        minlength: [8, "A senha deve ter pelo menos 8 caracteres"],
        maxlength: [128, "A senha deve ter no máximo 128 caracteres"],
        validate: {
            validator: function (value) {
                const regex =
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]\\|:;'<>,.?/])[a-zA-Z\d!@#$%^&*()_\-+={}[\]\\|:;'<>,.?/]{8,}$/;
                return regex.test(value);
            },
            message:
                "A senha deve conter ao menos uma letra maiúscula, uma minúscula, um número e um caractere especial",
        },
    },
    loginCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

// Middleware para hash da senha antes de salvar
userSchema.pre("save", async function (next) {
    if (this.isModified("password") || this.isNew) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

// Método para incrementar o contador de logins
userSchema.methods.incrementLoginCount = async function () {
    this.loginCount++;
    return await this.save();
};

// Método para gerar um token de autenticação
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this.id }, JWT_SECRET, { expiresIn: "1d" });
    return token;
};

// Método estático para buscar um usuário por token
userSchema.statics.findByToken = async function (token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return await this.findById(decoded._id);
    } catch (err) {
        throw new Error(`Erro ao verificar o token: ${err.message}`);
    }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
