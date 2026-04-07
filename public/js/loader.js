function mostrarLoader(){
  document.getElementById("loaderGlobal").style.display = "flex";
}

function esconderLoader(){
  document.getElementById("loaderGlobal").style.display = "none";
}

// Função para mostrar mensagens
function mostrarMensagem(msg, tipo) {
  let div = document.getElementById("mensagem");
  if (!div) {
    div = document.createElement("div");
    div.id = "mensagem";
    div.style.position = "fixed";
    div.style.top = "10px";
    div.style.right = "10px";
    div.style.padding = "10px 20px";
    div.style.borderRadius = "5px";
    div.style.zIndex = "9999";
    div.style.color = "#fff";
    document.body.appendChild(div);
  }

  div.innerText = msg;

  if (tipo === "sucesso") div.style.backgroundColor = "green";
  else if (tipo === "erro") div.style.backgroundColor = "red";

  // Remove a mensagem depois de 3 segundos
  setTimeout(() => div.remove(), 3000);
}