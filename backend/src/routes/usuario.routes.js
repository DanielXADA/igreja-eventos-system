const express = require("express");
const roteador = express.Router();
const Modelo = require("../models/Usuario");
const controleGenerico = require("../controllers/crudController");

roteador.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await Modelo.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }
    if (usuario.senha && usuario.senha !== senha) {
      return res.status(401).json({ erro: "Senha incorreta" });
    }
    res.json(usuario);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

roteador.post("/", async (req, res) => {
  try {
    const dados = { ...req.body };
    if (req.body.funcao) {
      dados.tipo = req.body.funcao;
    }
    if (!dados.senha) {
      dados.senha = "123456";
    }
    if (req.body.origem === "publico") {
      dados.tipo = "membro";
    }
    const novoUsuario = new Modelo(dados);
    await novoUsuario.save();
    res.status(201).json(novoUsuario);
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

roteador.get("/", controleGenerico.obterTodos(Modelo));
roteador.get("/:id", controleGenerico.obterPorId(Modelo));
roteador.put("/:id", controleGenerico.atualizar(Modelo));
roteador.delete("/:id", controleGenerico.remover(Modelo));

module.exports = roteador;