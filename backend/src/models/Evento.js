const mongoose = require("mongoose");

const EventoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "O título é obrigatório"],
      trim: true
    },
    descricao: {
      type: String,
      default: ""
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categoria",
      required: [true, "A categoria é obrigatória"]
    },
    local: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Local",
      required: [true, "O local é obrigatório"]
    },
    data: {
      type: Date,
      required: [true, "A data é obrigatória"]
    },
    capacidade: {
      type: Number,
      required: [true, "A capacidade é obrigatória"],
      min: [1, "A capacidade mínima é 1"]
    },
    imagens: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ["pendente", "confirmado", "cancelado"],
      default: "confirmado"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Evento", EventoSchema);