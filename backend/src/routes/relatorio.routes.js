const express = require("express");

const roteador = express.Router();

const servico = require("../services/relatorios.service");
const autenticar = require("../middlewares/autenticacao");
const autorizar = require("../middlewares/autorizacao");

roteador.use(
  autenticar,
  autorizar("admin", "pastor", "lider")
);

roteador.get(
  "/participantes",
  servico.obterParticipantesPorEvento
);

roteador.get(
  "/media-categoria",
  servico.obterMediaAvaliacaoPorCategoria
);

roteador.get(
  "/engajados",
  servico.obterEventosMaisEngajados
);

module.exports = roteador;