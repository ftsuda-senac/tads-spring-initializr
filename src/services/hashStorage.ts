const STORAGE_KEY = 'tads-initializr-hash-records';

export interface StoredDeveloper {
  github: string;
  name: string;
  email: string;
}

export interface StoredSubmission {
  group: string;
  artifact: string;
  developers: StoredDeveloper[];
  hashRecalculated: string;
  valid: boolean;
  queriedAt: string;
}

export interface HashRecord {
  hash: string;
  createdAt: string;
  lastQueriedAt: string;
  submissions: StoredSubmission[];
}

function loadAll(): HashRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HashRecord[]) : [];
  } catch {
    return [];
  }
}

function persistAll(records: HashRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function findHashRecord(hash: string): HashRecord | null {
  return loadAll().find((r) => r.hash === hash) ?? null;
}

export function saveHashRecord(
  hash: string,
  submission: Omit<StoredSubmission, 'queriedAt'>
): void {
  const now = new Date().toISOString();
  const full: StoredSubmission = { ...submission, queriedAt: now };
  const records = loadAll();
  const existing = records.find((r) => r.hash === hash);

  if (existing) {
    existing.lastQueriedAt = now;
    // Deduplicate by hashRecalculated: same data → replace that entry, different data → append
    const dupIdx = existing.submissions.findIndex((s) => s.hashRecalculated === full.hashRecalculated);
    if (dupIdx >= 0) {
      existing.submissions[dupIdx] = full;
    } else {
      existing.submissions.push(full);
    }
  } else {
    records.push({ hash, createdAt: now, lastQueriedAt: now, submissions: [full] });
  }
  persistAll(records);
}

export function getAllHashRecords(): HashRecord[] {
  return loadAll().sort((a, b) => b.lastQueriedAt.localeCompare(a.lastQueriedAt));
}

export function clearAllHashRecords(): void {
  localStorage.removeItem(STORAGE_KEY);
}
