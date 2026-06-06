const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const autenticar = async (req, res, next) => {
  try {
    const cabecalho = req.headers.authorization;

    if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
      return res.status(401).json({
        erro: "Token não informado"
      });
    }

    const token = cabecalho.split(" ")[1];

    const dadosToken = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findById(dadosToken.id);

    if (!usuario) {
      return res.status(401).json({
        erro: "Usuário do token não encontrado"
      });
    }

    req.usuario = usuario;

    return next();
  } catch (erro) {
    return res.status(401).json({
      erro: "Token inválido ou expirado"
    });
  }
};

module.exports = autenticar;