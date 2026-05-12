const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const dbUrl = 'mysql://root:rbOzKavZGaQSreOqmGmLJpGNdYMmYmHr@shortline.proxy.rlwy.net:45859/controle_de_producao';
const pool = mysql.createPool(dbUrl);

// TESTE DE CONEXÃO INICIAL
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ ERRO CRÍTICO NO BANCO DE DADOS:', err.message);
        return;
    }
    console.log('✅ SUCESSO: Conectado ao MySQL do Railway!');
    connection.release();
});

// --- ROTA DE CADASTRO COM LOGS DETALHADOS ---
// ROTA DE CADASTRO COM LOGS
// ROTA DE CADASTRO AJUSTADA PARA O SCRIPT SQL
// ROTA DE CADASTRO NO SERVER.JS
app.post('/api/cadastro', (req, res) => {
    console.log('\n--- 📥 NOVA TENTATIVA DE CADASTRO ---');
    
    // Pegando apenas o que o HTML está enviando agora
    const { nome, email, senha } = req.body; 

    console.log('Dados recebidos do Front-end:', { nome, email });

    // 1. Validação básica
    if (!nome || !email || !senha) {
        console.warn('⚠️ Erro: Dados incompletos vindos do formulário.');
        return res.status(400).json({ message: 'Preencha nome, e-mail e senha!' });
    }

    // 2. Query mapeada para o seu banco (login = email do front)
    // O campo 'perfil' é obrigatório no seu SQL (ENUM), então definimos um padrão aqui.
    const query = 'INSERT INTO tbUsuarios (nome, login, senha, perfil) VALUES (?, ?, ?, ?)';
    const perfilPadrao = 'Admin'; 

    console.log(`🔌 Executando INSERT no banco para: ${email}`);

    pool.query(query, [nome, email, senha, perfilPadrao], (err, result) => {
        if (err) {
            console.error('❌ ERRO NO BANCO DE DADOS:');
            console.error('   -> Código:', err.code);
            console.error('   -> Mensagem:', err.message);
            
            // Se o e-mail já existir na coluna 'login' que é UNIQUE
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
            }
            
            return res.status(500).json({ message: 'Erro ao salvar no banco de dados.' });
        }

        console.log('✨ SUCESSO: Usuário cadastrado no MySQL!');
        console.log('ID do novo usuário:', result.insertId);
        console.log('--------------------------------------\n');
        
        res.status(201).json({ message: 'Conta criada com sucesso!' });
    });
});
// ROTA DE LOGIN
app.post('/api/login', (req, res) => {
    console.log('\n--- 🔐 Tentativa de Login ---');
    const { email, senha } = req.body;

    // 1. Busca o usuário pelo login (que é o email)
    const query = 'SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?';

    pool.query(query, [email, senha], (err, results) => {
        if (err) {
            console.error('❌ Erro na query de login:', err.message);
            return res.status(500).json({ message: 'Erro interno no servidor' });
        }

        // 2. Verifica se encontrou alguém
        if (results.length > 0) {
            const usuario = results[0];
            console.log(`✅ Login bem-sucedido: ${usuario.nome} (${usuario.perfil})`);
            
            // Retorna os dados básicos para o Front-end
            res.json({ 
                message: 'Login realizado com sucesso!',
                user: {
                    id: usuario.usuario_id,
                    nome: usuario.nome,
                    perfil: usuario.perfil
                }
            });
        } else {
            console.warn('⚠️ Tentativa de login inválida:', email);
            res.status(401).json({ message: 'E-mail ou senha incorretos.' });
        }
    });
});
// ROTA PARA O DASHBOARD (Mantida)
app.get('/api/dashboard-stats', (req, res) => {
    console.log('📊 Buscando estatísticas do Dashboard...');
    const query = `
        SELECT 
            (SELECT COUNT(*) FROM tbOrdemProducao WHERE status = 'Ativo') as ativos,
            (SELECT COUNT(*) FROM tbOrdemProducao WHERE status = 'Concluido') as concluidos
    `;

    pool.query(query, (err, results) => {
        if (err) {
            console.error('❌ Erro na query do Dashboard:', err.message);
            return res.status(500).json({ error: 'Erro ao buscar dados', details: err.message });
        }
        res.json(results[0]);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 SERVIDOR INICIADO`);
    console.log(`🔗 URL local: http://localhost:${PORT}`);
    console.log(`📡 Banco: shortline.proxy.rlwy.net`);
    console.log(`_______________________________________________\n`);
});
// ROTA PARA LISTAR TODOS OS USUÁRIOS
app.get('/api/usuarios', (req, res) => {
    const query = "SELECT usuario_id, nome, login FROM tbUsuarios"; // Seleciona os campos do seu DER
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results); // Envia a lista para o front-end
    });
});
async function carregarUsuarios() {
    try {
        const response = await fetch('http://localhost:3000/api/usuarios');
        const usuarios = await response.json();
        
        const tabela = document.getElementById('lista-usuarios');
        tabela.innerHTML = ''; // Limpa a tabela antes de carregar

        usuarios.forEach(user => {
            // Pega as iniciais do nome para o avatar
            const iniciais = user.nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2);

            tabela.innerHTML += `
                <tr>
                    <td>
                        <div class="user-info">
                            <div class="avatar">${iniciais}</div>
                            <span>${user.nome}</span>
                        </div>
                    </td>
                    <td>${user.login}</td>
                    <td><span class="status-badge">Ativo</span></td>
                    <td style="text-align:right">
                        <div class="actions">
                            <button class="btn-action" onclick="editarUsuario(${user.usuario_id})" title="Editar">✏️</button>
                            <button class="btn-action" onclick="excluirUsuario(${user.usuario_id})" title="Excluir">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Erro ao carregar usuários:", error);
    }
}

// Chama a função assim que a página carregar
window.onload = carregarUsuarios;