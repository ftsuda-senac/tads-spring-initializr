// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { generatePomXml } from './pomXml';
import { INITIAL_STATE } from '../models/projectState';
import type { ProjectState } from '../models/projectState';

// ── Fixtures ───────────────────────────────────────────────────────────────

const HASH = 'a'.repeat(64);

const BASE: ProjectState = {
  ...INITIAL_STATE,
  group: 'br.senac.tads.dsw',
  artifact: 'demo',
  name: 'demo',
  description: 'Test project',
  packageName: 'br.senac.tads.dsw.demo',
  javaVersion: '21',
  springBootVersion: '4.0.3',
  developers: [
    { name: 'Alice Souza', github: 'alicesouza', email: 'alice@senac.br' },
  ],
  dependencies: [],
};

function pom(deps: string[]): string {
  return generatePomXml({ ...BASE, dependencies: deps }, HASH);
}

// ── Structure ──────────────────────────────────────────────────────────────

describe('generatePomXml — structure', () => {
  it('starts with XML declaration', () => {
    expect(pom([])).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
  });

  it('includes Spring Boot parent with correct version', () => {
    const xml = pom([]);
    expect(xml).toContain('<artifactId>spring-boot-starter-parent</artifactId>');
    expect(xml).toContain('<version>4.0.3</version>');
    expect(xml).toContain('<relativePath/> <!-- lookup parent from repository -->');
  });

  it('includes groupId, artifactId, version, name, description', () => {
    const xml = pom([]);
    expect(xml).toContain('<groupId>br.senac.tads.dsw</groupId>');
    expect(xml).toContain('<artifactId>demo</artifactId>');
    expect(xml).toContain('<version>0.0.1-SNAPSHOT</version>');
    expect(xml).toContain('<name>demo</name>');
    expect(xml).toContain('<description>Test project</description>');
  });

  it('includes java.version property', () => {
    expect(pom([])).toContain('<java.version>21</java.version>');
  });

  it('places hash comment after </developers>', () => {
    const xml = pom([]);
    const devClose = xml.indexOf('</developers>');
    const hashComment = xml.indexOf(`<!-- hash-identificacao: ${HASH} -->`);
    expect(devClose).toBeGreaterThan(-1);
    expect(hashComment).toBeGreaterThan(devClose);
  });
});

// ── Developers block ───────────────────────────────────────────────────────

describe('generatePomXml — developers', () => {
  it('maps developer fields correctly', () => {
    const xml = pom([]);
    expect(xml).toContain('<id>alicesouza</id>');
    expect(xml).toContain('<name>Alice Souza</name>');
    expect(xml).toContain('<email>alice@senac.br</email>');
  });

  it('includes all developers when multiple', () => {
    const xml = generatePomXml(
      {
        ...BASE,
        developers: [
          { name: 'Alice', github: 'alice', email: 'a@a.com' },
          { name: 'Bob', github: 'bob', email: 'b@b.com' },
        ],
        dependencies: [],
      },
      HASH
    );
    expect(xml).toContain('<id>alice</id>');
    expect(xml).toContain('<id>bob</id>');
  });
});

// ── Test starters (always present) ────────────────────────────────────────

describe('generatePomXml — test starters', () => {
  it('always includes spring-boot-starter-test', () => {
    expect(pom([])).toContain('<artifactId>spring-boot-starter-test</artifactId>');
  });

  it('includes webmvc-test when web selected', () => {
    expect(pom(['web'])).toContain('<artifactId>spring-boot-starter-webmvc-test</artifactId>');
  });

  it('includes security-test when security selected', () => {
    expect(pom(['security'])).toContain('<artifactId>spring-boot-starter-security-test</artifactId>');
  });

  it('includes data-jpa-test when data-jpa selected', () => {
    expect(pom(['data-jpa'])).toContain('<artifactId>spring-boot-starter-data-jpa-test</artifactId>');
  });

  it('does NOT include webmvc-test when web not selected', () => {
    expect(pom([])).not.toContain('spring-boot-starter-webmvc-test');
  });
});

// ── R2: web without thymeleaf → springdoc ─────────────────────────────────

describe('generatePomXml — R2 (web without thymeleaf)', () => {
  it('auto-includes springdoc OpenAPI 3.0.2 when web present', () => {
    const xml = pom(['web']);
    expect(xml).toContain('springdoc-openapi-starter-webmvc-ui');
    expect(xml).toContain('<version>3.0.2</version>');
  });

  it('does NOT include springdoc when thymeleaf also present', () => {
    expect(pom(['web', 'thymeleaf'])).not.toContain('springdoc-openapi-starter-webmvc-ui');
  });

  it('uses webmvc artifact ID (not starter-web)', () => {
    expect(pom(['web'])).toContain('<artifactId>spring-boot-starter-webmvc</artifactId>');
    expect(pom(['web'])).not.toContain('<artifactId>spring-boot-starter-web</artifactId>');
  });
});

// ── Thymeleaf auto-includes ────────────────────────────────────────────────

describe('generatePomXml — thymeleaf auto-includes', () => {
  it('auto-includes layout dialect 4.0.0 when thymeleaf present', () => {
    const xml = pom(['thymeleaf']);
    expect(xml).toContain('thymeleaf-layout-dialect');
    expect(xml).toContain('<version>4.0.0</version>');
  });

  it('auto-includes webjars when thymeleaf present', () => {
    const xml = pom(['thymeleaf']);
    expect(xml).toContain('webjars-locator-lite');
    expect(xml).toContain('bootstrap');
    expect(xml).toContain('<version>5.3.8</version>');
    expect(xml).toContain('font-awesome');
    expect(xml).toContain('<version>7.2.0</version>');
  });

  it('does NOT include webjars without thymeleaf', () => {
    expect(pom([])).not.toContain('webjars');
  });
});

// ── R6: thymeleaf + security ───────────────────────────────────────────────

describe('generatePomXml — R6 (thymeleaf + security)', () => {
  it('includes thymeleaf-extras-springsecurity6 when thymeleaf + security', () => {
    expect(pom(['thymeleaf', 'security'])).toContain('thymeleaf-extras-springsecurity6');
  });

  it('includes thymeleaf-extras when thymeleaf + oauth2-resource-server', () => {
    expect(pom(['thymeleaf', 'oauth2-resource-server'])).toContain('thymeleaf-extras-springsecurity6');
  });

  it('does NOT include thymeleaf-extras without security', () => {
    expect(pom(['thymeleaf'])).not.toContain('thymeleaf-extras-springsecurity6');
  });
});

// ── H2 console (Spring Boot 4) ─────────────────────────────────────────────

describe('generatePomXml — H2 console', () => {
  it('auto-includes spring-boot-h2console when h2 selected', () => {
    expect(pom(['h2'])).toContain('<artifactId>spring-boot-h2console</artifactId>');
  });

  it('does NOT include spring-boot-h2console without h2', () => {
    expect(pom([])).not.toContain('spring-boot-h2console');
  });
});

// ── Runtime / optional deps ───────────────────────────────────────────────

describe('generatePomXml — runtime and optional deps', () => {
  it('marks devtools as runtime + optional', () => {
    const xml = pom(['devtools']);
    const block = xml.slice(
      xml.indexOf('spring-boot-devtools'),
      xml.indexOf('</dependency>', xml.indexOf('spring-boot-devtools')) + 13
    );
    expect(block).toContain('<scope>runtime</scope>');
    expect(block).toContain('<optional>true</optional>');
  });

  it('marks docker-compose as runtime + optional', () => {
    const xml = pom(['docker-compose']);
    expect(xml).toContain('<scope>runtime</scope>');
    expect(xml).toContain('<optional>true</optional>');
  });

  it('marks h2 as runtime (no optional)', () => {
    const xml = pom(['h2']);
    // The h2 runtime entry (not the h2console compile entry)
    const h2Idx = xml.lastIndexOf('<artifactId>h2</artifactId>');
    const block = xml.slice(xml.lastIndexOf('<dependency>', h2Idx), xml.indexOf('</dependency>', h2Idx) + 13);
    expect(block).toContain('<scope>runtime</scope>');
    expect(block).not.toContain('<optional>true</optional>');
  });

  it('marks lombok as optional (no scope)', () => {
    const xml = pom(['lombok']);
    const lombokIdx = xml.indexOf('<artifactId>lombok</artifactId>');
    const block = xml.slice(xml.lastIndexOf('<dependency>', lombokIdx), xml.indexOf('</dependency>', lombokIdx) + 13);
    expect(block).toContain('<optional>true</optional>');
    expect(block).not.toContain('<scope>');
  });
});

// ── Annotation processor paths ────────────────────────────────────────────

describe('generatePomXml — annotation processor paths', () => {
  it('adds maven-compiler-plugin with lombok in annotationProcessorPaths', () => {
    const xml = pom(['lombok']);
    expect(xml).toContain('maven-compiler-plugin');
    expect(xml).toContain('<annotationProcessorPaths>');
    expect(xml).toContain('org.projectlombok');
  });

  it('adds configuration-processor to annotationProcessorPaths, not as dependency', () => {
    const xml = pom(['configuration-processor']);
    expect(xml).toContain('maven-compiler-plugin');
    expect(xml).toContain('spring-boot-configuration-processor');
    // Should NOT appear as a standalone <dependency>
    const depsBlock = xml.slice(xml.indexOf('<dependencies>'), xml.indexOf('</dependencies>'));
    expect(depsBlock).not.toContain('spring-boot-configuration-processor');
  });

  it('does NOT add maven-compiler-plugin when neither lombok nor config-processor selected', () => {
    expect(pom(['web'])).not.toContain('maven-compiler-plugin');
  });
});

// ── Lombok exclusion in spring-boot-maven-plugin ──────────────────────────

describe('generatePomXml — lombok exclusion', () => {
  it('excludes lombok from spring-boot-maven-plugin when selected', () => {
    const xml = pom(['lombok']);
    expect(xml).toContain('spring-boot-maven-plugin');
    expect(xml).toContain('<excludes>');
    const pluginBlock = xml.slice(xml.indexOf('spring-boot-maven-plugin'));
    expect(pluginBlock).toContain('org.projectlombok');
  });

  it('does NOT add exclusion when lombok not selected', () => {
    const xml = pom(['web']);
    expect(xml).not.toContain('<excludes>');
  });
});
