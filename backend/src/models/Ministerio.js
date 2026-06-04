const mongoose = require("mongoose");
const MinisterioSchema = new mongoose.Schema({
  nome: String,
  descricao: String,
  lider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario"
  }
});
module.exports = mongoose.model("Ministerio", MinisterioSchema);