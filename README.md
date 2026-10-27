# M!SS — protótipo web MVC

Protótipo responsivo baseado na referência visual enviada: identidade rosa/floral, marca M!SS, alertas de perigo e insegurança, contatos com prioridades e configurações.

## Executar
- Extraia o ZIP.
- Abra `index.html` ou, recomendado para recursos do navegador, execute com VS Code Live Server.
- Para geolocalização, use `localhost`/HTTPS e aceite a permissão do navegador.
- O recurso de voz depende do navegador e da disponibilidade da Web Speech API.

## MVC
- `js/model.js`: contatos, prioridades e histórico, persistidos no localStorage.
- `js/view.js`: navegação entre telas, renderização, modal de alerta e feedback.
- `js/controller.js`: eventos, geolocalização, comando de voz e fluxo de simulação.
- `index.html`: estrutura das telas.
- `css/styles.css`: identidade visual e responsividade.

## Funcionalidades demonstráveis
- Tela inicial com dois tipos de alerta.
- Contatos de demonstração com prioridade e reordenação.
- Adicionar/excluir contatos.
- Localização do navegador sob demanda.
- Comando de voz em navegadores compatíveis.
- Ajuste do tamanho do texto e tema escuro.
- Histórico local de simulações.
