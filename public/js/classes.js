export default class TabelaAPI {
  constructor(apiUrl) {
    this.apiUrl = apiUrl; // URL base da API, ex: "https://minhaapi.com/clientes"
    this.registros = [];  // Lista interna de registros
  }

  //Carrega todos os registros da tabela
async carregar() {
  try {
    const response = await fetch(this.apiUrl);
    if (!response.ok) throw new Error('Erro ao carregar registros');

    const data = await response.json();

    this.registros = data.registros || data; 

    return this.registros;

  } catch (error) {
    console.error(error);
    return [];
  }
}

  //Filtra registros por qualquer campo
  filtrar(campo, valor) {
    return this.registros.filter(r =>
      r[campo]?.toString().toLowerCase().includes(valor.toLowerCase())
    );
  }

  //Adiciona um novo registro
  async adicionar(dados) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      const novoRegistro = await response.json();
      this.registros.push(novoRegistro);
      return novoRegistro;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  //Atualiza um registro pelo id
  async atualizar(id, dadosAtualizados) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PUT', // ou PATCH dependendo da API
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados)
      });
      const registroAtualizado = await response.json();
      this.registros = this.registros.map(r => r.id === id ? registroAtualizado : r);
      return registroAtualizado;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  //Remove um registro pelo id
  async remover(id) {
    try {
      await fetch(`${this.apiUrl}/${id}`, { method: 'DELETE' });
      this.registros = this.registros.filter(r => r.id !== id);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

