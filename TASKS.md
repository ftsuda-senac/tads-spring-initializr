# TASKS.md — Tarefas de Implementação Sequenciais

> Executar cada tarefa na ordem. Cada tarefa inclui critérios de validação.
> Marcar `[x]` conforme concluído. Não pular tarefas.

---

## Fase 1 — Scaffold e Infraestrutura

### T01: Inicialização do projeto
- [x] Criar projeto com `npm create vite@latest spring-initializr-custom -- --template react-ts`
- [x] Instalar dependências: `jszip`, `file-saver`, `zod`, `react-router-dom`
- [x] Instalar tipos: `@types/file-saver`
- [x] Configurar `tsconfig.json` com `strict: true`
- [x] Criar estrutura de pastas conforme CLAUDE.md (components/, generators/, hash/, models/, pages/, reducers/, services/)
- [x] Configurar React Router com rotas `/` (GeneratorPage) e `/verificar` (VerifyPage)
- [x] **Validação:** `npm run dev` funciona, rotas navegam corretamente, sem erros no console

### T02: Modelos e estado
- [x] Criar `models/springBootVersions.ts` com constante `SPRING_BOOT_VERSIONS`
- [x] Criar `models/dependencies.ts` com catálogo completo de dependências organizadas por categoria (WEB, DEVELOPER TOOLS, SECURITY, SQL, I/O) conforme CLAUDE.md
- [x] Criar `models/projectState.ts` com interface `ProjectState` contendo todos os campos do formulário, lista de developers (1–10), e dependências selecionadas
- [x] Criar `reducers/projectReducer.ts` com `useReducer` — actions para atualizar cada campo, adicionar/remover developer, adicionar/remover dependência
- [x] Preencher valores default conforme CLAUDE.md (Group: `br.senac.tads.dsw`, Artifact: `demo`, etc.)
- [x] **Validação:** Importar o reducer em um componente temporário, despachar ações, verificar que o estado muda corretamente via console.log

---

## Fase 2 — Layout Principal (Fidelidade ao Spring Initializr)

### T03: CSS base e variáveis
- [x] Criar `assets/styles/variables.css` com custom properties: cores (`--si-green: #6db33f`, `--si-bg-dark: #191E1E`, etc.), tipografia, espaçamentos
- [x] Criar `assets/styles/initializr.css` com estilos base: body background escuro, container centralizado, layout de duas colunas, estilo dos radio buttons pill/badge
- [x] Resetar estilos default do Vite (limpar `App.css`, `index.css`)
- [x] **Validação:** Página com fundo escuro, cores Spring corretas, sem resquícios do template Vite

### T04: Header e banner de aviso
- [x] Criar `components/layout/Header.tsx` com logo "Spring Initializr" em texto estilizado (tipografia similar ao original)
- [x] Criar `components/layout/Banner.tsx` com aviso: "Esta é uma versão reduzida do Spring Initializr com objetivos didáticos" + link para `start.spring.io`
- [x] Estilizar banner com destaque visual (fundo amarelo/âmbar sutil) para ser notado sem ser intrusivo
- [x] **Validação:** Header e banner visíveis, link externo funciona, visual consistente com o tema escuro

### T05: Coluna esquerda — Project, Language, Spring Boot
- [x] Criar `components/common/RadioGroup.tsx` — componente reutilizável de radio buttons estilo pill com suporte a opções desabilitadas
- [x] Criar `components/common/Tooltip.tsx` — tooltip customizado que aparece no hover de opções desabilitadas, texto conforme R17
- [x] Criar seção "Project" com opções Maven (selecionado), Gradle-Groovy (desabilitado), Gradle-Kotlin (desabilitado)
- [x] Criar seção "Language" com opções Java (selecionado), Kotlin (desabilitado), Groovy (desabilitado)
- [x] Criar seção "Spring Boot" com versões do array `SPRING_BOOT_VERSIONS` — habilitadas e desabilitadas conforme `enabled`
- [x] **Validação:** Radio buttons funcionais, opções desabilitadas com visual grayed-out, cursor not-allowed, tooltip aparece no hover

### T06: Coluna direita — Project Metadata
- [x] Criar `components/form/ProjectMetadata.tsx` com campos: Group, Artifact, Name, Description, Package name
- [x] `Package name` é auto-gerado a partir de Group + Artifact (R11): substituir hifens por underscores, remover caracteres inválidos para pacotes Java
- [x] Artifact altera automaticamente o Name (comportamento do Initializr original)
- [x] Valores default pré-preenchidos conforme CLAUDE.md
- [x] **Validação:** Alterar Group ou Artifact atualiza Package name em tempo real. Campos editáveis com estilo correto

### T07: Packaging, Configuration e Java version
- [x] Adicionar seção "Packaging" com Jar (selecionado) e War (desabilitado + tooltip)
- [x] Adicionar seção "Configuration" com Properties (selecionado) e YAML (desabilitado + tooltip)
- [x] Adicionar seção "Java" com versões 25, 21, 17 — todas habilitadas, default 21
- [x] **Validação:** Layout completo da área de metadados, consistente com o Initializr original

### T08: Footer com botões de ação
- [x] Criar `components/layout/Footer.tsx` com botões: GENERATE (verde primário, destaque), EXPLORE (secundário), SHARE (secundário)
- [x] Atalho de teclado: Ctrl+Enter (ou Cmd+Enter no Mac) aciona GENERATE
- [x] Botões ainda sem funcionalidade (serão conectados nas fases seguintes)
- [x] **Validação:** Footer fixo na parte inferior, botões estilizados, atalho de teclado registrado (verificar via console.log)

---

## Fase 3 — Painel de Dependências

### T09: Modal de dependências
- [x] Criar `components/dependencies/DependencyModal.tsx` — modal/overlay que abre ao clicar "ADD DEPENDENCIES..." (ou Ctrl+B como no original)
- [x] Dentro do modal: campo de busca no topo, lista de categorias colapsáveis abaixo
- [x] Criar `components/dependencies/CategoryList.tsx` — renderiza categorias (WEB, DEVELOPER TOOLS, etc.) com dependências clicáveis
- [x] Busca filtra dependências por nome ou descrição em tempo real
- [x] Clicar em dependência adiciona ao estado e fecha o modal (ou mantém aberto para seleção múltipla, como no original)
- [x] **Validação:** Modal abre/fecha, busca funciona, categorias colapsam, dependência é adicionada ao estado

### T10: Tags de dependências selecionadas
- [x] Criar `components/dependencies/DependencyTag.tsx` — badge/tag com nome da dependência e botão X para remover
- [x] Exibir tags das dependências selecionadas no painel direito do formulário
- [x] Remover dependência ao clicar no X
- [x] **Validação:** Adicionar/remover dependências reflete nas tags. Tags estilizadas como no Initializr

---

## Fase 4 — Seção de Equipe (Identificação dos Alunos)

### T11: Formulário de desenvolvedores
- [x] Criar `components/form/TeamSection.tsx` — seção "Equipe do Projeto" com lista dinâmica de 1–10 desenvolvedores
- [x] Cada entrada: campos Nome completo, Username GitHub, E-mail (em linha ou empilhados)
- [x] Botão "+ Adicionar desenvolvedor" (desabilitado ao atingir 10)
- [x] Botão remover (ícone X) em cada entrada (desabilitado se restar apenas 1)
- [x] Validação com zod: nome mín. 3 chars, GitHub pattern `^[a-zA-Z0-9-]+$`, e-mail válido
- [x] Exibir erros de validação inline
- [x] **Validação:** Adicionar até 10 devs, remover até mín. 1, validação inline funciona, dados persistem no estado

---

## Fase 5 — Hash de Identificação

### T12: Cálculo do hash SHA-256
- [x] Criar `hash/identification.ts` com função `calculateHash(state: ProjectState): Promise<string>`
- [x] Payload: `${groupId}:${artifactId}::${devsSorted}` onde devs são sorted por github username, cada um `nome|github|email` (tudo lowercase, trimmed), separados por `;`
- [x] Usar `crypto.subtle.digest('SHA-256', ...)` — retornar hex string de 64 caracteres
- [x] Criar função `injectHash(content: string, hash: string, format: 'java' | 'xml' | 'properties' | 'html'): string` que insere o comentário no formato correto
- [x] **Validação:** Criar teste unitário: dado um estado fixo, o hash gerado é sempre o mesmo (determinístico). Testar com 1 dev e com 3 devs

---

## Fase 6 — Engine de Geração de Arquivos

### T13: Gerador do pom.xml
- [x] Criar `generators/pomXml.ts` com função `generatePomXml(state, hash): string`
- [x] Incluir: parent Spring Boot, groupId, artifactId, version, name, description
- [x] Bloco `<developers>` com mapeamento: `<id>` = github, `<name>` = nome, `<email>` = email
- [x] Comentário `<!-- hash-identificacao: ... -->` logo após `</developers>`
- [x] `<properties>` com `<java.version>`
- [x] `<dependencies>` com todas as dependências selecionadas + auto-incluídas (springdoc, thymeleaf-layout-dialect, thymeleaf-extras-springsecurity6)
- [x] `<build>` com spring-boot-maven-plugin (e exclusão do Lombok se selecionado)
- [x] **Validação:** Gerar pom.xml com diferentes combinações de dependências. XML resultante deve ser válido. Hash posicionado corretamente

### T14: Geradores de arquivos Java
- [x] Criar `generators/javaFiles.ts` com funções para cada arquivo:
  - `generateApplication(state, hash): string` — classe main Spring Boot
  - `generateApplicationTests(state, hash): string` — teste básico com `@SpringBootTest`
  - `generateEntity(state, hash): string` — ExemploEntity com id, tipo, mensagem. Respeitar R13 (Lombok vs getters/setters)
  - `generateDto(state, hash): string` — ExemploDto como Java Record
  - `generateRepository(state, hash): string` — ExemploRepository extends JpaRepository, método findByTipo
  - `generateService(state, hash): string` — ExemploService com findAll, findByTipo, addNew, mappers toDto/toEntity. Se sem JPA, usar List em memória com dados pré-populados
  - `generateRestController(state, hash): string` — ExemploRestController com GET /api/exemplos, GET /api/exemplos/{tipo}, POST /api/exemplos
  - `generateMvcController(state, hash): string` — ExemploController com GET /exemplos, GET /exemplos/novo, POST /exemplos (Post-Redirect-Get)
  - `generateSecurityConfig(state, hash): string` — SecurityConfig com permitAll + CORS, comentário de alerta
  - `generateOpenApiConfig(state, hash): string` — OpenApiConfig com customOpenAPI bean
- [x] Cada arquivo inclui: hash na primeira linha + comentário de aviso de autoria (exceto Application.java e ApplicationTests.java que o Initializr real gera)
- [x] Todos os arquivos Java usam o package correto (derivado do Package name do estado)
- [x] **Validação:** Gerar cada arquivo com diferentes combinações. Código Java resultante deve ser sintaticamente correto. Package declarado correto

### T15: Gerador de application.properties
- [x] Criar `generators/propertiesFile.ts` com função `generateProperties(state, hash): string`
- [x] Sempre incluir: `spring.application.name=${artifactId}`
- [x] Se `data-jpa` + PostgreSQL: configurações datasource PostgreSQL
- [x] Se `data-jpa` + MySQL: configurações datasource MySQL
- [x] Se `data-jpa` + H2: configurações datasource H2 + console habilitado
- [x] Se `data-jpa` + múltiplos drivers: gerar o primeiro como ativo, demais comentados
- [x] Se `data-jpa`: configurações JPA (show-sql, format_sql, ddl-auto=update)
- [x] Hash como comentário na primeira linha
- [x] Seção extra com comentário de aviso de autoria (separada das configs que o Initializr geraria)
- [x] **Validação:** Gerar com PostgreSQL selecionado: verificar URL, username, password. Gerar com H2: verificar console habilitado

### T16: Geradores de templates Thymeleaf
- [x] Criar `generators/thymeleafTemplates.ts` com funções:
  - `generateListaHtml(state, hash): string` — tabela HTML com th:each, link "Adicionar Novo"
  - `generateFormHtml(state, hash): string` — formulário com th:action, method=post, campos tipo e mensagem
- [x] Templates usam layout dialect se disponível
- [x] Hash como comentário HTML na primeira linha + aviso de autoria
- [x] **Validação:** HTML gerado é válido. Expressões Thymeleaf corretas (th:each, th:action, th:object, th:field)

### T17: Geradores de arquivos estáticos
- [x] Criar `generators/staticFiles.ts` com funções:
  - `generateGitignore(): string` — template padrão do Spring Initializr para Maven/Java
  - `generateEditorconfig(): string` — conteúdo exato conforme CLAUDE.md
  - `generateHelpMd(state): string` — conteúdo dinâmico com aviso acadêmico, instruções Maven Wrapper, links das dependências selecionadas
- [x] **Validação:** .gitignore contém HELP.md, target/, *.class, .idea/, .vscode/. .editorconfig byte-a-byte correto

### T18: Orquestrador de geradores
- [x] Criar `generators/index.ts` com função `generateAllFiles(state: ProjectState): Promise<Record<string, string>>`
- [x] Calcula o hash primeiro
- [x] Invoca cada gerador conforme regras condicionais R1–R7, R13–R15
- [x] Retorna mapa completo `{ "demo/pom.xml": "...", "demo/src/main/java/.../Application.java": "...", ... }`
- [x] Construir os paths corretamente usando artifactId como raiz e packageName convertido em path
- [x] **Validação:** Chamar com estado mínimo (web apenas) e estado completo (web+jpa+postgres+security+thymeleaf+lombok). Verificar que os arquivos corretos são gerados em cada caso. Nenhum arquivo REST quando thymeleaf está presente (R1). Nenhum arquivo MVC quando thymeleaf está ausente (R2)

---

## Fase 7 — Empacotamento e Download

### T19: Montagem do ZIP
- [x] Criar `services/zipBuilder.ts` com função `buildAndDownloadZip(files: Record<string, string>, artifactId: string): Promise<void>`
- [x] Usa JSZip para criar estrutura de diretórios e popular arquivos
- [x] Usa file-saver para trigger do download como `${artifactId}.zip`
- [x] **Validação:** Gerar ZIP, baixar, descompactar manualmente. Estrutura de diretórios correta. Abrir pom.xml no IDE, verificar que é válido

### T20: Conectar botão GENERATE
- [x] Ao clicar GENERATE (ou Ctrl+Enter):
  1. Validar formulário (todos os campos obrigatórios preenchidos, pelo menos 1 developer válido)
  2. Se validação falha: mostrar erros inline, não gerar
  3. Se validação OK: chamar `generateAllFiles(state)` → `buildAndDownloadZip(files, artifactId)`
- [x] Mostrar indicador de loading durante a geração (o cálculo do hash é assíncrono)
- [x] **Validação:** Preencher formulário completo → GENERATE → ZIP baixado com estrutura correta. Formulário incompleto → erros mostrados

---

## Fase 8 — Funcionalidade EXPLORE (Preview)

### T21: Modal de preview dos arquivos
- [x] Criar modal EXPLORE que exibe a árvore de arquivos do ZIP
- [x] Árvore de diretórios colapsável (similar a um file explorer)
- [x] Ao clicar em um arquivo, exibir seu conteúdo em um painel com fonte monospace
- [x] Syntax highlighting básico (pode ser via CSS simples: keywords em cor diferente) ou usar uma lib leve
- [x] **Validação:** Clicar EXPLORE → modal abre com árvore. Clicar em pom.xml → conteúdo exibido. Clicar em arquivo .java → conteúdo exibido

---

## Fase 9 — Funcionalidade SHARE

### T22: Link compartilhável
- [x] Ao clicar SHARE: serializar estado do formulário (sem conteúdos gerados) em JSON → base64 → colocar como query parameter `?config=...`
- [x] Copiar URL para o clipboard e mostrar toast/feedback visual
- [x] Ao carregar a página com `?config=...`: deserializar e preencher o formulário
- [x] **Validação:** Clicar SHARE → URL copiada. Colar URL em nova aba → formulário preenchido com mesmos dados

---

## Fase 10 — Verificador de Hash (Ferramenta do Professor)

### T23: Página de verificação
- [x] Criar `pages/VerifyPage.tsx` acessível via `/verificar`
- [x] Área de texto para colar o conteúdo do `pom.xml`
- [x] Ao colar/submeter:
  1. Extrair `groupId`, `artifactId` das tags XML
  2. Extrair bloco `<developers>` — para cada `<developer>`: `<id>` (github), `<name>`, `<email>`
  3. Extrair hash do comentário `<!-- hash-identificacao: ... -->`
  4. Recalcular hash com o mesmo algoritmo
  5. Comparar e exibir resultado: ✅ válido ou ❌ adulterado
- [x] Mostrar detalhes: hash encontrado, hash recalculado, dados extraídos
- [x] Link para voltar à página principal
- [x] **Validação:** Gerar um projeto → copiar pom.xml → colar no verificador → ✅ válido. Editar um nome no pom.xml → colar → ❌ adulterado

---

## Fase 11 — Responsividade e Polish

### T24: Responsividade
- [ ] Layout responsivo: em telas menores (<768px), empilhar as colunas verticalmente
- [ ] Modal de dependências ocupa tela inteira em mobile
- [ ] Formulário de equipe empilha campos verticalmente em mobile
- [ ] Testar em viewport 375px, 768px e 1200px
- [ ] **Validação:** Interface usável em todas as larguras sem overflow horizontal

### T25: Acessibilidade básica
- [ ] HTML semântico: `<main>`, `<header>`, `<footer>`, `<form>`, `<fieldset>`, `<legend>`
- [ ] Labels associados a todos os inputs
- [ ] Navegação por teclado funciona (Tab entre campos, Enter para submit)
- [ ] Foco visível em todos os elementos interativos
- [ ] **Validação:** Navegar pelo formulário inteiro usando apenas Tab + Enter

### T26: Testes unitários dos geradores
- [x] Configurar Vitest
- [x] Testes para `hash/identification.ts`: hash determinístico, diferentes quantidades de devs
- [x] Testes para `generators/pomXml.ts`: dependências corretas, bloco developers, hash posicionado
- [x] Testes para regras condicionais: R1 (thymeleaf → MVC), R2 (web sem thymeleaf → REST), R3/R4 (JPA vs memória)
- [x] Testes para `generators/index.ts`: verificar quais arquivos são gerados para cada cenário
- [x] **Validação:** `npm test` passa. Cobertura dos geradores > 80%