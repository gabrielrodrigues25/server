import express from "express";
import { getListItems, updateListItem, createListItem, deleteListItem } from "../services/sharepointService.js";
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


export default router;