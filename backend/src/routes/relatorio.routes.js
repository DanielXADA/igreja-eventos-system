const express = require("express");
const roteador = express.Router();
const servico = require("../services/relatorios.service");

roteador.get("/participantes", servico.obterParticipantesPorEvento);
roteador.get("/media-categoria", servico.obterMediaAvaliacaoPorCategoria);
roteador.get("/engajados", servico.obterEventosMaisEngajados);

module.exports = roteador;