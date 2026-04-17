import AnaliticTable from "../../../js/AnaliticTable.js";

definirTodasDatasHoje();

//carregar lista de vendedores
let listaVendedores = [];

async function carregarVendedores() {
  try {
    const res = await fetch(`${AUTH_URL}/Vendedores`);
    const data = await res.json();

    // nomes únicos
    listaVendedores = [...new Set(
      data.Clientes.map(i => i.NmVendedor)
    )];

    renderizarVendedores(listaVendedores);

  } catch (erro) {
    console.error("Erro ao carregar vendedores:", erro);
  }
}

document.addEventListener("DOMContentLoaded", carregarVendedores);

// 🔹 apenas renderiza no datalist
function renderizarVendedores(lista) {
  const datalist = document.getElementById("lista-vendedor");

  datalist.innerHTML = lista
    .map(nome => `<option value="${nome}">`)
    .join("");
}

// 🔹 filtro enquanto digita
document.getElementById("buscarVendedor").addEventListener("input", (e) => {
  const texto = e.target.value.toLowerCase();

  const filtrados = listaVendedores.filter(nome =>
    nome?.toLowerCase().includes(texto)
  );

  renderizarVendedores(filtrados);
});

let dadosGlobais = [];
let vendedorGlobal = "";

//carregar a tabela de pedidos programados

async function carregarTabelaAPI() {
  mostrarLoader();

  const vendedor = document.getElementById("buscarVendedor").value;

  try {
    const res = await fetch(`${AUTH_URL}/Programado?vendedor=${vendedor}`);
    const data = await res.json();

    dadosGlobais = data.registros;   // guarda os dados
    vendedorGlobal = vendedor;

    renderizarTabela(data.registros);

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
    headerHTML += `<th>${col.toUpperCase()}</th>`;
  });

  head.innerHTML = headerHTML;

  // Linhas
  dados.forEach(item => {
    let linha = `<tr data-id="${item.id}">`;

    colunas.forEach(col => {
      let valor = item[col];

    // Detecta e formata
    if (ehData(valor)) {
    valor = formatarData(valor);
    } 
    else if (ehNumero(valor) && col.toLowerCase().includes("valor")) {
      valor = formatarMoeda(valor);
    }

      linha += `<td data-col="${col}">${valor ?? ""}</td>`;
    });

    body.innerHTML += linha;
  });

   // Inicializa AnaliticTable após renderizar
    new AnaliticTable('tab');

}

function ehData(valor) {
  return typeof valor === "string" && !isNaN(Date.parse(valor));
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

    const dataOriginal = new Date(item['DATA DE REMESSA']);
    const dataFormatada = formatarData(item['DATA DE REMESSA']);
    const chave = `${item.EMISSOR}-${dataOriginal.toISOString()}`;
    console.log(chave);

    if (!grupos[chave]) {
      grupos[chave] = {
      emissor: item.EMISSOR,
      cliente: item.CLIENTE,
      data: dataOriginal,       // 👈 guarda como Date
      dataFormatada: dataFormatada, // 👈 só pra exibir
      pedidos: new Set(),
      total: 0
    };
    }

    grupos[chave].pedidos.add(item.DOC);
    grupos[chave].total += Number(item.VALOR || 0);
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
    return acc + Number(item.VALOR || 0);
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

