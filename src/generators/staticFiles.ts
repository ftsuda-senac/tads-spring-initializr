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

  const hasWeb = deps.includes('web');

  const links: string[] = [];
  if (hasWeb && hasThymeleaf) {
    links.push(`    <li><a href="/exemplos">Tela de listagem de exemplo (Thymeleaf)</a></li>`);
  }
  if (hasWeb && !hasThymeleaf) {
    if (state.generateExamples) {
      links.push(`    <li><a href="/exemplo.html">Página de exemplo com Fetch API</a></li>`);
    }
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

// ── static/exemplo.html ───────────────────────────────────────────────────────

export function generateExemploHtml(state: ProjectState, hash: string): string {
  const displayName = state.name.charAt(0).toUpperCase() + state.name.slice(1);
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
  <title>Exemplos — ${displayName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 720px; margin: 2.5rem auto; padding: 0 1.25rem 5rem; color: #333; line-height: 1.6; }
    h1 { color: #6db33f; border-bottom: 2px solid #6db33f; padding-bottom: 0.4rem; margin-bottom: 0.25rem; }
    h2 { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-top: 2rem; margin-bottom: 0.75rem; }
    a { color: #6db33f; }
    p { margin: 0.5rem 0; }
    nav { margin-bottom: 1.5rem; font-size: 0.875rem; }

    section { background: #f6f8f6; border: 1px solid #d4e8c4; border-radius: 6px; padding: 1.25rem; margin-bottom: 1.5rem; }

    button { background: #6db33f; color: #fff; border: none; border-radius: 4px; padding: 0.45rem 1rem; font-size: 0.875rem; cursor: pointer; }
    button:hover { background: #5a9a32; }

    table { width: 100%; border-collapse: collapse; margin-top: 0.75rem; font-size: 0.875rem; }
    th, td { text-align: left; padding: 0.4rem 0.6rem; border-bottom: 1px solid #d4e8c4; }
    th { background: #eaf4e0; font-weight: 700; }

    .form-row { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 0.75rem; }
    label { font-size: 0.875rem; font-weight: 600; }
    input[type="text"] { width: 100%; box-sizing: border-box; padding: 0.4rem 0.6rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.875rem; }
    input[type="text"]:focus { outline: none; border-color: #6db33f; }

    .msg-ok  { color: #2d6a00; font-size: 0.875rem; margin-top: 0.5rem; }
    .msg-err { color: #b00020; font-size: 0.875rem; margin-top: 0.5rem; }

    .site-footer { position: fixed; bottom: 0; left: 0; right: 0; background: #1e2d1e; color: #7a9a7a; font-size: 0.75rem; text-align: center; padding: 0.6rem 1rem; border-top: 1px solid #2e4a2e; }
    .site-footer a { color: #6db33f; text-decoration: none; }

    .aviso-fonte { background: #fffbeb; border: 1px solid #f59e0b; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 0.75rem 1rem; margin-bottom: 1.5rem; font-size: 0.875rem; color: #78450e; }
    .aviso-fonte strong { display: block; margin-bottom: 0.2rem; }
  </style>
</head>
<body>
  <h1>Exemplos — ${displayName}</h1>

  <nav>
    <a href="/">← Início</a> &nbsp;|&nbsp;
    <a href="/swagger-ui.html">Swagger UI</a>
  </nav>

  <div class="aviso-fonte">
    <strong>📄 Analise o código-fonte desta página</strong>
    Para entender a lógica de comunicação com a API REST, abra o arquivo
    <code>src/main/resources/static/exemplo.html</code> na IDE e localize a tag <code>&lt;script&gt;</code>.
  </div>

  <!-- ======== SEÇÃO 1: LISTAR ======== -->
  <section>
    <h2>Lista de exemplos</h2>
    <p>Clique no botão para buscar os dados da API: <code>GET /api/exemplos</code></p>
    <button id="btn-listar" type="button">Carregar lista</button>
    <div id="area-lista"></div>
  </section>

  <!-- ======== SEÇÃO 2: ADICIONAR ======== -->
  <section>
    <h2>Adicionar exemplo</h2>
    <p>Preencha os campos e clique em Adicionar para enviar para a API: <code>POST /api/exemplos</code></p>
    <form id="form-adicionar" novalidate>
      <div class="form-row">
        <label for="campo-tipo">Tipo</label>
        <input type="text" id="campo-tipo" placeholder="ex: novo-tipo">
      </div>
      <div class="form-row">
        <label for="campo-mensagem">Mensagem</label>
        <input type="text" id="campo-mensagem" placeholder="ex: Minha mensagem">
      </div>
      <button type="submit">Adicionar</button>
    </form>
    <p id="msg-adicionar"></p>
  </section>

  <footer class="site-footer">
    Gerado pelo <a href="https://ftsuda-senac.github.io/tads-spring-initializr/" target="_blank" rel="noopener noreferrer">TADS Spring Initializr</a> — v${appVersion}
  </footer>

  <script>

    // ================================================================
    // SEÇÃO 1 — Listar todos os exemplos via GET
    // ================================================================

    const btnListar = document.getElementById('btn-listar');
    const areaLista = document.getElementById('area-lista');

    // async: indica que a função executa operações assíncronas com await
    btnListar.addEventListener('click', async function() {
      areaLista.innerHTML = '<p>Carregando...</p>';

      // try/catch substitui o .catch() — captura qualquer erro dentro do bloco
      try {
        // await pausa a execução aqui até a Promise do fetch() ser resolvida,
        // sem bloquear o restante da página
        const response = await fetch('/api/exemplos');

        // await novamente: aguarda a leitura e conversão do corpo para objeto JavaScript
        const lista = await response.json();

        // 'lista' é o array de objetos retornado pela API: [{id, tipo, mensagem}, ...]
        if (lista.length === 0) {
          areaLista.innerHTML = '<p>Nenhum exemplo encontrado.</p>';
          return;
        }

        // Montar a tabela HTML com os dados recebidos
        let html = '<table>';
        html += '<thead><tr><th>ID</th><th>Tipo</th><th>Mensagem</th></tr></thead>';
        html += '<tbody>';
        for (let i = 0; i < lista.length; i++) {
          const item = lista[i];
          html += '<tr>';
          html += '<td>' + item.id + '</td>';
          html += '<td>' + item.tipo + '</td>';
          html += '<td>' + item.mensagem + '</td>';
          html += '</tr>';
        }
        html += '</tbody></table>';
        areaLista.innerHTML = html;

      } catch (erro) {
        // Executado se fetch() lançar erro (ex: servidor offline, erro de rede)
        areaLista.innerHTML = '<p class="msg-err">Erro ao conectar com a API. Verifique se a aplicação está rodando.</p>';
        console.error('Erro ao buscar exemplos:', erro);
      }
    });

    // ================================================================
    // SEÇÃO 2 — Adicionar novo exemplo via POST
    // ================================================================

    const formAdicionar = document.getElementById('form-adicionar');
    const campoTipo     = document.getElementById('campo-tipo');
    const campoMensagem = document.getElementById('campo-mensagem');
    const msgAdicionar  = document.getElementById('msg-adicionar');

    // async: necessário para usar await dentro do handler do evento
    formAdicionar.addEventListener('submit', async function(evento) {
      // Impede o comportamento padrão do formulário (recarregar a página)
      evento.preventDefault();

      const tipo     = campoTipo.value.trim();
      const mensagem = campoMensagem.value.trim();

      if (!tipo || !mensagem) {
        msgAdicionar.className = 'msg-err';
        msgAdicionar.textContent = 'Preencha todos os campos antes de enviar.';
        return;
      }

      msgAdicionar.className = '';
      msgAdicionar.textContent = 'Enviando...';

      // Montar o objeto que será enviado no corpo da requisição
      const novoItem = { tipo: tipo, mensagem: mensagem };

      try {
        const response = await fetch('/api/exemplos', {
          method: 'POST',
          headers: {
            // Informa ao servidor que o corpo está em formato JSON
            'Content-Type': 'application/json'
          },
          // JSON.stringify converte o objeto JavaScript em texto JSON
          body: JSON.stringify(novoItem)
        });

        // 'criado' é o objeto retornado pela API com o ID gerado pelo servidor
        const criado = await response.json();

        msgAdicionar.className = 'msg-ok';
        msgAdicionar.textContent = 'Adicionado com sucesso! ID gerado pelo servidor: ' + criado.id;
        formAdicionar.reset();

      } catch (erro) {
        msgAdicionar.className = 'msg-err';
        msgAdicionar.textContent = 'Erro ao adicionar. Verifique o console (F12).';
        console.error('Erro ao adicionar exemplo:', erro);
      }
    });

  </script>
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

### VARIÁVEIS DE AMBIENTE (dotenv) ###
### Arquivos de configuração local que podem conter segredos (ex: credenciais de banco, chaves de API).
### Estes arquivos NÃO devem ser versionados para evitar exposição acidental de informações sensíveis.
### Manter somente uma versão de exemplo (.env.example) com valores fictícios para referência.
### Eles NÃO são gerados pelo Spring Initializr oficial, mas foram incluídos neste projeto para fins didáticos e de conveniência.
.env
.env.*
!.env.example
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
