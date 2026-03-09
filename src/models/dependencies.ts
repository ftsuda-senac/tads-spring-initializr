export interface Dependency {
  id: string;
  name: string;
  description: string;
  category: DependencyCategory;
  groupId: string;
  artifactId: string;
  /** Explicit version — undefined means managed by Spring Boot BOM */
  version?: string;
  scope?: 'compile' | 'runtime' | 'test' | 'provided';
}

export type DependencyCategory =
  | 'DEVELOPER TOOLS'
  | 'WEB'
  | 'TEMPLATE ENGINES'
  | 'SECURITY'
  | 'SQL'
  | 'I/O'
  | 'OPS';

export const DEPENDENCY_CATEGORIES: DependencyCategory[] = [
  'DEVELOPER TOOLS',
  'WEB',
  'TEMPLATE ENGINES',
  'SECURITY',
  'SQL',
  'I/O',
  'OPS',
];

export const DEPENDENCIES: Dependency[] = [
  // ── DEVELOPER TOOLS ──────────────────────────────────────────────────────
  {
    id: 'devtools',
    name: 'Spring Boot DevTools',
    description:
      'Provides fast application restarts, LiveReload, and configurations for enhanced development experience.',
    category: 'DEVELOPER TOOLS',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-devtools',
    scope: 'runtime',
  },
  {
    id: 'lombok',
    name: 'Lombok',
    description: 'Java annotation library which helps to reduce boilerplate code.',
    category: 'DEVELOPER TOOLS',
    groupId: 'org.projectlombok',
    artifactId: 'lombok',
    scope: 'provided',
  },
  {
    id: 'configuration-processor',
    name: 'Spring Configuration Processor',
    description:
      'Generate metadata for developers to offer contextual help and "code completion" when working with custom configuration keys (ex.application.properties/.yml files).',
    category: 'DEVELOPER TOOLS',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-configuration-processor',
    scope: 'provided',
  },
  {
    id: 'docker-compose',
    name: 'Docker Compose Support',
    description:
      'Provides docker compose support for enhanced development experience.',
    category: 'DEVELOPER TOOLS',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-docker-compose',
    scope: 'runtime',
  },

  // ── WEB ──────────────────────────────────────────────────────────────────
  {
    id: 'web',
    name: 'Spring Web',
    description:
      'Build web, including RESTful, applications using Spring MVC. Uses Apache Tomcat as the default embedded container.',
    category: 'WEB',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-webmvc',
  },
  // ── TEMPLATE ENGINES ─────────────────────────────────────────────────────
  {
    id: 'thymeleaf',
    name: 'Thymeleaf',
    description:
      'A modern server-side Java template engine for both web and standalone environments. Allows HTML to be correctly displayed in browsers and as static prototypes.',
    category: 'TEMPLATE ENGINES',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-thymeleaf',
  },

  // ── SECURITY ─────────────────────────────────────────────────────────────
  {
    id: 'security',
    name: 'Spring Security',
    description:
      'Highly customizable authentication and access-control framework for Spring applications.',
    category: 'SECURITY',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-security',
  },
  {
    id: 'oauth2-resource-server',
    name: 'OAuth2 Resource Server',
    description:
      'Spring Boot integration for Spring Security OAuth2 Resource Server.',
    category: 'SECURITY',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-oauth2-resource-server',
  },

  // ── SQL ───────────────────────────────────────────────────────────────────
  {
    id: 'data-jpa',
    name: 'Spring Data JPA',
    description:
      'Persist data in SQL stores with Java Persistence API using Spring Data and Hibernate.',
    category: 'SQL',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-data-jpa',
  },
  {
    id: 'mysql',
    name: 'MySQL Driver',
    description: 'MySQL JDBC driver.',
    category: 'SQL',
    groupId: 'com.mysql',
    artifactId: 'mysql-connector-j',
    scope: 'runtime',
  },
  {
    id: 'h2',
    name: 'H2 Database',
    description:
      'Provides a fast in-memory database that supports JDBC API and R2DBC access, with a small (2mb) footprint. Supports embedded and server modes as well as a browser based console application.',
    category: 'SQL',
    groupId: 'com.h2database',
    artifactId: 'h2',
    scope: 'runtime',
  },
  {
    id: 'mariadb',
    name: 'MariaDB Driver',
    description: 'MariaDB JDBC and R2DBC driver.',
    category: 'SQL',
    groupId: 'org.mariadb.jdbc',
    artifactId: 'mariadb-java-client',
    scope: 'runtime',
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL Driver',
    description:
      'A JDBC and R2DBC driver that allows Java programs to connect to a PostgreSQL database using standard, database independent Java code.',
    category: 'SQL',
    groupId: 'org.postgresql',
    artifactId: 'postgresql',
    scope: 'runtime',
  },

  // ── I/O ───────────────────────────────────────────────────────────────────
  {
    id: 'validation',
    name: 'Validation',
    description: 'Bean Validation with Hibernate Validator.',
    category: 'I/O',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-validation',
  },
  {
    id: 'mail',
    name: 'Java Mail Sender',
    description: "Send email using Java Mail and Spring Framework's JavaMailSender.",
    category: 'I/O',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-mail',
  },

  // ── OPS ───────────────────────────────────────────────────────────────────
  {
    id: 'actuator',
    name: 'Spring Boot Actuator',
    description:
      'Supports built in (or custom) endpoints that let you monitor and manage your application - such as health, metrics, sessions, etc.',
    category: 'OPS',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-actuator',
  },
];

/** Returns all dependencies for a given category, in declaration order. */
export function getDependenciesByCategory(
  category: DependencyCategory
): Dependency[] {
  return DEPENDENCIES.filter((d) => d.category === category);
}

/** Returns a dependency by id, or undefined if not found. */
export function getDependencyById(id: string): Dependency | undefined {
  return DEPENDENCIES.find((d) => d.id === id);
}
