const express = require("express");
const router = express.Router();
const Noticia = require("../models/Noticia");

router.post("/", async (req, res) => {
  try {
    const novaNoticia = new Noticia(req.body);
    await novaNoticia.save();
    res.status(201).json({ mensagem: "Notícia salva com sucesso!", dados: novaNoticia });
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const noticias = await Noticia.find().sort({ createdAt: -1 });
    res.json(noticias);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

module.exports = router;