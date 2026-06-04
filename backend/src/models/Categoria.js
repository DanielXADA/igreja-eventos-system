const mongoose = require("mongoose");
const CategoriaSchema = new mongoose.Schema({
  nome: String,
  descricao: String
});
module.exports = mongoose.model("Categoria", CategoriaSchema);