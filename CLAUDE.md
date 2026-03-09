# Spring Initializr Customizado — Versão Didática

## Visão Geral

Aplicação 100% frontend (React 19 + TypeScript + Vite) que replica visualmente o layout do Spring Initializr oficial (`start.spring.io`), com restrições didáticas, identificação de alunos, hash de identificação e geração de código-fonte de exemplo.

**Deploy:** GitHub Pages (estático, sem backend).

## Stack Técnica

| Camada | Tecnologia | Notas |
|--------|------------|-------|
| Framework | React 19 | TypeScript strict mode |
| Build | Vite | Template react-ts |
| Styling | CSS customizado | Replicar visual do Spring Initializr (paleta verde #6db33f / cinza escuro #191E1E) |
| ZIP | jszip + file-saver | Geração do projeto em memória |
| Hash | crypto.subtle | Web Crypto API nativa (SHA-256) |
| Validação | zod | Validação dos formulários |
| State | useReducer | Estado centralizado do formulário |
| Routing | react-router-dom | Rotas `/` e `/verificar` |

### Bibliotecas NÃO utilizadas

- NÃO usar Bootstrap, Tailwind ou frameworks CSS (o visual deve imitar fielmente o Initializr)
- NÃO usar Axios, jQuery ou XmlHttpRequest
- NÃO usar styled-components
- NÃO usar i18n (interface em português do Brasil, strings hardcoded estão OK)
- NÃO usar TanStack Query (não há fetching de dados)

## Estrutura do Projeto

```
src/
├── assets/                  # CSS global, fontes, imagens
│   └── styles/
│       ├── initializr.css   # Estilos principais imitando start.spring.io
│       └── variables.css    # CSS custom properties
├── components/
│   ├── layout/              # Header, Footer, Banner de aviso
│   ├── form/                # ProjectMetadata, DependencySelector, TeamSection
│   ├── dependencies/        # DependencyModal, DependencyTag, CategoryList
│   └── common/              # RadioGroup, Tooltip, TextInput, DisabledOption
├── generators/              # Funções puras de geração de arquivos
│   ├── pomXml.ts
│   ├── javaFiles.ts         # Application, Entity, Dto, Repository, Service, Controllers, Config
│   ├── propertiesFile.ts
│   ├── thymeleafTemplates.ts
│   ├── staticFiles.ts       # .gitignore, .editorconfig, HELP.md
│   └── index.ts             # Orquestra todos os geradores
├── hash/
│   └── identification.ts    # Cálculo SHA-256 e injeção nos arquivos
├── models/
│   ├── projectState.ts      # Interface do estado do formulário
│   ├── dependencies.ts      # Catálogo de dependências disponíveis
│   └── springBootVersions.ts # Constante de versões (facilita manutenção)
├── pages/
│   ├── GeneratorPage.tsx    # Página principal (formulário + geração)
│   └── VerifyPage.tsx       # Ferramenta de verificação do hash
├── reducers/
│   └── projectReducer.ts   # useReducer centralizado
├── services/
│   └── zipBuilder.ts        # Montagem do ZIP com JSZip
├── App.tsx
└── main.tsx
```

## Regras de Negócio (R1–R17)

### Geração de Código Condicional

- **R1:** Se `thymeleaf` selecionado → gerar `ExemploController` (MVC) + templates HTML. **NÃO** gerar `ExemploRestController`.
- **R2:** Se `web` sem `thymeleaf` → gerar `ExemploRestController` (REST) + `OpenApiConfig` + dependência `springdoc-openapi-starter-webmvc-ui`. **NÃO** gerar `ExemploController` nem templates.
- **R3:** Se `data-jpa` → gerar `ExemploEntity`, `ExemploDto`, `ExemploRepository`. Service usa Repository.
- **R4:** Se **não** `data-jpa` → Service usa `List<ExemploDto>` em memória com dados pré-populados. Não gerar Entity/Repository. Ainda gerar Dto.
- **R5:** Se `security` ou `oauth2-resource-server` → gerar `SecurityConfig` com `permitAll()` + CORS. Mesmo template para ambos.
- **R6:** Se `thymeleaf` + (`security` ou `oauth2-resource-server`) → incluir `thymeleaf-extras-springsecurity6` no pom.xml.
- **R7:** Se `data-jpa` + driver(s) → adicionar configurações de datasource e JPA no `application.properties`.
- **R13:** Se Lombok presente, classes Entity usam annotations Lombok (`@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`). Se não, gerar getters/setters explícitos.

### Hash de Identificação

- **R8:** Hash calculado sobre `${groupId}:${artifactId}::dev1|dev2|...` (sorted por GitHub username). Cada dev: `nome|github|email` (tudo lowercase, trimmed).
- **R9:** Hash inserido em todos os arquivos gerados. No `pom.xml`, posicionado como comentário logo após o bloco `</developers>`. Nos demais arquivos (`.java`, `.properties`, `.html`), na primeira linha.
- **R10:** Todos os arquivos extras (não gerados pelo Initializr real) devem ter comentário de aviso: "Arquivo gerado automaticamente pelo Spring Initializr Customizado (versão didática). ATENÇÃO: Este arquivo NÃO é gerado pelo Spring Initializr oficial."

### Interface

- **R11:** `Package name` auto-gerado a partir de `Group` + `Artifact` (substituindo hifens por underscores, removendo caracteres inválidos).
- **R12:** Versões do Spring Boot mantidas como constante de configuração (`SPRING_BOOT_VERSIONS`). Atualmente: `4.0.3` habilitada, `3.5.x` visível mas desabilitada. Estrutura preparada para múltiplas GAs coexistentes.
- **R14:** Sempre gerar `.editorconfig` com configuração padronizada.
- **R15:** Sempre gerar `HELP.md` com aviso de versão acadêmica, instruções de Maven Wrapper, e links dinâmicos das dependências.
- **R16:** Versões do Spring Boot configuradas como array: `{version, enabled, default}`. Somente versões GA.
- **R17:** Todas as opções desabilitadas exibem tooltip: "Opção não disponível nesta versão didática. Disponível no Spring Initializr oficial: start.spring.io".

## Constante de Versões do Spring Boot

```typescript
// src/models/springBootVersions.ts
export const SPRING_BOOT_VERSIONS = [
  { version: "4.0.3", enabled: true, default: true },
  { version: "3.5.10", enabled: false, default: false },
] as const;
```

Quando novas GAs coexistirem (ex: 4.1.0 + 4.0.x), basta adicionar ao array.

## Dependências Auto-incluídas (lógica interna, não aparecem no modal)

| Condição | Dependência Maven |
|----------|-------------------|
| `web` E NÃO `thymeleaf` | `org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.6` |
| `thymeleaf` | `nz.net.ultraq.thymeleaf:thymeleaf-layout-dialect` |
| `thymeleaf` + (`security` ou `oauth2-resource-server`) | `org.thymeleaf.extras:thymeleaf-extras-springsecurity6` |

## Mapeamento Developer no pom.xml

```xml
<developers>
    <developer>
        <id>USERNAME_GITHUB</id>
        <name>NOME_COMPLETO</name>
        <email>EMAIL</email>
    </developer>
</developers>
<!-- hash-identificacao: SHA256_HEX_64_CHARS -->
```

## Valores Default do Formulário

| Campo | Default |
|-------|---------|
| Group | `br.senac.tads.dsw` |
| Artifact | `demo` |
| Name | `demo` |
| Description | `Projeto de demonstração com Spring Boot` |
| Package name | `br.senac.tads.dsw.demo` |
| Java | `21` |

## Campos Desabilitados

Todas as opções abaixo são **visíveis** (grayed out, cursor not-allowed) com tooltip R17:

- Project: Gradle - Groovy, Gradle - Kotlin
- Language: Kotlin, Groovy
- Spring Boot: 3.5.x
- Packaging: War
- Configuration: YAML

## Arquivo .editorconfig (sempre gerado)

```editorconfig
[*]
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
charset = utf-8

[*.java]
indent_style = tab
indent_size = 4

[{*.cjs,*.js, *.jsx, *.ts, *.tsx}]
indent_style = space
indent_size = 2

[*.html]
indent_style = space
indent_size = 2

[{*.css, *.scss}]
indent_style = space
indent_size = 2

[*.xml]
indent_style = tab
indent_size = 4

[{*.yml, *.yaml}]
indent_style = space
indent_size = 4
```

## Estilo Visual — Referência do Spring Initializr

O design deve imitar fielmente o `start.spring.io`:

- **Background:** Escuro (`#191E1E` ou similar)
- **Cards/formulário:** Fundo ligeiramente mais claro com bordas sutis
- **Cor primária (botões, radio selecionado):** Verde Spring `#6db33f`
- **Texto:** Branco/cinza claro sobre fundo escuro
- **Tipografia:** Sans-serif limpa (pode usar a mesma fonte do Initializr ou uma próxima)
- **Radio buttons customizados:** Estilo pill/badge como no original
- **Botões do footer:** GENERATE (destaque verde), EXPLORE e SHARE (secundários)
- **Modal de dependências:** Overlay escuro com busca e categorias colapsáveis

## Convenções de Código

### TypeScript
- Strict mode habilitado
- Interfaces para props de componentes (não `type`)
- Funções geradoras em `generators/` devem ser **funções puras** — recebem o estado e retornam string
- Usar `Record<string, string>` para mapas de arquivos gerados (path → conteúdo)

### CSS
- CSS customizado com custom properties (variáveis)
- Organização: um arquivo CSS por componente quando necessário
- Nomenclatura de classes: kebab-case, prefixo `si-` (spring-initializr) para evitar conflitos
- Sem CSS-in-JS

### Componentes React
- Functional components com hooks
- Um componente por arquivo
- Props com interface nomeada `<ComponentName>Props`
- Estado complexo via `useReducer`, estado local simples via `useState`

### Geração de Arquivos
- Cada gerador em `generators/` é uma função pura: `(state: ProjectState) => Record<string, string>`
- O retorno é um mapa `{ "caminho/do/arquivo.java": "conteúdo do arquivo" }`
- O `zipBuilder.ts` agrega todos os mapas e monta o ZIP
- O hash é calculado ANTES dos geradores e passado como parte do estado

## Testes

- Testes unitários com Vitest para os geradores (funções puras são fáceis de testar)
- Testar: geração condicional de arquivos, cálculo do hash, conteúdo do pom.xml
- Não é necessário testar componentes de UI nesta fase