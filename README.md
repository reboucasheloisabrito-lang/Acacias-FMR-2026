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

## Limitações importantes
Este protótipo não envia WhatsApp/SMS, não chama a polícia, não envia coordenadas e não confirma recebimento. Os contatos de exemplo são fictícios e servem somente para demonstração. Não utilize para situações reais de risco.

Para uma aplicação real, implemente backend seguro, autenticação, autorização e consentimento, proteção de dados pessoais, provedor de mensagens aprovado e procedimentos de emergência validados com os órgãos responsáveis. Não exponha chaves privadas de APIs no frontend.
