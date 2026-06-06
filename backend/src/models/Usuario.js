const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true },
  senha: String,
  tipo: {
    type: String,
    enum: ["membro", "voluntario", "lider", "pastor", "admin"],
    default: "membro"
  },
  telefone: String,
  ministerio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ministerio"
  },
  criadoEm: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Usuario", UsuarioSchema);