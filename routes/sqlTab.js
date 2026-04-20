import express from "express";
import { pool1, pool2, poolConnect1, poolConnect2 } from "../auth/banco.js";
import { AllGetListItems, getListItems, createListItem, updateListItem, deleteListItem } from "../services/sharepointService.js";

const router = express.Router();

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