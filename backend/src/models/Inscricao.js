const mongoose = require("mongoose");
const InscricaoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario"
  },
  evento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Evento"
  },
  status: {
    type: String,
    enum: ["confirmado", "pendente"]
  },
  dataInscricao: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model("Inscricao", InscricaoSchema);