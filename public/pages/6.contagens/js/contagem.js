import AnaliticTable from "../../../js/AnaliticTable.js";
import TabelaAPI from "../../../js/classes.js"

definirTodasDatasHoje();
let tabela;

const loja = document.getElementById("filtroLoja").value;
const hoje = document.getElementById("filtroData").value;
 
new TabelaAPI(`${AUTH_URL}/Pedidos?loja=${loja}&data=${hoje}`)

async function carregarTabelaAPI() {
  mostrarLoader();

  const loja = document.getElementById("filtroLoja").value;
  const hoje = document.getElementById("filtroData").value;

  try {

    tabela = new TabelaAPI(`${AUTH_URL}/Pedidos?loja=${loja}&data=${hoje}`);

    const data = await tabela.carregar();

    // se sua API já retorna { registros: [] }
    renderizarTabela(data.registros || data);

  } catch (erro) {
    console.error("Erro:", erro);
  } finally {
    esconderLoader();
  }
}

function renderizarTabela(dados) {
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
    new AnaliticTable('tabContagem');

  // Eventos
  body.querySelectorAll(".editarRegistro").forEach(btn => {
    btn.addEventListener("click", function () {
      editarRegistro(this);
    });
  });

  body.querySelectorAll(".deletarRegistro").forEach(btn => {
    btn.addEventListener("click", function () {
      const id = this.closest("tr").dataset.id;
      deletarRegistro(id);
    });
  });
}

//editar 
function editarRegistro(botao){

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

  novoBotao.addEventListener("click", () => salvarRegistro(linha));

}

//enviar edição
async function salvarRegistro(linha){

  const id = linha.dataset.id;
  const inputs = linha.querySelectorAll("td[data-col] input");

  const dados = {};

  inputs.forEach(input => {
    const coluna = input.closest("td").dataset.col;
    dados[coluna] = input.value;
  });

  try {

    await tabela.atualizar(id, dados);

    await carregarTabelaAPI();

    mostrarMensagem("Relatório de contagem atualizado com sucesso!", "sucesso");

  } catch (erro) {
    console.error("Erro ao atualizar:", erro);
    mostrarMensagem("Erro ao atualizar", "erro");
  }
}

//deletar
async function deletarRegistro(id){

  if(!confirm("Deseja realmente excluir este item?")) return;

  try {

    await tabela.remover(id);

    await carregarTabelaAPI();

    mostrarMensagem("Excluído com sucesso!", "sucesso");

  } catch (erro) {
    console.error("Erro:", erro);
    mostrarMensagem("Erro ao excluir", "erro");
  }
}

document.getElementById("carregarTab").addEventListener("click", carregarTabelaAPI);


