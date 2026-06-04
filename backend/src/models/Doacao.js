const mongoose = require("mongoose");
const DoacaoSchema = new mongoose.Schema({
  evento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Evento"
  },
  tipo: {
    type: String,
    enum: ["dinheiro", "alimento", "ingresso"]
  },
  valor: Number,
  descricao: String,
  data: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model("Doacao", DoacaoSchema);