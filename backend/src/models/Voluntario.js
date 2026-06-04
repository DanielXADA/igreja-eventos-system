const mongoose = require("mongoose");
const VoluntarioSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario"
  },
  evento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Evento"
  },
  funcao: String
});
module.exports = mongoose.model("Voluntario", VoluntarioSchema);