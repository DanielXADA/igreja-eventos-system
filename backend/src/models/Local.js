const mongoose = require("mongoose");
const LocalSchema = new mongoose.Schema({
  nome: String,
  capacidade: Number,
  endereco: {
    rua: String,
    numero: String,
    cidade: String,
    estado: String
  }
});
module.exports = mongoose.model("Local", LocalSchema);