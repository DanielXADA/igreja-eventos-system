const express = require("express");
const roteador = express.Router();
const Modelo = require("../models/Doacao");
const controleGenerico = require("../controllers/crudController");

roteador.post("/", controleGenerico.criar(Modelo));
roteador.get("/", controleGenerico.obterTodos(Modelo));
roteador.get("/:id", controleGenerico.obterPorId(Modelo));
roteador.put("/:id", controleGenerico.atualizar(Modelo));
roteador.delete("/:id", controleGenerico.remover(Modelo));

module.exports = roteador;