import AnaliticTable from "../../../js/AnaliticTable.js";
import TabelaAPI from "../../../js/classes.js"

definirTodasDatasHoje();

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

let listaLojas = [];
//carregar lista de lojas
async function carregarLojas(){
  try{
    const res = await fetch(`${TAB_URL}/Lojas`);
    const data = await res.json();

    listaLojas = data.registros; // salva tudo aqui

    const select = document.getElementById("filtroLoja");
    const selectRede = document.getElementById("filtroRede");

    select.innerHTML = '<option value="">Todas as lojas</option>';

    const lojasFiltradas = listaLojas
      .filter(i => i.rede === selectRede.value);

    lojasFiltradas.forEach(item => {
      const option = document.createElement("option");
      option.value = item.loja;
      option.textContent = item.loja;
      select.appendChild(option);
    });

  }catch(erro){
    console.error("Erro ao carregar lojas:", erro);
  }
}

async function carregarTabelaCompleta() {
  mostrarLoader();

  const lojaSelecionada = document.getElementById("filtroLoja").value;
  const dataFiltro = document.getElementById("filtroData").value;
  const dataFiltroEntrega = document.getElementById("filtroDataEntrega").value;
  const periodo = document.getElementById("periodo").value;
  const tipo = document.getElementById("tipo").value;

  const lojaObj = listaLojas.find(l => l.loja == lojaSelecionada);
  const cliente = lojaObj?.cliente || "";

  try {

    const [prodRes, estoqueRes, progRes, fatRes, sellRes, gradeRes, planoRes, sellCenter] = await Promise.all([
      fetch(`${TAB_URL}/Produtos?cliente=${cliente}`),
      fetch(`${TAB_URL}/Pedidos?loja=${lojaSelecionada}&data=${dataFiltro}`),
      fetch(`${TAB_URL}/VendasProgramadas?cliente=${cliente}`),
      fetch(`${TAB_URL}/VendasFaturadas?cliente=${cliente}`),
      fetch(`${TAB_URL}/SelloutResumo?cliente=${cliente}&periodo=${periodo}&tipo=${tipo}`),
      fetch(`${TAB_URL}/Grade?cliente=${cliente}`),
      fetch(`${TAB_URL}/Planograma?cliente=${cliente}`),
      fetch(`${TAB_URL}/SelloutCenterBox?cliente=${Number(cliente)}`)
    ]);

    const produtos = (await prodRes.json()).produtos || [];
    const estoque = (await estoqueRes.json()).registros || [];
    const programado = (await progRes.json()).registros || [];
    const faturado = (await fatRes.json()).Relatorio || [];
    const selloutGeral = await sellRes.json();
    const grade = (await gradeRes.json()).registros || [];
    const planograma = (await planoRes.json()).registros || [];
    const selloutCenterbox = await sellCenter.json();

    const isCenterbox = lojaObj?.rede === "Centerbox Supermercados Ltda";

    const sellout = isCenterbox ? selloutCenterbox : selloutGeral

    console.log(sellout);

    // MAPA CONVERSÃO
    const mapaConversao = {};
    produtos.forEach(prod => {
      const codigo = String(prod.material || prod.codigo).trim();
      mapaConversao[codigo] = {
        peso: Number(prod.un || prod.UN_MED || 1)
      };
    });

    // FILTRO FATURADO
    const faturadoFiltrado = faturado.filter(item =>
      new Date(item.DATA_ENTREGA_MERC).toISOString().split("T")[0] === dataFiltro
    );

    // NORMALIZAÇÃO
    const estoqueNormalizado = estoque.map(item => ({
      produto: String(item.material).trim(),
      quantidade: Number(item.estoque || 0)
    }));

    const programadoNormalizado = programado.map(item => {
      const codigo = String(item.Material).trim();
      const peso = mapaConversao[codigo]?.peso || 1;

      return {
        produto: codigo,
        quantidade: Math.round(Number(item.Quantidade || 0) / peso)
      };
    });

    const faturadoNormalizado = faturadoFiltrado.map(item => {
      const codigo = String(item.MATERIAL).trim();
      const peso = mapaConversao[codigo]?.peso || 1;

      return {
        produto: codigo,
        quantidade: Math.round(Number(item.QUANTIDADE || 0) / peso)
      };
    });

    function agrupar(lista) {
      const mapa = {};
      lista.forEach(item => {
        if (!mapa[item.produto]) mapa[item.produto] = 0;
        mapa[item.produto] += item.quantidade;
      });
      return mapa;
    }

    const mapaEstoque = agrupar(estoqueNormalizado);
    const mapaProgramado = agrupar(programadoNormalizado);
    const mapaFaturado = agrupar(faturadoNormalizado);

    // SELLOUT
    const mapaSellout = {};
    sellout.forEach(item => {
      const codigo = String(item.produto).trim();
      mapaSellout[codigo] = item;
    });

    console.log(mapaSellout)

    // PLANOGRAMA
    const mapaPlano = {};
    planograma.forEach(item => {
      const key = `${item.cliente}_${item.material}`;
      mapaPlano[key] = Number(item.qtd || 0);
    });

    // GRADE
    const mapaGrade = {};
    grade.forEach(item => {
      const key = `${item.cliente}_${item.diaPedido}_${item.diaEntrega}`;
      mapaGrade[key] = Number(item.dias || 0);
    });

    function getDias(cliente, dataPedido, dataEntrega) {
      const key = `${cliente}_${dataPedido.getDay()}_${dataEntrega.getDay()}`;
      return mapaGrade[key] || 0;
    }

    window.parseDataLocal = function(dataStr) {
      const [ano, mes, dia] = dataStr.split("-");
      return new Date(ano, mes - 1, dia);
    }

    window.faturadoGlobal = faturado.map(item => ({
      produto: String(item.MATERIAL).trim(),
      data: item.DATA_ENTREGA_MERC,
      qtd: Math.round(Number(item.QUANTIDADE || 0))
    }));

    window.programadoGlobal = programado.map(item => ({
      produto: String(item.Material).trim(),
      data: item.Data || item.DATA || item.data || item["Data de Remessa"], // depende do seu campo
      qtd: Math.round(Number(item.Quantidade || 0))
    }));

    // RESULTADO FINAL
    const resultado = produtos.map(prod => {

      const codigo = String(prod.material || prod.codigo).trim();

      const dataPedido = parseDataLocal(dataFiltro);
      const dataEntrega = parseDataLocal(dataFiltroEntrega);

      let dias = getDias(cliente, dataPedido, dataEntrega);

      if (dataEntrega.getDate() <= 10 || dataPedido.getMonth() !== dataEntrega.getMonth()) {
        dias++;
      }

      const estoqueQtd = mapaEstoque[codigo] || 0;
      const programadoQtd = mapaProgramado[codigo] || 0;
      const faturadoQtd = mapaFaturado[codigo] || 0;

      const planoQtd = mapaPlano[`${cliente}_${codigo}`] || 0;

      const sell = mapaSellout[codigo] || {};

      let sellMedia = 0;

      if (tipo === "primeiros") {
        sellMedia = Math.round((sell.primeiros15 || 0) / 15);
      } else if (tipo === "ultimos") {
        sellMedia = Math.round((sell.ultimos15 || 0) / 15);
      } else if (tipo === "media") {
        sellMedia = Math.round(sell.media || 0);
      }

      const unid = Number(prod.un || 1) || 1;
      const umCX = Number(prod.qtd_cx || 1) || 1;
      
      // venda vem em KG → converter para UN antes
      const vendaPeriodo = Math.round((sellMedia * (dias || 1)) / unid);

      const faturadoConv = Math.round(faturadoQtd);
      const programadoConv = Math.round(programadoQtd);

      const estoqueProjetado =
        estoqueQtd + faturadoConv + programadoConv;

      const necessidade = vendaPeriodo - estoqueProjetado;

      let disparo = 0;

      if (necessidade < planoQtd) {
        disparo = Math.ceil((planoQtd + necessidade) / umCX);
      } else {
        disparo = Math.ceil(necessidade / umCX);
      }

      disparo = Math.max(disparo, 0);


      // MEMÓRIA DE CÁLCULO

      const memoria = [];

      memoria.push(`Venda prevista: ${Math.round(sellMedia / unid)}  x ${dias} dias = ${vendaPeriodo}`);

      memoria.push(`Estoque atual: ${estoqueQtd}`);
      memoria.push(`+ Faturado: ${faturadoConv}`);
      memoria.push(`+ Programado: ${programadoConv}`);
      memoria.push(`= Estoque projetado: ${estoqueProjetado}`);

      memoria.push(`Demanda - Estoque: ${vendaPeriodo} - ${estoqueProjetado} = ${necessidade}`);

      memoria.push(`Plano mínimo: ${planoQtd}`);

      if (necessidade < planoQtd) {
        memoria.push(`Necessidade abaixo do plano → força reposição`);
        memoria.push(`(${planoQtd} + ${necessidade}) / ${umCX}`);
      } else {
        memoria.push(`Reposição normal`);
        memoria.push(`${necessidade} / ${umCX}`);
      }

      memoria.push(`Disparo final: ${disparo} CX`);

      return {
        produto: codigo,
        descricao: prod.descricao,

        estoque: estoqueQtd,
        programado: programadoQtd,
        faturado: faturadoQtd,

        total: estoqueProjetado,

        planograma: planoQtd,

        media_dia: Math.round(sellMedia / unid), // KG → UN/dia
        venda: vendaPeriodo, // já está convertido

        disparo: disparo,

        /* memoria_calculo: memoria.join(" | "), */
        unid: unid,
        unidCX: umCX
      };
    });

    renderizarTabela(resultado);

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

  // remove apenas id (se existir)
  const colunas = Object.keys(dados[0]).filter(c => c !== "id");

  // CABEÇALHO
  let headerHTML = "<tr>";

  colunas.forEach(col => {
    headerHTML += `<th>${col}</th>`;
  });

  headerHTML += `<th>Caixas</th>`;
  headerHTML += `<th>Previsão</th>`;
  headerHTML += `</tr>`;

  head.innerHTML = headerHTML;

  // LINHAS
  let linhasHTML = "";

  dados.forEach(item => {

    // garante que produto existe
    const produto = item.produto;
    const descricao = item.descricao;

    let linha = `<tr data-produto="${produto}">`;

    colunas.forEach(col => {
      linha += `<td data-col="${col}">${item[col] ?? ""}</td>`;
    });

    // INPUT
    linha += `
      <td>
        <input 
          type="number"
          id="cx_${produto}"
          value="0"
          style="width:70px"
          oninput="gerarPrevisao(
            '${produto}',
            '${descricao}',
            ${Number(item.media_dia) || 0},
            ${Number(item.estoque) || 0},
            ${Number(item.unid) || 0},
            ${Number(item.unidCX) || 0}
          )"
        >
      </td>
    `;

    // RESULTADO
    linha += `<td id="prev_${produto}">-</td>`;

    linha += `</tr>`;

    linhasHTML += linha;
  });

  body.innerHTML = linhasHTML;
}

let produtoSelecionado = null;
let descricaoSelecionada = null;

// CALCULAR PREVISÃO
function calcularPrevisao({
  dias = 7,
  dataInicio,
  vendaDia = 0,
  estoqueInicial = 0,
  faturadoLista = [],
  programadoLista = [],
  entradaData,
  entradaQtdCX = 0,
  unidCX = 1,
  unid = 1
}) {

  const resultado = [];
  let estoqueAtual = Number(estoqueInicial) || 0;

  const un = Number(unid) || 1;

  function normalizarData(d) {
    if (!d) return null;
    return new Date(d).toISOString().split("T")[0];
  }

  const dataInicioNorm = normalizarData(dataInicio);
  const entradaDataNorm = normalizarData(entradaData);

  for (let i = 0; i < dias; i++) {

    const data = new Date(dataInicioNorm);
    data.setDate(data.getDate() + i);

    const dataStr = normalizarData(data);

    // ENTRADA MANUAL
    const entradaManual =
      entradaDataNorm === dataStr
        ? Math.round((Number(entradaQtdCX) || 0) * (Number(unidCX) || 1))
        : 0;

    // FATURADO
    const faturadoDia = faturadoLista
      .filter(f => normalizarData(f.data) === dataStr)
      .reduce((soma, f) => soma + Math.round((Number(f.qtd) || 0) / un), 0);

    // PROGRAMADO
    const programadoDia = programadoLista
      .filter(p => normalizarData(p.data) === dataStr)
      .reduce((soma, p) => soma + Math.round((Number(p.qtd) || 0) / un), 0);

    const venda = Number(vendaDia) || 0;

    const totalDia =
      estoqueAtual +
      entradaManual +
      faturadoDia +
      programadoDia;

    const vendaAplicada = Math.min(totalDia, venda);

    estoqueAtual = Math.max(totalDia - vendaAplicada, 0);

    resultado.push({
      data: dataStr,
      diaSemana: data.toLocaleDateString("pt-BR", { weekday: "short" }),

      entrada: entradaManual,
      faturado: faturadoDia,
      programado: programadoDia,

      total: Math.round(totalDia),
      venda: venda,
      estoque: Math.round(estoqueAtual)
    });
  }

  return resultado;
}

// GERAR PREVISÃO (POR PRODUTO)
window.gerarPrevisao = function (produto,descricao, venda, estoque, unid, unidCX) {

  const input = document.getElementById(`cx_${produto}`);
  if (!input) return;

  const caixas = Number(input.value) || 0;

  const dataEntrada = parseDataLocal(document.getElementById("filtroDataEntrega")?.value);
  const dataInicio = parseDataLocal(document.getElementById("filtroData")?.value);

  const previsao = calcularPrevisao({
    dataInicio,
    vendaDia: venda,
    estoqueInicial: estoque,

    faturadoLista: faturadoGlobal?.filter(f => f.produto == produto) || [],
    programadoLista: programadoGlobal?.filter(p => p.produto == produto) || [],

    entradaData: dataEntrada,
    entradaQtdCX: caixas,
    unidCX,
    unid
  });

  // ATUALIZA LINHA
  window.renderPrevisao(produto, previsao);

  // ATUALIZA PAINEL
  renderPrevisaoPainel(produto, descricao, previsao);
};

// RENDER NA TABELA
window.renderPrevisao = function (produto, dados) {

  const td = document.getElementById(`prev_${produto}`);
  if (!td) return;

  if (!dados || !Array.isArray(dados) || dados.length === 0) {
    td.innerHTML = "-";
    td.style.color = "black";
    return;
  }

  const ultimo = dados[dados.length - 1];
  const estoqueFinal = Number(ultimo?.estoque ?? 0);

  td.innerHTML = `<b>${estoqueFinal}</b>`;

  if (estoqueFinal <= 0) {
    td.style.color = "red";
  } else if (estoqueFinal < 20) {
    td.style.color = "orange";
  } else {
    td.style.color = "green";
  }
};

function formatarDataBR(data) {
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

// RENDER NO PAINEL
function renderPrevisaoPainel(produto, descricao, dados) {

  const painel = document.getElementById("painelPrevisao");
  if (!painel) return;

  // proteção total
  if (!Array.isArray(dados) || dados.length === 0) {
    painel.innerHTML = "Sem previsão";
    return;
  }

  console.log(dados);

  let headerDatas = "";
  let linhaValores = "";
  let previsaoValores = "";

  dados.forEach(d => {

    headerDatas += `<th>${d.diaSemana} - ${formatarDataBR(d.data)}</th>`;

    const cor = d.estoque <= 0 ? "red" : "green";

    linhaValores += `
      <td style="color:${cor}; font-weight:bold;">
        ${d.estoque}
        ${d.entrada > 0 ? `<div style="font-size:11px">Pedido: ${d.entrada}</div>` : ""}
      </td>
    `;

     const cobertura = d.venda > 0 
      ? (d.estoque / d.venda) 
      : 0;

    const coberturaFormatada = cobertura.toFixed(1);

    previsaoValores += `
      <td style="color:${cor}; font-weight:bold;">
        ${coberturaFormatada}d
      </td>
    `;
  });

  painel.innerHTML = `
    <div style="overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.2);">
      
      <div style="background: #e58f2c; color:white; padding:10px; font-weight:bold; text-align:center;">
        Previsão de Estoque - ${descricao}
      </div>

      <table style="width:100%; border-collapse:collapse; text-align:center;">
        
        <tr style="background:#ddd;">
          <th style="background: #e58f2c; color:white;">Data</th>
          ${headerDatas}
        </tr>

        <tr>
          <th style="background: #e58f2c; color:white;">Previsto</th>
          ${linhaValores}
        </tr>

        <tr>
          <th style="background: #e58f2c; color:white;">Previsão Dia</th>
          ${previsaoValores}
        </tr>

      </table>
    </div>
  `;
}

/* function agruparDados(estoque, programado, faturado) {

  const mapa = {};

  function normalizarData(data) {
    return new Date(data).toISOString().split("T")[0];
  }

  function getKey(loja, data, produto) {
    return `${loja}_${normalizarData(data)}_${produto}`;
  }

  // ESTOQUE (CONTADO)
  estoque.forEach(item => {
    const key = getKey(item.loja, item.data, item.produto);

    if (!mapa[key]) {
      mapa[key] = {
        loja: item.loja,
        data: normalizarData(item.data),
        produto: item.produto,
        descricao: item.descricao || "",
        contado: 0,
        programado: 0,
        faturado: 0
      };
    }

    mapa[key].contado += Number(item.quantidade || 0);
  });

  // PROGRAMADO
  programado.forEach(item => {
    const key = getKey(item.loja, item.data, item.produto);

    if (!mapa[key]) {
      mapa[key] = {
        loja: item.loja,
        data: normalizarData(item.data),
        produto: item.produto,
        descricao: item.produto,
        contado: 0,
        programado: 0,
        faturado: 0
      };
    }

    mapa[key].programado += Number(item.quantidade || 0);
  });

  // FATURADO (CORRIGIDO)
  faturado.forEach(item => {
    const key = getKey(item.loja, item.data, item.produto); // ✅ corrigido

    if (!mapa[key]) {
      mapa[key] = {
        loja: item.loja,
        data: normalizarData(item.data),
        produto: item.produto,
        descricao: item.descricao,
        contado: 0,
        programado: 0,
        faturado: 0
      };
    }

    mapa[key].faturado += Number(item.quantidade || 0); // ✅ corrigido
  });

  return Object.values(mapa);
}
 */

document.querySelector("#filtroRede").addEventListener("change", function(){
  carregarLojas();
});

document.addEventListener("DOMContentLoaded", () => {

  carregarRedes();
  carregarLojas();

});

//editar 
/* function editarRegistro(botao){

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
} */

document.getElementById("carregarTab").addEventListener("click", carregarTabelaCompleta);


