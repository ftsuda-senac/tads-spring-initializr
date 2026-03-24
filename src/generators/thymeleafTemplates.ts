import type { ProjectState } from '../models/projectState';

const WARNING_COMMENT = `<!--
  Arquivo gerado automaticamente pelo TADS Spring Initializr customizado (versão didática).
  ATENÇÃO: Este arquivo NÃO é gerado pelo Spring Initializr oficial.
-->`;

// CSS compartilhado — mesmo visual de static/exemplo.html
const SHARED_CSS = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 720px; margin: 2.5rem auto; padding: 0 1.25rem 5rem; color: #333; line-height: 1.6; }
    h1 { color: #6db33f; border-bottom: 2px solid #6db33f; padding-bottom: 0.4rem; margin-bottom: 0.25rem; }
    h2 { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-top: 2rem; margin-bottom: 0.75rem; }
    a { color: #6db33f; }
    p { margin: 0.5rem 0; }
    nav { margin-bottom: 1.5rem; font-size: 0.875rem; }
    section { background: #f6f8f6; border: 1px solid #d4e8c4; border-radius: 6px; padding: 1.25rem; margin-bottom: 1.5rem; }
    button, .btn { background: #6db33f; color: #fff; border: none; border-radius: 4px; padding: 0.45rem 1rem; font-size: 0.875rem; cursor: pointer; text-decoration: none; display: inline-block; }
    button:hover, .btn:hover { background: #5a9a32; }
    .btn-secondary { background: #555; }
    .btn-secondary:hover { background: #333; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.75rem; font-size: 0.875rem; }
    th, td { text-align: left; padding: 0.4rem 0.6rem; border-bottom: 1px solid #d4e8c4; }
    th { background: #eaf4e0; font-weight: 700; }
    .form-row { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 0.75rem; }
    label { font-size: 0.875rem; font-weight: 600; }
    input[type="text"] { width: 100%; box-sizing: border-box; padding: 0.4rem 0.6rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.875rem; }
    input[type="text"]:focus { outline: none; border-color: #6db33f; }
    .msg-ok  { color: #2d6a00; background: #f0fae8; border: 1px solid #d4e8c4; border-radius: 4px; padding: 0.5rem 0.75rem; font-size: 0.875rem; }
    .site-footer { position: fixed; bottom: 0; left: 0; right: 0; background: #1e2d1e; color: #7a9a7a; font-size: 0.75rem; text-align: center; padding: 0.6rem 1rem; border-top: 1px solid #2e4a2e; }
    .site-footer a { color: #6db33f; text-decoration: none; }
    .aviso-fonte { background: #fffbeb; border: 1px solid #f59e0b; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 0.75rem 1rem; margin-bottom: 1.5rem; font-size: 0.875rem; color: #78450e; }
    .aviso-fonte strong { display: block; margin-bottom: 0.2rem; }`;

// ── Lista (lista.html) ────────────────────────────────────────────────────────

export function generateListaHtml(state: ProjectState, hash: string): string {
  const appVersion = __APP_VERSION__;
  return `<!-- hash-identificacao: ${hash} -->
${WARNING_COMMENT}
<!DOCTYPE html>
<html lang="pt-BR"
      xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${state.name} — Lista de Exemplos</title>
  <style>${SHARED_CSS}
  </style>
</head>
<body>

  <h1>${state.name}</h1>

  <nav>
    <a href="/">← Início</a>
  </nav>

  <div class="aviso-fonte">
    <strong>📄 Analise o código-fonte desta página</strong>
    Para entender como o Thymeleaf renderiza os dados no servidor, abra o arquivo
    <code>src/main/resources/templates/exemplos/lista.html</code> na IDE
    e localize as expressões <code>th:each</code>, <code>th:text</code> e <code>th:if</code>.
  </div>

  <section>
    <h2>Lista de Exemplos</h2>

    <p th:if="\${mensagemSucesso}" th:text="\${mensagemSucesso}" class="msg-ok"></p>

    <p>
      <a th:href="@{/exemplos/novo}" class="btn">+ Adicionar Novo</a>
    </p>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Tipo</th>
          <th>Mensagem</th>
        </tr>
      </thead>
      <tbody>
        <tr th:each="exemplo : \${exemplos}">
          <td th:text="\${exemplo.id}"></td>
          <td th:text="\${exemplo.tipo}"></td>
          <td th:text="\${exemplo.mensagem}"></td>
        </tr>
        <tr th:if="\${#lists.isEmpty(exemplos)}">
          <td colspan="3">Nenhum registro encontrado.</td>
        </tr>
      </tbody>
    </table>
  </section>

  <footer class="site-footer">
    Gerado pelo <a href="https://ftsuda-senac.github.io/tads-spring-initializr/" target="_blank" rel="noopener noreferrer">TADS Spring Initializr</a> — v${appVersion}
  </footer>

</body>
</html>
`;
}

// ── Formulário (form.html) ────────────────────────────────────────────────────

export function generateFormHtml(state: ProjectState, hash: string): string {
  const appVersion = __APP_VERSION__;
  return `<!-- hash-identificacao: ${hash} -->
${WARNING_COMMENT}
<!DOCTYPE html>
<html lang="pt-BR"
      xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${state.name} — Novo Exemplo</title>
  <style>${SHARED_CSS}
  </style>
</head>
<body>

  <h1>${state.name}</h1>

  <nav>
    <a th:href="@{/exemplos}">← Lista de Exemplos</a>
  </nav>

  <div class="aviso-fonte">
    <strong>📄 Analise o código-fonte desta página</strong>
    Para entender como o Thymeleaf vincula os campos do formulário ao objeto Java, abra o arquivo
    <code>src/main/resources/templates/exemplos/form.html</code> na IDE
    e localize as expressões <code>th:action</code>, <code>th:object</code> e <code>th:field</code>.
  </div>

  <section>
    <h2>Novo Exemplo</h2>

    <form th:action="@{/exemplos}" th:object="\${exemplo}" method="post">
      <div class="form-row">
        <label for="tipo">Tipo</label>
        <input id="tipo" type="text" th:field="*{tipo}" placeholder="ex: categoria" required>
      </div>
      <div class="form-row">
        <label for="mensagem">Mensagem</label>
        <input id="mensagem" type="text" th:field="*{mensagem}" placeholder="ex: olá mundo" required>
      </div>
      <div style="display:flex; gap:0.75rem; align-items:center; margin-top:0.25rem;">
        <button type="submit">Salvar</button>
        <a th:href="@{/exemplos}" class="btn btn-secondary">Cancelar</a>
      </div>
    </form>
  </section>

  <footer class="site-footer">
    Gerado pelo <a href="https://ftsuda-senac.github.io/tads-spring-initializr/" target="_blank" rel="noopener noreferrer">TADS Spring Initializr</a> — v${appVersion}
  </footer>

</body>
</html>
`;
}
