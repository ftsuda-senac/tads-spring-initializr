// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { calculateHash, injectHash } from './identification';
import { INITIAL_STATE } from '../models/projectState';
import type { ProjectState } from '../models/projectState';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const singleDevState: ProjectState = {
  ...INITIAL_STATE,
  group: 'br.senac.tads.dsw',
  artifact: 'demo',
  developers: [
    { name: 'João da Silva', github: 'joaosilva', email: 'joao@exemplo.com' },
  ],
};

const threeDevState: ProjectState = {
  ...INITIAL_STATE,
  group: 'br.senac.tads.dsw',
  artifact: 'demo',
  developers: [
    { name: 'Alice Souza', github: 'alicesouza', email: 'alice@exemplo.com' },
    { name: 'Bob Lima', github: 'boblima', email: 'bob@exemplo.com' },
    { name: 'Carlos Matos', github: 'carlosmatos', email: 'carlos@exemplo.com' },
  ],
};

// ── calculateHash ─────────────────────────────────────────────────────────────

describe('calculateHash', () => {
  it('returns a 64-character hex string with 1 developer', async () => {
    const hash = await calculateHash(singleDevState);
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic with 1 developer', async () => {
    const h1 = await calculateHash(singleDevState);
    const h2 = await calculateHash(singleDevState);
    expect(h1).toBe(h2);
  });

  it('returns a 64-character hex string with 3 developers', async () => {
    const hash = await calculateHash(threeDevState);
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic with 3 developers', async () => {
    const h1 = await calculateHash(threeDevState);
    const h2 = await calculateHash(threeDevState);
    expect(h1).toBe(h2);
  });

  it('sorts developers by github so order does not matter', async () => {
    const reversed: ProjectState = {
      ...threeDevState,
      developers: [...threeDevState.developers].reverse(),
    };
    const h1 = await calculateHash(threeDevState);
    const h2 = await calculateHash(reversed);
    expect(h1).toBe(h2);
  });

  it('produces different hash for different developers', async () => {
    const other: ProjectState = {
      ...singleDevState,
      developers: [
        { name: 'Maria Santos', github: 'mariasantos', email: 'maria@exemplo.com' },
      ],
    };
    const h1 = await calculateHash(singleDevState);
    const h2 = await calculateHash(other);
    expect(h1).not.toBe(h2);
  });

  it('produces different hash for different artifacts', async () => {
    const other: ProjectState = { ...singleDevState, artifact: 'outro-projeto' };
    const h1 = await calculateHash(singleDevState);
    const h2 = await calculateHash(other);
    expect(h1).not.toBe(h2);
  });

  it('is case-insensitive for developer fields', async () => {
    const upper: ProjectState = {
      ...singleDevState,
      developers: [
        { name: 'JOÃO DA SILVA', github: 'JOAOSILVA', email: 'JOAO@EXEMPLO.COM' },
      ],
    };
    const h1 = await calculateHash(singleDevState);
    const h2 = await calculateHash(upper);
    expect(h1).toBe(h2);
  });
});

// ── injectHash ────────────────────────────────────────────────────────────────

describe('injectHash', () => {
  const hash = 'a'.repeat(64);

  it('injects java comment on first line', () => {
    const result = injectHash('package br.test;', hash, 'java');
    expect(result).toBe(`// hash-identificacao: ${hash}\npackage br.test;`);
  });

  it('injects properties comment on first line', () => {
    const result = injectHash('spring.application.name=demo', hash, 'properties');
    expect(result).toBe(`# hash-identificacao: ${hash}\nspring.application.name=demo`);
  });

  it('injects html comment on first line', () => {
    const result = injectHash('<html>', hash, 'html');
    expect(result).toBe(`<!-- hash-identificacao: ${hash} -->\n<html>`);
  });

  it('injects xml comment on first line', () => {
    const result = injectHash('<root/>', hash, 'xml');
    expect(result).toBe(`<!-- hash-identificacao: ${hash} -->\n<root/>`);
  });
});
