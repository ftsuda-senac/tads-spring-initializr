import { useState, useEffect, useMemo } from 'react';

// Bump this key to invalidate stale sessionStorage caches.
const CACHE_KEY = 'si-java-versions-v3';

// Fetches the start.spring.io configuration YAML directly from GitHub raw content,
// which supports CORS from any origin — unlike start.spring.io itself.
const CONFIG_URL =
  'https://raw.githubusercontent.com/spring-io/start.spring.io/main/' +
  'start-site/src/main/resources/application.yml';

// Static fallback: matches what start.spring.io showed before Java 26 was added.
const STATIC_JAVA_VERSIONS = ['25', '21', '17'];
const STATIC_DEFAULT = '21';

export interface JavaVersionOption {
  version: string;
  default: boolean;
}

/**
 * Extracts Java version entries from the application.yml text.
 * Handles both "java-versions:" and "javaVersions:" key names.
 * Returns null if the section is not found or has no entries.
 */
function parseJavaVersionsFromYaml(yaml: string): JavaVersionOption[] | null {
  const sectionIdx = yaml.search(/(?:java-versions|javaVersions):/);
  if (sectionIdx === -1) return null;

  // Take enough characters to cover all version entries (typically 3–6 items).
  const block = yaml.slice(sectionIdx, sectionIdx + 800);

  const versions: JavaVersionOption[] = [];
  const entryRe = /- id:\s*["']?(\d+)["']?/g;
  let m: RegExpExecArray | null;

  while ((m = entryRe.exec(block)) !== null) {
    const id = m[1];
    // Look for "default: true" within the next ~150 chars (the current list entry).
    const snippet = block.slice(m.index, m.index + 150);
    versions.push({ version: id, default: /default:\s*true/.test(snippet) });
  }

  return versions.length > 0 ? versions : null;
}

async function fetchFromGithub(): Promise<JavaVersionOption[]> {
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached) as JavaVersionOption[];
    } catch { /* corrupted cache — refetch */ }
  }

  const res = await fetch(CONFIG_URL);
  if (!res.ok) throw new Error(`GitHub raw content ${res.status}`);

  const yaml = await res.text();
  const result = parseJavaVersionsFromYaml(yaml);
  if (!result) throw new Error('Seção java-versions não encontrada no application.yml');

  sessionStorage.setItem(CACHE_KEY, JSON.stringify(result));
  return result;
}

function buildStatic(): JavaVersionOption[] {
  return STATIC_JAVA_VERSIONS.map((v) => ({
    version: v,
    default: v === STATIC_DEFAULT,
  }));
}

/**
 * Returns Java versions parsed from the start.spring.io source repository on GitHub.
 * Falls back to the static list on any error.
 */
export function useJavaVersions(): JavaVersionOption[] {
  const staticVersions = useMemo(() => buildStatic(), []);
  const [versions, setVersions] = useState<JavaVersionOption[]>(staticVersions);

  useEffect(() => {
    fetchFromGithub()
      .then(setVersions)
      .catch((err) => {
        console.error('[useJavaVersions] falha ao buscar versões do Java:', err);
      });
  }, []);

  return versions;
}
