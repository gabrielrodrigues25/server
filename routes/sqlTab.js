import express from "express";
import { pool1, pool2, poolConnect1, poolConnect2 } from "../auth/banco.js";
import { AllGetListItems, getListItems, createListItem, updateListItem, deleteListItem } from "../services/sharepointService.js";

const router = express.Router();

router.get('/Programado', async (req, res) => {
  const vendedor = req.query.vendedor;
  console.log("Cliente no backend:", vendedor);
  
  try {
    await poolConnect2;

    const result = await pool2.request()
      .input('vendedor', vendedor)
      .query(`		
        SELECT 
    V.DOCUMENTO_VENDAS AS DOC,
    V.EMISSOR_ORDEM AS EMISSOR,
    CAST(V.ROTA AS INT) AS ROTA,
    CAST(V.PROX_DATA AS DATE) AS "DATA DE REMESSA",
    CAST(V.DT_CRIACAO_ORDEM AS DATE) AS "DATA DE CRIAÇÃO",
    C.nmFantasia AS CLIENTE,
    SUM(V.VALOR) AS VALOR
FROM Pole_tab_VendaProgra V
LEFT JOIN POLE_FATO_CLIENTE_NEW C
    ON CAST(V.EMISSOR_ORDEM AS BIGINT) = CAST(C.cdCliente AS BIGINT)
WHERE C.NmVendedor = @vendedor       
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