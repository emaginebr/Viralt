# Feature Specification: Migrar o frontend para a nova base de build e estilização

**Feature Branch**: `003-frontend-vite-tailwind`
**Created**: 2026-11-27
**Status**: Draft
**Input**: User description: "Ajustar a pendencia -> FRONTEND-VITE: migrar o frontend de CRA + Bootstrap para Vite + Tailwind."

## Contexto

A constitution v4.0.0 define um padrão de frontend que o Viralt ainda não segue. Hoje o frontend
é construído com uma ferramenta de build descontinuada, e a estilização usa um framework de
componentes que a constitution proíbe. A seção "Transição" da constitution registra a pendência
`TODO(FRONTEND-VITE)`, e esta feature a resolve.

O frontend tem 27 telas, por exemplo painel, construtor de campanha, página pública da campanha,
widget embarcável, seleção de vencedores, moderação de envios, produtos, pedidos, faturas, perfis e
login. Cerca de 41 arquivos usam componentes do framework de estilização atual.

Quem é afetado:

- **Organizador de campanhas** (usuário logado): usa o painel administrativo.
- **Participante** (público): abre a página pública da campanha e o widget embarcado em sites de
  terceiros.
- **Equipe de desenvolvimento e operação**: faz build, executa localmente e publica o frontend.

## Clarifications

### Session 2026-11-27

- Q: Aparência das telas: paridade visual ou novo design? → A: Novo design system definido pelo
  `ux-designer` antes da implementação.
- Q: Forma de entrega: de uma vez ou em etapas? → A: De uma vez (build, design e remoção do
  framework antigo na mesma entrega).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Participante se inscreve na campanha com o novo visual (Priority: P1)

O participante abre a página pública de uma campanha, ou o widget embarcado num site parceiro,
preenche o formulário, cumpre as ações de entrada e confirma a inscrição. O visual é o do novo
design system, e o comportamento continua o mesmo de antes da migração.

**Why this priority**: a página pública e o widget são a fonte de receita do produto, porque é ali
que as inscrições acontecem. Uma regressão nessa área afeta todos os clientes de uma vez.

**Independent Test**: com uma campanha ativa, abrir a página pública e o widget num celular e num
desktop, completar uma inscrição e confirmar que ela aparece na lista de participantes.

**Acceptance Scenarios**:

1. **Given** uma campanha ativa, **When** o participante abre a página pública num celular,
   **Then** o layout se adapta à tela e todos os campos, botões e ações de entrada ficam visíveis e
   utilizáveis.
2. **Given** o widget embarcado num site de terceiros, **When** o participante se inscreve,
   **Then** o widget não herda nem altera a aparência do site hospedeiro, e a inscrição é registrada.
3. **Given** um formulário com campo obrigatório vazio, **When** o participante tenta enviar,
   **Then** a mensagem de erro aparece ligada ao campo e é anunciada a leitores de tela.

---

### User Story 2 - Organizador usa o painel administrativo normalmente (Priority: P1)

O organizador entra no sistema e usa as telas administrativas para criar e editar campanhas, ver
participantes, sortear e notificar vencedores, moderar envios e gerenciar produtos, pedidos,
faturas, redes e perfis. As telas seguem o novo design system, e todas as funções continuam as
mesmas de antes.

**Why this priority**: é o produto do ponto de vista de quem paga. Ele precisa continuar operável
no dia da troca.

**Independent Test**: percorrer o roteiro de regressão de todas as 27 telas, logado como
organizador, executando a ação principal de cada uma.

**Acceptance Scenarios**:

1. **Given** um organizador logado, **When** ele navega por qualquer uma das 27 telas, **Then** a
   tela carrega sem erro e a ação principal dela funciona.
2. **Given** uma tela com modal, por exemplo de confirmação, **When** o organizador abre o modal,
   **Then** o foco fica preso no modal, `Esc` o fecha e o foco volta ao elemento de origem.
3. **Given** uma mensagem de sucesso ou erro, por exemplo o resumo de "notificar todos", **When**
   ela aparece, **Then** é exibida com destaque e anunciada a leitores de tela.
4. **Given** a troca de idioma (pt, en, es), **When** o organizador muda o idioma, **Then** os
   textos de todas as telas mudam e o atributo de idioma do documento acompanha a escolha.

---

### User Story 3 - Organizador aprova o novo design system antes da implementação (Priority: P1)

O `ux-designer` apresenta a direção visual, os tokens, os componentes base e os mockups das telas
principais. O organizador, ou seja, o dono do produto, revisa e aprova antes de qualquer tela ser
reescrita.

**Why this priority**: com redesign e entrega única, aprovar o design antes evita retrabalho nas
27 telas.

**Independent Test**: revisar o pacote de design (tokens, especificações de componentes e
mockups) e registrar a aprovação.

**Acceptance Scenarios**:

1. **Given** o pacote de design entregue, **When** os tokens são verificados, **Then** todas as
   combinações de texto e fundo atingem o contraste AA.
2. **Given** os mockups das telas públicas e de uma lista e um formulário administrativos,
   **When** o dono do produto os revisa, **Then** ele aprova ou pede ajustes antes do início da
   implementação.

---

### User Story 4 - Equipe constrói, executa e publica o frontend com a nova base (Priority: P2)

A equipe instala as dependências sem contornos especiais, sobe o ambiente local, gera o build de
produção e publica a imagem do frontend, tudo com a nova ferramenta de build e as novas variáveis
de ambiente.

**Why this priority**: tira o projeto de uma ferramenta descontinuada e cumpre a constitution, mas
o usuário final só sente o efeito indiretamente, pelas outras histórias.

**Independent Test**: num clone limpo, instalar as dependências, iniciar o ambiente local, gerar o
build de produção e construir a imagem do container. Todas as etapas devem passar sem erro e sem
contornos.

**Acceptance Scenarios**:

1. **Given** um clone limpo, **When** a equipe instala as dependências, **Then** a instalação
   conclui sem exigir flags de contorno de conflito.
2. **Given** o ambiente local iniciado, **When** um arquivo de tela é alterado, **Then** a mudança
   aparece no navegador em até 2 segundos.
3. **Given** as variáveis de ambiente renomeadas para o novo prefixo, **When** o build de produção
   é gerado, **Then** a aplicação aponta para a API e o caminho base configurados.
4. **Given** o build de produção, **When** a imagem do container é construída e executada, **Then**
   todas as rotas da aplicação respondem, inclusive recarregando a página numa rota interna.

---

### Edge Cases

- **Rotas internas recarregadas** (deep link): abrir `/campanha/123` direto ou dar F5 numa rota
  interna deve continuar funcionando, tanto no ambiente local quanto no container.
- **Caminho base configurado**: a aplicação servida sob um subcaminho deve carregar todos os assets
  e rotas corretamente.
- **Widget em site com CSS agressivo**: a estilização do widget não pode vazar para o site
  hospedeiro, e o CSS do hospedeiro não pode quebrar o widget.
- **Arquivos estáticos públicos** (traduções em `locales/`, bandeiras, imagens, páginas HTML
  avulsas): devem continuar acessíveis nos mesmos caminhos.
- **Sessão existente**: um usuário que já estava logado antes do deploy continua logado. O
  armazenamento local da sessão não muda.
- **Variável de ambiente ausente**: com a URL da API vazia, a aplicação usa a mesma origem, como
  define a constitution.
- **Navegadores antigos**: navegadores fora dos suportados podem ter limitações. Os suportados
  estão em Assumptions.
- **Configuração de empacotamento mobile existente**: o arquivo de configuração mobile aponta
  para a pasta de saída do build e precisa apontar para a nova pasta.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O frontend MUST ser construído, executado localmente e testado exclusivamente com o
  bundler definido na constitution. A ferramenta de build anterior e seus scripts MUST ser
  removidos.
- **FR-002**: Toda a estilização MUST usar o framework utility-first definido na constitution.
  O framework de componentes anterior e seu pacote de integração com React MUST ser removidos das
  dependências, e nenhum arquivo pode importá-los.
- **FR-003**: As 27 telas MUST manter o mesmo comportamento funcional: rotas, formulários,
  validações, chamadas à API, modais, alertas e navegação.
- **FR-004**: A aparência das telas MUST seguir um **novo design system** definido pelo
  `ux-designer` antes da implementação: tokens (cores, tipografia, espaçamento, raios, sombras),
  especificação dos componentes base (botão, campo, select, checkbox/radio, card, tabela, modal,
  alerta, abas, navegação, paginação, badge) e mockups das telas públicas e de pelo menos uma tela
  administrativa típica (lista e formulário). A implementação só começa depois que o design
  system for aprovado pelo usuário.
- **FR-004a**: Os tokens do design system MUST ser validados contra as razões de contraste AA
  antes da implementação.
- **FR-005**: As variáveis de ambiente do frontend MUST usar o novo prefixo definido na
  constitution. As quatro variáveis em uso (URL da API, caminho base, flag de produção e nome do
  projeto) MUST ser renomeadas em todos os arquivos de ambiente, no build do container e na
  documentação.
- **FR-006**: As traduções (pt, en, es) MUST continuar carregando e trocando em todas as telas.
- **FR-007**: O widget embarcável MUST ter a estilização isolada do site hospedeiro, nos dois
  sentidos.
- **FR-008**: Todas as telas migradas MUST atender à seção de Acessibilidade (WCAG 2.1 AA) da
  constitution: contraste, alvos de 44×44 px, rótulos, teclado, foco visível, `aria-live` e zoom
  a 200%.
- **FR-009**: Modais MUST prender o foco, fechar com `Esc` e devolver o foco ao elemento de
  origem.
- **FR-010**: O build do container do frontend MUST continuar gerando uma imagem que sirva a
  aplicação com suporte a rotas internas (fallback para a página principal).
- **FR-011**: A instalação de dependências MUST funcionar sem flags de contorno de conflito de
  peer dependencies. Dependências que só existiam por causa do contorno MUST ser removidas ou
  substituídas.
- **FR-012**: Os testes automatizados do frontend MUST rodar no novo ambiente, e o comando de
  testes MUST passar.
- **FR-013**: A sessão do usuário MUST ser preservada no deploy, com a mesma chave e o mesmo
  formato de armazenamento local. Mudar a autenticação está fora do escopo.
- **FR-014**: A documentação do projeto (CLAUDE.md, README e constitution) MUST refletir a nova
  base. A pendência `TODO(FRONTEND-VITE)` MUST sair da seção "Transição" da constitution.
- **FR-015**: A migração MUST ser entregue **de uma vez**: troca da ferramenta de build, novo
  design system aplicado às 27 telas e remoção do framework de estilização anterior saem na mesma
  entrega, sem período em que os dois frameworks convivam em produção.

### Key Entities

- **Tela**: uma das 27 páginas roteáveis do frontend. Tem rota, ação principal e público
  (organizador ou participante). É a unidade do roteiro de regressão.
- **Variável de ambiente do frontend**: valor injetado no build, como a URL da API ou o caminho
  base. Tem nome, prefixo obrigatório e um valor por ambiente.
- **Widget embarcável**: versão da inscrição que roda dentro de sites de terceiros. Tem como
  restrição o isolamento de estilo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das 27 telas passam no roteiro de regressão, carregando e executando a ação
  principal sem erro.
- **SC-002**: Zero referências à ferramenta de build anterior, ao framework de estilização
  anterior e ao prefixo antigo de variáveis no código e nas dependências do frontend.
- **SC-003**: Uma inscrição completa pela página pública e pelo widget, em celular e desktop, é
  concluída na primeira tentativa em 100% dos testes de aceite.
- **SC-004**: O ambiente local inicia em até 5 segundos, e alterações aparecem no navegador em até
  2 segundos.
- **SC-005**: O tamanho total transferido no primeiro carregamento da página pública da campanha
  não aumenta em relação ao atual, que serve de baseline medido antes da migração.
- **SC-006**: Zero violações de contraste, rótulo ou teclado do nível AA nas telas públicas
  (página da campanha e widget), segundo uma auditoria automática de acessibilidade.
- **SC-007**: Instalação, build e build do container passam num clone limpo, sem nenhum passo
  manual além dos documentados.
- **SC-008**: 100% das telas usam apenas os tokens e componentes base do design system aprovado,
  sem cores, tamanhos de fonte ou espaçamentos avulsos fora da escala.

## Assumptions

- A migração é técnica e de estilização. Nenhuma funcionalidade nova entra nesta feature, e o
  backend não muda.
- A autenticação atual continua. A troca para JWT é a pendência separada `TODO(AUTH-JWT)`.
- O deploy continua no modelo atual. A migração para Kubernetes é a pendência separada
  `TODO(DEPLOY-K8S)`, mas o build do container precisa continuar funcionando.
- A versão do React (18.x), o roteador e a biblioteca de i18n se mantêm, porque a constitution já
  os prevê.
- O padrão de estado (Context API) e a estrutura de pastas com o casing atual (`Contexts/`,
  `Services/`, `hooks/`, `types/`) se mantêm.
- Código legado com Axios pode permanecer. Migrar para Fetch não faz parte do escopo.
- Navegadores suportados são as duas últimas versões de Chrome, Edge, Firefox e Safari, incluindo
  os móveis.
- O arquivo de configuração de empacotamento mobile existente só precisa apontar para a nova
  pasta de saída do build. Gerar o app mobile não faz parte do escopo.
- Os backups existentes de Dockerfile e o build gerado (`build/`) não são versionados como fonte.
  Podem ser limpos se estiverem rastreados.
- Como a entrega é única e inclui um redesign, o roteiro de regressão é **funcional**: verifica o
  comportamento de cada tela. A conformidade visual é verificada contra os mockups do
  `ux-designer`, não contra o layout antigo.
- O design system é uma entrega do `ux-designer` (tokens, especificações e mockups em HTML/CSS),
  aprovada pelo usuário antes de começar a implementação.
- Pela constitution, a implementação é feita pelo `react-developer`. Ajustes de
  Dockerfile e compose ficam com o `devops-engineer`. O design, se houver, é do `ux-designer`.
