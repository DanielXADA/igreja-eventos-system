const express = require("express");

const roteador = express.Router();

const servico = require("../services/consultas.service");
const autenticar = require("../middlewares/autenticacao");

roteador.use(autenticar);

roteador.get(
  "/categoria/:categoriaId",
  servico.listarPorCategoria
);

roteador.get(
  "/proximos",
  servico.listarProximosEventos
);

roteador.get(
  "/ativos-grandes",
  servico.listarEventosAtivosEGrandes
);

roteador.get(
  "/cidade/:cidade",
  servico.listarLocaisPorCidade
);

roteador.get(
  "/buscar",
  servico.buscarEventoPorTermo
);

module.exports = roteador;