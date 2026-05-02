fetch(`/usuario`)
  .then(res => res.json())
  .then(user => {
    document.getElementById("welcome").innerText =
      `Seja bem-vindo, ${user.nome}!`;
  })
  .catch(() => {
    document.getElementById("welcome").innerText =
      "Seja bem-vindo!";
  });