const mongoose = require("mongoose");

const EventoSchema = new mongoose.Schema({
  titulo: { 
    type: String, 
    required: [true, "O título do evento é obrigatório"], 
    trim: true 
  },
  categoria: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Categoria", 
    required: [true, "O evento precisa de uma categoria"] 
  },
  local: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Local", 
    required: [true, "O evento precisa de um local de realização"] 
  },
  status: { 
    type: String, 
    enum: ["Pendente", "Confirmado", "Cancelado"], 
    default: "Pendente" 
  }
}, { timestamps: true });

module.exports = mongoose.model("Evento", EventoSchema);