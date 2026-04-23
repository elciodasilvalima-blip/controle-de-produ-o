const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: "SEU_HOST",
  user: "SEU_USER",
  password: "SUA_SENHA",
  database: "SEU_BANCO"
});

app.post("/cadastrar", (req, res) => {
  const {produto, etapa, quantidade, prazo} = req.body;

  db.query(
    "INSERT INTO producao (produto, etapa, quantidade, prazo) VALUES (?, ?, ?, ?)",
    [produto, etapa, quantidade, prazo],
    (err) => {
      if(err) return res.send(err);
      res.send("OK");
    }
  );
});

app.get("/listar", (req, res) => {
  db.query("SELECT * FROM producao", (err, result) => {
    res.json(result);
  });
});

app.listen(3000, () => console.log("Servidor rodando"));