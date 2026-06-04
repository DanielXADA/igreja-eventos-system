const Evento = require("../models/Evento");
const Local = require("../models/Local");

const listarPorCategoria = async (requisicao, resposta) => {
  try {
    const dados = await Evento.find({ categoria: requisicao.params.categoriaId });
    resposta.json(dados);
  } catch (erro) {
    resposta.status(500).json({ erro: erro.message });
  }
};

const listarProximosEventos = async (requisicao, resposta) => {
  try {
    const dados = await Evento.find({ data: { $gte: new Date() } });
    resposta.json(dados);
  } catch (erro) {
    resposta.status(500).json({ erro: erro.message });
  }
};

const listarEventosAtivosEGrandes = async (requisicao, resposta) => {
  try {
    const dados = await Evento.find({
      $and: [
        { inscricoesAbertas: true },
        { capacidade: { $gt: 100 } }
      ]
    });
    resposta.json(dados);
  } catch (erro) {
    resposta.status(500).json({ erro: erro.message });
  }
};

const listarLocaisPorCidade = async (requisicao, resposta) => {
  try {
    const dados = await Local.find({ "endereco.cidade": requisicao.params.cidade });
    resposta.json(dados);
  } catch (erro) {
    resposta.status(500).json({ erro: erro.message });
  }
};

const buscarEventoPorTermo = async (requisicao, resposta) => {
  try {
    const dados = await Evento.find({ titulo: { $regex: requisicao.query.busca, $options: "i" } });
    resposta.json(dados);
  } catch (erro) {
    resposta.status(500).json({ erro: erro.message });
  }
};

module.exports = {
  listarPorCategoria,
  listarProximosEventos,
  listarEventosAtivosEGrandes,
  listarLocaisPorCidade,
  buscarEventoPorTermo
};