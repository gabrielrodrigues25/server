import axios from "axios";
import getToken from "../auth/auth.js";

const siteUrl =
  "https://graph.microsoft.com/v1.0/sites/polealimentos.sharepoint.com:/sites/Contagemdeestoque-Aplicativo";


   //FUNÇÃO AUXILIAR: pega siteId

async function getSiteId(token) {
  const siteResponse = await axios.get(siteUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return siteResponse.data.id;
}


   //FUNÇÃO AUXILIAR: pega listId da lista pelo nome

async function getListId(token, siteId, listName) {
  const listResponse = await axios.get(
    `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listName}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return listResponse.data.id;
}


   //GET: buscar todos os itens de uma lista (com paginação)

export async function getListItems(listName) {
  const token = await getToken();
  const siteId = await getSiteId(token);
  const listId = await getListId(token, siteId, listName);

  let url = `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items?expand=fields`;
  let allItems = [];

  while (url) {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    allItems = allItems.concat(response.data.value.map(item => item.fields));
    url = response.data["@odata.nextLink"] || null;
  }

  return allItems;
}


 /*   POST: criar um item na lista
   dados: objeto com os campos exatos do SharePoint */

export async function createListItem(listName, dados) {
  const token = await getToken();
  const siteId = await getSiteId(token);
  const listId = await getListId(token, siteId, listName);

  const response = await axios.post(
    `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items`,
    { fields: dados },
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );

  return response.data;
}


   //DELETE: deletar um item da lista pelo ID

export async function deleteListItem(listName, itemId) {
  const token = await getToken();
  const siteId = await getSiteId(token);
  const listId = await getListId(token, siteId, listName);

  await axios.delete(
    `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items/${itemId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return { message: "Item deletado com sucesso", id: itemId };
}