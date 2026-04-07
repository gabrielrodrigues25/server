async function carregarNavbar(){

  const resposta = await fetch("/navbar.html");
  const html = await resposta.text();

  document.getElementById("navbar").innerHTML = html;

}

carregarNavbar();