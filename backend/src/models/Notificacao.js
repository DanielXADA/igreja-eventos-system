const mongoose = require("mongoose");
const NotificacaoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario"
  },
  mensagem: String,
  lida: {
    type: Boolean,
    default: false
  },
  data: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model("Notificacao", NotificacaoSchema);