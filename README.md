# TADS Spring Initializr

Versão didática do [Spring Initializr](https://start.spring.io) desenvolvida para a disciplina de **Desenvolvimento de Sistemas Web** do curso **TADS - Análise e Desenvolvimento de Sistemas** do SENAC.

## O que é

Aplicação 100% frontend que replica o layout e a experiência do Spring Initializr oficial, com:

- Opções reduzidas e adaptadas ao contexto da disciplina
- Identificação da equipe com **hash SHA-256** embutido nos arquivos gerados
- Geração opcional de código-fonte de exemplo (Controller, Service, Repository, Entity, DTO)
- Suporte a Thymeleaf (MVC) e Spring Web (REST + Swagger)
- Página de verificação de hash para conferência da autoria

## Acesso

A aplicação está disponível em:
**https://ftsuda-senac.github.io/tads-spring-initializr/**

## Hash de identificação

Cada projeto gerado recebe um hash SHA-256 calculado a partir dos dados da equipe (`groupId`, `artifactId`, nomes, usernames GitHub e e-mails). Esse hash é inserido em **todos os arquivos gerados** e permite verificar a autoria sem depender de metadados externos.

> Os dados da equipe **não devem ser alterados manualmente** no `pom.xml` ou em qualquer outro arquivo — qualquer edição invalida o hash. Se necessário corrigir, regenere o projeto com as informações corretas.

## Geração de classes de exemplo

O formulário oferece a opção **Gerar classes de exemplo**, que controla quais arquivos são incluídos no projeto gerado:

| Opção | Arquivos gerados |
|-------|-----------------|
| **Não** (padrão) | `Application.java`, `application.properties`, `pom.xml`, `.gitignore`, `.editorconfig`, `HELP.md`, `static/index.html`, `.gitkeep` nas pastas vazias |
| **Sim** | Todos os anteriores + `ExemploController`, `ExemploService`, `ExemploDto`, `ExemploEntity` (se JPA), `ExemploRepository` (se JPA), `DatabaseInitializer` (se JPA), `SecurityConfig` (se Security), `OpenApiConfig` (se Web sem Thymeleaf), templates Thymeleaf (se Thymeleaf) |

As dependências selecionadas e as configurações do `application.properties` são sempre geradas, independentemente da opção escolhida.

## Versões do Spring Boot e Java

As versões disponíveis são obtidas dinamicamente:

| Campo | Fonte | Fallback |
|-------|-------|---------|
| **Spring Boot** | GitHub Releases (`spring-projects/spring-boot`) | Lista estática definida em `springBootVersions.ts` |
| **Java** | `application.yml` do repositório `spring-io/start.spring.io` (via GitHub raw content) | `25`, `21`, `17` |

A busca usa `sessionStorage` para evitar requisições repetidas na mesma sessão. A versão padrão disponível é selecionada automaticamente quando a lista é carregada.

> O acesso direto à API do `start.spring.io` é bloqueado por CORS no contexto de páginas estáticas. Por isso, as versões do Java são obtidas via `raw.githubusercontent.com`, que suporta CORS de qualquer origem.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | React 19 + TypeScript (strict) |
| Build | Vite |
| Estilização | CSS customizado (paleta Spring: `#6db33f` / `#191E1E`) |
| Geração de ZIP | JSZip + file-saver |
| Hash | Web Crypto API — `crypto.subtle` (SHA-256) |
| Validação | Zod |
| Estado | useReducer |
| Roteamento | react-router-dom |

## Estrutura do projeto

```
src/
├── assets/styles/       # CSS global e variáveis
├── components/          # Componentes React (layout, form, dependências, common)
├── generators/          # Funções puras de geração de arquivos (pom.xml, Java, HTML…)
├── hash/                # Cálculo SHA-256 e injeção nos arquivos
├── hooks/               # useSpringVersions, useJavaVersions, useTheme
├── models/              # Interfaces, catálogo de dependências, versões estáticas
├── pages/               # GeneratorPage e VerifyPage
├── reducers/            # projectReducer (useReducer centralizado)
└── services/            # zipBuilder, share (URL de compartilhamento), localSave
```

## Desenvolvimento local

### Pré-requisitos

- Node.js 20+
- npm

### Instalação e execução

```bash
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

### Build de produção

```bash
npm run build
npm run preview
```

### Testes

```bash
npm test
```

## Deploy

O deploy é feito automaticamente via **GitHub Actions** ao fazer push na branch `main`. O workflow:

1. Instala as dependências (`npm ci`)
2. Faz bump automático da versão minor (`npm version minor`)
3. Gera o build com `VITE_BASE_PATH=/<repo>/`
4. Publica no GitHub Pages
5. Faz commit e push do `package.json` atualizado com a nova versão

A versão atual da aplicação é injetada nos arquivos gerados via `__APP_VERSION__` (Vite `define`).

## Licença

Uso didático interno — SENAC TADS.
