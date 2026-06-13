const express = require("express");
const mongoose = require("mongoose");

const roteador = express.Router();

const Inscricao = require("../models/Inscricao");
const Evento = require("../models/Evento");

const autenticar = require("../middlewares/autenticacao");
const autorizar = require("../middlewares/autorizacao");

const HORAS_ANTES_CHECKIN = 2;
const HORAS_DEPOIS_CHECKIN = 6;

roteador.post("/", autenticar, async (req, res) => {
  try {
    const { evento } = req.body;

    if (!evento) {
      return res.status(400).json({
        erro: "O evento é obrigatório"
      });
    }

    if (!mongoose.isValidObjectId(evento)) {
      return res.status(400).json({
        erro: "ID do evento inválido"
      });
    }

    const eventoEncontrado = await Evento.findById(evento);

    if (!eventoEncontrado) {
      return res.status(404).json({
        erro: "Evento não encontrado"
      });
    }

    const agora = new Date();
    if (new Date(eventoEncontrado.data) < agora) {
      return res.status(400).json({
        erro: "As inscrições deste evento estão encerradas"
      });
    }

    if (eventoEncontrado.status === "Cancelado") {
      return res.status(400).json({
        erro: "Não é possível se inscrever em um evento cancelado"
      });
    }

    const inscricaoExistente = await Inscricao.findOne({
      usuario: req.usuario._id,
      evento
    });

    if (inscricaoExistente) {
      return res.status(409).json({
        erro: "Usuário já inscrito neste evento"
      });
    }

    const totalInscritos = await Inscricao.countDocuments({
      evento,
      status: {
        $ne: "cancelado"
      }
    });

    if (totalInscritos >= eventoEncontrado.capacidade) {
      return res.status(400).json({
        erro: "O evento atingiu a capacidade máxima"
      });
    }

    const inscricao = await Inscricao.create({
      usuario: req.usuario._id,
      evento,
      status: "confirmado"
    });

    const inscricaoCompleta = await Inscricao.findById(inscricao._id)
      .populate("usuario", "nome email tipo")
      .populate("evento", "titulo data status");

    return res.status(201).json(inscricaoCompleta);
  } catch (erro) {
    if (erro.code === 11000) {
      return res.status(409).json({
        erro: "Usuário já inscrito neste evento"
      });
    }

    return res.status(400).json({
      erro: erro.message
    });
  }
});

roteador.get("/minhas", autenticar, async (req, res) => {
  try {
    const inscricoes = await Inscricao.find({
      usuario: req.usuario._id
    })
      .populate("evento", "titulo descricao data status")
      .sort({
        dataInscricao: -1
      });

    return res.status(200).json(inscricoes);
  } catch (erro) {
    return res.status(500).json({
      erro: erro.message
    });
  }
});

roteador.get(
  "/",
  autenticar,
  autorizar("admin", "pastor", "lider"),
  async (req, res) => {
    try {
      const inscricoes = await Inscricao.find()
        .populate("usuario", "nome email telefone tipo")
        .populate("evento", "titulo data status")
        .sort({
          dataInscricao: -1
        });

      return res.status(200).json(inscricoes);
    } catch (erro) {
      return res.status(500).json({
        erro: erro.message
      });
    }
  }
);

roteador.get(
  "/evento/:eventoId",
  autenticar,
  autorizar("admin", "pastor", "lider"),
  async (req, res) => {
    try {
      const { eventoId } = req.params;

      if (!mongoose.isValidObjectId(eventoId)) {
        return res.status(400).json({
          erro: "ID do evento inválido"
        });
      }

      const inscricoes = await Inscricao.find({
        evento: eventoId
      })
        .populate("usuario", "nome email telefone tipo")
        .populate("evento", "titulo data status");

      return res.status(200).json(inscricoes);
    } catch (erro) {
      return res.status(500).json({
        erro: erro.message
      });
    }
  }
);

roteador.patch(
  "/:id/check-in",
  autenticar,
  autorizar("admin", "pastor", "lider"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          erro: "ID da inscrição inválido"
        });
      }

      const inscricao = await Inscricao.findById(id).populate("evento");

      if (!inscricao) {
        return res.status(404).json({
          erro: "Inscrição não encontrada"
        });
      }

      if (!inscricao.evento) {
        return res.status(404).json({
          erro: "Evento da inscrição não encontrado"
        });
      }

      if (inscricao.status === "cancelado") {
        return res.status(400).json({
          erro: "Não é possível realizar check-in em inscrição cancelada"
        });
      }

      if (inscricao.evento.status === "Cancelado") {
        return res.status(400).json({
          erro: "Não é possível realizar check-in em evento cancelado"
        });
      }

      if (inscricao.checkIn.realizado) {
        return res.status(409).json({
          erro: "Check-in já realizado"
        });
      }

      const agora = new Date();
      const dataEvento = new Date(inscricao.evento.data);

      const inicioPermitido = new Date(
        dataEvento.getTime() -
          HORAS_ANTES_CHECKIN * 60 * 60 * 1000
      );

      const fimPermitido = new Date(
        dataEvento.getTime() +
          HORAS_DEPOIS_CHECKIN * 60 * 60 * 1000
      );

      if (agora < inicioPermitido) {
        return res.status(400).json({
          erro: `Check-in disponível somente ${HORAS_ANTES_CHECKIN} horas antes do evento`
        });
      }

      if (agora > fimPermitido) {
        return res.status(400).json({
          erro: "O período de check-in deste evento foi encerrado"
        });
      }

      inscricao.checkIn.realizado = true;
      inscricao.checkIn.data = agora;

      await inscricao.save();

      const inscricaoCompleta = await Inscricao.findById(inscricao._id)
        .populate("usuario", "nome email tipo")
        .populate("evento", "titulo data status");

      return res.status(200).json(inscricaoCompleta);
    } catch (erro) {
      return res.status(400).json({
        erro: erro.message
      });
    }
  }
);

roteador.patch("/:id/cancelar", autenticar, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        erro: "ID da inscrição inválido"
      });
    }

    const inscricao = await Inscricao.findById(id);

    if (!inscricao) {
      return res.status(404).json({
        erro: "Inscrição não encontrada"
      });
    }

    const usuarioEhDono =
      inscricao.usuario.toString() === req.usuario._id.toString();

    const usuarioPodeAdministrar = [
      "admin",
      "pastor",
      "lider"
    ].includes(req.usuario.tipo);

    if (!usuarioEhDono && !usuarioPodeAdministrar) {
      return res.status(403).json({
        erro: "Usuário sem permissão para cancelar esta inscrição"
      });
    }

    inscricao.status = "cancelado";
    inscricao.checkIn.realizado = false;
    inscricao.checkIn.data = null;

    await inscricao.save();

    return res.status(200).json(inscricao);
  } catch (erro) {
    return res.status(400).json({
      erro: erro.message
    });
  }
});

roteador.delete(
  "/:id",
  autenticar,
  autorizar("admin", "pastor"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          erro: "ID da inscrição inválido"
        });
      }

      const inscricao = await Inscricao.findByIdAndDelete(id);

      if (!inscricao) {
        return res.status(404).json({
          erro: "Inscrição não encontrada"
        });
      }

      return res.status(200).json({
        mensagem: "Inscrição removida com sucesso"
      });
    } catch (erro) {
      return res.status(400).json({
        erro: erro.message
      });
    }
  }
);


module.exports = roteador;