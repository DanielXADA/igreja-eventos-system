const mongoose = require("mongoose");

const EventoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "O título do evento é obrigatório"],
      trim: true,
      minlength: [3, "O título deve possuir pelo menos 3 caracteres"]
    },

    descricao: {
      type: String,
      trim: true,
      default: ""
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

    data: {
      type: Date,
      required: [true, "A data do evento é obrigatória"]
    },

    capacidade: {
      type: Number,
      required: [true, "A capacidade do evento é obrigatória"],
      min: [1, "A capacidade deve ser maior que zero"]
    },

    inscricoesAbertas: {
      type: Boolean,
      default: true
    },

    status: {
      type: String,
      enum: ["Pendente", "Confirmado", "Cancelado"],
      default: "Pendente"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Evento", EventoSchema);