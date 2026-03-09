# TADS Spring Initializr

Versão didática do [Spring Initializr](https://start.spring.io) desenvolvida para a disciplina de **Desenvolvimento de Sistemas Web** do curso **TADS - Análise e Desenvolvimento de Sistemas** do SENAC.

## O que é

Aplicação 100% frontend que replica o layout e a experiência do Spring Initializr oficial, com:

- Opções reduzidas e adaptadas ao contexto da disciplina
- Identificação da equipe com **hash SHA-256** embutido nos arquivos gerados
- Geração de código-fonte de exemplo (Controller, Service, Repository, Entity, DTO)
- Suporte a Thymeleaf (MVC) e Spring Web (REST + Swagger)
- Página de verificação de hash para conferência da autoria

## Acesso

A aplicação está disponível em:
**https://ftsuda-senac.github.io/tads-spring-initializr/**

## Hash de identificação

Cada projeto gerado recebe um hash SHA-256 calculado a partir dos dados da equipe (`groupId`, `artifactId`, nomes, usernames GitHub e e-mails). Esse hash é inserido em **todos os arquivos gerados** e permite verificar a autoria sem depender de metadados externos.

> Os dados da equipe **não devem ser alterados manualmente** no `pom.xml` ou em qualquer outro arquivo — qualquer edição invalida o hash. Se necessário corrigir, regenerar o projeto com as informações corretas.

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
├── hooks/               # useTheme
├── models/              # Interfaces, catálogo de dependências, versões do Spring Boot
├── pages/               # GeneratorPage e VerifyPage
├── reducers/            # projectReducer (useReducer centralizado)
└── services/            # zipBuilder, share (URL de compartilhamento)
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

## Versões do Spring Boot suportadas

| Versão | Status |
|--------|--------|
| 4.0.3 | Habilitada (padrão) |
| 3.5.x | Visível, desabilitada |

## Licença

Uso didático interno — SENAC TADS.
