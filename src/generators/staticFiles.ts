import type { ProjectState } from '../models/projectState';
import { getDependencyById } from '../models/dependencies';

// ── static/index.html ─────────────────────────────────────────────────────────

export function generateIndexHtml(state: ProjectState, hash: string): string {
  const deps = state.dependencies;
  const hasThymeleaf = deps.includes('thymeleaf');
  const hasH2 = deps.includes('h2');

  const displayName = state.name.charAt(0).toUpperCase() + state.name.slice(1);

  const now = new Date();
  const timestamp = now.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const devItems = state.developers
    .filter(d => d.name.trim())
    .map(d => `      <li>${d.name.trim()}</li>`)
    .join('\n');

  const devList = devItems
    ? `<ul>\n${devItems}\n    </ul>`
    : '<p><em>Nenhum desenvolvedor informado.</em></p>';

  const links: string[] = [];
  if (hasThymeleaf) {
    links.push(`    <li><a href="/exemplos">Tela de listagem de exemplo (Thymeleaf)</a></li>`);
  } else {
    links.push(`    <li><a href="/swagger-ui.html">Swagger UI — documentação da API REST</a></li>`);
  }
  if (hasH2) {
    links.push(`    <li><a href="/h2-console">H2 Console — banco de dados em memória</a></li>`);
  }

  const appVersion = __APP_VERSION__;

  return `<!-- hash-identificacao: ${hash} -->
<!--
  Arquivo gerado automaticamente pelo TADS Spring Initializr customizado (versão didática).
  ATENÇÃO: Este arquivo NÃO é gerado pelo Spring Initializr oficial.
-->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${displayName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 720px; margin: 2.5rem auto; padding: 0 1.25rem 5rem; color: #333; line-height: 1.6; }
    h1 { color: #6db33f; border-bottom: 2px solid #6db33f; padding-bottom: 0.4rem; margin-bottom: 0.25rem; }
    h2 { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-top: 2rem; margin-bottom: 0.5rem; }
    a { color: #6db33f; }
    ul { padding-left: 1.5rem; margin: 0; }
    li { margin: 0.35rem 0; }
    .meta { background: #f6f8f6; border: 1px solid #d4e8c4; border-radius: 6px; padding: 1rem 1.25rem; font-size: 0.875rem; }
    .hash { font-family: monospace; font-size: 0.78rem; word-break: break-all; color: #666; margin: 0.25rem 0 0; }
    .generated { font-size: 0.8rem; color: #999; margin-top: 0.5rem; }
    .curiosity { background: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 0.75rem 1rem; margin-top: 2rem; font-size: 0.875rem; color: #78450e; }
    .curiosity strong { display: block; margin-bottom: 0.25rem; }
    .site-footer { position: fixed; bottom: 0; left: 0; right: 0; background: #1e2d1e; color: #7a9a7a; font-size: 0.75rem; text-align: center; padding: 0.6rem 1rem; border-top: 1px solid #2e4a2e; }
    .site-footer a { color: #6db33f; text-decoration: none; }
    .site-footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>${displayName}</h1>
  <p>${state.description}</p>

  <h2>Links de apoio do projeto</h2>
  <ul>
${links.join('\n')}
    <li><a href="https://github.com/ftsuda-senac/dicas-desenvolvimento/blob/main/Dicas-e-Tutoriais-Spring.md" target="_blank" rel="noopener noreferrer">Dicas e Tutoriais Spring</a></li>
  </ul>

  <div class="curiosity">
    <strong>🔍 Para pesquisar:</strong>
    Por que esta página se chama <code>index.html</code>?
  </div>

  <h2>Identificação do projeto</h2>
  <div class="meta">
    <strong>Desenvolvedores:</strong>
    ${devList}
    <p class="hash"><strong>hash-identificacao:</strong> ${hash}</p>
    <p class="generated">Gerado em: ${timestamp}</p>
  </div>

  <footer class="site-footer">
    Gerado pelo <a href="https://ftsuda-senac.github.io/tads-spring-initializr/" target="_blank" rel="noopener noreferrer">TADS Spring Initializr</a> — v${appVersion}
  </footer>
</body>
</html>
`;
}

// ── .gitignore ────────────────────────────────────────────────────────────────

export function generateGitignore(): string {
  return `HELP.md
target/
!.mvn/wrapper/maven-wrapper.jar
!**/src/main/**/target/
!**/src/test/**/target/

### STS ###
.apt_generated
.classpath
.factorypath
.project
.settings
.springBeans
.sts4-cache

### IntelliJ IDEA ###
.idea
*.iws
*.iml
*.ipr

### NetBeans ###
/nbproject/private/
/nbbuild/
/dist/
/nbdist/
/.nb-gradle/
build/
!**/src/main/**/build/
!**/src/test/**/build/

### VS Code ###
.vscode/
`;
}

// ── .editorconfig ─────────────────────────────────────────────────────────────

/** Content is fixed per CLAUDE.md specification. */
export function generateEditorconfig(): string {
  return `[*]
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
`;
}

// ── HELP.md ───────────────────────────────────────────────────────────────────

const DEP_LINKS: Record<string, string> = {
  'web': 'https://docs.spring.io/spring-framework/reference/web/webmvc.html',
  'thymeleaf': 'https://www.thymeleaf.org/documentation.html',
  'validation': 'https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html',
  'devtools': 'https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools',
  'lombok': 'https://projectlombok.org/',
  'security': 'https://docs.spring.io/spring-security/reference/',
  'oauth2-resource-server': 'https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/',
  'data-jpa': 'https://docs.spring.io/spring-data/jpa/reference/',
  'postgresql': 'https://jdbc.postgresql.org/',
  'mysql': 'https://dev.mysql.com/doc/connector-j/en/',
  'h2': 'https://www.h2database.com/html/main.html',
  'mail': 'https://docs.spring.io/spring-framework/reference/integration/email.html',
  'actuator': 'https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html',
};

export function generateHelpMd(state: ProjectState): string {
  const depsSection = state.dependencies.length > 0
    ? state.dependencies
        .map((id) => {
          const dep = getDependencyById(id);
          if (!dep) return null;
          const link = DEP_LINKS[id] ?? '#';
          return `- [${dep.name}](${link}) — ${dep.description}`;
        })
        .filter(Boolean)
        .join('\n')
    : '_Nenhuma dependência selecionada._';

  return `# ${state.name}

> **Observação — Spring Initializr Customizado**
> Este projeto foi gerado pelo **TADS Spring Initializr customizado**, uma ferramenta
> didática para a disciplina de Desenvolvimento de Sistemas Web no curso TADS do Senac.
> A estrutura gerada é equivalente à do [Spring Initializr oficial](https://start.spring.io),
> porém inclui algumas dependências adicionais não presentes no gerador
> original (ex: Springdoc OpenAPI/Swagger, Thymeleaf Layout Dialect, WebJars).

## Dependências selecionadas

${depsSection}

## Como executar

Este projeto foi criado para ser aberto diretamente na IDE de sua preferência
(IntelliJ IDEA, Eclipse, STS, VS Code com extensão Java, etc.). Importe-o como um
projeto Maven existente e aguarde o download das dependências.

### Pré-requisitos

- Java ${state.javaVersion}+
- Maven 3.9+ (instalado localmente **ou** use o Maven Wrapper após gerá-lo — veja abaixo)

### Gerando os arquivos do Maven Wrapper

O arquivo ZIP gerado por esta ferramenta **não inclui** os scripts \`mvnw\` / \`mvnw.cmd\`.
Para gerá-los, execute o comando abaixo uma vez na raiz do projeto (requer Maven instalado):

\`\`\`bash
mvn wrapper:wrapper
\`\`\`

Isso criará os arquivos \`mvnw\`, \`mvnw.cmd\` e o diretório \`.mvn/wrapper/\`.

### Executar com Maven Wrapper

\`\`\`bash
# Linux / macOS
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
\`\`\`

### Executar com Maven local

\`\`\`bash
mvn spring-boot:run
\`\`\`

### Empacotar

\`\`\`bash
./mvnw clean package
java -jar target/${state.artifact}-0.0.1-SNAPSHOT.jar
\`\`\`

## Referências

- [Documentação do Spring Boot](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Guias do Spring](https://spring.io/guides)
- [Spring Initializr oficial](https://start.spring.io)
- [Como gerar os arquivos do Maven Wrapper](https://mkyong.com/maven/how-to-generate-maven-wrapper-files-mvnw-and-mvnw-cmd/)
- [Dicas e Tutoriais Spring](https://github.com/ftsuda-senac/dicas-desenvolvimento/blob/main/Dicas-e-Tutoriais-Spring.md)
`;
}
