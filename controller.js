/* CONTROLLER: eventos e coordenação Model/View. */
(() => {
  let pendingType=null, sent=false;
  const $=id=>document.getElementById(id);
  const on=(id,ev,fn)=>{const el=$(id);if(el)el.addEventListener(ev,fn);};
  function refresh(){MissView.renderContacts(MissModel.getContacts());MissView.renderHistory(MissModel.getHistory());}

  /* ---------- mensagem e links de envio ---------- */
  function buildMessage(type,loc){
    const base=type==="danger"
      ?"🚨 ALERTA M!SS — PERIGO IMINENTE! Maria precisa de ajuda AGORA. Por favor, entre em contato ou acione a polícia (190)."
      :"💛 M!SS — Maria está se sentindo insegura e pediu que você entre em contato com ela assim que possível.";
    const where=loc?` Localização: https://www.google.com/maps?q=${loc.lat},${loc.lng}`:" (Localização não disponível.)";
    return base+where;
  }
  function linkFor(contact,message){
    const digits=String(contact.phone).replace(/\D/g,"");
    if(digits.length<=3) return {href:`tel:${digits}`,label:`📞 Ligar para ${contact.name} (${digits})`};
    const full=(digits.length===10||digits.length===11)?`55${digits}`:digits;
    return {href:`https://wa.me/${full}?text=${encodeURIComponent(message)}`,label:`💬 WhatsApp — ${contact.name}`};
  }
  function recipientsFor(type){
    const all=[...MissModel.getContacts()].sort((a,b)=>a.priority-b.priority);
    return type==="danger"?all.filter(c=>c.priority===1):all;
  }
  function tryLocation(){
    if(MissView.getLocation()||!("geolocation" in navigator))return;
    navigator.geolocation.getCurrentPosition(
      pos=>MissView.setLocation({lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy}),
      ()=>{},{enableHighAccuracy:true,timeout:8000,maximumAge:30000});
  }

  /* ---------- navegação e contatos ---------- */
  document.querySelectorAll("[data-screen]").forEach(btn=>btn.addEventListener("click",()=>MissView.showScreen(btn.dataset.screen)));
  on("settingsButton","click",()=>MissView.showScreen("settingsScreen"));
  on("menuButton","click",()=>MissView.showScreen("contactsScreen"));
  on("addContactButton","click",()=>MissView.showScreen("addContactScreen"));
  on("contactForm","submit",e=>{
    e.preventDefault();const c=MissView.getFormData();
    if(!c.name||!c.phone)return;
    if(!MissModel.addContact(c)){MissView.showToast("Não foi possível salvar. Verifique o armazenamento do navegador.");return;}
    MissView.resetForm();refresh();MissView.showScreen("contactsScreen");MissView.showToast("Contato adicionado à sua rede de apoio.");
  });
  on("contactList","click",e=>{
    const del=e.target.closest("[data-delete]"),move=e.target.closest("[data-move]");
    if(del){const c=MissModel.getContacts().find(x=>x.id===del.dataset.delete);if(c&&confirm(`Excluir ${c.name} da lista?`)){MissModel.deleteContact(c.id);refresh();MissView.showToast("Contato removido.");}}
    if(move){MissModel.movePriority(move.dataset.move,Number(move.dataset.delta));refresh();}
  });

  /* ---------- alertas ---------- */
  function ask(type){pendingType=type;sent=false;tryLocation();MissView.openAlert(type,MissModel.getContacts(),MissView.getLocation());}
  on("dangerButton","click",()=>ask("danger"));
  on("unsafeButton","click",()=>ask("unsafe"));
  on("alertForm","submit",e=>{
    if(sent||(e.submitter&&e.submitter.value==="cancel")){pendingType=null;sent=false;return;} // deixa o <dialog> fechar
    e.preventDefault();if(!pendingType)return;
    const recipients=recipientsFor(pendingType);
    if(!recipients.length){MissView.showToast("Nenhum contato cadastrado para receber o alerta.");return;}
    const message=buildMessage(pendingType,MissView.getLocation());
    const links=recipients.map(c=>linkFor(c,message));
    MissModel.addHistory({type:pendingType,count:recipients.length,status:"sent"});
    refresh();
    sent=true;
    MissView.showSendLinks(links);
    window.open(links[0].href,"_blank","noopener");   // redireciona para o primeiro contato (gesto do usuário)
    MissView.showToast(pendingType==="danger"
      ?"Alerta aberto para o 1º contato. Envie aos demais e, se possível, ligue 190."
      :"Pedido aberto para o 1º contato. Envie aos demais pela lista.");
  });

  /* ---------- localização ---------- */
  on("locationButton","click",()=>{
    if(!("geolocation" in navigator)){MissView.showToast("Este navegador não oferece geolocalização.");return;}
    $("locationButton").textContent="Buscando…";
    navigator.geolocation.getCurrentPosition(
      pos=>{MissView.setLocation({lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy});MissView.showToast("Localização obtida. Ela será incluída nos alertas.");},
      err=>{$("locationButton").textContent="Tentar";MissView.showToast(err.code===1?"Permissão de localização negada. Você pode continuar sem ela.":"Não foi possível obter a localização. Verifique GPS e conexão.");},
      {enableHighAccuracy:true,timeout:10000,maximumAge:30000}
    );
  });

  /* ---------- voz ---------- */
  on("voiceButton","click",()=>{
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

  /* ---------- ajustes ---------- */
  document.querySelectorAll("[data-font]").forEach(btn=>btn.addEventListener("click",()=>{
    document.body.classList.remove("large-text","xlarge-text");
    if(btn.dataset.font==="large")document.body.classList.add("large-text");
    if(btn.dataset.font==="xlarge")document.body.classList.add("xlarge-text");
    document.querySelectorAll("[data-font]").forEach(b=>b.classList.toggle("selected",b===btn));
  }));
  on("themeToggle","click",()=>document.body.classList.toggle("dark"));
  refresh();
})();
