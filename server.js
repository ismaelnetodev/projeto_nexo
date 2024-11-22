const express = require("express");
import ConectarAoBanco from "./src/config/db.js";
import user from "./src/models/userModel.js";

const app = express();
const STRING_CONEXAO = process.env.STRING_CONEXAO;

app.use(express.json());

let dbClient;

(async () => {
    dbClient = await ConectarAoBanco(STRING_CONEXAO);
})();