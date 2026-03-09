import type { ProjectState } from '../models/projectState';

const WARNING_COMMENT = `<!--
  Arquivo gerado automaticamente pelo TADS Spring Initializr customizado (versão didática).
  ATENÇÃO: Este arquivo NÃO é gerado pelo Spring Initializr oficial.
-->`;

// ── Lista (lista.html) ────────────────────────────────────────────────────────

export function generateListaHtml(state: ProjectState, hash: string): string {
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
</head>
<body>

  <h1>Lista de Exemplos</h1>

  <p th:if="\${mensagemSucesso}" th:text="\${mensagemSucesso}"></p>

  <a th:href="@{/exemplos/novo}">+ Adicionar Novo</a>

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

</body>
</html>
`;
}

// ── Formulário (form.html) ────────────────────────────────────────────────────

export function generateFormHtml(state: ProjectState, hash: string): string {
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
</head>
<body>

  <h1>Novo Exemplo</h1>

  <form th:action="@{/exemplos}" th:object="\${exemplo}" method="post">
    <div>
      <label for="tipo">Tipo</label>
      <input id="tipo" type="text" th:field="*{tipo}" placeholder="ex: categoria" required>
    </div>
    <div>
      <label for="mensagem">Mensagem</label>
      <input id="mensagem" type="text" th:field="*{mensagem}" placeholder="ex: olá mundo" required>
    </div>
    <div>
      <button type="submit">Salvar</button>
      <a th:href="@{/exemplos}">Cancelar</a>
    </div>
  </form>

</body>
</html>
`;
}
