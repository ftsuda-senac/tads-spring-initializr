// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { generateAllFiles } from './index';
import { INITIAL_STATE } from '../models/projectState';
import type { ProjectState } from '../models/projectState';

// ── Fixtures ───────────────────────────────────────────────────────────────

const BASE: ProjectState = {
  ...INITIAL_STATE,
  group: 'br.senac.tads.dsw',
  artifact: 'demo',
  name: 'demo',
  packageName: 'br.senac.tads.dsw.demo',
  developers: [
    { name: 'Alice Souza', github: 'alicesouza', email: 'alice@senac.br' },
  ],
  dependencies: [],
};

function withDeps(...deps: string[]): ProjectState {
  return { ...BASE, dependencies: deps };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function keys(files: Record<string, string>): string[] {
  return Object.keys(files);
}

function hasFile(files: Record<string, string>, suffix: string): boolean {
  return keys(files).some((k) => k.endsWith(suffix));
}

// ── Always-present files ───────────────────────────────────────────────────

describe('generateAllFiles — always-present files', () => {
  it('generates pom.xml', async () => {
    const files = await generateAllFiles(BASE);
    expect(hasFile(files, 'pom.xml')).toBe(true);
  });

  it('generates Application.java', async () => {
    const files = await generateAllFiles(BASE);
    expect(hasFile(files, 'DemoApplication.java')).toBe(true);
  });

  it('generates ApplicationTests.java', async () => {
    const files = await generateAllFiles(BASE);
    expect(hasFile(files, 'DemoApplicationTests.java')).toBe(true);
  });

  it('generates application.properties', async () => {
    const files = await generateAllFiles(BASE);
    expect(hasFile(files, 'application.properties')).toBe(true);
  });

  it('generates .gitignore', async () => {
    const files = await generateAllFiles(BASE);
    expect(hasFile(files, '.gitignore')).toBe(true);
  });

  it('generates .editorconfig', async () => {
    const files = await generateAllFiles(BASE);
    expect(hasFile(files, '.editorconfig')).toBe(true);
  });

  it('generates HELP.md', async () => {
    const files = await generateAllFiles(BASE);
    expect(hasFile(files, 'HELP.md')).toBe(true);
  });

  it('uses artifact as root folder', async () => {
    const files = await generateAllFiles(BASE);
    expect(keys(files).every((k) => k.startsWith('demo/'))).toBe(true);
  });
});

// ── R1: thymeleaf → MVC controller + templates, NO REST ───────────────────

describe('generateAllFiles — R1 (thymeleaf)', () => {
  it('generates MVC controller when thymeleaf selected', async () => {
    const files = await generateAllFiles(withDeps('thymeleaf'));
    expect(hasFile(files, 'ExemploController.java')).toBe(true);
  });

  it('generates Thymeleaf templates when thymeleaf selected', async () => {
    const files = await generateAllFiles(withDeps('thymeleaf'));
    expect(hasFile(files, 'lista.html')).toBe(true);
    expect(hasFile(files, 'form.html')).toBe(true);
  });

  it('does NOT generate REST controller when thymeleaf selected', async () => {
    const files = await generateAllFiles(withDeps('thymeleaf'));
    expect(hasFile(files, 'ExemploRestController.java')).toBe(false);
  });

  it('does NOT generate OpenApiConfig when thymeleaf selected', async () => {
    const files = await generateAllFiles(withDeps('thymeleaf'));
    expect(hasFile(files, 'OpenApiConfig.java')).toBe(false);
  });
});

// ── R2: web without thymeleaf → REST + OpenApiConfig ──────────────────────

describe('generateAllFiles — R2 (web without thymeleaf)', () => {
  it('generates REST controller when web (no thymeleaf)', async () => {
    const files = await generateAllFiles(withDeps('web'));
    expect(hasFile(files, 'ExemploRestController.java')).toBe(true);
  });

  it('generates OpenApiConfig when web (no thymeleaf)', async () => {
    const files = await generateAllFiles(withDeps('web'));
    expect(hasFile(files, 'OpenApiConfig.java')).toBe(true);
  });

  it('does NOT generate MVC controller when web (no thymeleaf)', async () => {
    const files = await generateAllFiles(withDeps('web'));
    expect(hasFile(files, 'ExemploController.java')).toBe(false);
  });

  it('does NOT generate templates when web (no thymeleaf)', async () => {
    const files = await generateAllFiles(withDeps('web'));
    expect(hasFile(files, 'lista.html')).toBe(false);
    expect(hasFile(files, 'form.html')).toBe(false);
  });
});

// ── R1+R2: both web and thymeleaf → MVC wins ──────────────────────────────

describe('generateAllFiles — R1+R2 (web + thymeleaf)', () => {
  it('generates MVC controller when both web and thymeleaf selected', async () => {
    const files = await generateAllFiles(withDeps('web', 'thymeleaf'));
    expect(hasFile(files, 'ExemploController.java')).toBe(true);
  });

  it('does NOT generate REST controller when both web and thymeleaf selected', async () => {
    const files = await generateAllFiles(withDeps('web', 'thymeleaf'));
    expect(hasFile(files, 'ExemploRestController.java')).toBe(false);
  });
});

// ── R3: JPA → Entity + Repository ─────────────────────────────────────────

describe('generateAllFiles — R3 (data-jpa)', () => {
  it('generates ExemploEntity when data-jpa + web', async () => {
    const files = await generateAllFiles(withDeps('web', 'data-jpa'));
    expect(hasFile(files, 'ExemploEntity.java')).toBe(true);
  });

  it('generates ExemploRepository when data-jpa + web', async () => {
    const files = await generateAllFiles(withDeps('web', 'data-jpa'));
    expect(hasFile(files, 'ExemploRepository.java')).toBe(true);
  });

  it('generates ExemploDto when data-jpa + web', async () => {
    const files = await generateAllFiles(withDeps('web', 'data-jpa'));
    expect(hasFile(files, 'ExemploDto.java')).toBe(true);
  });
});

// ── R4: no JPA → in-memory service, no Entity/Repository ──────────────────

describe('generateAllFiles — R4 (no data-jpa)', () => {
  it('does NOT generate ExemploEntity when no data-jpa', async () => {
    const files = await generateAllFiles(withDeps('web'));
    expect(hasFile(files, 'ExemploEntity.java')).toBe(false);
  });

  it('does NOT generate ExemploRepository when no data-jpa', async () => {
    const files = await generateAllFiles(withDeps('web'));
    expect(hasFile(files, 'ExemploRepository.java')).toBe(false);
  });

  it('still generates ExemploDto when no data-jpa (in-memory service needs it)', async () => {
    const files = await generateAllFiles(withDeps('web'));
    expect(hasFile(files, 'ExemploDto.java')).toBe(true);
  });
});

// ── R5: security → SecurityConfig ─────────────────────────────────────────

describe('generateAllFiles — R5 (security)', () => {
  it('generates SecurityConfig when security selected', async () => {
    const files = await generateAllFiles(withDeps('security'));
    expect(hasFile(files, 'SecurityConfig.java')).toBe(true);
  });

  it('generates SecurityConfig when oauth2-resource-server selected', async () => {
    const files = await generateAllFiles(withDeps('oauth2-resource-server'));
    expect(hasFile(files, 'SecurityConfig.java')).toBe(true);
  });

  it('does NOT generate SecurityConfig without security', async () => {
    const files = await generateAllFiles(withDeps('web'));
    expect(hasFile(files, 'SecurityConfig.java')).toBe(false);
  });
});

// ── No web layer → no business-logic files ────────────────────────────────

describe('generateAllFiles — no web layer', () => {
  it('does NOT generate Dto without web/thymeleaf', async () => {
    const files = await generateAllFiles(BASE);
    expect(hasFile(files, 'ExemploDto.java')).toBe(false);
  });

  it('does NOT generate Service without web/thymeleaf', async () => {
    const files = await generateAllFiles(BASE);
    expect(hasFile(files, 'ExemploService.java')).toBe(false);
  });

  it('does NOT generate controller without web/thymeleaf', async () => {
    const files = await generateAllFiles(BASE);
    expect(hasFile(files, 'Controller.java')).toBe(false);
  });
});

// ── Content spot-checks ────────────────────────────────────────────────────

describe('generateAllFiles — content checks', () => {
  it('pom.xml contains correct groupId', async () => {
    const files = await generateAllFiles(BASE);
    const pom = files['demo/pom.xml'];
    expect(pom).toContain('<groupId>br.senac.tads.dsw</groupId>');
  });

  it('Application.java declares correct package', async () => {
    const files = await generateAllFiles(BASE);
    const app = files['demo/src/main/java/br/senac/tads/dsw/demo/DemoApplication.java'];
    expect(app).toContain('package br.senac.tads.dsw.demo;');
  });

  it('pom.xml contains hash comment', async () => {
    const files = await generateAllFiles(BASE);
    const pom = files['demo/pom.xml'];
    expect(pom).toMatch(/<!-- hash-identificacao: [0-9a-f]{64} -->/);
  });

  it('application.properties starts with hash comment', async () => {
    const files = await generateAllFiles(BASE);
    const props = files['demo/src/main/resources/application.properties'];
    expect(props).toMatch(/^# hash-identificacao: [0-9a-f]{64}/);
  });
});
