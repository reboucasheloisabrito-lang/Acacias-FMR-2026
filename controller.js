/* CONTROLLER: eventos e coordenação Model/View. */
(() => {
  let pendingType=null;
  const $=id=>document.getElementById(id);
  function refresh(){MissView.renderContacts(MissModel.getContacts());MissView.renderHistory(MissModel.getHistory());}
  document.querySelectorAll("[data-screen]").forEach(btn=>btn.addEventListener("click",()=>MissView.showScreen(btn.dataset.screen)));
  $("settingsButton").addEventListener("click",()=>MissView.showScreen("settingsScreen"));
  $("menuButton").addEventListener("click",()=>MissView.showScreen("contactsScreen"));
  $("addContactButton").addEventListener("click",()=>MissView.showScreen("addContactScreen"));
  $("contactForm").addEventListener("submit",e=>{
    e.preventDefault();const c=MissView.getFormData();
    if(!c.name||!c.phone)return;
    if(!MissModel.addContact(c)){MissView.showToast("Não foi possível salvar. Verifique o armazenamento do navegador.");return;}
    MissView.resetForm();refresh();MissView.showScreen("contactsScreen");MissView.showToast("Contato adicionado à sua rede de apoio.");
  });
  $("contactList").addEventListener("click",e=>{
    const del=e.target.closest("[data-delete]"),move=e.target.closest("[data-move]");
    if(del){const c=MissModel.getContacts().find(x=>x.id===del.dataset.delete);if(c&&confirm(`Excluir ${c.name} da lista?`)){MissModel.deleteContact(c.id);refresh();MissView.showToast("Contato removido.");}}
    if(move){MissModel.movePriority(move.dataset.move,Number(move.dataset.delta));refresh();}
  });
  function ask(type){pendingType=type;MissView.openAlert(type,MissModel.getContacts(),MissView.getLocation());}
  $("dangerButton").addEventListener("click",()=>ask("danger"));
  $("unsafeButton").addEventListener("click",()=>ask("unsafe"));
  $("alertForm").addEventListener("submit",e=>{
    if(e.submitter&&e.submitter.value==="cancel"){pendingType=null;return;}
    e.preventDefault();if(!pendingType)return;
    const contacts=MissModel.getContacts();
    const count=pendingType==="danger"?contacts.filter(c=>c.priority===1).length:contacts.length;
    MissModel.addHistory({type:pendingType,count,status:"demo_only"});
    MissView.closeAlert();refresh();
    MissView.showToast(pendingType==="danger"
      ?"Simulação registrada. Nenhum contato foi avisado; em emergência real, use um canal oficial."
      :"Simulação registrada. Nenhuma mensagem foi enviada.");
    pendingType=null;
  });
  $("locationButton").addEventListener("click",()=>{
    if(!("geolocation" in navigator)){MissView.showToast("Este navegador não oferece geolocalização.");return;}
    $("locationButton").textContent="Buscando…";
    navigator.geolocation.getCurrentPosition(
      pos=>{const l={lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy};MissView.setLocation(l);MissView.showToast("Localização obtida com sua autorização. Ela ainda não foi compartilhada.");},
      err=>{$("locationButton").textContent="Tentar";MissView.showToast(err.code===1?"Permissão de localização negada. Você pode continuar sem ela.":"Não foi possível obter a localização. Verifique GPS e conexão.");},
      {enableHighAccuracy:true,timeout:10000,maximumAge:30000}
    );
  });
  $("voiceButton").addEventListener("click",()=>{
    const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!Speech){MissView.showToast("Comando por voz não disponível neste navegador. Os botões continuam funcionando.");return;}
    const recognition=new Speech();recognition.lang="pt-BR";recognition.interimResults=false;recognition.maxAlternatives=1;
    MissView.showToast("Ouvindo… diga “perigo” ou “estou insegura”.");
    recognition.onresult=e=>{
      const phrase=e.results[0][0].transcript.toLowerCase();
      if(phrase.includes("perigo"))ask("danger");
      else if(phrase.includes("insegura")||phrase.includes("medo"))ask("unsafe");
      else MissView.showToast("Não reconheci o pedido. Toque em um dos botões para continuar.");
    };
    recognition.onerror=()=>MissView.showToast("Não foi possível reconhecer a fala. Use os botões da tela.");
    recognition.start();
  });
  document.querySelectorAll("[data-font]").forEach(btn=>btn.addEventListener("click",()=>{
    document.body.classList.remove("large-text","xlarge-text");
    if(btn.dataset.font==="large")document.body.classList.add("large-text");
    if(btn.dataset.font==="xlarge")document.body.classList.add("xlarge-text");
    document.querySelectorAll("[data-font]").forEach(b=>b.classList.toggle("selected",b===btn));
  }));
  $("themeToggle").addEventListener("click",()=>document.body.classList.toggle("dark"));
  refresh();
})();
