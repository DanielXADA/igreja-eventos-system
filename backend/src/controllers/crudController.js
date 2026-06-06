const criar = (Modelo) => async (req, res) => {
  try {
    const dados = await Modelo.create(req.body);
    return res.status(201).json(dados);
  } catch (erro) {
    return res.status(400).json({ erro: erro.message });
  }
};

const obterTodos = (Modelo) => async (req, res) => {
  try {
    const dados = await Modelo.find();
    return res.status(200).json(dados);
  } catch (erro) {
    return res.status(500).json({ erro: erro.message });
  }
};

const obterPorId = (Modelo) => async (req, res) => {
  try {
    const dados = await Modelo.findById(req.params.id);

    if (!dados) {
      return res.status(404).json({ erro: "Registro não encontrado" });
    }

    return res.status(200).json(dados);
  } catch (erro) {
    return res.status(400).json({ erro: "ID inválido" });
  }
};

const atualizar = (Modelo) => async (req, res) => {
  try {
    const dados = await Modelo.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!dados) {
      return res.status(404).json({ erro: "Registro não encontrado" });
    }

    return res.status(200).json(dados);
  } catch (erro) {
    return res.status(400).json({ erro: erro.message });
  }
};

const remover = (Modelo) => async (req, res) => {
  try {
    const dados = await Modelo.findByIdAndDelete(req.params.id);

    if (!dados) {
      return res.status(404).json({ erro: "Registro não encontrado" });
    }

    return res.status(200).json({ mensagem: "Removido com sucesso" });
  } catch (erro) {
    return res.status(400).json({ erro: "ID inválido" });
  }
};

module.exports = {
  criar,
  obterTodos,
  obterPorId,
  atualizar,
  remover
};