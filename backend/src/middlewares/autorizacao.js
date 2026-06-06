const autorizar = (...tiposPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        erro: "Usuário não autenticado"
      });
    }

    if (!tiposPermitidos.includes(req.usuario.tipo)) {
      return res.status(403).json({
        erro: "Usuário sem permissão para esta operação"
      });
    }

    return next();
  };
};

module.exports = autorizar;