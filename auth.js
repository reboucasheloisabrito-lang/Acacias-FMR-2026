(() => {
    const SESSION_KEY = "miss.session.v1";  
    const ACCOUNT_KEY = "miss.account.v1";   
    const $ = id => document.getElementById(id);

    async function registrarConta(dados) { return { ok: true }; }
    async function autenticar(email, senha) { return { ok: true }; }
  
    function lerConta() { try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY)); } catch { return null; } }
    function salvarConta(perfil) { try { localStorage.setItem(ACCOUNT_KEY, JSON.stringify(perfil)); return true; } catch { return false; } }
    function iniciarSessao(email) { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email, at: Date.now() })); return true; } catch { return false; } }
  
    function mensagem(el, texto, tipo) {
      if (!el) return;
      el.textContent = texto || "";
      el.className = "form-hint" + (tipo ? " " + tipo : "");
      el.hidden = !texto;
    }
  
    function iniciarCadastro(form) {
      const cep = $("cep"), rua = $("rua"), bairro = $("bairro"), numero = $("numero"), status = $("cepStatus");
      let consulta = 0;
  
      const digitos = s => s.replace(/\D/g, "").slice(0, 8);
      const mascara = d => d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  
      async function buscarCep(d) {
        const id = ++consulta;
        mensagem(status, "Buscando endereço…");
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000);
        try {
          const resp = await fetch(`https://viacep.com.br/ws/${d}/json/`, { signal: ctrl.signal });
          if (!resp.ok) throw new Error("http " + resp.status);
          const dados = await resp.json();
          if (id !== consulta) return;                       // o CEP mudou durante a busca
          if (dados.erro) { mensagem(status, "CEP não encontrado. Preencha rua e bairro manualmente.", "error"); return; }
          if (dados.logradouro) rua.value = dados.logradouro;
          if (dados.bairro) bairro.value = dados.bairro;
          if (dados.logradouro && dados.bairro) {
            mensagem(status, "Endereço preenchido. Informe o número.", "ok");
            numero.focus();
          } else {
            mensagem(status, "Este CEP não traz rua ou bairro. Complete manualmente.", "error");
          }
        } catch {
          if (id === consulta) mensagem(status, "Não foi possível buscar o CEP agora. Preencha rua e bairro manualmente.", "error");
        } finally {
          clearTimeout(timer);
        }
      }
  
      cep.addEventListener("input", () => {
        consulta++;                                          // invalida buscas em andamento
        const d = digitos(cep.value);
        cep.value = mascara(d);
        if (d.length === 8) buscarCep(d); else mensagem(status, "");
      });
  
      form.addEventListener("submit", async e => {
        e.preventDefault();
        const dados = Object.fromEntries(new FormData(form));
        const { senha, ...perfil } = dados;                  // a senha nunca é guardada no navegador
        const r = await registrarConta(dados);
        if (!r.ok) { mensagem($("cadastroStatus"), r.erro || "Não foi possível concluir o cadastro.", "error"); return; }
        salvarConta(perfil);
        window.location.href = "login.html?cadastro=ok";
      });
    }
  
    function iniciarLogin(form) {
      const status = $("loginStatus");
      const conta = lerConta();
      if (conta && conta.email) $("email").value = conta.email;
      if (new URLSearchParams(window.location.search).get("cadastro") === "ok") {
        mensagem(status, "Cadastro concluído! Entre para continuar.", "ok");
      }
  
      form.addEventListener("submit", async e => {
        e.preventDefault();
        const email = $("email").value.trim(), senha = $("senha").value, confirmar = $("confirmar").value;
        if (senha !== confirmar) {
          mensagem(status, "As senhas não são iguais.", "error");
          $("confirmar").focus();
          return;
        }
        const r = await autenticar(email, senha);
        if (!r.ok) { mensagem(status, r.erro || "E-mail ou senha incorretos.", "error"); return; }
        iniciarSessao(email);
        window.location.href = "index.html";
      });
    }
  
    const formCadastro = $("cadastro"), formLogin = $("login");
    if (formCadastro) iniciarCadastro(formCadastro);
    if (formLogin) iniciarLogin(formLogin);
  })();