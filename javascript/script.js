let dados = JSON.parse(localStorage.getItem("dados")) || [];

function login() {
  let user = document.getElementById("user").value;
  let pass = document.getElementById("pass").value;

  if(user === "admin" && pass === "123") {
    window.location = "dashboard.html";
  } else {
    alert("Login inválido");
  }
}

function cadastrar() {
  let produto = document.getElementById("produto").value;
  let etapa = document.getElementById("etapa").value;
  let quantidade = document.getElementById("quantidade").value;
  let prazo = document.getElementById("prazo").value;

  dados.push({produto, etapa, quantidade, prazo});
  localStorage.setItem("dados", JSON.stringify(dados));

  alert("Cadastrado!");
}

function carregarTabela() {
  let tabela = document.getElementById("tabela");

  if(!tabela) return;

  tabela.innerHTML = "";

  dados.forEach(d => {
    tabela.innerHTML += `
      <tr>
        <td>${d.produto}</td>
        <td>${d.etapa}</td>
        <td>${d.quantidade}</td>
        <td>${d.prazo}</td>
      </tr>
    `;
  });

  document.getElementById("total").innerText =
    dados.reduce((soma, d) => soma + Number(d.quantidade), 0);

  document.getElementById("ordens").innerText = dados.length;
}

carregarTabela();