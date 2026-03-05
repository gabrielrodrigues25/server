import express from "express";
import { pool1, pool2, poolConnect1, poolConnect2 } from "../auth/banco.js";
import { getListItems, createListItem, deleteListItem } from "../services/sharepointService.js";

const router = express.Router();

// Rotas protegidas

router.get("/teste", (req, res) => {
  res.json({ teste: true, usuario: req.user.username });
});

/*-----BANCO DE DADOS-----*/

//TABELA DE MATERIAS

router.get("/dMateriais", async (req, res) => {
  try {

    await poolConnect2;

    const result = await pool2.request()
      .query(`SELECT
    CAST(MATERIAL AS INT) AS N_Material,
    TRIM(DescMaterial) AS Desc_Material,
    HIERARQUIA AS Hierarquia,
    TRIM(DescHierarquia) AS Desc_Hierarquia,
    EAN,
    KG_EMBALAGEM,
    Gramas,
    UM AS TIPO_EMBALAGEM,
    CONCAT(TRIM(DescMaterial), ' - ', CAST(MATERIAL AS INT)) AS Nome_SKU,
    CONCAT(EAN,'.',CAST(MATERIAL AS INT)) AS Chave_EAN_MATERIAL
    FROM dbo.POLE_FATO_MATERIAIS
    WHERE 
    CAST(MATERIAL AS INT) BETWEEN 300000 AND 499999
	    AND TRIM(DescHierarquia) NOT LIKE '%não%'
      AND TRIM(DescHierarquia) NOT LIKE ''
      AND TRIM(DescMaterial) NOT LIKE '%não%'
      AND TRIM(DescMaterial) NOT LIKE '%VFUN%'
      AND TRIM(DescMaterial) NOT LIKE '%nao%'	
      AND TRIM(EAN) NOT LIKE ''`);

    console.log("Linhas:", result.recordset.length);

    res.json(result.recordset);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }
});

//TABELA DE MATERIAS

router.get("/Hierarquia", async (req, res) => {
  try {

    await poolConnect2;

    const result = await pool2.request()
      .query(`SELECT * FROM (
            SELECT 
                A.HIERARQUIA,
                A.HIERARQUIA_PRODUTOS,
                A.NIVEL_1,
                A.NIVEL_2,
                CASE 
                    WHEN B.HIERARQUIA_PRODUTOS = 'Prod Terceiros' THEN 'Revenda'
                    ELSE B.HIERARQUIA_PRODUTOS 
                END AS CATEGORIA,
                CASE
                    WHEN B.HIERARQUIA_PRODUTOS = C.HIERARQUIA_PRODUTOS THEN ''
                    ELSE C.HIERARQUIA_PRODUTOS
                END AS LINHA,
                CASE
                    WHEN LEN(A.HIERARQUIA) = 18 THEN A.HIERARQUIA_PRODUTOS
                    ELSE ''
                END AS GRUPO,
                CASE 
                    WHEN B.HIERARQUIA_PRODUTOS = 'Aves Resfriadas' OR B.HIERARQUIA_PRODUTOS = 'Aves Congeladas' OR B.HIERARQUIA_PRODUTOS = 'Galeto/Carcaça' THEN 'Aves'
                    WHEN B.HIERARQUIA_PRODUTOS = 'Prod Terceiros' THEN 'Revenda'
                    ELSE B.HIERARQUIA_PRODUTOS 
                END AS CATEGORIA_DRE
                
            FROM (
                SELECT 
                    A.HIERARQUIA,
                    A.HIERARQUIA_PRODUTOS,
                    TRIM(LEFT(A.HIERARQUIA, 8)) AS NIVEL_1,
                    TRIM(LEFT(A.HIERARQUIA, 12)) AS NIVEL_2
                FROM POLE_FATO_HIERARQUIA A
                WHERE 
                    (A.HIERARQUIA LIKE '0008%' OR A.HIERARQUIA LIKE '0012%')
                    AND A.HIERARQUIA_PRODUTOS NOT LIKE '%(Não Usar)'
                    AND A.HIERARQUIA_PRODUTOS NOT LIKE '%(Nfão Usar)'
                    AND A.HIERARQUIA_PRODUTOS NOT LIKE 'Não Usar%'
                    AND A.HIERARQUIA_PRODUTOS NOT LIKE '%Produtos Acabados%'
                    AND A.HIERARQUIA_PRODUTOS NOT LIKE '%NÃO USAR%'
            ) AS A
            LEFT JOIN POLE_FATO_HIERARQUIA B ON A.NIVEL_1 = B.HIERARQUIA
            LEFT JOIN POLE_FATO_HIERARQUIA C ON A.NIVEL_2 = C.HIERARQUIA
        ) AS C
        WHERE C.LINHA NOT LIKE '%(Não usar)'
        AND LEN(C.HIERARQUIA) = 18`);

    console.log("Linhas:", result.recordset.length);

    res.json(result.recordset);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }
});

  //VENDAS FATURADAS - TABELA dbo.Pole_VW_VendaFaturada

router.get('/VendasFaturadas', async (req, res) => {
  const cliente = req.query.cliente;
  console.log("Cliente no backend:", cliente);
  
  try {
    await poolConnect2;

    const result = await pool2.request()
      .input('cliente', cliente)
      .query(`
        SELECT TOP 1000
            V.*,
            H.CATEGORIA
        FROM dbo.Pole_VW_VendaFaturada V

        LEFT JOIN dbo.POLE_FATO_MATERIAIS M
            ON CAST(V.N_MATERIAL AS INT) = CAST(M.MATERIAL AS INT)

        LEFT JOIN (
            SELECT * FROM (
                SELECT 
                    A.HIERARQUIA,
                    CASE 
                        WHEN B.HIERARQUIA_PRODUTOS = 'Prod Terceiros' THEN 'Revenda'
                        ELSE B.HIERARQUIA_PRODUTOS 
                    END AS CATEGORIA
                FROM (
                    SELECT 
                        HIERARQUIA,
                        TRIM(LEFT(HIERARQUIA,8)) AS NIVEL_1
                    FROM POLE_FATO_HIERARQUIA
                ) A
                LEFT JOIN POLE_FATO_HIERARQUIA B 
                    ON A.NIVEL_1 = B.HIERARQUIA
            ) H
        ) H
            ON M.HIERARQUIA = H.HIERARQUIA

        WHERE V.EMISSOR_DA_ORDEM = CAST(@cliente AS INT) 
        AND V.DT_DOC_FATURAMENTO >= DATEADD(MONTH, -1, GETDATE())
        ORDER BY V.DT_DOC_FATURAMENTO ASC
      `);

    console.log("Linhas:", result.recordset.length);

    res.json({ Relatorio: result.recordset });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Erro ao buscar relatório',
      error: err.message
    });

  }
});

  //LISTA DE CATEGORIAS

  router.get("/Categorias", async (req, res) => {
  try {

    await poolConnect2;

    const result = await pool2.request()
      .query(`
        SELECT DISTINCT
            CASE 
                WHEN B.HIERARQUIA_PRODUTOS = 'Prod Terceiros' THEN 'Revenda'
                ELSE B.HIERARQUIA_PRODUTOS
            END AS CATEGORIA
        FROM (
            SELECT 
                TRIM(LEFT(A.HIERARQUIA,8)) AS NIVEL_1
            FROM POLE_FATO_HIERARQUIA A
            WHERE 
                (A.HIERARQUIA LIKE '0008%' OR A.HIERARQUIA LIKE '0012%')
        ) A
        LEFT JOIN POLE_FATO_HIERARQUIA B 
            ON A.NIVEL_1 = B.HIERARQUIA
        WHERE B.HIERARQUIA_PRODUTOS IS NOT NULL
        AND B.HIERARQUIA_PRODUTOS NOT LIKE '%(Não Usar)'
        AND B.HIERARQUIA_PRODUTOS NOT LIKE '%(Nfão Usar)'
        AND B.HIERARQUIA_PRODUTOS NOT LIKE 'Não Usar%'
        AND B.HIERARQUIA_PRODUTOS NOT LIKE '%Produtos Acabados%'
        AND B.HIERARQUIA_PRODUTOS NOT LIKE '%NÃO USAR%'
        ORDER BY CATEGORIA
      `);

    res.json(result.recordset);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }
});

  //BUSCAR ITENS DA TABELA dbo.dKna1

router.get("/dKna1",  async (req, res) => {
  try {

    await poolConnect1;

    const result = await pool1.request()
      .query("SELECT TOP 100 * FROM dbo.dKna1");

    console.log("Linhas:", result.recordset.length);

    res.json(result.recordset);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }
});


//BUSCAR ITENS DA TABELA dbo.fact_pedido_vendedor

router.get('/PedidoBD', async (req, res) => {
  try {
    await poolConnect1;

    const result = await pool1.request().query(`
      SELECT *
      FROM dbo.fact_pedido_vendedor
      WHERE loja = @loja
    `);

    console.log("Linhas:", result.recordset.length);

    res.json({ Relatorio: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Erro ao buscar relatório',
      error: err.message
    });
  }
});

//BUSCAR ITENS DA TABELA dbo.fact_relatorio_disparo

router.get('/RelatorioBD', async (req, res) => {
const loja = req.query.loja;

  try {
    await poolConnect1;

    const result = await pool1.request()
    .input('loja', loja) // adiciona o parâmetro de entrada
    .query(`
      SELECT *
      FROM dbo.fact_relatorio_disparo
      WHERE loja = @loja
    `);

    console.log("Linhas:", result.recordset.length);

    res.json({ Relatorio: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Erro ao buscar relatório',
      error: err.message
    });
  }
});

/*-----LISTAS SHAREPOINT-----*/

// BUSCAR ITENS DA LISTA LOJAS
router.get("/Clientes", async (req, res) => {
  try {

    const { Promotor } = req.query; // recebe ?Promotor=9080

    const itens = await getListItems("dClientes");

    // filtrar se o parâmetro existir
    let itensFiltrados = itens;

    if (Promotor) {
      itensFiltrados = itens.filter(item =>
        String(item.field_9) === String(Promotor)
      );
    }


    const lojas = itensFiltrados.map(item => ({
      rede: item.field_1,
      fantasia: item.field_2,
      cliente: item.LinkTitle,
      cidade: item.field_3,
      cep: item.field_4,
      estado: item.field_5,
      rua: item.field_6,
      endereco: item.field_8,
      promotor: item.Promotor,
      matricula: item.field_9
    }));

    res.json({ lojas });

  } catch (err) {
    console.error("Erro /Clientes:", err);
    res.status(500).json({ error: err.message });
  }
});

//BUSCAR ITENS DA LISTA PRODUTOS
/* router.get("/Produtos",  async (req, res) => {
      try {
    const itensProd = await getListItems("dProdutosA");

    const produtos = itensProd.map(item => ({
        loja: item.field_1,           
        cliente: item.field_2,
        codigo_parceiro: item.field_3,
        material: item.field_4,
        ean: item.field_5,
        descricao: item.field_6,
        un_med: item.field_7,
        un: item.field_8,
        qtd_cx: item.field_9,
        situacao: item.field_10
      }));
       // adiciona dentro de "produtos"
      const TabFinal = {
        produtos: produtos
      };

    res.json(TabFinal);
  } catch (err) {
    res.status(500).json({
      error: err.response?.status,
      message: err.response?.data || err.message
    });
  }
}); */

router.get("/Produtos", async (req, res) => {

  try {

    const { cliente } = req.query;

    const itens = await getListItems("dProdutosA");

    let itensFiltrados = itens;

    if (cliente) {
      itensFiltrados = itens.filter(item =>
        String(item.field_2) === String(cliente)
      );
    }

    const produtos = itensFiltrados.map(item => ({
      loja: item.field_1,           
        cliente: item.field_2,
        codigo_parceiro: item.field_3,
        material: item.field_4,
        ean: item.field_5,
        descricao: item.field_6,
        un_med: item.field_7,
        un: item.field_8,
        qtd_cx: item.field_9,
        situacao: item.field_10
    }));

    res.json({ produtos });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// BUSCAR ITENS DA LISTA RELATÓRIO
router.get("/Relatorio", async (req, res) => {
  try {
    const itensProd = await getListItems("Relatório");

    const produtos = itensProd.map(item => ({
        rede: item.title,
        cliente: item.field_1,
        loja: item.field_2,
        data: item.field_3,
        material: item.field_4,
        codigo_parceiro: item.C_x00f3_digocliente,
        ean: item.field_5,
        descricao: item.field_6,
        custo: item.field_7,
        gondola: item.field_8,
        camara: item.field_9,
        estoque_total: item.field_11,
        planograma: item.field_12,
        data_vencimento: item.Datavencimento,
        dias_vencimento: item.Diasparavencer,
        preco: item.Pre_x00e7_o,
        lista: item.lista,
        situacao: item.Situa_x00e7__x00e3_oRebaixa
      }));

    res.json({ Relatorio: produtos });

  } catch (err) {
    res.status(500).json({
      error: err.response?.status,
      message: err.response?.data || err.message
    });
  }
});

// BUSCAR ITENS DA LISTA PEDIDOS  
router.get("/Pedidos",  async (req, res) => {
  try {
    const itensProd = await getListItems("Pedido - Vendedor");

    const produtos = itensProd.map(item => ({
        rede: item.title,
        cliente: item.field_1,
        loja: item.Loja,
        data: item.Data,
        material: item.Produto,
        codigo_parceiro: item.C_x00f3_digo_x0020_Cliente,
        ean: item.EAN,
        descricao: item.Descri_x00e7__x00e3_o,
        custo: item.Custo,
        estoque: item.Estoque_x0020_Fisico,
        pedido: item.Pr_x00f3_ximo_x0020_Pedido,
        total: item.Estoque_x0020_total,
        venda: item.VendaM_x00e9_dia,
        planograma: item.Planograma,
        disparo: item.Quantidade_x0020_do_x0020_dispar,
        disparo_cx: item.Disparo_x0020_CX,
        pedido_cx: item.Pedido_x0020_CX,
        sugestao: item.Sugest_x00e3_o_x0020_Promotor,
        status: item.STATUS,
        data_pedido: item.DataPedido,
        preco: item.Pre_x00e7_o,
        lista: item.lista,
        situacao: item.Situa_x00e7__x00e3_oRebaixa
      }));

    res.json({ Relatorio: produtos });

  } catch (err) {
    res.status(500).json({
      error: err.response?.status,
      message: err.response?.data || err.message
    });
  }
});

   //ENVIAR TODOS OS REGISTROS DO LOCALSTORAGE - RELATÓRIO

router.post("/Relatorio/lote",  async (req, res) => {
  try {
    const { registros } = req.body; // espera um array de objetos

    if (!Array.isArray(registros) || registros.length === 0) {
      return res.status(400).json({ message: "Nenhum registro para enviar" });
    }

    // Cria todos os itens em paralelo
    const promessas = registros.map(registro => createListItem("Relatório", {
      Title: registro.rede,
      field_1: registro.cliente,
      field_2: registro.loja,
      field_3: registro.data,
      field_4: registro.material,
      field_5: registro.ean,
      field_6: registro.descricao,
      field_8: registro.gondola,
      field_9: registro.camara,
      field_11: registro.quantidade,
      field_12: registro.planograma,
      Datavencimento: registro.vencimento,
      dias_vencimento: registro.dias_vencimento,
      Pre_x00e7_o: registro.preco,
      lista: registro.lista,
      Situa_x00e7__x00e3_oRebaixa: registro.situacao
    }));

    const resultados = await Promise.all(promessas);

    res.status(201).json({
      message: "Todos os registros enviados com sucesso",
      total: resultados.length,
      itens: resultados.map(item => ({ id: item.id, Title: item.fields?.Title }))
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.status,
      message: err.response?.data || err.message
    });
  }
});


   //ENVIAR TODOS OS REGISTROS DO LOCALSTORAGE - PEDIDOS

router.post("/Pedidos/lote", async (req, res) => {
  try {
    const { pedidos } = req.body; // espera um array de objetos

    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      return res.status(400).json({ message: "Nenhum pedido para enviar" });
    }

    // Cria todos os itens em paralelo
    const promessas = pedidos.map(pedido => createListItem("Pedido - Vendedor", {
      Title: pedido.rede,
      Loja: pedido.loja,
      Data: pedido.data,
      Produto: pedido.material,
      EAN: pedido.ean,
      Descri_x00e7__x00e3_o: pedido.descricao,
      Estoque_x0020_Fisico: pedido.quantidade,
      Pr_x00f3_ximo_x0020_Pedido: pedido.pedido,
      Estoque_x0020_total: pedido.total,
      VendaM_x00e9_dia: pedido.venda,
      field_12: pedido.planograma,
      Datavencimento: pedido.vencimento,
      dias_vencimento: pedido.dias_vencimento,
      Pre_x00e7_o: pedido.preco,
      lista: pedido.lista,
      Situa_x00e7__x00e3_oRebaixa: pedido.situacao
    }));

    const resultados = await Promise.all(promessas);

    res.status(201).json({
      message: "Todos os registros enviados com sucesso",
      total: resultados.length,
      itens: resultados.map(item => ({ id: item.id, Title: item.fields?.Title }))
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.status,
      message: err.response?.data || err.message
    });
  }
});



   //ENVIAR TODOS OS REGISTROS DO LOCALSTORAGE PARA LISTA DE AVARIAS

router.post("/Relatorio/Avarias",  async (req, res) => {
  try {
    const { avarias } = req.body; // espera um array de objetos

    if (!Array.isArray(avarias) || avarias.length === 0) {
      return res.status(400).json({ message: "Nenhum registro para enviar" });
    }

    // Cria todos os itens em paralelo
    const promessas = avarias.map(avarias => createListItem("Avarias", {
      Title: avarias.loja,
      Rede: avarias.rede,
      field_1: avarias.data,
      field_2: avarias.ean,
      field_3: avarias.material,
      field_4: avarias.descricao,
      field_5: avarias.quantidade,
      field_6: avarias.motivo,
      C_x00f3_digoFornecedor: avarias.codigo
    }));

    const resultados = await Promise.all(promessas);

    res.status(201).json({
      message: "Todos os registros enviados com sucesso",
      total: resultados.length,
      itens: resultados.map(item => ({ id: item.id, Title: item.fields?.Title }))
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.status,
      message: err.response?.data || err.message
    });
  }
});


//BUSCAR ITENS DA LISTA
router.get("/lista",  async (req, res) => {
  try {

    const itens = await getListItems("dClientes");

    res.json({ itens });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});;

export default router;