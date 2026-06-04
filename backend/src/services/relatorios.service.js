const Inscricao = require("../models/Inscricao");
const Comentario = require("../models/Comentario");

const obterParticipantesPorEvento = async (requisicao, resposta) => {
  try {
    const dados = await Inscricao.aggregate([
      {
        $group: {
          _id: "$evento",
          totalInscritos: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "eventos",
          localField: "_id",
          foreignField: "_id",
          as: "detalhes"
        }
      },
      { $unwind: "$detalhes" }
    ]);
    resposta.json(dados);
  } catch (erro) {
    resposta.status(500).json({ erro: erro.message });
  }
};

const obterMediaAvaliacaoPorCategoria = async (requisicao, resposta) => {
  try {
    const dados = await Comentario.aggregate([
      {
        $lookup: {
          from: "eventos",
          localField: "evento",
          foreignField: "_id",
          as: "eventoDados"
        }
      },
      { $unwind: "$eventoDados" },
      {
        $group: {
          _id: "$eventoDados.categoria",
          mediaNota: { $avg: "$avaliacao" }
        }
      },
      {
        $lookup: {
          from: "categorias",
          localField: "_id",
          foreignField: "_id",
          as: "categoriaDados"
        }
      },
      { $unwind: "$categoriaDados" }
    ]);
    resposta.json(dados);
  } catch (erro) {
    resposta.status(500).json({ erro: erro.message });
  }
};

const obterEventosMaisEngajados = async (requisicao, resposta) => {
  try {
    const dados = await Comentario.aggregate([
      {
        $group: {
          _id: "$evento",
          totalComentarios: { $sum: 1 }
        }
      },
      { $sort: { totalComentarios: -1 } },
      {
        $lookup: {
          from: "eventos",
          localField: "_id",
          foreignField: "_id",
          as: "eventoDados"
        }
      },
      { $unwind: "$eventoDados" }
    ]);
    resposta.json(dados);
  } catch (erro) {
    resposta.status(500).json({ erro: erro.message });
  }
};

module.exports = {
  obterParticipantesPorEvento,
  obterMediaAvaliacaoPorCategoria,
  obterEventosMaisEngajados
};