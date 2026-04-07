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
    body.innerHTML = "<tr><td>Nenhum registro encontrado</td></tr>";
    return;
  }

  const colunas = Object.keys(dados[0]);

  // Criar cabeçalho
  colunas.forEach(col => {
    head.innerHTML += `<th>${col.toUpperCase()}</th>`;
  });

  head.innerHTML += "<th>AÇÕES</th>"; // coluna nova

  // Criar linhas
dados.forEach(item => {

  let linha = `<tr data-id="${item.id}">`;

  Object.entries(item).forEach(([chave, valor]) => {

    if(chave !== "id"){
      linha += `<td data-col="${chave}">${valor ?? ""}</td>`;
    }

  });

  linha += `
    <td>
      <button id="editarRegistro">Editar</button>
      <button id="deletarRegistro">Excluir</button>
    </td>
  `;

  linha += "</tr>";

  body.innerHTML += linha;

  document.getElementById("editarRegistro").addEventListener("click", editarRegistroLoja(this));
  document.getElementById("deletarRegistro").addEventListener("click", deletarRegistroLoja(item.id));

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
  botao.onclick = () => salvarRegistroLoja(linha);

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

  await fetch(`${AUTH_URL}/Lojas/${id}`,{
    method:"PUT",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify(dados)
  });

  carregarTabelaAPILojas();

}

//deletar
async function deletarRegistroLoja(id){

  if(!confirm("Deseja realmente excluir este item?")) return;

  await fetch(`${AUTH_URL}/Lojas/${id}`,{
    method:"DELETE"
  });

  carregarTabelaAPILojas();

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

 await fetch(`${AUTH_URL}/Lojas`,{
  method:"POST",
  headers:{
   "Content-Type":"application/json"
  },
  body: JSON.stringify(dados)
 });

 carregarTabelaAPILojas();

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

