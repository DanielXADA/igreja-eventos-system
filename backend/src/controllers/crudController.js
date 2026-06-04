const criar = (Modelo) => async (requisicao, resposta) => {
  try {
    const dados = await Modelo.create(requisicao.body);
    resposta.status(201).json(dados);
  } catch (erro) {
    resposta.status(400).json({ erro: erro.message });
  }
};

const obterTodos = (Modelo) => async (requisicao, resposta) => {
  try {
    const dados = await Modelo.find();
    resposta.json(dados);
  } catch (erro) {
    resposta.status(500).json({ erro: erro.message });
  }
};

const obterPorId = (Modelo) => async (requisicao, resposta) => {
  try {
    const dados = await Modelo.findById(requisicao.params.id);
    resposta.json(dados);
  } catch (erro) {
    resposta.status(404).json({ erro: "Não encontrado" });
  }
};

const atualizar = (Modelo) => async (requisicao, resposta) => {
  try {
    const dados = await Modelo.findByIdAndUpdate(
      requisicao.params.id,
      requisicao.body,
      { new: true }
    );
    resposta.json(dados);
  } catch (erro) {
    resposta.status(400).json({ erro: erro.message });
  }
};

const remover = (Modelo) => async (requisicao, resposta) => {
  try {
    await Modelo.findByIdAndDelete(requisicao.params.id);
    resposta.json({ mensagem: "Removido com sucesso" });
  } catch (erro) {
    resposta.status(400).json({ erro: erro.message });
  }
};

module.exports = { criar, obterTodos, obterPorId, atualizar, remover };