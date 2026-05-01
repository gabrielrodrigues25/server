import express from "express";
import sql from "mssql";
import { poolDisp, pool1, pool2, poolConnectDisp, poolConnect1, poolConnect2 } from "../auth/banco.js";
import { AllGetListItems, getListItems, createListItem, updateListItem, deleteListItem, buscarContagemAnterior } from "../services/sharepointService.js";

const router = express.Router();

router.get("/teste", (req, res) => {
  res.json({ teste: true, usuario: req.user.username });
});

// Rotas protegidas

/*-----BANCO DE DADOS-----*/

router.put("/usuario/lote", async (req, res) => {
  try {
    const { ids, nome, matricula } = req.body;

    if (!ids || ids.length === 0) {
      return res.status(400).json({ error: "Nenhuma loja informada" });
    }

    const pool = await poolDisp;

    // cria lista segura de parâmetros
    const request = pool.request();

    ids.forEach((id, index) => {
      request.input(`Cliente${index}`, sql.Int, id);
    });

    const listaIds = ids.map((_, i) => `@Cliente${i}`).join(",");

    await request
      .input("nome", sql.VarChar, nome)
      .input("matricula", sql.VarChar, matricula)
      .query(`
        UPDATE dClientes
        SET Promotor = @nome,
            Login = @matricula
        WHERE Cliente IN (${listaIds})
      `);

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erro ao atualizar lojas" });
  }
});

router.get("/Clientes", async (req, res) => {
  try {

    const { Promotor } = req.query;

    const request = poolDisp.request();

    let query = `
      SELECT *
      FROM dClientes
      WHERE 1=1
    `;

    if (Promotor) {
      query += ` AND Login = @Promotor`;
      request.input("Promotor", sql.NVarChar, Promotor);
    }

    const result = await request.query(query);

    const itens = result.recordset;

    const lojas = itens.map(item => ({
      rede: item.Nome1,           // field_1
      fantasia: item.NomeFantasia,  // field_2
      cliente: item.Cliente,         // LinkTitle
      cidade: item.Cidade,          // field_3
      cep: item.CodigoPostal,       // field_4
      estado: item.Regiao,          // field_5
      rua: item.Rua,                // field_6
      endereco: item.Bairro,        // field_8
      promotor: item.Promotor,
      matricula: item.Login         // field_9
    }));

    res.json({ lojas });

  } catch (err) {
    console.error("Erro /Clientes:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/produtos/status", async (req, res) => {
  try {

    const { id, ativo } = req.body;

    console.log("Atualizando produto:", id, ativo);

    const request = poolDisp.request();

    request.input("Id", sql.Int, id);
    request.input("Situacao", sql.NVarChar, ativo);

    await request.query(`
      UPDATE dProdutos
      SET 
        Situacao = @Situacao,
        Modificado = GETDATE(),
        ModificadoPor = 'Gabriel'
      WHERE Id = @Id
    `);

    res.json({ ok: true });

  } catch (error) {

    console.error("Erro ao atualizar produto:", error);

    res.status(500).json({
      error: error.message
    });

  }
});

router.get("/Produtos", async (req, res) => {
  try {

    const { cliente } = req.query;

    const request = poolDisp.request();

    let query = `
      SELECT *
      FROM dProdutos
      WHERE 1=1
    `;

    if (cliente) {
      query += ` AND Cliente = @cliente`;
      request.input("Cliente", sql.Int, cliente);
    }

    const result = await request.query(query);

    const produtos = result.recordset.map(item => ({
      loja: item.Loja,
      descricao: item.Descricao,
      ean: item.Ean, // assumindo ET = etiqueta/EAN

      cliente: item.Cliente,
      codigo_parceiro: item.CodigoCliente,
      material: item.Material,

      un: item.Unid,
      un_med: item.UnidMed,
      qtd_cx: item.UnidCx,

      situacao: item.Situacao,
      lojasAtivas: item.LojasAtivas,

      criado: item.Criado,
      modificado: item.Modificado,
      criadoPor: item.CriadoPor,
      modificadoPor: item.ModificadoPor,

      id: item.Id
    }));

    res.json({ produtos });

  } catch (err) {
    console.error("Erro /Produtos:", err);
    res.status(500).json({ error: err.message });
  }
});

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
      .query(`WITH ResumoVenda AS (

    SELECT 
         CAST(V.DT_DOC_FATURAMENTO AS DATE) AS DATA_FATURAMENTO
        ,CAST(V.N_MATERIAL AS INT) AS MATERIAL
        ,V.ORGANIZACAO
        ,CAST(V.EMISSOR_DA_ORDEM AS INT) AS EMISSOR
        ,CAST(V.DT_ENT AS DATE) AS DATA_ENTREGA_MERC
        ,SUM(CAST(V.QUANTIDADE AS FLOAT)) AS QUANTIDADE
        ,SUM(CAST(V.VALOR AS FLOAT)) AS VALOR

    FROM dbo.Pole_VW_VendaFaturada V

    WHERE 

        V.TIPO_FATURAMENTO IN ('Z001','Z033')

        AND (V.TIPO_DOC_VENDAS IS NULL OR V.TIPO_DOC_VENDAS <> 'H')

        AND CAST(V.EMISSOR_DA_ORDEM AS INT) = CAST(@cliente AS INT)
        AND V.DT_DOCUMENTO_VENDAS <> V.DT_FAT_CRIACAO
        AND V.DT_DOC_FATURAMENTO >= DATEADD(MONTH,-1,GETDATE())

    GROUP BY
         CAST(V.DT_DOC_FATURAMENTO AS DATE)
        ,V.EMISSOR_DA_ORDEM
        ,V.ORGANIZACAO
        ,CAST(V.EMISSOR_DA_ORDEM AS INT)
        ,CAST(V.N_MATERIAL AS INT)
        ,CAST(V.DT_ENT AS DATE)
)

SELECT TOP 100
     
     V.EMISSOR
    ,V.MATERIAL
    ,M.DescMaterial
    ,V.DATA_FATURAMENTO
    ,V.DATA_ENTREGA_MERC
    ,V.ORGANIZACAO
    ,V.QUANTIDADE
    ,V.VALOR
    ,H.CATEGORIA

    ,CAST(V.QUANTIDADE AS FLOAT) /
        NULLIF(CAST(M.KG_EMBALAGEM AS FLOAT),0) AS CAIXAS

FROM ResumoVenda V

LEFT JOIN dbo.POLE_FATO_MATERIAIS M
    ON V.MATERIAL = CAST(M.MATERIAL AS INT)

LEFT JOIN (
    SELECT 
        A.HIERARQUIA,
        CASE 
            WHEN B.HIERARQUIA_PRODUTOS = 'Prod Terceiros' 
            THEN 'Revenda'
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
    ON M.HIERARQUIA = H.HIERARQUIA

ORDER BY V.DATA_FATURAMENTO DESC
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
  const data = req.query.data;

  try {

    await poolConnect1;

    const result = await pool1.request()
      .input('loja', loja)
      .input('data', data)
      .query(`
        SELECT *
        FROM dbo.fact_relatorio_disparo
        WHERE loja = @loja
        AND data = @data
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


// Registrar horário de entrada
router.post("/horario/entrada", async (req, res) => {
  try {
    const { registros } = req.body;

    if (!registros || !Array.isArray(registros)) {
      return res.status(400).json({ erro: "O corpo da requisição deve conter um array 'registros'." });
    }

    // Cria os itens no SharePoint
    const promessas = registros.map(registro =>
      createListItem("8124c393-ca24-42e1-96ff-1aaa7d789f7f", {
        Rede: registro.rede,
        Loja: registro.loja,
        Cliente: registro.cliente,
        Matricula: registro.matricula,
        Usu_x00e1_rio: registro.usuario,
        Data: registro.data,
        Entrada: registro.entrada,
        Saida0: registro.saida,
        Dura_x00e7__x00e3_o: registro.duracao,
        Motivo: registro.motivo,
        Contagem: registro.contagem
      })
    );

    // Aguarda todas as promessas
    const resultados = await Promise.all(promessas);

    // Retorna os resultados
    res.json({ sucesso: true, resultados });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

// BUSCAR REGISTROS DO USUARIO

router.get("/contagem", async (req, res) => {

  try {

    const loja = req.query.loja;
    const data = req.query.data;
    const rede = req.query.rede;

    const filtro = `&$filter=${encodeURIComponent(
      `fields/Rede eq '${rede}' and fields/Loja eq '${loja}' and fields/Data eq '${data}'`
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

/* router.get("/Mapeamento", async (req, res) => {

  try {

    const loja = req.query.Loja;
    const data = req.query.data;


    const filtro = `&$filter=${encodeURIComponent(
      `fields/Loja eq '${loja}' and fields/Data eq '${data}'`
    )}`;

    const itens = await AllGetListItems("8124c393-ca24-42e1-96ff-1aaa7d789f7f", filtro);

    const registros = itens.map(item => {

  const f = item.fields;

  const datadia = f.Data ? new Date(f.Data).toISOString().split("T")[0] : null;


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

}); */

// BUSCAR ITENS DA LISTA LOJAS
router.get("/ClientesShare", async (req, res) => {
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

router.post("/produtosShare/status", async (req, res) => {

  try {

    const { id, ativo } = req.body;

    console.log("Atualizando produto:", id, ativo);

    await updateListItem("dProdutosA", id, {
      field_10: ativo
    });

    res.json({ ok: true });

  } catch (error) {

    console.error("Erro ao atualizar produto:", error);

    res.status(500).json({
      error: error.message
    });

  }

});

router.get("/ProdutosShare", async (req, res) => {

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
        situacao: item.field_10,
		    id: item.id
    }));

    res.json({ produtos });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//Produtos da lista formulario
router.get("/ProdutosForm", async (req, res) => {

  try {

    const itens = await getListItems("ListaProdutos");

    let itensFiltrados = itens;

    const produtos = itensFiltrados.map(item => ({
        descricao: item.Title,           
        material: item.field_0,
        ean: item.EAN
    }));

    res.json({ produtos });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// BUSCAR ITENS DA LISTA AVARIAS

router.get("/Avarias", async (req, res) => {

  try {

    const loja = req.query.loja;
    const data = req.query.data;

    console.log(loja, data);

    const filtro = `&$filter=${encodeURIComponent(
      `fields/Title eq '${loja}' and fields/field_1 eq '${data}'`
    )}`;

    const itens = await AllGetListItems("Avarias", filtro);

    const produtos = itens.map(item => {

      const f = item.fields;

      return {
        idSharePoint: item.id,
        rede: f.Rede,
        loja: f.Title,
        data: f.field_1,
        material: f.field_3,
        codigo_parceiro: f.C_x00f3_digoFornecedor,
        ean: f.field_2,
        descricao: f.field_4,
        quantidade: f.field_5,
        data_vencimento: f.Vencimento,
        motivo: f.field_6
      };

    });

    res.json({ Relatorio: produtos });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message
    });

  }

});

// BUSCAR ITENS DA LISTA RELATÓRIO FILTRADOS

router.get("/Relatorio", async (req, res) => {

  try {

    const loja = req.query.loja;
    const data = req.query.data;

    console.log(loja, data);

    const filtro = `&$filter=${encodeURIComponent(
      `fields/field_2 eq '${loja}' and fields/field_3 eq '${data}'`
    )}`;

    const itens = await AllGetListItems("Relatório", filtro);

    const produtos = itens.map(item => {

      const f = item.fields;

      return {
        idSharePoint: item.id,
        rede: f.Title,
        cliente: f.field_1,
        loja: f.field_2,
        data: f.field_3,
        material: f.field_4,
        codigo_parceiro: f.C_x00f3_digocliente,
        ean: f.field_5,
        descricao: f.field_6,
        gondola: f.field_8,
        camara: f.field_9,
        quantidade: f.field_11,
        planograma: f.field_12,
        data_vencimento: f.Datavencimento,
        dias_vencimento: f.Dias_x0020_para_x0020_vencer,
        preco: f.Pre_x00e7_o,
        lista: f.Lista,
        situacao: f.Situa_x00e7__x00e3_oRebaixa
      };

    });

    res.json({ Relatorio: produtos });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message
    });

  }

});

// BUSCAR CONTAGEM ANTERIOR
router.get("/Pedidos/Anterior", async (req, res) => {

  const { loja, data } = req.query;

  try {
    const dados = await buscarContagemAnterior(loja, data);

    const produtos = dados.map(f => {

      return {
        // se quiser manter id, precisa ajustar lá na função (explico abaixo)
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

    res.json({ Relatorio: produtos });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar contagem anterior" });
  }

});

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

    const produtos = itens.map(item => {

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

    res.json({ Relatorio: produtos });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message
    });

  }

});

// ATUALIZAR UM REGISTRO NA LISTA RELATÓRIO
router.patch("/Relatorio/:id", async (req, res) => {
  const { id } = req.params;
  const campos = req.body;

  try {
    const atualizado = await updateListItem("Relatório", id, campos);
    res.json({ message: "Registro do Relatório atualizado", item: atualizado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar registro do Relatório", detalhe: err.message });
  }
});

// ATUALIZAR UM REGISTRO NA LISTA PEDIDOS
router.patch("/Pedidos/:id", async (req, res) => {
  const { id } = req.params;
  const campos = req.body;

  try {
    const atualizado = await updateListItem("Pedido - Vendedor", id, campos);
    res.json({ message: "Registro do Pedido atualizado", item: atualizado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar registro do Pedido", detalhe: err.message });
  }
});

//DELETAR DA LISTA RELATÓRIO
router.delete("/Relatorio/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteListItem("Relatório", id);
    res.json({ message: "Registro do Relatório deletado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao deletar registro do Relatório", detalhe: err.message });
  }
});

//DELETAR DA LISTA PEDIDO-VENDEDOR
router.delete("/Pedidos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteListItem("Pedido - Vendedor", id);
    res.json({ message: "Registro do Pedido deletado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao deletar registro do Pedido", detalhe: err.message });
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
	  C_x00f3_digocliente: registro.codigo,
      Datavencimento: registro.vencimento,
      Diasparavencer: registro.dias_vencimento,
      Pre_x00e7_o: registro.preco,
      Lista: registro.lista,
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
	    C_x00f3_digo_x0020_Cliente: pedido.codigo,
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
      C_x00f3_digoFornecedor: avarias.codigo,
      Vencimento: avarias.vencimento

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

//ENVIO DO formulario

router.post("/Formulario/lote", async (req, res) => {

  try {

    const { registros } = req.body;

    if (!Array.isArray(registros) || registros.length === 0) {
      return res.status(400).json({ message: "Nenhum produto encontrado" });
    }

    const promessas = registros.map(registro =>

      createListItem("Formulário", {

        Title: registro.nome,
        Data: registro.data,
        EAN: registro.ean,

        field_1: registro.matricula,
        field_2: registro.rede,
        field_3: registro.loja,
        field_4: registro.emissor,

        field_6: registro.latitude,
        field_7: registro.longitude,

        field_9: registro.material,
        field_10: registro.descricao,

        field_11: registro.disponivel ? "Sim" : "Não",
        field_12: registro.precificado ? "Sim" : "Não",
        field_13: registro.promocao ? "Sim" : "Não",
		
		field_14: Number(registro.frentesTotais),
        field_15: Number(registro.frentesSucre),

        PontoExtra: registro.pontoExtra === "sim" ? "Sim" : "Não"

      })

    );

    const resultados = await Promise.all(promessas);

    res.status(201).json({
      message: "Registros criados",
      total: resultados.length
    });

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: err.message });

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