const express = require("express");

const roteador = express.Router();

const Modelo = require("../models/Doacao");
const controleGenerico = require("../controllers/crudController");
const autenticar = require("../middlewares/autenticacao");
const autorizar = require("../middlewares/autorizacao");

roteador.post(
  "/",
  autenticar,
  controleGenerico.criar(Modelo)
);

roteador.get(
  "/",
  autenticar,
  autorizar("admin", "pastor"),
  controleGenerico.obterTodos(Modelo)
);

roteador.get(
  "/:id",
  autenticar,
  autorizar("admin", "pastor"),
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
  autorizar("admin"),
  controleGenerico.remover(Modelo)
);

module.exports = roteador;