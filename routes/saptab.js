import express from 'express';
import { getConnection } from '../auth/sap.js';
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

const app = express();

// AXIOS COM COOKIE
const jar = new CookieJar();

const client = wrapper(axios.create({
  baseURL: "http://187.110.239.34:5002",
  jar,
  withCredentials: true
}));

// LOGIN
async function login() {
  const res = await client.post("/_dash-update-component", {
    output: "..url.pathname...login-status.data...data-select-pedido-status.data...data-select-produtos.data...alert-return-login.children...login-data.data..",
    outputs: [
      { id: "url", property: "pathname" },
      { id: "login-status", property: "data" },
      { id: "data-select-pedido-status", property: "data" },
      { id: "data-select-produtos", property: "data" },
      { id: "alert-return-login", property: "children" },
      { id: "login-data", property: "data" }
    ],
    inputs: [
      {
        id: "submit-button",
        property: "n_clicks",
        value: 1
      }
    ],
    changedPropIds: ["submit-button.n_clicks"],
    parsedChangedPropsIds: ["submit-button.n_clicks"],
    state: [
      {
        id: "input-username",
        property: "value",
        value: "naldo.morais"
      },
      {
        id: "input-password",
        property: "value",
        value: "0481"
      },
      {
        id: "input-store",
        property: "value",
        value: "1"
      }
    ]
  });

  console.log("Login OK");

  return res.data;
}

// ROTA VENDAS
app.get("/SelloutCenterBox", async (req, res) => {
  
  const { cliente } = req.query;
  try {
    const lojas = [
  { id: "1", nome: "01-GENIBAU", cliente: 1000120, rede: "CENTERBOX" },
  { id: "2", nome: "02-P S JOSE", cliente: 1000702, rede: "CENTERBOX" },
  { id: "3", nome: "03-J. XXIII", cliente: 1000704, rede: "CENTERBOX" },
  { id: "5", nome: "05-S DUMONT", cliente: 1002009, rede: "CENTERBOX" },
  { id: "6", nome: "06-MESSEJANA", cliente: 1002244, rede: "CENTERBOX" },
  { id: "7", nome: "07-PARQUELAN", cliente: 1002447, rede: "CENTERBOX" },
  { id: "8", nome: "08-J. BASTOS", cliente: 1003701, rede: "CENTERBOX" },
  { id: "9", nome: "09-CONCEITO", cliente: 1005464, rede: "CENTERBOX" },
  { id: "30", nome: "10-C.CARVALH", cliente: 1015903, rede: "CENTERBOX" },
  { id: "31", nome: "11-EXPEDICIO", cliente: 1030879, rede: "CENTERBOX" },
  { id: "34", nome: "14-BARRA", cliente: 1031404, rede: "CENTERBOX" },
  { id: "33", nome: "13-CAUCAIA", cliente: 1031407, rede: "CENTERBOX" },
  { id: "35", nome: "15-MESSEJANA", cliente: 1033652, rede: "CENTERBOX" },
  { id: "32", nome: "04-JARDIM", cliente: 1034051, rede: "CENTERBOX" },
  { id: "36", nome: "16-PQ DELSOL", cliente: 1044668, rede: "CENTERBOX" },
  { id: "37", nome: "17-GRANJA", cliente: 1047713, rede: "CENTERBOX" },
  { id: "38", nome: "18-CURIO", cliente: 1049458, rede: "CENTERBOX" },
  { id: "40", nome: "20-DOMPEDRO", cliente: 1049841, rede: "CENTERBOX" },
  { id: "39", nome: "19-LREDONDA", cliente: 1049842, rede: "CENTERBOX" },
  { id: "41", nome: "21-VALPARAISO", cliente: 1049845, rede: "CENTERBOX" },
  { id: "42", nome: "22-PEDRAS", cliente: 1049846, rede: "CENTERBOX" },
  { id: "43", nome: "23-SANTAMARIA", cliente: 1050002, rede: "CENTERBOX" },
  { id: "14", nome: "ATACAREJO", cliente: 1042074, rede: "CENTERBOX" }
];

  const material = [
    {id:1,codigo:10989,material:300912,descricao:"BCX Asa s/ Coxinha Frango Resf 10x700g"},
    {id:2,codigo:10998,material:300561,descricao:"BPL Coracao Frango Resf 10x500g"},
    {id:3,codigo:11001,material:300914,descricao:"BCX Coxa Frango Resf 10x700g"},
    {id:4,codigo:11017,material:300915,descricao:"BCX Coxinha Asa Frango Resf 10x700g"},
    {id:5,codigo:11021,material:300563,descricao:"BPL Figado Frango Resf 10x500g"},
    {id:6,codigo:11026,material:300558,descricao:"BCX File Peito Frango Resf 10x700g"},
    {id:7,codigo:11034,material:300540,descricao:"Frango Resfriado Cx25kg"},
    {id:8,codigo:11059,material:300562,descricao:"BPL Moela Frango Resf 10x500g"},
    {id:9,codigo:11073,material:300916,descricao:"BCX Peito Frango Resf 10x700g"},
    {id:10,codigo:11079,material:300546,descricao:"BCX Peito s/ Pele Frango Resf 10x700g"},
    {id:11,codigo:11083,material:300918,descricao:"BCX Sobrecoxa Frango Resf 10x700g"},
    {id:12,codigo:11086,material:300554,descricao:"BCX Sobrecoxa s/ Pele Fgo Resf 10x700g"},
    {id:13,codigo:11039,material:300587,descricao:"BCX Hot Wings Resf CF 10x700g"},
    {id:16,codigo:44895,material:300599,descricao:"Galeto Grill Temp Resf Cx30kg"},
    {id:17,codigo:59012,material:300606,descricao:"BCX Sassami Frango Resf 10x400g"},
    {id:18,codigo:115639,material:300374,descricao:"CF Ling Toscana Resf 20x460g"},
    {id:19,codigo:135788,material:300714,descricao:"FF Coxinha Asa Temp Resf Cx15kg"},
    {id:20,codigo:135787,material:300579,descricao:"PCX Coxa Frango Resf Cx15kg"},
    {id:21,codigo:135785,material:300578,descricao:"PCX Coxinha Asa Frango Resf Cx15kg"},
    {id:22,codigo:135784,material:300577,descricao:"PCX Peito Frango Resf Cx15kg"},
    {id:23,codigo:135783,material:300584,descricao:"PCX File Peito Frango Resf Cx15kg"},
    {id:24,codigo:135782,material:300720,descricao:"FF Sobrecoxa Temp Resf Cx15kg"},
    {id:25,codigo:128478,material:300715,descricao:"FF Coxinha Asa Temp Resf Cx7kg"},
    {id:26,codigo:128477,material:300725,descricao:"FF Bife File Temp Resf Cx4kg"},
    {id:27,codigo:128476,material:300719,descricao:"FF Coxa Temp Resf Cx7kg"},
    {id:28,codigo:128475,material:300721,descricao:"FF Sobrecoxa Temp Resf Cx7kg"},
    {id:29,codigo:142327,material:300824,descricao:"Galeto Temp Faça Facil Resf Cx12kg"},
    {id:33,codigo:59014,material:300607,descricao:"BCX File Sobrecoxa Frango Resf 10x400g"},
    {id:36,codigo:135786,material:300579,descricao:"PCX Coxa Frango Resf Cx15kg"},
    {id:37,codigo:140969,material:300568,descricao:"PCX Asa s/ Coxinha Frango Resf Cx15kg"}
  ]

  const mapaLojas = Object.fromEntries(
  lojas.map(l => [String(l.cliente), l.id])
);

const lojaId = mapaLojas[String(cliente)];

if (!lojaId) {
  return res.status(400).json({ erro: "Loja não mapeada", cliente });
}


    const loginResponse = await client.post("/_dash-update-component", {
      output: "..url.pathname...login-status.data...data-select-pedido-status.data...data-select-produtos.data...alert-return-login.children...login-data.data..",
      outputs: [
        { id: "url", property: "pathname" },
        { id: "login-status", property: "data" },
        { id: "data-select-pedido-status", property: "data" },
        { id: "data-select-produtos", property: "data" },
        { id: "alert-return-login", property: "children" },
        { id: "login-data", property: "data" }
      ],
      inputs: [
        {
          id: "submit-button",
          property: "n_clicks",
          value: 1
        }
      ],
      changedPropIds: ["submit-button.n_clicks"],
      parsedChangedPropsIds: ["submit-button.n_clicks"],
      state: [
        {
          id: "input-username",
          property: "value",
          value: "naldo.morais"
        },
        {
          id: "input-password",
          property: "value",
          value: "0481"
        },
        {
          id: "input-store",
          property: "value",
          value: lojaId || "1"
        }
      ]
    });
    const produtos =
      loginResponse.data?.response?.["data-select-produtos"]?.data ||
      loginResponse.data?.response?.["data-select-produtos"];

      const mapaMaterial = Object.fromEntries(
        material.map(m => [String(m.codigo), m.material])
      );

      const registros = produtos.map(item => {
        const codigo = String(item.seqproduto);

        return {
          codigo: Number(codigo),
          descricao: item.produto,
          produto: mapaMaterial[codigo] || null, 
          estoque: Math.round(Number(item.estqloja || 0)),
          media: Math.round(Number(item.media || 0)),
        };
      });

    res.json(registros);

  } catch (erro) {
    console.error("Erro:", erro.response?.data || erro.message);

    res.status(500).json({
      erro: erro.response?.data || erro.message
    });
  }
});

app.get("/dMateriais", async (req, res) => {
  try {

    const conect = await getConnection();

    const result = await conect.query(
      `SELECT TOP 5000
  Z.MATNR,
  M.MATNR,
  M.MATKL
FROM SAPSR3.ZSDT042 Z
LEFT JOIN SAPSR3.MARA M
  ON Z.MATNR = M.MATNR`
    );

    console.log("Linhas:", result.length);

    res.json(result);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }
});

app.get("/SelloutResumo", async (req, res) => {
  try {

    const { cliente, periodo } = req.query;

    if (!cliente) {
      return res.status(400).json({ error: "Cliente é obrigatório" });
    }

    const conect = await getConnection();
    const clienteFormatado = String(cliente).padStart(10, "0");

    let meses = 1;

    if (periodo === "30") meses = 1;
    if (periodo === "60") meses = 2;
    if (periodo === "90") meses = 3;

    const hoje = new Date();

    const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - (meses - 1), 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const dataInicio = inicio.toISOString().slice(0,10).replace(/-/g, "");
    const dataFim = fim.toISOString().slice(0,10).replace(/-/g, "");

    const result = await conect.query(`
      SELECT
  M.MATNR,
  M.NOME,

  AVG(M.TOTAL_MES) AS TOTAL_QTD,

  AVG(M.PRIMEIROS_15_MES) AS PRIMEIROS_15_DIAS,

  AVG(M.ULTIMOS_15_MES) AS ULTIMOS_15_DIAS,

  AVG(M.MEDIA_DIARIA_MES) AS MEDIA_DIARIA

FROM (

  SELECT
    Z.MATNR,
    T.MAKTX AS NOME,

    SUBSTRING(Z.BUDAT, 1, 6) AS ANO_MES,

    SUM(Z.ERFMG) AS TOTAL_MES,

    COUNT(DISTINCT Z.BUDAT) AS DIAS_MES,

    CAST(SUM(Z.ERFMG) AS FLOAT)
      / NULLIF(COUNT(DISTINCT Z.BUDAT), 0) AS MEDIA_DIARIA_MES,

    -- PRIMEIROS 15 DO MÊS
    SUM(CASE 
          WHEN SUBSTRING(Z.BUDAT, 7, 2) BETWEEN '01' AND '15'
          THEN Z.ERFMG ELSE 0
        END) AS PRIMEIROS_15_MES,

    -- ÚLTIMOS 15 DO MÊS
    SUM(CASE 
          WHEN SUBSTRING(Z.BUDAT, 7, 2) BETWEEN '16' AND '31'
          THEN Z.ERFMG ELSE 0
        END) AS ULTIMOS_15_MES

  FROM SAPSR3.ZSDT042 Z

  LEFT JOIN SAPSR3.MAKT T
    ON Z.MATNR = T.MATNR
    AND Z.MANDT = T.MANDT
    AND T.SPRAS = 'P'

  WHERE 
    Z.KUNNR = '${clienteFormatado}'
    AND Z.BUDAT BETWEEN '${dataInicio}' AND '${dataFim}'

  GROUP BY
    Z.MATNR,
    T.MAKTX,
    SUBSTRING(Z.BUDAT, 1, 6)

) M

GROUP BY
  M.MATNR,
  M.NOME

ORDER BY TOTAL_QTD DESC;
    `);

    const registros = result.map(item => ({
      produto: Number(item.MATNR),
      descricao: item.NOME,

      total: Math.round(Number(item.TOTAL_QTD || 0)),
      media: Math.round(Number(item.MEDIA_DIARIA || 0)),

      primeiros15: Math.round(Number(item.PRIMEIROS_15_DIAS || 0)),
      ultimos15: Math.round(Number(item.ULTIMOS_15_DIAS || 0))
    }));

    res.json(registros);

  } catch (err) {
    console.error("ERRO COMPLETO:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/Sellout", async (req, res) => {
  try {

    const conect = await getConnection();

    const result = await conect.query(`
  SELECT TOP 10 BUDAT FROM SAPSR3.ZSDT042
`);

    console.log("Linhas:", result.length);

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


export default app;