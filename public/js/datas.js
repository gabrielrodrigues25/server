
//Iniciar data com o dia atual
function definirTodasDatasHoje() {
    let hoje = new Date().toISOString().split('T')[0];

    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.value = hoje;
    });
}

// Formatar data para padrão brasileiro
function formatarData(data) {
  const dataSemHora = data.split("T")[0];
  const [ano, mes, dia] = dataSemHora.split("-");
  return `${dia}/${mes}/${ano}`;
}


//Formatar datas
function formatarDatasNaTela() {

  const elementos = document.querySelectorAll("body *");

  elementos.forEach(el => {

    if (el.children.length === 0) {

      let texto = el.innerText;

      if (!texto) return;

      // procura datas ISO: 2026-03-27 ou 2026-03-27T10:20:30
      const regex = /\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}Z?)?/g;

      const datas = texto.match(regex);

      if (datas) {

        datas.forEach(dataStr => {

          const data = new Date(dataStr);

          if (!isNaN(data)) {

            const dia = String(data.getDate()).padStart(2, "0");
            const mes = String(data.getMonth() + 1).padStart(2, "0");
            const ano = data.getFullYear();

            const novaData = `${dia}/${mes}/${ano}`;

            texto = texto.replace(dataStr, novaData);
          }

        });

        el.innerText = texto;

      }

    }

  });

}
