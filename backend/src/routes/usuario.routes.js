const express = require("express");
const jwt = require("jsonwebtoken");

const roteador = express.Router();

const Modelo = require("../models/Usuario");
const controleGenerico = require("../controllers/crudController");
const autenticar = require("../middlewares/autenticacao");
const autorizar = require("../middlewares/autorizacao");

roteador.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        erro: "E-mail e senha são obrigatórios"
      });
    }

    const usuario = await Modelo.findOne({
      email: email.toLowerCase().trim()
    }).select("+senha");

    if (!usuario) {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos"
      });
    }

    const senhaCorreta = await usuario.compararSenha(senha);

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos"
      });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        tipo: usuario.tipo
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "8h"
      }
    );

    const usuarioResposta = usuario.toObject();
    delete usuarioResposta.senha;

    return res.status(200).json({
      usuario: usuarioResposta,
      token
    });
  } catch (erro) {
    return res.status(500).json({
      erro: erro.message
    });
  }
});

roteador.post("/", async (req, res) => {
  try {
    const dados = { ...req.body };

    if (dados.funcao) {
      dados.tipo = dados.funcao;
      delete dados.funcao;
    }

    if (!dados.senha) {
      dados.senha = "123456";
    }

    if (dados.origem === "publico") {
      dados.tipo = "membro";
    }

    delete dados.origem;

    const novoUsuario = await Modelo.create(dados);

    const usuarioResposta = novoUsuario.toObject();
    delete usuarioResposta.senha;

    return res.status(201).json(usuarioResposta);
  } catch (erro) {
    if (erro.code === 11000) {
      return res.status(409).json({
        erro: "E-mail já cadastrado"
      });
    }

    return res.status(400).json({
      erro: erro.message
    });
  }
});

roteador.get(
  "/",
  autenticar,
  autorizar("admin","pastor"),
  controleGenerico.obterTodos(Modelo)
);

roteador.get(
  "/:id",
  autenticar,
  autorizar("admin"),
  controleGenerico.obterPorId(Modelo)
);

roteador.put(
  "/:id",
  autenticar,
  autorizar("admin"),
  async (req, res) => {
    try {
      const usuario = await Modelo.findById(req.params.id).select("+senha");

      if (!usuario) {
        return res.status(404).json({
          erro: "Usuário não encontrado"
        });
      }

      const camposPermitidos = [
        "nome",
        "email",
        "senha",
        "tipo",
        "telefone",
        "ministerio"
      ];

      camposPermitidos.forEach((campo) => {
        if (req.body[campo] !== undefined) {
          usuario[campo] = req.body[campo];
        }
      });

      if (req.body.funcao !== undefined) {
        usuario.tipo = req.body.funcao;
      }

      await usuario.save();

      const usuarioResposta = usuario.toObject();
      delete usuarioResposta.senha;

      return res.status(200).json(usuarioResposta);
    } catch (erro) {
      if (erro.code === 11000) {
        return res.status(409).json({
          erro: "E-mail já cadastrado"
        });
      }

      return res.status(400).json({
        erro: erro.message
      });
    }
  }
);

roteador.delete(
  "/:id",
  autenticar,
  autorizar("admin","pastor"),
  controleGenerico.remover(Modelo)
);

module.exports = roteador;