import { useState, useEffect, useMemo } from 'react';
import { SPRING_BOOT_VERSIONS, type SpringBootVersion } from '../models/springBootVersions';

const GITHUB_URL =
  'https://api.github.com/repos/spring-projects/spring-boot/releases?per_page=30';
const CACHE_KEY = 'si-spring-versions';

// GA releases have a plain semver tag: v3.4.3, v4.0.0, etc.
const GA_TAG_RE = /^v\d+\.\d+\.\d+$/;

function semverDesc(a: string, b: string): number {
  const [ma, mia, pa] = a.split('.').map(Number);
  const [mb, mib, pb] = b.split('.').map(Number);
  if (ma !== mb) return mb - ma;
  if (mia !== mib) return mib - mia;
  return pb - pa;
}

/**
 * Filters versions from the API:
 * - Groups by major.minor, keeps only the latest patch per group.
 * - For the highest major: keeps the 2 most recent minor groups.
 * - For the second highest major: keeps only the 1 most recent minor group.
 * - All older majors are discarded.
 * Then applies enable rule: highest major → enabled, previous major → disabled.
 * The highest enabled version becomes the default.
 */
function filterAndApplyRule(versionStrings: string[]): SpringBootVersion[] {
  // Group by "major.minor" → latest patch in each group
  const minorMap = new Map<string, string>();
  for (const v of versionStrings) {
    const [major, minor, patch] = v.split('.').map(Number);
    const key = `${major}.${minor}`;
    const existing = minorMap.get(key);
    if (!existing) {
      minorMap.set(key, v);
    } else {
      const [, , ep] = existing.split('.').map(Number);
      if (patch > ep) minorMap.set(key, v);
    }
  }

  // Sort minor groups descending by major then minor
  const sortedGroups = [...minorMap.entries()].sort(([ka], [kb]) => {
    const [maa, mia] = ka.split('.').map(Number);
    const [mab, mib] = kb.split('.').map(Number);
    if (maa !== mab) return mab - maa;
    return mib - mia;
  });

  if (sortedGroups.length === 0) return [];

  // Find the two highest distinct majors
  const majors = [...new Set(sortedGroups.map(([k]) => parseInt(k.split('.')[0], 10)))].sort(
    (a, b) => b - a
  );
  const latestMajor = majors[0];
  const prevMajor = majors[1] ?? -1;

  const kept: string[] = [];

  // Keep 2 latest minors of latest major
  let latestMajorCount = 0;
  for (const [key, version] of sortedGroups) {
    const maj = parseInt(key.split('.')[0], 10);
    if (maj === latestMajor && latestMajorCount < 2) {
      kept.push(version);
      latestMajorCount++;
    }
  }

  // Keep 1 latest minor of previous major
  let prevMajorCount = 0;
  for (const [key, version] of sortedGroups) {
    const maj = parseInt(key.split('.')[0], 10);
    if (maj === prevMajor && prevMajorCount < 1) {
      kept.push(version);
      prevMajorCount++;
    }
  }

  // Sort kept versions descending and classify
  const sorted = [...kept].sort(semverDesc);
  const classified: SpringBootVersion[] = sorted.map((version) => {
    const major = parseInt(version.split('.')[0], 10);
    return { version, enabled: major === latestMajor, default: false };
  });
  const firstEnabled = classified.find((v) => v.enabled);
  if (firstEnabled) firstEnabled.default = true;
  return classified;
}

/**
 * Applies the enable rule to a static list (no filtering):
 * major >= 4 → enabled, older → disabled. Highest enabled → default.
 */
function applyRule(versionStrings: string[]): SpringBootVersion[] {
  const sorted = [...versionStrings].sort(semverDesc);
  const classified: SpringBootVersion[] = sorted.map((version) => {
    const major = parseInt(version.split('.')[0], 10);
    return { version, enabled: major >= 4, default: false };
  });
  const firstEnabled = classified.find((v) => v.enabled);
  if (firstEnabled) firstEnabled.default = true;
  return classified;
}

interface GithubRelease {
  tag_name: string;
  prerelease: boolean;
  draft: boolean;
}

async function fetchFromGithub(): Promise<SpringBootVersion[]> {
  // Return cached result within the same session to avoid hitting rate limits
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached) as SpringBootVersion[];
    } catch { /* corrupted cache — refetch */ }
  }

  const res = await fetch(GITHUB_URL, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);

  const releases = (await res.json()) as GithubRelease[];
  const gaVersions = releases
    .filter((r) => !r.prerelease && !r.draft && GA_TAG_RE.test(r.tag_name))
    .map((r) => r.tag_name.slice(1)); // strip leading 'v'

  const result = gaVersions.length > 0
    ? filterAndApplyRule(gaVersions)
    : applyRule(SPRING_BOOT_VERSIONS.map((v) => v.version));
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(result));
  return result;
}

/**
 * Returns Spring Boot versions fetched from GitHub Releases.
 * Falls back silently to the static list (springBootVersions.ts) on any error.
 * Versions with major >= 4 are enabled; older ones are visible but disabled.
 */
export function useSpringVersions(): SpringBootVersion[] {
  const staticVersions = useMemo(
    () => applyRule(SPRING_BOOT_VERSIONS.map((v) => v.version)),
    []
  );
  const [versions, setVersions] = useState<SpringBootVersion[]>(staticVersions);

  useEffect(() => {
    fetchFromGithub()
      .then(setVersions)
      .catch(() => { /* keep static fallback — no visible error */ });
  }, []);

  return versions;
}
