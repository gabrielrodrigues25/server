import express from 'express';
import { getConnection } from '../auth/sap.js';

const app = express();

app.get("/dMateriais", async (req, res) => {
  try {

    const conect = await getConnection();

    const result = await conect.query(
      'SELECT TOP 5 * FROM SAPSR3.ZSD0100'
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

export default app;