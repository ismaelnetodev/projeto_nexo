import { MongoClient } from "mongodb";

export default async function conectarAoBanco(stringConexao)
{
    let mongoclient;

    try{
        mongoclient = new MongoClient(stringConexao);
        console.log("Conectando ao banco de dados...");
        await mongoclient.connect();
        console.log("Conectado ao MongoDB Atlas com sucesso");

        return mongoclient;
    }catch (erro){
        console.log('Falha na conexão: ', erro);
        process.exit();
    }
}