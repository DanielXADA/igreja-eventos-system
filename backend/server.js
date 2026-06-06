require("dotenv").config();

const app = require("./src/app");
const mongoose = require("mongoose");
const Usuario = require("./src/models/Usuario");

const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/igreja-eventos";

if (!process.env.JWT_SECRET) {
  console.error("Erro: JWT_SECRET não foi definido no arquivo .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Conectado ao MongoDB");

    const adminExistente = await Usuario.findOne({
      email: "admin@igrejanova.com"
    });

    if (!adminExistente) {
      await Usuario.create({
        nome: "Administrador Principal",
        email: "admin@igrejanova.com",
        senha: "admin123456",
        tipo: "admin"
      });

      console.log("Administrador padrão criado");
    }

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((erro) => {
    console.error("Erro ao conectar ao banco:", erro);
    process.exit(1);
  });