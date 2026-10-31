(() => {
   try {
    if (sessionStorage.getItem("miss.session.v1")) return;
    const temConta = !!localStorage.getItem("miss.account.v1");
    window.location.replace(temConta ? "login.html" : "cadastro.html");
} catch {
    }
  })();