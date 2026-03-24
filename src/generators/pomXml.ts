import type { ProjectState } from '../models/projectState';
import { getDependencyById } from '../models/dependencies';
import type { Dependency } from '../models/dependencies';

// ── Helpers ───────────────────────────────────────────────────────────────────

function indent(n: number): string {
  return '\t'.repeat(n);
}

interface DepOpts {
  version?: string;
  scope?: string;
  optional?: boolean;
}

function depXml(groupId: string, artifactId: string, opts: DepOpts = {}): string {
  const lines = [
    `${indent(2)}<dependency>`,
    `${indent(3)}<groupId>${groupId}</groupId>`,
    `${indent(3)}<artifactId>${artifactId}</artifactId>`,
  ];
  if (opts.version) lines.push(`${indent(3)}<version>${opts.version}</version>`);
  if (opts.scope)   lines.push(`${indent(3)}<scope>${opts.scope}</scope>`);
  if (opts.optional) lines.push(`${indent(3)}<optional>true</optional>`);
  lines.push(`${indent(2)}</dependency>`);
  return lines.join('\n');
}

// IDs that are NOT emitted as regular compile-scope <dependency> entries
// (either handled as runtime/optional or as annotationProcessorPaths)
const RUNTIME_IDS  = new Set(['devtools', 'docker-compose', 'mysql', 'h2', 'mariadb', 'postgresql']);
const ANNOTATION_PROCESSOR_IDS = new Set(['lombok', 'configuration-processor']);

// ── Main generator ────────────────────────────────────────────────────────────

/**
 * Generates the full pom.xml content for the project.
 * Hash is embedded after </developers> per R9.
 */
export function generatePomXml(state: ProjectState, hash: string): string {
  const appVersion = __APP_VERSION__;
  const deps = state.dependencies;

  const hasThymeleaf     = deps.includes('thymeleaf');
  const hasWeb           = deps.includes('web');
  const hasSecurity      = deps.includes('security') || deps.includes('oauth2-resource-server');
  const hasLombok        = deps.includes('lombok');
  const hasH2            = deps.includes('h2');
  const hasActuator      = deps.includes('actuator');
  const hasDataJpa       = deps.includes('data-jpa');
  const hasMail          = deps.includes('mail');
  const hasValidation    = deps.includes('validation');
  const hasConfigProc    = deps.includes('configuration-processor');

  // ── Developers block ───────────────────────────────────────────────────────

  const developersXml = state.developers
    .map((dev) =>
      [
        `${indent(2)}<developer>`,
        `${indent(3)}<id>${dev.github}</id>`,
        `${indent(3)}<name>${dev.name}</name>`,
        `${indent(3)}<email>${dev.email}</email>`,
        `${indent(2)}</developer>`,
      ].join('\n')
    )
    .join('\n');

  // ── Compile-scope dependencies ─────────────────────────────────────────────

  const compileDeps: string[] = [];

  // Spring Boot 4: h2console when H2 is selected
  if (hasH2) {
    compileDeps.push(depXml('org.springframework.boot', 'spring-boot-h2console'));
  }

  // Selected deps that are NOT runtime-only and NOT annotation-processor-only
  const selectedCompile: Dependency[] = deps
    .filter((id) => !RUNTIME_IDS.has(id) && !ANNOTATION_PROCESSOR_IDS.has(id))
    .map((id) => getDependencyById(id))
    .filter((d): d is Dependency => d !== undefined);

  for (const d of selectedCompile) {
    compileDeps.push(depXml(d.groupId, d.artifactId, { version: d.version }));
  }

  // Auto-include: thymeleaf + security → thymeleaf-extras-springsecurity6 (R6)
  if (hasThymeleaf && hasSecurity) {
    compileDeps.push(depXml('org.thymeleaf.extras', 'thymeleaf-extras-springsecurity6'));
  }

  // Auto-include: thymeleaf → layout dialect + WebJars
  if (hasThymeleaf) {
    compileDeps.push(`\t\t<!-- ATENÇÃO: As dependências layout-dialect e webjars abaixo NÃO são geradas pelo Spring Initializr oficial. -->`);
    compileDeps.push(depXml('nz.net.ultraq.thymeleaf', 'thymeleaf-layout-dialect', { version: '4.0.0' }));
    compileDeps.push(`\t\t<!-- WebJars: bibliotecas de frontend gerenciadas pelo Maven -->`);
    compileDeps.push(depXml('org.webjars', 'webjars-locator-lite'));
    compileDeps.push(depXml('org.webjars', 'bootstrap', { version: '5.3.8' }));
    compileDeps.push(depXml('org.webjars', 'font-awesome', { version: '7.2.0' }));
    compileDeps.push('');
  }

  // Auto-include: web + NOT thymeleaf → springdoc OpenAPI 3 (R2)
  if (hasWeb && !hasThymeleaf) {
    compileDeps.push(`\t\t<!-- ATENÇÃO: A dependência abaixo NÃO é gerada pelo Spring Initializr oficial. -->`);
    compileDeps.push(
      depXml('org.springdoc', 'springdoc-openapi-starter-webmvc-ui', { version: '3.0.2' })
    );
  }

  // ── Runtime / optional dependencies ───────────────────────────────────────

  const runtimeDeps: string[] = [];

  for (const id of ['devtools', 'docker-compose'] as const) {
    if (deps.includes(id)) {
      const d = getDependencyById(id)!;
      runtimeDeps.push(depXml(d.groupId, d.artifactId, { scope: 'runtime', optional: true }));
    }
  }

  // DB drivers — runtime only (no optional flag)
  for (const id of ['mysql', 'h2', 'mariadb', 'postgresql'] as const) {
    if (deps.includes(id)) {
      const d = getDependencyById(id)!;
      runtimeDeps.push(depXml(d.groupId, d.artifactId, { scope: 'runtime' }));
    }
  }

  // Lombok — optional, no scope
  if (hasLombok) {
    runtimeDeps.push(depXml('org.projectlombok', 'lombok', { optional: true }));
  }

  // ── Test dependencies ──────────────────────────────────────────────────────

  const testDeps: string[] = [
    depXml('org.springframework.boot', 'spring-boot-starter-test', { scope: 'test' }),
  ];

  // Spring Boot 4 adds test starters for each included starter
  if (hasActuator)   testDeps.push(depXml('org.springframework.boot', 'spring-boot-starter-actuator-test',   { scope: 'test' }));
  if (hasDataJpa)    testDeps.push(depXml('org.springframework.boot', 'spring-boot-starter-data-jpa-test',    { scope: 'test' }));
  if (hasMail)       testDeps.push(depXml('org.springframework.boot', 'spring-boot-starter-mail-test',        { scope: 'test' }));
  if (hasSecurity)   testDeps.push(depXml('org.springframework.boot', 'spring-boot-starter-security-test',    { scope: 'test' }));
  if (hasThymeleaf)  testDeps.push(depXml('org.springframework.boot', 'spring-boot-starter-thymeleaf-test',   { scope: 'test' }));
  if (hasValidation) testDeps.push(depXml('org.springframework.boot', 'spring-boot-starter-validation-test',  { scope: 'test' }));
  if (hasWeb)        testDeps.push(depXml('org.springframework.boot', 'spring-boot-starter-webmvc-test',      { scope: 'test' }));

  const allDepsXml = [...compileDeps, ...runtimeDeps, ...testDeps].join('\n');

  // ── Build plugins ──────────────────────────────────────────────────────────

  const plugins: string[] = [];

  // maven-compiler-plugin — only when annotation processors are present
  if (hasLombok || hasConfigProc) {
    const paths: string[] = [];
    if (hasLombok) {
      paths.push(
        [
          `${indent(6)}<path>`,
          `${indent(7)}<groupId>org.projectlombok</groupId>`,
          `${indent(7)}<artifactId>lombok</artifactId>`,
          `${indent(6)}</path>`,
        ].join('\n')
      );
    }
    if (hasConfigProc) {
      paths.push(
        [
          `${indent(6)}<path>`,
          `${indent(7)}<groupId>org.springframework.boot</groupId>`,
          `${indent(7)}<artifactId>spring-boot-configuration-processor</artifactId>`,
          `${indent(6)}</path>`,
        ].join('\n')
      );
    }
    plugins.push(
      [
        `${indent(3)}<plugin>`,
        `${indent(4)}<groupId>org.apache.maven.plugins</groupId>`,
        `${indent(4)}<artifactId>maven-compiler-plugin</artifactId>`,
        `${indent(4)}<configuration>`,
        `${indent(5)}<parameters>true</parameters>`,
        `${indent(5)}<annotationProcessorPaths>`,
        paths.join('\n'),
        `${indent(5)}</annotationProcessorPaths>`,
        `${indent(4)}</configuration>`,
        `${indent(3)}</plugin>`,
      ].join('\n')
    );
  }

  // spring-boot-maven-plugin (always present)
  const bootPluginLines = [
    `${indent(3)}<plugin>`,
    `${indent(4)}<groupId>org.springframework.boot</groupId>`,
    `${indent(4)}<artifactId>spring-boot-maven-plugin</artifactId>`,
  ];
  if (hasLombok) {
    bootPluginLines.push(
      `${indent(4)}<configuration>`,
      `${indent(5)}<excludes>`,
      `${indent(6)}<exclude>`,
      `${indent(7)}<groupId>org.projectlombok</groupId>`,
      `${indent(7)}<artifactId>lombok</artifactId>`,
      `${indent(6)}</exclude>`,
      `${indent(5)}</excludes>`,
      `${indent(4)}</configuration>`
    );
  }
  bootPluginLines.push(`${indent(3)}</plugin>`);
  plugins.push(bootPluginLines.join('\n'));

  const pluginsXml = plugins.join('\n');

  // ── Full pom.xml ───────────────────────────────────────────────────────────

  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
\txsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
\t<modelVersion>4.0.0</modelVersion>
\t<parent>
\t\t<groupId>org.springframework.boot</groupId>
\t\t<artifactId>spring-boot-starter-parent</artifactId>
\t\t<version>${state.springBootVersion}</version>
\t\t<relativePath/> <!-- lookup parent from repository -->
\t</parent>
\t<groupId>${state.group}</groupId>
\t<artifactId>${state.artifact}</artifactId>
\t<version>0.0.1-SNAPSHOT</version>
\t<name>${state.name}</name>
\t<description>${state.description}</description>

\t<developers>
${developersXml}
\t</developers>
\t<!-- Versão do TADS Spring Initializr: ${appVersion} -->
\t<!-- hash-identificacao: ${hash} -->

\t<properties>
\t\t<java.version>${state.javaVersion}</java.version>
\t</properties>

\t<dependencies>
${allDepsXml}
\t</dependencies>

\t<build>
\t\t<plugins>
${pluginsXml}
\t\t</plugins>
\t</build>

</project>
`;
}
