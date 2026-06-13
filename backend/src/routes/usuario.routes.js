const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  try {
    const { nome, email, senha, confirmaSenha, telefone, cpf, dataNascimento, genero, endereco } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Campos obrigatórios não preenchidos" });
    }

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ erro: "Este e-mail já está cadastrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    const novoUsuario = new Usuario({
      nome,
      email,
      senha: senhaCriptografada,
      telefone,
      cpf,
      dataNascimento,
      genero,
      endereco,
      tipo: "membro",
      origem: "publico"
    });

    await novoUsuario.save();
    return res.status(201).json(novoUsuario);
  } catch (error) {
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ erro: "E-mail ou senha inválidos" });
    }

    let senhaValida = false;
    if (usuario.senha.startsWith("$2a$") || usuario.senha.startsWith("$2b$")) {
      senhaValida = await bcrypt.compare(senha, usuario.senha);
    } else {
      senhaValida = (senha === usuario.senha);
    }

    if (!senhaValida) {
      return res.status(400).json({ erro: "E-mail ou senha inválidos" });
    }

    const token = jwt.sign(
      { id: usuario._id, tipo: usuario.tipo },
      process.env.JWT_SECRET || "suachavesecretasupersegura123",
      { expiresIn: "1d" }
    );

    return res.status(200).json({ token, usuario });
  } catch (error) {
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { nome, telefone, cpf, dataNascimento, genero, avatar } = req.body;

    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    if (nome) usuario.nome = nome;
    if (telefone) usuario.telefone = telefone;
    if (cpf) usuario.cpf = cpf;
    if (dataNascimento) usuario.dataNascimento = dataNascimento;
    if (genero) usuario.genero = genero;
    if (avatar) usuario.avatar = avatar;

    await usuario.save();
    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

router.get("/", async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-senha");
    return res.status(200).json(usuarios);
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar usuários" });
  }
});

module.exports = router;