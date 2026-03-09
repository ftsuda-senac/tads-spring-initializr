import type { ProjectState } from '../models/projectState';

const DB_WARNING = `# ATENÇÃO: As configurações de banco de dados e JPA abaixo NÃO são adicionadas pelo
# Spring Initializr oficial. Foram incluídas apenas para fins didáticos.`;

// ── Datasource configs ────────────────────────────────────────────────────────

function postgresConfig(artifactId: string): string {
  return `spring.datasource.url=jdbc:postgresql://localhost:5432/${artifactId}
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver`;
}

function mysqlConfig(artifactId: string): string {
  return `spring.datasource.url=jdbc:mysql://localhost:3306/${artifactId}?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver`;
}

function h2Config(artifactId: string): string {
  return `spring.datasource.url=jdbc:h2:mem:${artifactId}
# Trocar a linha acima pelas duas linhas abaixo se H2 usar arquivos
# No Windows, o arquivo será criado no diretório C:\\Users\\<NOME_USUARIO>\\${artifactId}-h2-data.mv
# spring.datasource.url=jdbc:h2:file:~/${artifactId}-h2-data
# spring.sql.init.platform=h2

spring.datasource.username=sa
spring.datasource.password=
spring.datasource.driver-class-name=org.h2.Driver
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console`;
}

function jpaConfig(): string {
  return `spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.hibernate.ddl-auto=update

# ATENÇÃO: PARA PROJETOS REAIS, RECOMENDA-SE DESCOMENTAR A OPÇÃO ABAIXO:
# spring.jpa.open-in-view=false`;
}

// ── Main generator ────────────────────────────────────────────────────────────

/**
 * Generates application.properties content.
 * Hash injected as first-line comment (R9).
 * Datasource configured conditionally per R7.
 */
export function generateProperties(state: ProjectState, hash: string): string {
  const deps = state.dependencies;
  const hasJpa = deps.includes('data-jpa');
  const hasPostgres = deps.includes('postgresql');
  const hasMysql = deps.includes('mysql');
  const hasH2 = deps.includes('h2');
  const hasWeb = deps.includes('web');
  const hasThymeleaf = deps.includes('thymeleaf');

  const sections: string[] = [];

  // Hash (first line, R9)
  sections.push(`# hash-identificacao: ${hash}`);

  // Reference to all available properties
  sections.push(`\n# Configurações padrão disponíveis: https://docs.spring.io/spring-boot/appendix/application-properties/index.html`);

  // Always include app name
  sections.push(`\nspring.application.name=${state.artifact}`);

  // Web server
  sections.push(`\n# --- Servidor Web ---`);
  sections.push(`# server.port=8080`);
  sections.push(`# server.servlet.context-path=/  # Opcional: definir um contexto base para a API`);

  // Jackson: pretty-print JSON responses for REST projects
  if (hasWeb && !hasThymeleaf) {
    sections.push(`\n# --- Jackson (serialização JSON formatada) ---`);
    sections.push(`spring.jackson.serialization.INDENT_OUTPUT=true`);
  }

  if (hasJpa) {
    sections.push(`\n${DB_WARNING}`);

    // Determine primary driver; comment out the rest
    const drivers = [
      hasPostgres ? { id: 'postgresql', config: postgresConfig(state.artifact) } : null,
      hasMysql ? { id: 'mysql', config: mysqlConfig(state.artifact) } : null,
      hasH2 ? { id: 'h2', config: h2Config(state.artifact) } : null,
    ].filter((d): d is { id: string; config: string } => d !== null);

    if (drivers.length > 0) {
      const [primary, ...rest] = drivers;
      sections.push(`\n# --- Datasource (${primary.id}) ---`);
      sections.push(primary.config);

      for (const driver of rest) {
        sections.push(`\n# --- Datasource alternativo (${driver.id}) — descomente para usar ---`);
        sections.push(
          driver.config
            .split('\n')
            .map((line) => `# ${line}`)
            .join('\n')
        );
      }
    } else {
      sections.push(`\n# --- Datasource --- configure sua fonte de dados aqui`);
      sections.push(`# spring.datasource.url=jdbc:...`);
      sections.push(`# spring.datasource.username=`);
      sections.push(`# spring.datasource.password=`);
    }

    sections.push(`\n# --- JPA / Hibernate ---`);
    sections.push(jpaConfig());
  }

  return sections.join('\n') + '\n';
}
