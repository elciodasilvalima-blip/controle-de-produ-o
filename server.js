const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão via Pool (Mais estável para o Railway)
const dbUrl = 'mysql://root:rbOzKavZGaQSreOqmGmLJpGNdYMmYmHr@shortline.proxy.rlwy.net:45859/controle_de_producao';
const pool = mysql.createPool(dbUrl);

// Teste de Conexão
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ ERRO NO BANCO:', err.message);
        return;
    }
    console.log('✅ SUCESSO: Conectado ao MySQL do Railway!');
    connection.release();
});

// --- ROTA DE CADASTRO ---
app.post('/api/cadastro', (req, res) => {
    const { nome, email, senha } = req.body; 
    const query = 'INSERT INTO tbUsuarios (nome, login, senha, perfil) VALUES (?, ?, ?, ?)';
    const perfilPadrao = 'Admin'; 

    pool.query(query, [nome, email, senha, perfilPadrao], (err, result) => {
        if (err) return res.status(500).json({ message: 'Erro ao cadastrar.' });
        res.status(201).json({ message: 'Conta criada!' });
    });
});

// --- ROTA DE LOGIN ---
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;
    const query = 'SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?';
    pool.query(query, [email, senha], (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ message: 'Falha no login' });
        res.json({ message: 'Sucesso!', user: results[0] });
    });
});

// --- ROTA PARA LISTAR (Para a Tabela) ---
app.get('/api/usuarios', (req, res) => {
    const query = "SELECT usuario_id, nome, login FROM tbUsuarios";
    pool.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- NOVO: EXCLUIR USUÁRIO ---
app.delete('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM tbUsuarios WHERE usuario_id = ?";
    pool.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao excluir" });
        res.json({ message: "Removido!" });
    });
});

// --- NOVO: EDITAR USUÁRIO ---
app.put('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { nome, login } = req.body;
    const query = "UPDATE tbUsuarios SET nome = ?, login = ? WHERE usuario_id = ?";
    pool.query(query, [nome, login, id], (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao atualizar" });
        res.json({ message: "Atualizado!" });
    });
});

// --- ROTA DASHBOARD ---
app.get('/api/dashboard-stats', (req, res) => {
    const query = `
        SELECT 
            (SELECT COUNT(*) FROM tbOrdemProducao WHERE status = 'Ativo') as ativos,
            (SELECT COUNT(*) FROM tbOrdemProducao WHERE status = 'Concluido') as concluidos
    `;
    pool.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

app.listen(3000, () => console.log(`🚀 Servidor rodando em http://localhost:3000`));