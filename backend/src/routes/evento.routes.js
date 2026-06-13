const express = require("express");
const router = express.Router();
const Evento = require("../models/Evento");

router.post("/", async (req, res) => {
  try {
    const { titulo, descricao, categoria, local, data, capacidade, imagens } = req.body;

    if (!titulo || !categoria || !local || !data || !capacidade) {
      return res.status(400).json({ erro: "Campos obrigatórios não preenchidos" });
    }

    const novoEvento = new Evento({
      titulo,
      descricao,
      categoria,
      local,
      data,
      capacidade,
      imagens: imagens || [],
      status: "confirmado"
    });

    await novoEvento.save();
    return res.status(201).json(novoEvento);
  } catch (error) {
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

router.get("/", async (req, res) => {
  try {
    const eventos = await Evento.find().populate("categoria").populate("local");
    return res.status(200).json(eventos);
  } catch (error) {
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ erro: "Evento não encontrado" });
    }
    return res.status(200).json(evento);
  } catch (error) {
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { titulo, descricao, categoria, local, data, capacidade, imagens, status } = req.body;

    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ erro: "Evento não encontrado" });
    }

    if (titulo) evento.titulo = titulo;
    if (descricao !== undefined) evento.descricao = descricao;
    if (categoria) evento.categoria = categoria;
    if (local) evento.local = local;
    if (data) evento.data = data;
    if (capacidade) evento.capacidade = capacidade;
    if (imagens) evento.imagens = imagens;
    if (status) evento.status = status;

    await evento.save();
    return res.status(200).json(evento);
  } catch (error) {
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const eventoDeletado = await Evento.findByIdAndDelete(req.params.id);
    if (!eventoDeletado) {
      return res.status(404).json({ erro: "Evento não encontrado" });
    }
    return res.status(200).json({ mensagem: "Evento removido com sucesso" });
  } catch (error) {
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

module.exports = router;