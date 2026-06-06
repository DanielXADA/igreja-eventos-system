const mongoose = require("mongoose");

const LocalSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome do local é obrigatório"],
      trim: true,
      minlength: [2, "O nome deve possuir pelo menos 2 caracteres"]
    },

    capacidade: {
      type: Number,
      default: 0,
      min: [0, "A capacidade não pode ser negativa"]
    },

    endereco: {
      rua: {
        type: String,
        trim: true,
        default: ""
      },

      numero: {
        type: String,
        trim: true,
        default: ""
      },

      bairro: {
        type: String,
        trim: true,
        default: ""
      },

      cidade: {
        type: String,
        trim: true,
        default: ""
      },

      estado: {
        type: String,
        trim: true,
        uppercase: true,
        maxlength: [2, "O estado deve possuir 2 caracteres"],
        default: ""
      },

      cep: {
        type: String,
        trim: true,
        default: ""
      }
    },

    ativo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Local", LocalSchema);