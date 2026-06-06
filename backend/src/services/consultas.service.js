const mongoose = require("mongoose");

const Evento = require("../models/Evento");
const Local = require("../models/Local");

const listarPorCategoria = async (req, res) => {
  try {
    const { categoriaId } = req.params;

    if (!mongoose.isValidObjectId(categoriaId)) {
      return res.status(400).json({
        erro: "ID de categoria inválido"
      });
    }

    const dados = await Evento.find({
      categoria: categoriaId
    })
      .sort({ data: 1 })
      .populate("categoria")
      .populate("local");

    return res.status(200).json(dados);
  } catch (erro) {
    return res.status(500).json({
      erro: erro.message
    });
  }
};

const listarProximosEventos = async (req, res) => {
  try {
    const dados = await Evento.find({
      data: {
        $gte: new Date()
      }
    })
      .sort({ data: 1 })
      .populate("categoria")
      .populate("local");

    return res.status(200).json(dados);
  } catch (erro) {
    return res.status(500).json({
      erro: erro.message
    });
  }
};

const listarEventosAtivosEGrandes = async (req, res) => {
  try {
    const dados = await Evento.find({
      $and: [
        {
          inscricoesAbertas: true
        },
        {
          capacidade: {
            $gt: 100
          }
        }
      ]
    })
      .sort({ data: 1 })
      .populate("categoria")
      .populate("local");

    return res.status(200).json(dados);
  } catch (erro) {
    return res.status(500).json({
      erro: erro.message
    });
  }
};

const listarLocaisPorCidade = async (req, res) => {
  try {
    const cidade = req.params.cidade.trim();

    if (!cidade) {
      return res.status(400).json({
        erro: "A cidade é obrigatória"
      });
    }

    const dados = await Local.find({
      "endereco.cidade": {
        $regex: `^${cidade}$`,
        $options: "i"
      }
    }).sort({ nome: 1 });

    return res.status(200).json(dados);
  } catch (erro) {
    return res.status(500).json({
      erro: erro.message
    });
  }
};

const buscarEventoPorTermo = async (req, res) => {
  try {
    const termo = String(req.query.busca || "").trim();

    if (termo.length < 2) {
      return res.status(400).json({
        erro: "Informe pelo menos 2 caracteres para a busca"
      });
    }

    const termoEscapado = termo.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const dados = await Evento.find({
      titulo: {
        $regex: termoEscapado,
        $options: "i"
      }
    })
      .sort({ data: 1 })
      .populate("categoria")
      .populate("local");

    return res.status(200).json(dados);
  } catch (erro) {
    return res.status(500).json({
      erro: erro.message
    });
  }
};

module.exports = {
  listarPorCategoria,
  listarProximosEventos,
  listarEventosAtivosEGrandes,
  listarLocaisPorCidade,
  buscarEventoPorTermo
};