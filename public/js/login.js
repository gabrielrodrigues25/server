async function buscarUsuario(){
  const cpf = document.getElementById("cpf").value;

  if (!cpf) {
    mostrarMensagem("Digite o CPF", "erro");
    return;
  }

  try {
    const res = await fetch(`auth/buscar-matricula?cpf=${cpf}`);

    if (!res.ok) {
      throw new Error("Erro na requisição");
    }

    const data = await res.json();

    if (data.erro) {
      mostrarMensagem("CPF não encontrado", "erro");
      return;
    }

    mostrarMensagem(
      `Olá ${data.nome}, sua matrícula é ${data.matricula}`,
      "sucesso"
    );

  } catch (err) {
    console.error(err);
    mostrarMensagem("Erro ao buscar usuário", "erro");
  }
}

document.addEventListener("DOMContentLoaded", () => {

  //informar qual é a senha
  const info = document.querySelector(".info-password");

if (info) {
  info.addEventListener("click", () => {
    mostrarMensagem("Sua senha é: 5 + sua matrícula", "sucesso");
  });
}

  const form = document.getElementById("formLogin");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); // impede abrir outra página

      const usuario = document.querySelector("[name='username']").value;
      const senha = document.querySelector("[name='password']").value;

      try {
        const res = await fetch("auth/log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ usuario, senha })
        });

        const data = await res.json();

        if (data.erro) {
          mostrarMensagem(data.erro, "erro");
          return;
        }

        // sucesso
        mostrarMensagem("Login realizado com sucesso", "sucesso");

        setTimeout(() => {
          window.location.href = "/home";
        }, 1000);

      } catch (err) {
        console.error(err);
        mostrarMensagem("Erro ao fazer login", "erro");
      }
    });
  }

  // MICROSOFT
  const btnMicrosoft = document.getElementById("loginMicrosoft");
  if (btnMicrosoft) {
    btnMicrosoft.addEventListener("click", () => {
      window.location.href = "/auth/microsoft";
    });
  }

  // OLHO SENHA
  const toggle = document.querySelector(".toggle-password");
  const inputSenha = document.getElementById("senha");

  if (toggle && inputSenha) {
    toggle.addEventListener("click", () => {
      if (inputSenha.type === "password") {
        inputSenha.type = "text";
        toggle.classList.remove("ri-eye-line");
        toggle.classList.add("ri-eye-off-line");
      } else {
        inputSenha.type = "password";
        toggle.classList.remove("ri-eye-off-line");
        toggle.classList.add("ri-eye-line");
      }
    });
  }

  // BOTÃO CPF
  const btnCPF = document.getElementById("btnBuscarCPF");
  if (btnCPF) {
    btnCPF.addEventListener("click", buscarUsuario);
  }

});