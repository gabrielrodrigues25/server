import "dotenv/config";
import odbc from "odbc";

const connectionString = `
DRIVER={Adaptive Server Enterprise};
SERVER=${process.env.DB_SERVER_SYBASE};
PORT=${process.env.DB_PORT_SYBASE};
DATABASE=${process.env.DB_NAME_SYBASE};
UID=${process.env.DB_USER_SYBASE};
PWD=${process.env.DB_PASSWORD_SYBASE};
`;

let connection;

export async function getConnection() {
  try {
    if (!connection) {
      connection = await odbc.connect(connectionString);
      console.log("Conectado");
    }
    return connection;
  } catch (err) {
    console.error("Erro ao conectar:", err);
    throw err;
  }
}