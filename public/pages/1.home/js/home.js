fetch(`${AUTH_URL}/usuario`)
  .then(res => res.json())
  .then(user => {
    const nome = user.nome || user.email;
    document.getElementById("welcome").innerText =
      `Seja bem-vindo, ${nome}!`;
  })
  .catch(() => {
    document.getElementById("welcome").innerText =
      "Seja bem-vindo!";
  });