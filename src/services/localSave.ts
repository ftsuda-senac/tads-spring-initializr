import type { ProjectState } from '../models/projectState';
import type { SpringBootVersion } from '../models/springBootVersions';
import { encodeState, decodeState } from './share';

const STORAGE_KEY = 'si-saved-state';

export function saveState(state: ProjectState): void {
  localStorage.setItem(STORAGE_KEY, encodeState(state).toString());
}

export function hasSavedState(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Loads and decodes the saved state.
 * If the saved Spring Boot version is no longer available/enabled,
 * the most recent enabled version is used instead.
 */
export function loadSavedState(availableVersions: SpringBootVersion[]): ProjectState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  const decoded = decodeState(new URLSearchParams(raw));
  if (!decoded) return null;

  const enabled = availableVersions.filter((v) => v.enabled);
  const versionOk = enabled.some((v) => v.version === decoded.springBootVersion);

  if (!versionOk && enabled.length > 0) {
    const fallback = availableVersions.find((v) => v.default && v.enabled) ?? enabled[0];
    decoded.springBootVersion = fallback.version;
  }

  return decoded;
}

export function clearSavedState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
