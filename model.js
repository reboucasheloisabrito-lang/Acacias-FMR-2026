/* MODEL: dados de demonstração e persistência local. */
const MissModel = (() => {
  const CONTACTS_KEY = "miss.contacts.v1";
  const HISTORY_KEY = "miss.history.v1";
  const defaults = [
    {id:"demo-1", name:"Polícia", phone:"190", role:"Polícia / serviço oficial", priority:1, demo:true},
    {id:"demo-2", name:"Filha", phone:"(43) 99999-1234", role:"Familiar", priority:1, demo:true},
    {id:"demo-3", name:"Vizinha Maria", phone:"(43) 98888-7654", role:"Vizinha(o)", priority:2, demo:true},
    {id:"demo-4", name:"Neta", phone:"(43) 97777-4321", role:"Familiar", priority:2, demo:true},
    {id:"demo-5", name:"Vizinho João", phone:"(43) 92222-3344", role:"Vizinha(o)", priority:3, demo:true}
  ];
  function read(key, fallback=[]) {
    try { const v = JSON.parse(localStorage.getItem(key)); return Array.isArray(v) ? v : fallback; }
    catch { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  }
  function getContacts() {
    const saved = read(CONTACTS_KEY, null);
    if (saved) return saved;
    write(CONTACTS_KEY, defaults);
    return [...defaults];
  }
  function saveContacts(contacts) { return write(CONTACTS_KEY, contacts); }
  function addContact(contact) {
    const contacts = getContacts();
    contacts.push({...contact, id: `c-${Date.now()}`, demo:false});
    return saveContacts(contacts);
  }
  function deleteContact(id) { return saveContacts(getContacts().filter(c => c.id !== id)); }
  function movePriority(id, delta) {
    const contacts = getContacts().sort((a,b) => a.priority-b.priority);
    const index = contacts.findIndex(c => c.id === id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= contacts.length) return;
    [contacts[index], contacts[target]] = [contacts[target], contacts[index]];
    contacts.forEach((c,i) => c.priority = i < 2 ? (i+1) : (i < 4 ? 2 : 3));
    saveContacts(contacts);
  }
  function getHistory() { return read(HISTORY_KEY); }
  function addHistory(item) {
    const events = getHistory();
    events.unshift({...item, id: String(Date.now()), at: new Date().toISOString()});
    return write(HISTORY_KEY, events.slice(0,15));
  }
  return {getContacts, addContact, deleteContact, movePriority, getHistory, addHistory};
})();
