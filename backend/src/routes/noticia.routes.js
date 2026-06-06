const express = require("express");

const roteador = express.Router();

const Modelo = require("../models/Noticia");
const controleGenerico = require("../controllers/crudController");
const autenticar = require("../middlewares/autenticacao");
const autorizar = require("../middlewares/autorizacao");

roteador.post(
  "/",
  autenticar,
  autorizar("admin", "pastor", "lider"),
  controleGenerico.criar(Modelo)
);

roteador.get("/", async (req, res) => {
  try {
    const noticias = await Modelo.find().sort({
      createdAt: -1
    });

    return res.status(200).json(noticias);
  } catch (erro) {
    return res.status(500).json({
      erro: erro.message
    });
  }
});

roteador.get(
  "/:id",
  controleGenerico.obterPorId(Modelo)
);

roteador.put(
  "/:id",
  autenticar,
  autorizar("admin", "pastor", "lider"),
  controleGenerico.atualizar(Modelo)
);

roteador.delete(
  "/:id",
  autenticar,
  autorizar("admin", "pastor"),
  controleGenerico.remover(Modelo)
);

module.exports = roteador;