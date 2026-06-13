const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome completo é obrigatório"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "O e-mail é obrigatório"],
      unique: true,
      trim: true,
      lowercase: true
    },
    senha: {
      type: String,
      required: [true, "A senha é obrigatória"]
    },
    telefone: {
      type: String,
      default: ""
    },
    cpf: {
      type: String,
      default: ""
    },
    dataNascimento: {
      type: Date,
      default: null
    },
    genero: {
      type: String,
      default: ""
    },
    avatar: {
      type: String,
      default: ""
    },
    tipo: {
      type: String,
      enum: ["admin", "pastor", "lider", "voluntario", "membro"],
      default: "membro"
    },
    origem: {
      type: String,
      default: "publico"
    }
  },
    {timestamps: true}
);

module.exports = mongoose.model("Usuario", UsuarioSchema);