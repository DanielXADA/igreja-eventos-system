require("dotenv").config();
const app = require("./src/app");
const conectarBanco = require("./src/config/db");
const porta = process.env.PORTA || 3000;

conectarBanco().then(() => {
  app.listen(porta);
});