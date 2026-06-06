const mongoose = require("mongoose");

const InscricaoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "O usuário é obrigatório"]
    },

    evento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evento",
      required: [true, "O evento é obrigatório"]
    },

    status: {
      type: String,
      enum: ["confirmado", "pendente", "cancelado"],
      default: "pendente"
    },

    checkIn: {
      realizado: {
        type: Boolean,
        default: false
      },

      data: {
        type: Date,
        default: null
      }
    },

    dataInscricao: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

InscricaoSchema.index(
  {
    usuario: 1,
    evento: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model("Inscricao", InscricaoSchema);