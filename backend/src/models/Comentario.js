const mongoose = require("mongoose");

const ComentarioSchema = new mongoose.Schema(
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

    mensagem: {
      type: String,
      required: [true, "A mensagem é obrigatória"],
      trim: true,
      minlength: [2, "A mensagem deve possuir pelo menos 2 caracteres"],
      maxlength: [1000, "A mensagem deve possuir no máximo 1000 caracteres"]
    },

    avaliacao: {
      type: Number,
      min: [1, "A avaliação mínima é 1"],
      max: [5, "A avaliação máxima é 5"],
      default: null
    },

    resposta: {
      texto: {
        type: String,
        trim: true,
        default: ""
      },

      data: {
        type: Date,
        default: null
      },

      respondidoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        default: null
      }
    },

    criadoEm: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Comentario", ComentarioSchema);