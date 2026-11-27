# Feature Specification: Remover a dependência do zTools

**Feature Branch**: `002-remove-ztools`
**Created**: 2026-11-27
**Status**: Draft
**Input**: User description: "Remova o ztools e implemente o que foi usado de forma direta"

## Contexto

Hoje o Viralt depende do zTools, um serviço intermediário compartilhado, para conversar com
provedores externos. Para que o Viralt funcione, o zTools precisa estar no ar e acessível. Um
levantamento do código mostrou o que é realmente usado:

| Capacidade do zTools | Situação no Viralt |
|---|---|
| Envio de e-mail (MailerSend) | **Em uso**: o e-mail de "você ganhou" enviado aos vencedores de um sorteio |
| Armazenamento de arquivos (S3) | Existe uma camada pronta (upload e URL de arquivo), mas **nenhuma tela ou endpoint a chama** |
| Geração de slugs | Registrada, mas **nunca usada** |
| IA (ChatGPT / DALL-E) | **Não usada** |

O objetivo é que o Viralt deixe de depender do zTools e fale diretamente com os provedores
das capacidades que de fato usa, sem que administradores ou participantes percebam diferença.

## Clarifications

### Session 2026-11-27

- Q: Como os arquivos no S3 serão acessados? → A: Pasta `viralt/` com leitura pública; a URL é permanente e pode ser guardada no banco.
- Q: O que acontece quando um envio falha no meio do "notificar todos"? → A: Continua com os demais e devolve um resumo (quantos foram notificados e quais falharam, com o motivo).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vencedor continua recebendo o e-mail de premiação (Priority: P1)

O administrador de uma campanha sorteia os vencedores e manda notificá-los. Cada vencedor
recebe um e-mail de parabéns com o nome da campanha, exatamente como hoje, mas sem que o
zTools precise estar no ar.

**Why this priority**: é a única capacidade do zTools em uso. Se ela quebrar, os vencedores
não são avisados, o que afeta diretamente a credibilidade do sorteio.

**Independent Test**: sortear um vencedor numa campanha de teste e acionar a notificação com o
zTools desligado. O e-mail deve chegar na caixa do vencedor e o vencedor deve aparecer como
"notificado".

**Acceptance Scenarios**:

1. **Given** uma campanha com um vencedor que tem e-mail cadastrado, **When** o administrador
   notifica esse vencedor, **Then** o vencedor recebe o e-mail de parabéns com o nome da
   campanha e passa a constar como notificado.
2. **Given** uma campanha com vários vencedores, **When** o administrador usa "notificar
   todos", **Then** cada vencedor com e-mail recebe a sua mensagem e o administrador vê um
   resumo com quantos foram notificados.
3. **Given** um "notificar todos" em que o envio falha para alguns vencedores, **When** o
   processo termina, **Then** os demais vencedores foram notificados mesmo assim, e o resumo
   lista os que falharam com o motivo de cada falha. Esses continuam não notificados.
4. **Given** que o provedor de e-mail recusa ou não responde ao envio, **When** o administrador
   tenta notificar, **Then** o vencedor **não** é marcado como notificado e o administrador
   recebe uma mensagem de erro clara.
5. **Given** um vencedor sem e-mail cadastrado, **When** o administrador tenta notificá-lo,
   **Then** o comportamento atual se mantém: a notificação é recusada com o aviso de que falta
   o e-mail.

---

### User Story 2 - Viralt sobe e opera sem o zTools (Priority: P1)

A equipe que mantém o Viralt sobe a aplicação em desenvolvimento, homologação (Docker) ou
produção sem precisar do serviço zTools nem de nenhuma configuração dele.

**Why this priority**: é o motivo da mudança. Enquanto houver referência ao zTools, o
ambiente continua dependendo de um serviço externo a mais.

**Independent Test**: subir o Viralt num ambiente sem o zTools e sem as variáveis dele, e usar
as funcionalidades principais (criar campanha, inscrever participante, sortear, notificar).

**Acceptance Scenarios**:

1. **Given** um ambiente sem o serviço zTools, **When** o Viralt é iniciado, **Then** ele sobe
   normalmente e todas as funcionalidades existentes continuam disponíveis.
2. **Given** os arquivos de configuração e de ambiente do projeto, **When** são revisados,
   **Then** não há nenhuma configuração, variável ou referência ao zTools.
3. **Given** que a configuração do provedor de e-mail está ausente, **When** o Viralt é
   iniciado, **Then** a falha aparece de forma clara: na inicialização ou na primeira
   tentativa de envio, com mensagem que indica qual configuração falta.

---

### User Story 3 - Armazenamento de arquivos direto no S3 (Priority: P3)

A camada de armazenamento de arquivos (enviar arquivo e obter a URL dele) é reimplementada
falando direto com o S3. Ela passa a gravar no bucket compartilhado da Emagine, dentro de uma
pasta exclusiva do Viralt, e não mais no bucket "monexup", herdado de outro projeto. Assim, ela
fica pronta para funcionalidades futuras, como o upload do concurso de foto/vídeo.

**Why this priority**: nenhuma funcionalidade usa essa camada hoje, então os usuários atuais
não são afetados. O valor está em deixar o armazenamento pronto e no lugar certo.

**Independent Test**: enviar um arquivo de teste pela camada de armazenamento, conferir que
ele aparece na pasta do Viralt dentro do bucket da Emagine e abrir a URL retornada.

**Acceptance Scenarios**:

1. **Given** a configuração do S3 de um ambiente, **When** um arquivo é enviado pela camada de
   armazenamento, **Then** ele é gravado no bucket da Emagine, dentro da pasta `viralt/`, e
   nunca fora dela.
2. **Given** um arquivo já enviado, **When** a URL dele é solicitada, **Then** a URL retornada
   é pública e permanente, e abre o arquivo sem autenticação.
3. **Given** dois arquivos enviados com o mesmo nome original, **When** ambos são gravados,
   **Then** nenhum sobrescreve o outro.
4. **Given** um nome de arquivo vazio, **When** a URL é solicitada, **Then** o retorno é vazio,
   como acontece hoje.
5. **Given** credenciais do S3 ausentes ou inválidas, **When** um envio é tentado, **Then** a
   falha vem com uma mensagem clara que indica o problema de configuração.

---

### Edge Cases

- O provedor de e-mail fica fora do ar ou demora a responder durante um "notificar todos": o
  processo não para. Os vencedores cujo envio falhou **não** são marcados como notificados,
  aparecem no resumo e podem ser notificados de novo depois. Um novo "notificar todos" só tenta
  os que ainda não foram notificados.
- Vencedor sem e-mail cadastrado durante um "notificar todos": ele aparece no resumo como falha
  ("sem e-mail") e não interrompe os demais.
- A credencial do provedor de e-mail é inválida ou expirou: o erro vem com uma mensagem que
  aponta a credencial, e não com um erro genérico.
- Nome de vencedor ou título de campanha com caracteres especiais ou HTML: o e-mail continua
  legível e não quebra o layout.
- Remetente não verificado no provedor de e-mail: o envio falha com uma mensagem clara, em vez
  de o vencedor ser marcado como notificado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST enviar o e-mail de premiação diretamente pelo provedor de e-mail
  (MailerSend), sem passar pelo zTools.
- **FR-002**: O conteúdo do e-mail de premiação (remetente, assunto, texto e nome da campanha)
  MUST ser igual ao enviado hoje.
- **FR-003**: O sistema MUST marcar um vencedor como notificado **somente** depois que o
  provedor confirmar que aceitou o envio.
- **FR-004**: Quando o envio falhar, o sistema MUST informar ao administrador o motivo, de
  forma compreensível, e manter o vencedor como não notificado.
- **FR-005**: No "notificar todos", uma falha individual MUST NOT interromper o envio aos
  demais vencedores. Ao final, o sistema MUST devolver um resumo com o total notificado e a
  lista de vencedores que falharam, cada um com o motivo. Não há nova tentativa automática.
- **FR-006**: As credenciais e o remetente do provedor de e-mail MUST vir da configuração do
  ambiente, nunca do código, e nunca podem ser expostos ao frontend.
- **FR-007**: O sistema MUST deixar de exigir o serviço zTools e a configuração dele em todos
  os ambientes (desenvolvimento, homologação e produção).
- **FR-008**: Todas as referências ao zTools MUST ser removidas: dependência do pacote,
  registros de serviço, seções de configuração, variáveis de ambiente e exemplos de `.env`.
- **FR-009**: As capacidades do zTools que nunca foram usadas (geração de slugs e IA) MUST ser
  removidas sem substituto.
- **FR-010**: O sistema MUST manter as capacidades "enviar arquivo" e "obter a URL de um
  arquivo", agora falando direto com o S3.
- **FR-011**: Os arquivos MUST ser gravados no bucket compartilhado da Emagine, sempre dentro
  da pasta `viralt/`. O Viralt nunca grava fora dessa pasta.
- **FR-012**: Bucket, pasta, região/endpoint e credenciais do S3 MUST vir da configuração do
  ambiente. As credenciais nunca podem ser expostas ao frontend.
- **FR-013**: Cada arquivo enviado MUST receber um nome único dentro da pasta, para que um
  envio nunca sobrescreva outro arquivo.
- **FR-014**: As URLs dos arquivos MUST ser públicas e permanentes, sem expiração e sem
  assinatura, para que possam ser guardadas e exibidas diretamente em páginas públicas e no
  widget.
- **FR-015**: A documentação do projeto (constituição, CLAUDE.md, README) MUST deixar de
  indicar o zTools como dependência obrigatória e passar a descrever a integração direta.

### Key Entities

- **E-mail de premiação**: mensagem enviada a um vencedor. Tem remetente, destinatário (nome e
  e-mail do participante), assunto e corpo com o nome da campanha.
- **Vencedor**: participante sorteado em uma campanha. A marcação "notificado" depende do
  envio bem-sucedido do e-mail de premiação.
- **Configuração do provedor de e-mail**: credencial de acesso e remetente padrão, definidos
  por ambiente.
- **Arquivo armazenado**: arquivo enviado ao S3. Tem nome único, fica dentro da pasta `viralt/`
  do bucket da Emagine e tem uma URL de acesso.
- **Configuração de armazenamento**: bucket, pasta (`viralt/`), região/endpoint e credenciais,
  definidos por ambiente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com o zTools desligado, 100% das notificações de vencedor com e-mail válido
  chegam ao destinatário.
- **SC-002**: O Viralt sobe e passa por todos os fluxos existentes (criar campanha, inscrever,
  sortear, notificar) num ambiente sem o zTools, sem nenhum erro novo.
- **SC-003**: A busca por "zTools" no repositório não encontra mais nada, exceto no histórico
  de specs e no registro de mudanças da constituição.
- **SC-004**: Nenhum vencedor fica marcado como notificado sem ter recebido o e-mail, nem mesmo
  quando o provedor de e-mail falha.
- **SC-005**: 100% dos arquivos enviados ficam dentro da pasta `viralt/` do bucket da Emagine, e
  a URL de cada um abre o arquivo enviado.
- **SC-006**: Num "notificar todos", uma falha isolada nunca impede os demais vencedores de
  receberem o e-mail, e o resumo final mostra 100% dos vencedores que falharam.
- **SC-007**: O tempo para notificar um vencedor não aumenta em relação ao fluxo atual.

## Assumptions

- O provedor de e-mail continua sendo o MailerSend. Trocar de provedor está fora do escopo.
- A equipe tem, ou vai obter, uma credencial de API do MailerSend e um domínio de remetente
  verificado para cada ambiente.
- O remetente atual (`noreply@viralt.com`, "Viralt") passa a vir da configuração, mantendo o
  mesmo valor padrão.
- O bucket compartilhado se chama "Emagine". Como nomes de bucket S3 só aceitam letras
  minúsculas, o nome real é `emagine`. A pasta do Viralt é `viralt/`. Os dois valores vêm da
  configuração.
- O bucket da Emagine já existe e é administrado fora do Viralt. Criar ou configurar o bucket
  (permissões, CORS, política de leitura) está fora do escopo.
- A pasta `viralt/` do bucket da Emagine permite leitura pública. Liberar essa leitura no bucket
  é responsabilidade de quem administra o bucket.
- Nenhum arquivo do bucket "monexup" precisa ser migrado, porque nenhuma funcionalidade
  gravou nele.
- O upload de imagem de usuário continua via NAuth, que não depende do zTools, e fica fora do
  escopo.
- O upload do concurso de foto/vídeo hoje chama um endpoint que não existe no backend. Corrigir
  isso está fora do escopo desta feature, mas é registrado como pendência.
- A constituição v3.0.0 (2026-11-27) já retirou a obrigação do zTools e proíbe o uso dele.
  O Princípio X agora define as integrações diretas com MailerSend e S3.
