import { poolDisp, pool1, pool2, poolConnectDisp, poolConnect1, poolConnect2 } from "../auth/banco.js";
import sql from "mssql";

export async function importarPlanograma(itens) {
  await poolConnectDisp;

  for (const item of itens) {

    const request = poolDisp.request();

    request.input("Cliente", sql.Int, item.field_1 || null);
    request.input("Material", sql.Int, item.field_0 || null);
    request.input("Descricao", sql.NVarChar(120), item.field_2 || null);
    request.input("UndMedida", sql.NVarChar(10), item.field_3 || null);
    request.input("Peso", sql.Numeric(18,1), item.field_4 || null);
    request.input("QtdUnd", sql.Numeric(18,1), item.field_5 || null);

    await request.query(`
      MERGE dPlanograma AS target
      USING (
        SELECT 
          @Cliente AS Cliente,
          @Material AS Material
      ) AS source
      ON target.Cliente = source.Cliente 
         AND target.Material = source.Material

      WHEN MATCHED THEN
        UPDATE SET
          Descricao = @Descricao,
          UndMedida = @UndMedida,
          Peso = @Peso,
          QtdUnd = @QtdUnd

      WHEN NOT MATCHED THEN
        INSERT (
          Cliente,
          Material,
          Descricao,
          UndMedida,
          Peso,
          QtdUnd
        )
        VALUES (
          @Cliente,
          @Material,
          @Descricao,
          @UndMedida,
          @Peso,
          @QtdUnd
        );
    `);
  }

  console.log("Sync com dPlanograma concluído");
}

export async function importarLojas(itens) {
  await poolConnectDisp;

  for (const item of itens) {

    const request = poolDisp.request();

    request.input("IDLoja", sql.Int, Number(item.Title));
    request.input("Cliente", sql.NVarChar, item.Title || null);
    request.input("Nome1", sql.NVarChar, item.field_1 || null);
    request.input("NomeFantasia", sql.NVarChar, item.field_2 || null);
    request.input("Local", sql.NVarChar, item.field_3 || null);
    request.input("CodigoPostal", sql.NVarChar, item.field_4 || null);
    request.input("Regiao", sql.NVarChar, item.field_5 || null);
    request.input("Rua", sql.NVarChar, item.field_6 || null);
    request.input("Cidade", sql.NVarChar, item.field_7 || null);
    request.input("Bairro", sql.NVarChar, item.field_8 || null);
    request.input("CNPJ", sql.NVarChar, item.CNPJ || null);

    request.input("Login", sql.Int, item.field_9 || 0);
    request.input("LoginVendedor", sql.NVarChar, item.field_10 || null);
    request.input("Promotor", sql.NVarChar, item.Promotor || null);
    request.input("Situacao", sql.NVarChar, item.Situa_x00e7__x00e3_o || null);
    request.input("Disparo", sql.NVarChar, item.Disparo || null);

    request.input("Criado", sql.DateTime, item.Created);
    request.input("Modificado", sql.DateTime, item.Modified);
    request.input("CriadoPor", sql.NVarChar, "Gabriel");

    await request.query(`
      MERGE dClientes AS target
      USING (SELECT @IDLoja AS IDLoja) AS source
      ON target.IDLoja = source.IDLoja

      WHEN MATCHED THEN
        UPDATE SET
          Cliente = @Cliente,
          Nome1 = @Nome1,
          NomeFantasia = @NomeFantasia,
          Local = @Local,
          CodigoPostal = @CodigoPostal,
          Regiao = @Regiao,
          Rua = @Rua,
          Cidade = @Cidade,
          Bairro = @Bairro,
          CNPJ = @CNPJ,
          Login = @Login,
          LoginVendedor = @LoginVendedor,
          Promotor = @Promotor,
          Situacao = @Situacao,
          Disparo = @Disparo,
          CriadoPor = @CriadoPor,
          Modificado = @Modificado

      WHEN NOT MATCHED THEN
        INSERT (
          Cliente,
          Nome1,
          NomeFantasia,
          Local,
          CodigoPostal,
          Regiao,
          Rua,
          Cidade,
          Bairro,
          CNPJ,
          Login,
          LoginVendedor,
          Promotor,
          IDLoja,
          Situacao,
          Disparo,
          Criado,
          Modificado,
          CriadoPor
        )
        VALUES (
          @Cliente,
          @Nome1,
          @NomeFantasia,
          @Local,
          @CodigoPostal,
          @Regiao,
          @Rua,
          @Cidade,
          @Bairro,
          @CNPJ,
          @Login,
          @LoginVendedor,
          @Promotor,
          @IDLoja,
          @Situacao,
          @Disparo,
          @Criado,
          @Modificado,
          @CriadoPor
        );
    `);
  }

  console.log("Sync com dClientes concluído");
}


export async function importarProdutos(itens) {
  await poolConnectDisp;

  for (const item of itens) {

    const request = poolDisp.request();

    request.input("Loja", sql.NVarChar, item.field_1 || null);
    request.input("Cliente", sql.Int, item.field_2 || null);
    request.input("CodigoCliente", sql.Int, item.field_3 || null);
    request.input("Material", sql.Int, item.field_4 || null);

    request.input("Ean", sql.BigInt, item.field_5 || null);

    request.input("Descricao", sql.NVarChar, item.field_6 || null);

    request.input("Unid", sql.Numeric(10,2), item.field_7 || null);
    request.input("UnidMed", sql.NVarChar, item.field_8 || null);
    request.input("UnidCx", sql.Int, item.field_9 || null);

    request.input("Situacao", sql.NVarChar, item.field_10 || null);
    request.input("LojasAtivas", sql.NVarChar, item.field_11 || null);

    request.input("Criado", sql.DateTime, item.Created || null);
    request.input("Modificado", sql.DateTime, item.Modified || null);

    request.input("CriadoPor", sql.NVarChar, "Gabriel");
    request.input("ModificadoPor", sql.NVarChar, "Gabriel");

    await request.query(`
      MERGE dProdutos AS target
      USING (
        SELECT 
          @Loja AS Loja,
          @Material AS Material,
          @Cliente AS Cliente
      ) AS source
      ON 
        target.Loja = source.Loja
        AND target.Material = source.Material
        AND target.Cliente = source.Cliente

      WHEN MATCHED THEN
        UPDATE SET
          CodigoCliente = @CodigoCliente,
          Ean = @Ean,
          Descricao = @Descricao,
          Unid = @Unid,
          UnidMed = @UnidMed,
          UnidCx = @UnidCx,
          Situacao = @Situacao,
          LojasAtivas = @LojasAtivas,
          Modificado = @Modificado,
          ModificadoPor = @ModificadoPor

      WHEN NOT MATCHED THEN
        INSERT (
          Loja,
          Cliente,
          CodigoCliente,
          Material,
          Ean,
          Descricao,
          Unid,
          UnidMed,
          UnidCx,
          Situacao,
          LojasAtivas,
          Criado,
          Modificado,
          CriadoPor,
          ModificadoPor
        )
        VALUES (
          @Loja,
          @Cliente,
          @CodigoCliente,
          @Material,
          @Ean,
          @Descricao,
          @Unid,
          @UnidMed,
          @UnidCx,
          @Situacao,
          @LojasAtivas,
          @Criado,
          @Modificado,
          @CriadoPor,
          @ModificadoPor
        );
    `);
  }
}