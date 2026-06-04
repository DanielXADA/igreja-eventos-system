const mongoose = require("mongoose");
const ComentarioSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario"
  },
  evento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Evento"
  },
  mensagem: String,
  avaliacao: Number,
  resposta: {
    texto: String,
    data: Date
  },
  criadoEm: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model("Comentario", ComentarioSchema);