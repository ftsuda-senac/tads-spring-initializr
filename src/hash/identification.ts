import type { ProjectState } from '../models/projectState';

// ── Payload builder ───────────────────────────────────────────────────────────

/**
 * Builds the canonical payload string for hash calculation (R8).
 * Format: `${groupId}:${artifactId}::dev1;dev2;...`
 * Each dev: `nome|github|email` (lowercase, trimmed), sorted by github.
 */
function buildPayload(state: ProjectState): string {
  const devsSorted = [...state.developers]
    .map((d) => ({
      name: d.name.toLowerCase().trim(),
      github: d.github.toLowerCase().trim(),
      email: d.email.toLowerCase().trim(),
    }))
    .sort((a, b) => a.github.localeCompare(b.github))
    .map((d) => `${d.name}|${d.github}|${d.email}`)
    .join(';');

  const group = state.group.toLowerCase().trim();
  const artifact = state.artifact.toLowerCase().trim();
  return `${group}:${artifact}::${devsSorted}`;
}

// ── Hash calculation ──────────────────────────────────────────────────────────

/**
 * Calculates SHA-256 hash of the project state using Web Crypto API.
 * Returns 64-character hex string (R8, R9).
 */
export async function calculateHash(state: ProjectState): Promise<string> {
  const payload = buildPayload(state);
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Calculates the hash from already-extracted fields (used by VerifyPage).
 * Only group, artifact, and developers affect the hash payload.
 */
export async function calculateHashFromExtracted(
  group: string,
  artifact: string,
  developers: Array<{ name: string; github: string; email: string }>
): Promise<string> {
  const minimalState = { group, artifact, developers } as ProjectState;
  return calculateHash(minimalState);
}

// ── Hash injection ────────────────────────────────────────────────────────────

/**
 * Injects the hash as the first line comment of a file (R9).
 * For pom.xml the hash is injected inline by generatePomXml (after </developers>).
 */
export function injectHash(
  content: string,
  hash: string,
  format: 'java' | 'xml' | 'properties' | 'html'
): string {
  let comment: string;
  switch (format) {
    case 'java':
      comment = `// hash-identificacao: ${hash}`;
      break;
    case 'xml':
      comment = `<!-- hash-identificacao: ${hash} -->`;
      break;
    case 'html':
      comment = `<!-- hash-identificacao: ${hash} -->`;
      break;
    case 'properties':
      comment = `# hash-identificacao: ${hash}`;
      break;
  }
  return `${comment}\n${content}`;
}
