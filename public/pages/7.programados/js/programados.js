import AnaliticTable from "../../../js/AnaliticTable.js";

definirTodasDatasHoje();

//carregar lista de vendedores
let listaVendedores = [];
let dadosClientes = []; // guarda tudo

async function carregarVendedores() {
  try {
    const res = await fetch(`${TAB_URL}/Vendedores`);
    const data = await res.json();

    dadosClientes = data.Clientes; //salva tudo

    listaVendedores = [...new Set(
  dadosClientes.map(i => i.NmVendedor?.trim())
)];

    renderizarVendedores(listaVendedores);

  } catch (erro) {
    console.error("Erro ao carregar vendedores:", erro);
  }
}

document.addEventListener("DOMContentLoaded", carregarVendedores);

// apenas renderiza no datalist
function renderizarVendedores(lista) {
  const datalist = document.getElementById("lista-vendedor");

  datalist.innerHTML = lista
    .map(nome => `<option value="${nome}">`)
    .join("");
}

// filtro enquanto digita
document.getElementById("buscarVendedor").addEventListener("input", (e) => {
  const texto = e.target.value.toLowerCase();

  const filtrados = listaVendedores.filter(nome =>
    nome?.toLowerCase().includes(texto)
  );

  renderizarVendedores(filtrados);
});

function carregarDatasRemessa(vendedor) {

  const selectData = document.getElementById("select-data");

  selectData.innerHTML = '<option value="">Todas as datas</option>';

  // usa os dados da API de programados
  const filtrados = dadosGlobais.filter(item =>
    String(item.Vendedor?.trim()) === String(vendedor?.trim())
  );

  // pega datas únicas
  const datas = [...new Set(
    filtrados.map(i => i["Data de Remessa"])
  )];

  console.log(dadosGlobais)

  // ordena
  datas.sort((a, b) => new Date(a) - new Date(b));

  // renderiza
  datas.forEach(data => {
    const option = document.createElement("option");
    option.value = data;
    option.textContent = formatarData(data);
    selectData.appendChild(option);
  });
}

let dadosGlobais = [];
let vendedorGlobal = "";

//CARREGAR TABELA PRA SABER SE EXISTE REGISTRO
async function carregarTabelaAPIGeral() {

  try {
    const res = await fetch(`${TAB_URL}/ProgramadoTab`);
    const data = await res.json();
      if (!data || data.length === 0) {
      alert("Os dados estão sendo atualizados no momento... Tente novamente em instantes");
      console.log(data)
      return;
}

  } catch (erro) {
    console.error("Erro:", erro);
  }
}

//carregar a tabela de pedidos programados

async function carregarTabelaAPI() {
  mostrarLoader();

  const vendedor = document.getElementById("buscarVendedor").value;
  const dataRemessa = document.getElementById("select-data").value;
  const dataFormatada = dataRemessa ? dataRemessa.split("T")[0] : "";

  try {
    const res = await fetch(`${TAB_URL}/Programado?vendedor=${vendedor}&data=${dataFormatada}`);
    const data = await res.json();

    dadosGlobais = data.registros;
    vendedorGlobal = vendedor;

    await carregarTabelaAPIGeral(); 

    renderizarTabela(dadosGlobais);

    carregarDatasRemessa(vendedor);

    esconderLoader();

  } catch (erro) {
    console.error("Erro:", erro);
    esconderLoader();
  }
}

//Carregar tabela sem alterar a data
async function carregarTabelaAPIFiltrados() {
  mostrarLoader();

  const vendedor = document.getElementById("buscarVendedor").value;
  const dataRemessa = document.getElementById("select-data").value;
  const dataFormatada = dataRemessa ? dataRemessa.split("T")[0] : "";

  try {
    const res = await fetch(`${TAB_URL}/Programado?vendedor=${vendedor}&data=${dataFormatada}`);
    const data = await res.json();

    dadosGlobais = data.registros;
    vendedorGlobal = vendedor;

    renderizarTabela(dadosGlobais);

    esconderLoader();

  } catch (erro) {
    console.error("Erro:", erro);
    esconderLoader();
  }
}

/* document.getElementById("buscarVendedor").addEventListener("input", function () {

  const texto = this.value.toLowerCase();

  const filtrados = listaVendedores.filter(nome =>
    nome.toLowerCase().includes(texto)
  );

 filtrarVendedor(filtrados);
}); */

//renderizar a tabela na tela

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
    headerHTML += `<th>${col}</th>`;
  });

  head.innerHTML = headerHTML;

  // Linhas
let linhasHTML = "";

dados.forEach(item => {
  let linha = `<tr data-id="${item.id}">`;

  colunas.forEach(col => {
    let valor = item[col];

    if (ehData(valor)) {
      valor = formatarData(valor);
    } 
    else if (ehNumero(valor) && col.toLowerCase().includes("valor")) {
      valor = formatarMoeda(valor);
    }

    linha += `<td data-col="${col}">${valor ?? ""}</td>`;
  });

  linha += "</tr>";
  linhasHTML += linha;
});

body.innerHTML = linhasHTML;

   // Inicializa AnaliticTable após renderizar
    new AnaliticTable('tab');

}

function ehData(valor) {
  if (typeof valor !== "string") return false;

  const formatosValidos = [
    /^\d{2}\/\d{2}\/\d{4}$/,             // DD/MM/YYYY ou MM/DD/YYYY
    /^\d{4}-\d{2}-\d{2}$/,               // YYYY-MM-DD
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/, // ISO 8601 com timestamp
  ];

  const temFormato = formatosValidos.some(regex => regex.test(valor));
  if (!temFormato) return false;

  const data = new Date(valor);
  return !isNaN(data.getTime());
}

function ehNumero(valor) {
  return typeof valor === "number" || (!isNaN(valor) && valor !== "");
}
//conversor para moeda
function parseMoedaBR(valor) {
  if (!valor) return 0;

  return 
    valor
      .replace(/\./g, "")   // remove milhar
      .replace(",", ".");    // troca decimaL
}

//formatar em formato moeda
function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

/* //formatar a data
function formatarDataSAP(valor) {
  if (!valor) return "";

  const data = new Date(valor);

  if (isNaN(data)) return "Data inválida";

  return data.toLocaleDateString("pt-BR");
} */

//gerar o html para PDF
function gerarHTML(registros, vendedor) {

  const grupos = {};

  registros.forEach(item => {

    const dataOriginal = new Date(item['Data de Remessa']);
    const dataFormatada = formatarData(item['Data de Remessa']);
    const chave = `${item.Emissor}-${dataOriginal.toISOString()}`;
    console.log(chave);

    if (!grupos[chave]) {
      grupos[chave] = {
      emissor: item.Emissor,
      cliente: item.Cliente,
      data: dataOriginal,       // guarda como Date
      dataFormatada: dataFormatada, //só pra exibir
      pedidos: new Set(),
      total: 0
    };
    }

    grupos[chave].pedidos.add(item.Doc);
    grupos[chave].total += Number(item.Valor || 0);
  });

  let linhas = "";

  Object.values(grupos)
    .sort((a, b) => a.data - b.data)
    .forEach(g => {

      linhas += `
        <tr>
          <td>${g.emissor} - ${g.cliente}</td>
          <td>${[...g.pedidos].join(" - ")}</td>
          <td>${formatarMoeda(g.total)}</td>
          <td>${g.dataFormatada}</td>
        </tr>
      `;
    });

  const totalGeral = registros.reduce((acc, item) => {
    return acc + Number(item.Valor || 0);
  }, 0);

  return `
<html>
<head>
<meta charset='UTF-8'>
<style>
body { font-family: Arial; font-size: 12px; }

h1 {
  padding:6px;
  font-size:20px;
  font-weight: bold;
}

h2 {
  background:#f2f2f2;
  padding:6px;
  font-size:16px;
}

table {
  width:100%;
  border-collapse:collapse;
}

th, td {
  border:1px solid #000;
  padding:6px;
}

th {
  background:#e6e6e6;
}

.total-geral {
  display:flex;
  justify-content:flex-end;
  margin-top:20px;
}

.total-box {
  border:2px solid #333;
  padding:10px;
  font-weight:bold;
}
</style>
</head>

<body>

<h1>Relatório de Pedidos Programados</h1>
<h2>Vendedor: ${vendedor}</h2>
<h2>Atualização: ${new Date().toLocaleString("pt-BR")}</h2>

<table>
<thead>
<tr>
<th>Emissor</th>
<th>N° da Ordem</th>
<th>Valor Total</th>
<th>Data Remessa</th>
</tr>
</thead>

<tbody>
${linhas}
</tbody>

</table>

<div class="total-geral">
  <div class="total-box">
    Total Geral: ${formatarMoeda(totalGeral)}
  </div>
</div>

</body>
</html>
`;
}

//gerar o pdf para download
async function gerarPDF(htmlString) {

  const container = document.createElement("div");
  container.innerHTML = htmlString;

  // estilo de página A4
  container.style.width = "210mm";
  container.style.background = "#fff";
  container.style.padding = "10mm";

  document.body.appendChild(container);

  await new Promise(r => setTimeout(r, 300));

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });

  await pdf.html(container, {
    x: 0,
    y: 0,
    html2canvas: {
      scale: 0.25,
      useCORS: true
    },
    callback: function (pdf) {

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);

      // abre em nova aba (visualização PDF)
      window.open(url, "_blank");

      document.body.removeChild(container);
    }
  });
}

//baixar o pdf
async function baixarPDF() {

  if (!dadosGlobais.length) {
    alert("Nenhum dado carregado");
    return;
  }

  const html = gerarHTML(dadosGlobais, vendedorGlobal);

  await gerarPDF(html);
}


document.getElementById("carregarTab").addEventListener("click", carregarTabelaAPI);

document.getElementById("gerarPDF").addEventListener("click", baixarPDF);

document.getElementById("select-data").addEventListener("change", carregarTabelaAPIFiltrados);



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

