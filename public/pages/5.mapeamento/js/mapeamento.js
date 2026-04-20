import AnaliticTable from "../../../js/AnaliticTable.js";

definirTodasDatasHoje();

async function carregarTabelaAPIMapeamento() {
  mostrarLoader();

  const loja = document.getElementById("filtroLoja").value;
  const rede = document.getElementById("filtroRede").value;
  const hoje = document.getElementById("filtroData").value;

  try {

    const res = await fetch(`${TAB_URL}/Mapeamento?loja=${loja}&rede=${rede}&data=${hoje}`);

    const data = await res.json();

    renderizarTabelaMapeamento(data.registros);
    esconderLoader();

  } catch (erro) {

    console.error("Erro:", erro);
    esconderLoader();

  }

}

function renderizarTabelaMapeamento(dados) {
  const head = document.getElementById("thead");
  const body = document.getElementById("tbody");

  head.innerHTML = "";
  body.innerHTML = "";

  if (!dados || dados.length === 0) {
    body.innerHTML = "<tr><td colspan='100%'>Nenhum registro encontrado</td></tr>";
    return;
  }

  const colunas = Object.keys(dados[0]).filter(c => c !== "id");

  // Cabeçalho
  let headerHTML = "<tr>";
  colunas.forEach(col => {
    headerHTML += `<th>${col.toUpperCase()}</th>`;
  });

  headerHTML += "<th>Ações</th></tr>";
  head.innerHTML = headerHTML;


  // Linhas
  dados.forEach(item => {
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

   // Inicializa AnaliticTable após renderizar
    new AnaliticTable('tabMapeamento');

  // Eventos
  body.querySelectorAll(".editarRegistro").forEach(btn => {
    btn.addEventListener("click", function () {
      editarRegistroMapeamento(this);
    });
  });

  body.querySelectorAll(".deletarRegistro").forEach(btn => {
    btn.addEventListener("click", function () {
      const id = this.closest("tr").dataset.id;
      deletarRegistroMapeamento(id);
    });
  });
}

//editar 
function editarRegistroMapeamento(botao){

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

  novoBotao.addEventListener("click", () => salvarRegistroMapeamento(linha));

}

//enviar edição
async function salvarRegistroMapeamento(linha){

  const id = linha.dataset.id;
  const inputs = linha.querySelectorAll("td[data-col] input");

  const dados = {};

  inputs.forEach(input => {

    const coluna = input.closest("td").dataset.col;
    dados[coluna] = input.value;

  });

  try {
  await fetch(`${TAB_URL}/Mapeamento/${id}`,{
    method:"PUT",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify(dados)
  });
  await carregarTabelaAPIMapeamento();
  mostrarMensagem("Mapeamento atualizado com sucesso!", "sucesso");
  } catch (erro) {
    console.error("Erro ao atualizar mapeamento:", erro);
    mostrarMensagem("Erro ao atualizar mapeamento", "erro");
  }
}

//deletar
async function deletarRegistroMapeamento(id){

  if(!confirm("Deseja realmente excluir este item?")) return;

  try {
  await fetch(`${TAB_URL}/Mapeamento/${id}`,{
    method:"DELETE"
  });
  await carregarTabelaAPIMapeamento();
  mostrarMensagem("Horario excluído com sucesso!", "sucesso");
} catch (erro) {
    console.error("Erro ao excluir mapeamento:", erro);
    mostrarMensagem("Erro ao excluir mapeamento", "erro");
  }

}

document.getElementById("carregarTabMapeamento").addEventListener("click", carregarTabelaAPIMapeamento);



/* async function criarProduto(produto){

 await fetch(`${TAB_URL}/Produtos`,{

   method:"POST",
   headers:{
     "Content-Type":"application/json"
   },
   body:JSON.stringify(produto)

 });

} */

/* //atualizar 
async function atualizarProduto(id, dados){

 await fetch(`${TAB_URL}/Produtos/${id}`,{

   method:"PUT",
   headers:{
     "Content-Type":"application/json"
   },
   body:JSON.stringify(dados)

 });

} */

/* //deletar 
async function deletarProduto(id){

 await fetch(`${TAB_URL}/Produtos/${id}`,{
   method:"DELETE"
 });

} */

