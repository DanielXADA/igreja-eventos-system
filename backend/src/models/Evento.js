const mongoose = require("mongoose");
const EventoSchema = new mongoose.Schema({
  titulo: String,
  descricao: String,
  data: Date,
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categoria"
  },
  local: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Local"
  },
  inscricoesAbertas: Boolean,
  capacidade: Number
});
module.exports = mongoose.model("Evento", EventoSchema);