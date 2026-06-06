const express = require("express");

const roteador = express.Router();

const Modelo = require("../models/Ministerio");
const controleGenerico = require("../controllers/crudController");
const autenticar = require("../middlewares/autenticacao");
const autorizar = require("../middlewares/autorizacao");

roteador.post(
  "/",
  autenticar,
  autorizar("admin", "pastor"),
  controleGenerico.criar(Modelo)
);

roteador.get(
  "/",
  autenticar,
  controleGenerico.obterTodos(Modelo)
);

roteador.get(
  "/:id",
  autenticar,
  controleGenerico.obterPorId(Modelo)
);

roteador.put(
  "/:id",
  autenticar,
  autorizar("admin", "pastor"),
  controleGenerico.atualizar(Modelo)
);

roteador.delete(
  "/:id",
  autenticar,
  autorizar("admin", "pastor"),
  controleGenerico.remover(Modelo)
);

module.exports = roteador;