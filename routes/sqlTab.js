import express from "express";
import sql from "mssql";
import { poolDisp, pool1, pool2, poolConnectDisp, poolConnect1, poolConnect2 } from "../auth/banco.js";
import { AllGetListItems, getListItems, createListItem, updateListItem, deleteListItem } from "../services/sharepointService.js";

const router = express.Router();

/* router.get("/Clientes", async (req, res) => {
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

router.get("/ClientesBD", async (req, res) => {
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
        situacao: item.field_10,
        id: item.id
    }));

    res.json({ produtos });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/ProdutosBD", async (req, res) => {
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

router.get("/ProgramadoTab",  async (req, res) => {
  try {

    await poolConnect2;

    const result = await pool2.request()
      .query(`SELECT TOP 10 *
      FROM Pole_tab_VendaProgra V`);

    console.log("Linhas:", result.recordset.length);

    res.json(result.recordset);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }
});

router.get('/Programado', async (req, res) => {
  const vendedor = req.query.vendedor;
  const data = req.query.data ? req.query.data : null;
  console.log("Cliente no backend:", vendedor);
  console.log("Data:", data )
  
  try {
    await poolConnect2;

    const result = await pool2.request()
      .input('vendedor', vendedor)
      .input('data', data)
      .query(`		
        SELECT 
    C.NmVendedor AS Vendedor,
    V.DOCUMENTO_VENDAS AS Doc,
    V.EMISSOR_ORDEM AS Emissor,
    CAST(V.ROTA AS INT) AS Rota,
    CAST(V.PROX_DATA AS DATE) AS "Data de Remessa",
    CAST(V.DT_CRIACAO_ORDEM AS DATE) AS "Data de Criação",
    C.nmFantasia AS Cliente,
    SUM(V.VALOR) AS Valor
FROM Pole_tab_VendaProgra V
LEFT JOIN POLE_FATO_CLIENTE_NEW C
    ON CAST(V.EMISSOR_ORDEM AS BIGINT) = CAST(C.cdCliente AS BIGINT)
WHERE C.NmVendedor = @vendedor 
AND (
  @data IS NULL 
  OR CONVERT(DATE, V.PROX_DATA, 112) = @data
)
GROUP BY 
    V.DOCUMENTO_VENDAS,
    V.EMISSOR_ORDEM,
    V.ROTA,
    V.PROX_DATA,
    V.DT_CRIACAO_ORDEM,
    C.nmFantasia,
    C.NmVendedor,
    C.cdRotaEntrega
ORDER BY V.DOCUMENTO_VENDAS
      `);

    console.log("Linhas:", result.recordset.length);

    res.json({ registros: result.recordset });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Erro ao buscar relatório',
      error: err.message
    });

  }
});

router.get('/Vendedores', async (req, res) => {
  try {
    await poolConnect2;

    const result = await pool2.request()
      .query(`		
       SELECT DISTINCT 
    NmVendedor,
    cdRotaEntrega
FROM POLE_FATO_CLIENTE_NEW
WHERE NmVendedor IS NOT NULL
  AND NmVendedor <> ''
  AND cdRotaEntrega IS NOT NULL
  AND cdRotaEntrega <> ''
ORDER BY NmVendedor;
      `);

    console.log("Linhas:", result.recordset.length);

    res.json({ Clientes: result.recordset });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Erro ao buscar clientes',
      error: err.message
    });

  }
});

export default router;