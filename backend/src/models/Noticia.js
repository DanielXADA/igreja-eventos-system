const mongoose = require("mongoose");

const NoticiaSchema = new mongoose.Schema({
  titulo: { 
    type: String, 
    required: [true, "O título da notícia é obrigatório"], 
    trim: true 
  },
  conteudo: { 
    type: String, 
    required: [true, "O conteúdo da notícia é obrigatório"] 
  },
  linkOriginal: {
    type: String,
    trim: true
  },
  categoria: { 
    type: String, 
    enum: ["Geral", "Vaticano", "Avisos", "Eventos"], 
    default: "Geral" 
  }
}, { timestamps: true });

module.exports = mongoose.model("Noticia", NoticiaSchema);