async function carregarTabelaAPILojas() {
  mostrarLoader();

  const loja = document.getElementById("filtroLoja").value;
  const rede = document.getElementById("filtroRede").value;

  try {

    const res = await fetch(`${AUTH_URL}/Lojas?loja=${loja}&rede=${rede}`);

    const data = await res.json();

    renderizarTabelaLojas(data.registros);
    esconderLoader();

  } catch (erro) {

    console.error("Erro:", erro);
    esconderLoader();

  }

}

document.addEventListener("DOMContentLoaded", () => {

  carregarLojas()

});

function renderizarTabelaLojas(dados) {
  const head = document.getElementById("thead");
  const body = document.getElementById("tbody");

  head.innerHTML = "";
  body.innerHTML = "";

  if (!dados || dados.length === 0) {
    body.innerHTML = "<tr><td colspan='100%'>Nenhum registro encontrado</td></tr>";
    return;
  }

  const colunas = Object.keys(dados[0]).filter(c => c !== "id");

  // Criar cabeçalho com filtro
  let headerHTML = "<tr>";
  colunas.forEach(col => {
    headerHTML += `<th>
      ${col.toUpperCase()}<br>
      <input type="text" data-col="${col}" placeholder="Filtrar..." style="width: 90%;">
    </th>`;
  });
  headerHTML += "<th>Ações</th></tr>";

  head.innerHTML = headerHTML;

  // Função para renderizar linhas filtradas
  function atualizarLinhas(filtro = {}) {
    body.innerHTML = "";

    const linhasFiltradas = dados.filter(item => {
      return Object.entries(filtro).every(([col, valor]) => {
        if (!valor) return true;
        return String(item[col]).toLowerCase().includes(valor.toLowerCase());
      });
    });

    if (linhasFiltradas.length === 0) {
      body.innerHTML = "<tr><td colspan='100%'>Nenhum registro encontrado</td></tr>";
      return;
    }

    linhasFiltradas.forEach(item => {
      let linha = `<tr data-id="${item.id}">`;
      colunas.forEach(col => {
        linha += `<td data-col="${col}">${item[col] ?? ""}</td>`;
      });
      linha += `
        <td>
          <button class="editarRegistro">Editar</button>
          <button class="deletarRegistro">Excluir</button>
        </td>
      </tr>`;
      body.innerHTML += linha;
    });
  }

  // adicionar eventos depois que a tabela é criada
  body.querySelectorAll(".editarRegistro").forEach(btn => {
    btn.addEventListener("click", function () {
      editarRegistroLoja(this);
    });
  });

  body.querySelectorAll(".deletarRegistro").forEach(btn => {
    btn.addEventListener("click", function () {
      const id = this.closest("tr").dataset.id;
      deletarRegistroLoja(id);
    });
  });

  // Inicializa tabela com todas as linhas
  atualizarLinhas();

  // Adiciona evento nos inputs de filtro
  head.querySelectorAll("input[data-col]").forEach(input => {
    input.addEventListener("input", () => {
      const filtro = {};
      head.querySelectorAll("input[data-col]").forEach(i => {
        filtro[i.dataset.col] = i.value;
      });
      atualizarLinhas(filtro);
    });
  });

}

function filtrarTabelaLojas() {

  const filtro = document.getElementById("filtro").value.toLowerCase();
  const linhas = document.querySelectorAll("#tbody tr");

  linhas.forEach(linha => {

    const texto = linha.innerText.toLowerCase();

    linha.style.display = texto.includes(filtro) ? "" : "none";

  });

}

//editar 
function editarRegistroLoja(botao){

  const linha = botao.closest("tr");
  const tds = linha.querySelectorAll("td[data-col]");

  tds.forEach(td => {

    const valor = td.innerText;

    td.innerHTML = `<input value="${valor}" style="width:100%">`;

  });

  botao.innerText = "Salvar";

  // remover eventos antigos clonando o botão
  const novoBotao = botao.cloneNode(true);
  botao.replaceWith(novoBotao);

  novoBotao.addEventListener("click", () => salvarRegistroLoja(linha));

}

//enviar edição
async function salvarRegistroLoja(linha){

  const id = linha.dataset.id;
  const inputs = linha.querySelectorAll("td[data-col] input");

  const dados = {};

  inputs.forEach(input => {

    const coluna = input.closest("td").dataset.col;
    dados[coluna] = input.value;

  });

  try {
  await fetch(`${AUTH_URL}/Lojas/${id}`,{
    method:"PUT",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify(dados)
  });
  await carregarTabelaAPILojas();
  mostrarMensagem("Loja atualizada com sucesso!", "sucesso");
  } catch (erro) {
    console.error("Erro ao atualizar loja:", erro);
    mostrarMensagem("Erro ao atualizar loja", "erro");
  }
}

//deletar
async function deletarRegistroLoja(id){

  if(!confirm("Deseja realmente excluir este item?")) return;

  try {
  await fetch(`${AUTH_URL}/Lojas/${id}`,{
    method:"DELETE"
  });
  await carregarTabelaAPILojas();
  mostrarMensagem("Loja excluída com sucesso!", "sucesso");
} catch (erro) {
    console.error("Erro ao excluir loja:", erro);
    mostrarMensagem("Erro ao excluir loja", "erro");
  }

}

//criar 
function abrirLoja(){

if(document.getElementById("formLoja").style.display === "none"){
 document.getElementById("formLoja").style.display = "block";
} else {
 document.getElementById("formLoja").style.display = "none";

}}

async function salvarLoja(){

 const dados = {

  rede: document.getElementById("rede").value,
  loja: document.getElementById("loja").value,
  cliente: document.getElementById("cliente").value,
  promotor: document.getElementById("promotor").value,
  login: document.getElementById("login").value,
  situacao: document.getElementById("situacao").value,
  disparo: document.getElementById("disparo").value

 };

 try {
 await fetch(`${AUTH_URL}/Lojas`,{
  method:"POST",
  headers:{
   "Content-Type":"application/json"
  },
  body: JSON.stringify(dados)
 });
  await carregarTabelaAPILojas();
  mostrarMensagem("Loja registrada com sucesso!", "sucesso");
} catch (erro) {
    console.error("Erro ao criar loja:", erro);
    mostrarMensagem("Erro ao criar loja", "erro");

}
}

document.getElementById("carregarTabLojas").addEventListener("click", carregarTabelaAPILojas);
document.getElementById("abrirNovoLoja").addEventListener("click", abrirLoja);
document.getElementById("salvarNovaLoja").addEventListener("click", salvarLoja);

/* async function criarProduto(produto){

 await fetch(`${AUTH_URL}/Produtos`,{

   method:"POST",
   headers:{
     "Content-Type":"application/json"
   },
   body:JSON.stringify(produto)

 });

} */

/* //atualizar 
async function atualizarProduto(id, dados){

 await fetch(`${AUTH_URL}/Produtos/${id}`,{

   method:"PUT",
   headers:{
     "Content-Type":"application/json"
   },
   body:JSON.stringify(dados)

 });

} */

/* //deletar 
async function deletarProduto(id){

 await fetch(`${AUTH_URL}/Produtos/${id}`,{
   method:"DELETE"
 });

} */

