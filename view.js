/* VIEW: desenha as telas e mostra mensagens. */
const MissView = (() => {
  const $ = id => document.getElementById(id);
  let lastLocation = null;

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.id === id));
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.screen === id));
    window.scrollTo({top:0, behavior:"smooth"});
  }
  function renderContacts(contacts) {
    const list = $("contactList"); list.replaceChildren();
    [...contacts].sort((a,b)=>a.priority-b.priority).forEach(c => {
      const item = document.createElement("article"); item.className="contact-item";
      const avatar=document.createElement("span"); avatar.className="contact-avatar"; avatar.textContent=c.role.includes("Polícia")?"✚":c.name.trim().charAt(0).toUpperCase();
      const details=document.createElement("div"); details.className="contact-details";
      const name=document.createElement("strong"); name.textContent=c.name;
      const phone=document.createElement("small"); phone.textContent=c.phone;
      const tag=document.createElement("span"); tag.className=`priority-tag ${c.priority===2?"p2":c.priority===3?"p3":""}`; tag.textContent=`PRIORIDADE ${c.priority}`;
      details.append(name,phone,tag);
      const actions=document.createElement("div"); actions.className="contact-actions";
      const up=document.createElement("button"); up.textContent="↑"; up.title=`Aumentar prioridade de ${c.name}`; up.dataset.move=c.id; up.dataset.delta="-1";
      const down=document.createElement("button"); down.textContent="↓"; down.title=`Diminuir prioridade de ${c.name}`; down.dataset.move=c.id; down.dataset.delta="1";
      const del=document.createElement("button"); del.textContent="×"; del.title=`Excluir ${c.name}`; del.dataset.delete=c.id;
      actions.append(up,down,del); item.append(avatar,details,actions); list.append(item);
    });
  }
  function renderHistory(events) {
    const list=$("historyList"); list.replaceChildren(); $("historyEmpty").hidden=events.length>0;
    events.forEach(e=>{
      const item=document.createElement("article");item.className="history-item";
      const dot=document.createElement("span");dot.className=`history-dot ${e.type==="danger"?"urgent":""}`;
      const body=document.createElement("div");
      const title=document.createElement("strong");title.textContent=e.type==="danger"?"Simulação: perigo iminente":"Simulação: estou insegura";
      const time=document.createElement("small");time.textContent=new Date(e.at).toLocaleString("pt-BR");
      const status=document.createElement("small");status.textContent=`${e.count} contato(s) considerados. Nenhuma mensagem enviada.`;
      body.append(title,time,status);item.append(dot,body);list.append(item);
    });
  }
  function showToast(message) {
    const toast=$("toast");toast.textContent=message;toast.hidden=false;
    window.clearTimeout(showToast.timer);showToast.timer=window.setTimeout(()=>toast.hidden=true,4500);
  }
  function openAlert(type, contacts, location) {
    const urgent=type==="danger", dialog=$("alertDialog");
    $("modalIcon").className=`modal-icon ${urgent?"urgent":"worried"}`;
    $("modalIcon").textContent=urgent?"!":"♡";
    $("modalEyebrow").textContent=urgent?"ALERTA PRIORITÁRIO":"PEDIDO DE ACOMPANHAMENTO";
    $("modalTitle").textContent=urgent?"Você está em perigo iminente?":"Você está se sentindo insegura?";
    $("modalDescription").textContent=urgent
      ?"Vamos simular um pedido urgente para os contatos de prioridade 1 e, em seguida, os demais contatos da sua rede."
      :"Vamos simular uma mensagem pedindo que sua rede de confiança entre em contato com você.";
    const recipients=urgent?contacts.filter(c=>c.priority===1):contacts;
    $("modalRecipients").textContent=recipients.length
      ? `Destinatários previstos: ${recipients.map(c=>c.name).join(", ")}.`
      :"Nenhum contato cadastrado ainda.";
    $("modalLocation").hidden=!location;
    $("modalLocation").textContent=location?`Localização disponível nesta sessão: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}. A localização não será enviada neste protótipo.`:"";
    $("confirmAlert").textContent=urgent?"Simular alerta urgente":"Simular pedido de apoio";
    if(dialog.showModal) dialog.showModal();
    return recipients;
  }
  function closeAlert(){ $("alertDialog").close(); }
  function getFormData(){return {name:$("nameInput").value.trim(),phone:$("phoneInput").value.trim(),role:$("roleInput").value,priority:Number($("priorityInput").value)};}
  function resetForm(){ $("contactForm").reset(); }
  function getLocation(){return lastLocation;}
  function setLocation(location) {
    lastLocation=location;
    $("locationTitle").textContent="Localização obtida";
    $("locationText").textContent=`Precisão aproximada: ${Math.round(location.accuracy)} m.`;
    $("locationButton").textContent="Atualizar";
  }
  return {showScreen,renderContacts,renderHistory,showToast,openAlert,closeAlert,getFormData,resetForm,setLocation,getLocation};
})();
