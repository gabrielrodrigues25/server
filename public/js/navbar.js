async function carregarNavbar(){

  const resposta = await fetch("../html/navbar.html");
  const html = await resposta.text();

  document.getElementById("navbar").innerHTML = html;

}

carregarNavbar();