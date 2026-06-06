const mongoose = require("mongoose");

const CategoriaSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome da categoria é obrigatório"],
      unique: true,
      trim: true,
      minlength: [2, "O nome deve possuir pelo menos 2 caracteres"]
    },

    descricao: {
      type: String,
      trim: true,
      default: ""
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

module.exports = mongoose.model("Categoria", CategoriaSchema);