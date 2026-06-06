const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UsuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, "O nome é obrigatório"],
    trim: true
  },

  email: {
    type: String,
    required: [true, "O e-mail é obrigatório"],
    unique: true,
    lowercase: true,
    trim: true
  },

  senha: {
    type: String,
    required: [true, "A senha é obrigatória"],
    minlength: [6, "A senha deve possuir pelo menos 6 caracteres"],
    select: false
  },

  tipo: {
    type: String,
    enum: ["membro", "voluntario", "lider", "pastor", "admin"],
    default: "membro"
  },

  telefone: {
    type: String,
    trim: true
  },

  ministerio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ministerio",
    default: null
  },

  criadoEm: {
    type: Date,
    default: Date.now
  }
});

UsuarioSchema.pre("save", async function () {
  if (!this.isModified("senha")) {
    return;
  }

  this.senha = await bcrypt.hash(this.senha, 10);
});

UsuarioSchema.methods.compararSenha = async function (senhaInformada) {
  return bcrypt.compare(senhaInformada, this.senha);
};

module.exports = mongoose.model("Usuario", UsuarioSchema);