import express from "express";
import { getListItems, updateListItem, createListItem, deleteListItem, AllGetListItems } from "../services/sharepointService.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

//lista de lojas
router.get("/Lojas", async (req, res) => {
 try {

    const { loja, rede } = req.query;

    const itens = await getListItems("dClientes");

    let itensFiltrados = itens;

    if (loja) {
      itensFiltrados = itensFiltrados.filter(i => i.field_2 == loja);
    }

    if (rede) {
      itensFiltrados = itensFiltrados.filter(i => i.field_1 == rede);
    }

    const registros = itensFiltrados.map(item => ({
      rede: item.field_1,
      loja: item.field_2,
      cliente: item.Title,
      promotor: item.Promotor == null ? "Sem promotor" : item.Promotor,
      login: item.field_9 == null ? 0 : item.field_9,
      situacao: item.Situa_x00e7__x00e3_o == "Ativa" ? "Ativa" : "Inativa",
      disparo: item.Disparo == null ? "Sem disparo" : item.Disparo,
      id: item.id == null ? 0 : item.id

    }));

    res.json({ registros });

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: err.message });

  }

});

//LISTA DE PRODUTOS - GET, POST, PUT, DELETE

router.get("/Produtos", async (req, res) => {

  try {

    const { loja, produto, rede } = req.query;

    const itens = await getListItems("dProdutosA");

    let itensFiltrados = itens;

    if (loja) {
      itensFiltrados = itensFiltrados.filter(i => i.field_1 == loja);
    }

    if (rede) {
      itensFiltrados = itensFiltrados.filter(i => i.field_1 == rede);
    }

    if (produto) {
      itensFiltrados = itensFiltrados.filter(i => i.field_6 == produto);
    }
    
    const registros = itensFiltrados.map(item => ({
      loja: item.field_1,
      cliente: item.field_2,
      codigo_parceiro: item.field_3 == null ? 0 : item.field_3,
      material: item.field_4,
      ean: item.field_5,
      descricao: item.field_6,
      un_med: item.field_7,
      un: item.field_8,
      qtd_cx: item.field_9,
      situacao: item.field_10,
      id: item.id == null ? 0 : item.id
    }));

    res.json({ registros });

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: err.message });

  }

});

router.post("/Produtos", async (req, res) => {

  try {

    const dados = req.body;

    const novoItem = {
      field_1: dados.loja,
      field_2: dados.cliente,
      field_3: dados.codigo_parceiro,
      field_4: dados.material,
      field_5: dados.ean,
      field_6: dados.descricao,
      field_7: dados.un,
      field_8: dados.un_med,
      field_9: dados.qtd_cx,
      field_10: dados.situacao
    };

    const item = await createListItem("dProdutosA", novoItem);

    res.json({ sucesso:true, item });

  } catch (err) {

    console.error("Erro criar item:", err);

    res.status(500).json({ error: err.message });

  }

});

//atualizar 
router.put("/Produtos/:id", async (req, res) => {

  try {

    const id = req.params.id;
    const dados = req.body;

    const update = {
      field_1: dados.loja,
      field_2: dados.cliente,
      field_3: dados.codigo_parceiro,
      field_4: dados.material,
      field_5: dados.ean,
      field_6: dados.descricao,
      field_7: dados.un_med,
      field_8: dados.un,
      field_9: dados.qtd_cx,
      field_10: dados.situacao
    };

    await updateListItem("dProdutosA", id, update);

    res.json({ sucesso: true });

  } catch (err) {

    console.error("Erro update:", err);

    res.status(500).json({ error: err.message });

  }

});

//deletar 
router.delete("/Produtos/:id", async (req, res) => {

  try {

    const id = req.params.id;

    await deleteListItem("dProdutosA", id);

    res.json({ sucesso:true });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

//LISTA DE LOJAS - GET, POST, PUT, DELETE

router.post("/Lojas", async (req, res) => {

  try {

    const dados = req.body;

    const novoItem = {
      field_1: dados.rede,
      field_2: dados.loja,
      Promotor: dados.promotor,
      Title: dados.cliente,
      field_9: dados.login,
      Situa_x00e7__x00e3_o: dados.situacao,
      Disparo: dados.disparo,
    };

    const item = await createListItem("dClientes", novoItem);

    res.json({ sucesso:true, item });

  } catch (err) {

    console.error("Erro criar item:", err);

    res.status(500).json({ error: err.message });

  }

});

//atualizar 
router.put("/Lojas/:id", async (req, res) => {

  try {

    const id = req.params.id;
    const dados = req.body;

    const update = {
      field_1: dados.rede,
      field_2: dados.loja,
      Title: dados.cliente,
      Promotor: dados.promotor,
      field_9: dados.login,
      Situa_x00e7__x00e3_o: dados.situacao,
      Disparo: dados.disparo
    };

    await updateListItem("dClientes", id, update);

    res.json({ sucesso: true });

  } catch (err) {

    console.error("Erro update:", err);

    res.status(500).json({ error: err.message });

  }

});

//deletar 
router.delete("/Lojas/:id", async (req, res) => {

  try {

    const id = req.params.id;

    await deleteListItem("dClientes", id);

    res.json({ sucesso:true });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

//Mapeamento de horários - GET

router.get("/Mapeamento", async (req, res) => {

  try {

    const rede = req.query.rede;
    const data = req.query.data;


    const filtro = `&$filter=${encodeURIComponent(
      `fields/Rede eq '${rede}' and fields/Data eq '${data}'`
    )}`;

    const itens = await AllGetListItems("8124c393-ca24-42e1-96ff-1aaa7d789f7f", filtro);

    const registros = itens.map(item => {

  const f = item.fields;

  const datadia = f.Data ? new Date(f.Data).toISOString().split("T")[0] : null;
  const [ano, mes, dia] = datadia.split("-");
  const data = `${dia}/${mes}/${ano}`;

  const entrada = f.Entrada
    ? new Date(f.Entrada).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "Sem entrada";

  const saida = f.Saida0
    ? new Date(f.Saida0).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "Sem saída";

  return {
    rede: f.Rede,
    loja: f.Loja,
    data: data,
    cliente: f.Cliente,
    matricula: f.Matricula == null ? 0 : f.Matricula,
    usuario: f.Usu_x00e1_rio == null ? 0 : f.Usu_x00e1_rio,
    entrada: entrada,
    saida: saida,
    duracao: f.Dura_x00e7__x00e3_o == null ? "Sem duração" : f.Dura_x00e7__x00e3_o,
    id: f.id == null ? 0 : f.id
  };

});
    res.json({ registros });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message
    });

  }

});

//GET - RELATÓRIO DE CONTAGENS - PEDIDO VENDEDOR

// BUSCAR ITENS DA LISTA PEDIDOS  
router.get("/Pedidos",  async (req, res) => {
  try {
    const loja = req.query.loja;
    const data = req.query.data;

    console.log(loja, data);

    const filtro = `&$filter=${encodeURIComponent(
      `fields/Loja eq '${loja}' and fields/Data eq '${data}'`
    )}`;

    const itens = await AllGetListItems("Pedido - Vendedor", filtro);

    const registros = itens.map(item => {

      const f = item.fields;

      return {
        id: item.id,
        rede: f.title,
        cliente: f.field_1,
        loja: f.Loja,
        data: f.Data,
        material: f.Produto,
        codigo_parceiro: f.C_x00f3_digo_x0020_Cliente,
        ean: f.EAN,
        descricao: f.Descri_x00e7__x00e3_o,
        custo: f.Custo,
        estoque: f.Estoque_x0020_Fisico,
        pedido: f.Pr_x00f3_ximo_x0020_Pedido,
        total: f.Estoque_x0020_total,
        venda: f.VendaM_x00e9_dia,
        planograma: f.Planograma,
        disparo: f.Quantidade_x0020_do_x0020_dispar,
        disparo_cx: f.Disparo_x0020_CX,
        pedido_cx: f.Pedido_x0020_CX,
        sugestao: f.Sugest_x00e3_o_x0020_Promotor,
        status: f.STATUS,
        data_pedido: f.DataPedido,
        preco: f.Pre_x00e7_o,
        lista: f.lista,
        situacao: f.Situa_x00e7__x00e3_oRebaixa
      };

    });

    res.json({ registros });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message
    });

  }

});

export default router;