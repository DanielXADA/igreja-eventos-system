const mongoose = require("mongoose");

const LocalSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: [true, "O nome do local é obrigatório"], 
    trim: true 
  },
  capacidade: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

module.exports = mongoose.model("Local", LocalSchema);