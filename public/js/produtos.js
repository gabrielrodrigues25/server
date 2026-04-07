async function carregarTabelaAPI() {
  mostrarLoader();

  const loja = document.getElementById("filtroLoja").value;
  const produto = document.getElementById("filtroProdutos").value;

  try {

    const res = await fetch(`${AUTH_URL}/Produtos?loja=${loja}&produto=${produto}`);

    const data = await res.json();

    renderizarTabela(data.registros);
    carregarProdutos();
    esconderLoader();

  } catch (erro) {

    console.error("Erro:", erro);
    esconderLoader();

  }

}

//carregar lista de lojas
async function carregarRedes(){
  try{

    const res = await fetch(`${AUTH_URL}/Lojas`);
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

    const res = await fetch(`${AUTH_URL}/Lojas`);
    const data = await res.json();
    const select = document.getElementById("filtroLoja");
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

  }catch(erro){
    console.error("Erro ao carregar lojas:", erro);
  }
}

document.querySelector("#filtroRede").addEventListener("change", function(){
  carregarLojas();
});

//carregar lista de produtos
async function carregarProdutos(){

  const loja = document.getElementById("filtroLoja").value;

  try{

    const res = await fetch(`${AUTH_URL}/Produtos?loja=${loja}`);
    const data = await res.json();
    const select = document.getElementById("filtroProdutos");

    select.innerHTML = "<option value=''>Todos os produtos</option>";
    
    data.registros.forEach(produto => {

      const option = document.createElement("option");
      option.value = produto.descricao;
      option.textContent = produto.descricao;
      select.appendChild(option);
    });
  }catch(erro){
    console.error("Erro ao carregar produtos:", erro);
  }
}

document.addEventListener("DOMContentLoaded", () => {

  carregarRedes();
  carregarLojas();

});

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

  // Cabeçalho com inputs de filtro
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
        return String(item[col] ?? "").toLowerCase().includes(valor.toLowerCase());
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
          <button class="btnEditar">Editar</button>
          <button class="btnDeletar">Excluir</button>
        </td>
      </tr>`;
      body.innerHTML += linha;
    });

    // Reatribuir eventos aos botões depois que a tabela é atualizada
    body.querySelectorAll(".btnEditar").forEach(btn => {
      btn.addEventListener("click", function () {
        editar(this);
      });
    });

    body.querySelectorAll(".btnDeletar").forEach(btn => {
      btn.addEventListener("click", function () {
        const id = this.closest("tr").dataset.id;
        deletar(id);
      });
    });
  }

  // Inicializa a tabela com todas as linhas
  atualizarLinhas();

  // Eventos para inputs de filtro
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

function filtrarTabela() {

  const filtro = document.getElementById("filtro").value.toLowerCase();
  const linhas = document.querySelectorAll("#tbody tr");

  linhas.forEach(linha => {

    const texto = linha.innerText.toLowerCase();

    linha.style.display = texto.includes(filtro) ? "" : "none";

  });

}

//editar 
function editar(botao){

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

  novoBotao.addEventListener("click", () => salvar(linha));

}

//enviar edição
async function salvar(linha){

  const id = linha.dataset.id;
  const inputs = linha.querySelectorAll("td[data-col] input");

  const dados = {};

  inputs.forEach(input => {

    const coluna = input.closest("td").dataset.col;
    dados[coluna] = input.value;

  });

  try {
  await fetch(`${AUTH_URL}/Produtos/${id}`,{
    method:"PUT",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify(dados)
  });
  await carregarTabelaAPI();
  mostrarMensagem("Produto atualizado com sucesso!", "sucesso");
  } catch (erro) {
    console.error("Erro ao atualizar produto:", erro);
    mostrarMensagem("Erro ao atualizar produto", "erro");
  }
  

}

//deletar
async function deletar(id){

  if(!confirm("Deseja realmente excluir este item?")) return;

  try {
    await fetch(`${AUTH_URL}/Produtos/${id}`,{
      method:"DELETE"
    });
    await carregarTabelaAPI();  
    mostrarMensagem("Produto excluído com sucesso!", "sucesso");
  } catch (erro) {
    console.error("Erro ao excluir produto:", erro);
    mostrarMensagem("Erro ao excluir produto", "erro");
  }

}

//criar 
function abrirNovo(){

 if(document.getElementById("formNovo").style.display === "none"){
 document.getElementById("formNovo").style.display = "block";
} else {
 document.getElementById("formNovo").style.display = "none";

}}

async function salvarNovo(){

 const dados = {

  loja: document.getElementById("loja").value,
  cliente: document.getElementById("cliente").value,
  codigo_parceiro: document.getElementById("codigo_parceiro").value,
  material: document.getElementById("material").value,
  ean: document.getElementById("ean").value,
  descricao: document.getElementById("descricao").value,
  un_med: document.getElementById("un_med").value,
  un: document.getElementById("un").value,
  qtd_cx: document.getElementById("qtd_cx").value,
  situacao: document.getElementById("situacao").value

 };

 try {
 await fetch(`${AUTH_URL}/Produtos`,{
  method:"POST",
  headers:{
   "Content-Type":"application/json"
  },
  body: JSON.stringify(dados)
 });

 await carregarTabelaAPI();
  mostrarMensagem("Produto criado com sucesso!", "sucesso");
} catch (erro) {
  mostrarMensagem("Erro ao criar produto", "erro");
  }
}

document.getElementById("carregarTab").addEventListener("click", carregarTabelaAPI);
document.getElementById("abrirNovo").addEventListener("click", abrirNovo);
document.getElementById("salvarNovo").addEventListener("click", salvarNovo);


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

