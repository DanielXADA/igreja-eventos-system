const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/usuarios", require("./routes/usuario.routes"));
app.use("/api/eventos", require("./routes/evento.routes"));
app.use("/api/categorias", require("./routes/categoria.routes"));
app.use("/api/comentarios", require("./routes/comentario.routes"));
app.use("/api/ministerios", require("./routes/ministerio.routes"));
app.use("/api/inscricoes", require("./routes/inscricao.routes"));
app.use("/api/locais", require("./routes/local.routes"));
app.use("/api/voluntarios", require("./routes/voluntario.routes"));
app.use("/api/doacoes", require("./routes/doacao.routes"));
app.use("/api/notificacoes", require("./routes/notificacao.routes"));

app.use("/api/consultas", require("./routes/consulta.routes"));
app.use("/api/relatorios", require("./routes/relatorio.routes"));

module.exports = app;