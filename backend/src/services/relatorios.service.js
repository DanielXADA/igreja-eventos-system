const Inscricao = require("../models/Inscricao");
const Comentario = require("../models/Comentario");

const obterParticipantesPorEvento = async (req, res) => {
  try {
    const dados = await Inscricao.aggregate([
      {
        $match: {
          evento: {
            $ne: null
          }
        }
      },
      {
        $group: {
          _id: "$evento",
          totalInscritos: {
            $sum: 1
          }
        }
      },
      {
        $lookup: {
          from: "eventos",
          localField: "_id",
          foreignField: "_id",
          as: "evento"
        }
      },
      {
        $unwind: "$evento"
      },
      {
        $project: {
          _id: 0,
          eventoId: "$evento._id",
          titulo: "$evento.titulo",
          data: "$evento.data",
          totalInscritos: 1
        }
      },
      {
        $sort: {
          totalInscritos: -1
        }
      }
    ]);

    return res.status(200).json(dados);
  } catch (erro) {
    return res.status(500).json({
      erro: erro.message
    });
  }
};

const obterMediaAvaliacaoPorCategoria = async (req, res) => {
  try {
    const dados = await Comentario.aggregate([
      {
        $match: {
          evento: {
            $ne: null
          },
          avaliacao: {
            $type: "number"
          }
        }
      },
      {
        $lookup: {
          from: "eventos",
          localField: "evento",
          foreignField: "_id",
          as: "evento"
        }
      },
      {
        $unwind: "$evento"
      },
      {
        $match: {
          "evento.categoria": {
            $ne: null
          }
        }
      },
      {
        $group: {
          _id: "$evento.categoria",
          mediaNota: {
            $avg: "$avaliacao"
          },
          totalAvaliacoes: {
            $sum: 1
          }
        }
      },
      {
        $lookup: {
          from: "categorias",
          localField: "_id",
          foreignField: "_id",
          as: "categoria"
        }
      },
      {
        $unwind: "$categoria"
      },
      {
        $project: {
          _id: 0,
          categoriaId: "$categoria._id",
          categoria: "$categoria.nome",
          mediaNota: {
            $round: ["$mediaNota", 2]
          },
          totalAvaliacoes: 1
        }
      },
      {
        $sort: {
          mediaNota: -1
        }
      }
    ]);

    return res.status(200).json(dados);
  } catch (erro) {
    return res.status(500).json({
      erro: erro.message
    });
  }
};

const obterEventosMaisEngajados = async (req, res) => {
  try {
    const dados = await Comentario.aggregate([
      {
        $match: {
          evento: {
            $ne: null
          }
        }
      },
      {
        $group: {
          _id: "$evento",
          totalComentarios: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          totalComentarios: -1
        }
      },
      {
        $lookup: {
          from: "eventos",
          localField: "_id",
          foreignField: "_id",
          as: "evento"
        }
      },
      {
        $unwind: "$evento"
      },
      {
        $project: {
          _id: 0,
          eventoId: "$evento._id",
          titulo: "$evento.titulo",
          data: "$evento.data",
          totalComentarios: 1
        }
      },
      {
        $sort: {
          totalComentarios: -1
        }
      }
    ]);

    return res.status(200).json(dados);
  } catch (erro) {
    return res.status(500).json({
      erro: erro.message
    });
  }
};

module.exports = {
  obterParticipantesPorEvento,
  obterMediaAvaliacaoPorCategoria,
  obterEventosMaisEngajados
};