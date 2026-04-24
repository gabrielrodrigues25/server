import AnaliticTable from "../../../js/AnaliticTable.js";
import TabelaAPI from "../../../js/classes.js"

definirTodasDatasHoje();

async function carregarTabelaCompleta() {
  mostrarLoader();

  const loja = document.getElementById("filtroLoja").value;
  const cliente = document.getElementById("filtroCliente").value;
  const data = document.getElementById("filtroData").value;

  try {
    const [estoqueRes, progRes, fatRes] = await Promise.all([
      fetch(`${TAB_URL}/Pedidos?loja=${loja}&data=${data}`),
      fetch(`${TAB_URL}/VendasProgramadas?cliente=${cliente}`),
      fetch(`${TAB_URL}/VendasFaturadas?cliente=${cliente}`)
    ]);

    const estoqueData = await estoqueRes.json();
    const progData = await progRes.json();
    const fatData = await fatRes.json();

    const estoque = estoqueData.registros || [];
    const programado = progData.registros || [];
    const faturado = fatData.registros || [];

    const resultado = agruparDados(estoque, programado, faturado);
    console.log(estoque, programado, faturado)

    renderizarTabela(resultado);

  } catch (erro) {
    console.error("Erro:", erro);
  } finally {
    esconderLoader();
  }
}

function agruparDados(estoque, programado, faturado) {

  const mapa = {};

  function getKey(loja, data) {
    return `${loja}_${data}`;
  }

  // ESTOQUE
  estoque.forEach(item => {
    const key = getKey(item.loja, item.data);

    if (!mapa[key]) {
      mapa[key] = {
        loja: item.loja,
        data: item.data,
        estoque: 0,
        programado: 0,
        faturado: 0
      };
    }

    mapa[key].estoque += Number(item.quantidade || 0);
  });

  // PROGRAMADO
  programado.forEach(item => {
    const key = getKey(item.loja, item.data);

    if (!mapa[key]) {
      mapa[key] = {
        loja: item.loja,
        data: item.data,
        estoque: 0,
        programado: 0,
        faturado: 0
      };
    }

    mapa[key].programado += Number(item.quantidade || 0);
  });

  // FATURADO
  faturado.forEach(item => {
    const key = getKey(item.loja, item.data);

    if (!mapa[key]) {
      mapa[key] = {
        loja: item.loja,
        data: item.data,
        estoque: 0,
        programado: 0,
        faturado: 0
      };
    }

    mapa[key].faturado += Number(item.quantidade || 0);
  });

  return Object.values(mapa);
}

async function carregarRedes(){
  try{

    const res = await fetch(`${TAB_URL}/Lojas`);
    const data = await res.json();
    const selectRede = document.getElementById("filtroRede");

    // Limpa as opções existentes
    selectRede.innerHTML = '<option value="">Todas as redes</option>';

    const redes = [...new Set(data.registros.map(i => i.rede))];
    redes.forEach(rede => {
      const option = document.createElement("option");
      option.value = rede;
      option.textContent = rede;
      selectRede.appendChild(option);
    });

  }catch(erro){
    console.error("Erro ao carregar lojas:", erro);
  }
}

//carregar lista de lojas
async function carregarLojas(){
  try{

    const res = await fetch(`${TAB_URL}/Lojas`);
    const data = await res.json();
    const select = document.getElementById("filtroLoja");
    const selectCliente = document.getElementById("filtroCliente");
    const selectRede = document.getElementById("filtroRede");

    // Limpa as opções existentes
    select.innerHTML = '<option value="">Todas as lojas</option>';

    const loja = data.registros.filter(i => i.rede === selectRede.value).map(i => i.loja);
    loja.forEach(loja => {
      const option = document.createElement("option");
      option.value = loja;
      option.textContent = loja;
      select.appendChild(option);
    });

    selectCliente.innerHTML = '<option value="">Todos os clientes</option>';

    const cliente = data.registros.filter(i => i.rede === selectRede.value).map(i => i.cliente);
    cliente.forEach(loja => {
      const option = document.createElement("option");
      option.value = loja;
      option.textContent = loja;
      selectCliente.appendChild(option);
    });

  }catch(erro){
    console.error("Erro ao carregar lojas:", erro);
  }
}

document.querySelector("#filtroRede").addEventListener("change", function(){
  carregarLojas();
});

document.addEventListener("DOMContentLoaded", () => {

  carregarRedes();
  carregarLojas();

});

let tabela;

async function carregarTabelaAPI() {
  mostrarLoader();

  const loja = document.getElementById("filtroLoja").value;
  const hoje = document.getElementById("filtroData").value;

  try {

    tabela = new TabelaAPI(`${TAB_URL}/Pedidos?loja=${loja}&data=${hoje}`);

    const data = await tabela.carregar();

    // se sua API já retorna { registros: [] }
    renderizarTabela(data.registros || data);

  } catch (erro) {
    console.error("Erro:", erro);
  } finally {
    esconderLoader();
  }
}

async function carregarOrdensFaturadas() {
  mostrarLoader();

  const loja = document.getElementById("filtroCliente").value;

  try {

    tabela = new TabelaAPI(`${TAB_URL}/VendasFaturadas?cliente=${loja}`);

    const data = await tabela.carregar();

    // se sua API já retorna { registros: [] }
    console.log(data)

  } catch (erro) {
    console.error("Erro:", erro);
  } finally {
    esconderLoader();
  }
}

async function carregarOrdensAFaturar() {
  mostrarLoader();

  const loja = document.getElementById("filtroCliente").value;

  try {

    tabela = new TabelaAPI(`${TAB_URL}/VendasProgramadas?cliente=${loja}`);

    const data = await tabela.carregar();

    // se sua API já retorna { registros: [] }
    console.log(data)

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

document.getElementById("carregarTab").addEventListener("click", carregarTabelaCompleta);


