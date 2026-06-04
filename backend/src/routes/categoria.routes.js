const express = require("express");
const router = express.Router();
const Categoria = require("../models/Categoria");

router.post("/", async (req, res) => {
  try {
    const novaCategoria = new Categoria(req.body);
    await novaCategoria.save();
    res.status(201).json({ mensagem: "Categoria salva!", dados: novaCategoria });
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const categorias = await Categoria.find();
    res.json(categorias);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

module.exports = router;