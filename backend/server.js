const app = require("./src/app");
const mongoose = require("mongoose");
const Usuario = require("./src/models/Usuario");

const PORT = 3000;

mongoose.connect("mongodb://127.0.0.1:27017/igreja-eventos")
  .then(async () => {
    console.log("Conectado ao MongoDB");
    
    const adminExistente = await Usuario.findOne({ email: "admin@igrejanova.com" });
    if (!adminExistente) {
      await Usuario.create({
        nome: "Administrador Principal",
        email: "admin@igrejanova.com",
        senha: "admin123456",
        tipo: "admin"
      });
    }

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((erro) => {
    console.error("Erro ao conectar ao banco:", erro);
  });