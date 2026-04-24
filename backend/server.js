const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURAÇÃO DO RAILWAY
// Pegue esses dados na aba "Connect" ou "Variables" do seu MySQL no Railway
const db = mysql.createConnection({
    host: 'shortline.proxy.rlwy.net', 
    user: 'root',
    password: 'rbOzKavZGaQSreOqmGmLJpGNdYMmYmHr',
    database: 'controle_de_producao', // Nome que está no seu script do Workbench
    port: 45859
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao banco:', err);
        return;
    }
    console.log('Conectado ao MySQL do Railway!');
});

// ROTA PARA O DASHBOARD (Visão Geral)
// Aqui buscamos os dados para preencher os cards do seu print de Dashboard
app.get('/api/dashboard-stats', (req, res) => {
    const query = `
        SELECT 
            (SELECT COUNT(*) FROM tbOrdemProducao WHERE status = 'Ativo') as ativos,
            (SELECT COUNT(*) FROM tbOrdemProducao WHERE status = 'Concluido') as concluidos
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0]);
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});