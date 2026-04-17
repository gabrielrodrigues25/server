function loginMicrosoft() {
  window.location.href = "/auth/microsoft";
}

document.getElementById("login").addEventListener("click", loginMicrosoft);