fetch(`/usuario`)
  .then(res => res.json())
  .then(user => {
    document.getElementById("welcome").innerText =
      `Seja Bem-Vindo, ${user.nome}!`;
  })
  .catch(() => {
    document.getElementById("welcome").innerText =
      "Seja Bem-Vindo!";
  });