import type { ProjectState } from '../models/projectState';
import { calculateHash } from '../hash/identification';
import { generatePomXml } from './pomXml';
import {
  toClassName,
  generateApplication,
  generateApplicationTests,
  generateDto,
  generateEntity,
  generateRepository,
  generateService,
  generateRestController,
  generateMvcController,
  generateSecurityConfig,
  generateOpenApiConfig,
  generateDatabaseInitializer,
} from './javaFiles';
import { generateProperties } from './propertiesFile';
import { generateListaHtml, generateFormHtml } from './thymeleafTemplates';
import { generateGitignore, generateEditorconfig, generateHelpMd, generateIndexHtml } from './staticFiles';

// ── Path helpers ──────────────────────────────────────────────────────────────

/** Converts a Java package name to a filesystem path (dots → slashes). */
function packageToPath(packageName: string): string {
  return packageName.replace(/\./g, '/');
}

// ── Main orchestrator ─────────────────────────────────────────────────────────

/**
 * Generates all project files based on the current state.
 * Applies rules R1–R7 and R13–R15.
 * Returns a map of `{ "path/to/file": "content" }`.
 */
export async function generateAllFiles(
  state: ProjectState
): Promise<Record<string, string>> {
  const hash = await calculateHash(state);

  const deps = state.dependencies;
  const hasWeb = deps.includes('web');
  const hasThymeleaf = deps.includes('thymeleaf');
  const hasJpa = deps.includes('data-jpa');
  const hasSecurity = deps.includes('security') || deps.includes('oauth2-resource-server');

  const root = state.artifact;
  const pkgPath = packageToPath(state.packageName);
  const mainJava = `${root}/src/main/java/${pkgPath}`;
  const testJava = `${root}/src/test/java/${pkgPath}`;
  const mainResources = `${root}/src/main/resources`;
  const className = toClassName(state.artifact);

  const files: Record<string, string> = {};

  // ── Always-present files ───────────────────────────────────────────────────

  files[`${root}/pom.xml`] = generatePomXml(state, hash);
  files[`${mainJava}/${className}Application.java`] = generateApplication(state, hash);
  files[`${testJava}/${className}ApplicationTests.java`] = generateApplicationTests(state, hash);
  files[`${mainResources}/application.properties`] = generateProperties(state, hash);
  files[`${root}/.gitignore`] = generateGitignore();
  files[`${root}/.editorconfig`] = generateEditorconfig();
  files[`${root}/HELP.md`] = generateHelpMd(state);

  // ── Static index.html (always generated when web is selected) ───────────

  if (hasWeb) {
    files[`${mainResources}/static/index.html`] = generateIndexHtml(state, hash);
  } else {
    files[`${mainResources}/static/.gitkeep`] = '';
  }

  if (state.generateExamples) {
    // ── Example classes (when web or thymeleaf present) ───────────────────

    if (hasWeb && !hasThymeleaf) {
      // thymeleaf already generates real files inside templates/
      files[`${mainResources}/templates/.gitkeep`] = '';
    }

    const hasWebLayer = hasWeb || hasThymeleaf;

    if (hasWebLayer) {
      files[`${mainJava}/dto/ExemploDto.java`] = generateDto(state, hash);
      files[`${mainJava}/service/ExemploService.java`] = generateService(state, hash);

      // R3: JPA → Entity + Repository + DatabaseInitializer
      if (hasJpa) {
        files[`${mainJava}/model/ExemploEntity.java`] = generateEntity(state, hash);
        files[`${mainJava}/repository/ExemploRepository.java`] = generateRepository(state, hash);
        files[`${mainJava}/config/DatabaseInitializer.java`] = generateDatabaseInitializer(state, hash);
      }
      // R4: !JPA → in-memory service (already handled in generateService)

      // R1: thymeleaf → MVC controller + templates
      if (hasThymeleaf) {
        files[`${mainJava}/controller/ExemploController.java`] = generateMvcController(state, hash);
        files[`${mainResources}/templates/exemplos/lista.html`] = generateListaHtml(state, hash);
        files[`${mainResources}/templates/exemplos/form.html`] = generateFormHtml(state, hash);
      }

      // R2: web + NOT thymeleaf → REST controller + OpenApiConfig
      if (hasWeb && !hasThymeleaf) {
        files[`${mainJava}/controller/ExemploRestController.java`] = generateRestController(state, hash);
        files[`${mainJava}/config/OpenApiConfig.java`] = generateOpenApiConfig(state, hash);
      }
    }

    // R5: security or oauth2-resource-server → SecurityConfig
    if (hasSecurity) {
      files[`${mainJava}/config/SecurityConfig.java`] = generateSecurityConfig(state, hash);
    }
  } else {
    // ── Sem exemplos: apenas marcador de pasta para templates ─────────────
    files[`${mainResources}/templates/.gitkeep`] = '';
  }

  return files;
}
