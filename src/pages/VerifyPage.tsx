import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { calculateHashFromExtracted } from '../hash/identification';
import {
  findHashRecord,
  saveHashRecord,
  getAllHashRecords,
  clearAllHashRecords,
  type HashRecord,
  type StoredSubmission,
} from '../services/hashStorage';

// ── Types ──────────────────────────────────────────────────────────────────

interface Developer {
  github: string;
  name: string;
  email: string;
}

interface ParsedPom {
  group: string;
  artifact: string;
  developers: Developer[];
  hashFound: string | null;
}

interface VerifyResult {
  parsed: ParsedPom;
  hashRecalculated: string;
  hashKey: string;
  valid: boolean;
  usedManual: boolean;
  previousRecord: HashRecord | null;
}

// ── XML parsing ────────────────────────────────────────────────────────────

function parsePomXml(xml: string): ParsedPom | null {
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(xml, 'text/xml');
  } catch {
    return null;
  }

  if (doc.querySelector('parsererror')) return null;

  const group    = doc.querySelector('project > groupId')?.textContent?.trim() ?? '';
  const artifact = doc.querySelector('project > artifactId')?.textContent?.trim() ?? '';

  const developers: Developer[] = Array.from(
    doc.querySelectorAll('project > developers > developer')
  ).map((node) => ({
    github: node.querySelector('id')?.textContent?.trim()   ?? '',
    name:   node.querySelector('name')?.textContent?.trim() ?? '',
    email:  node.querySelector('email')?.textContent?.trim() ?? '',
  }));

  // Comments not accessible via querySelector — search raw text
  const hashMatch = xml.match(/<!--\s*hash-identificacao:\s*([a-f0-9]{64})\s*-->/);
  const hashFound = hashMatch?.[1] ?? null;

  return { group, artifact, developers, hashFound };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function truncateHash(hash: string): string {
  return `${hash.slice(0, 14)}…${hash.slice(-8)}`;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function DevTable({ devs }: { devs: Developer[] }) {
  return (
    <table className="si-verify-table">
      <thead>
        <tr><th>Nome</th><th>GitHub</th><th>E-mail</th></tr>
      </thead>
      <tbody>
        {devs.map((dev) => (
          <tr key={dev.github}>
            <td>{dev.name}</td>
            <td>
              <a
                href={`https://github.com/${dev.github}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                @{dev.github}
              </a>
            </td>
            <td>{dev.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SubmissionCard({ sub }: { sub: StoredSubmission }) {
  return (
    <div className={`si-history-submission${sub.valid ? ' si-history-submission--valid' : ' si-history-submission--invalid'}`}>
      <div className="si-history-submission__meta">
        <span className="si-history-submission__date">{formatDate(sub.queriedAt)}</span>
        <span className={`si-history-submission__badge${sub.valid ? ' si-history-submission__badge--valid' : ' si-history-submission__badge--invalid'}`}>
          {sub.valid ? '✓ válido' : '✗ inválido'}
        </span>
      </div>
      <div className="si-history-submission__inline">
        <code className="si-history-submission__coord">{sub.group} · {sub.artifact}</code>
        <code
          className={`si-history-submission__hash${sub.valid ? '' : ' si-verify-hash--mismatch'}`}
          title={sub.hashRecalculated}
        >
          {truncateHash(sub.hashRecalculated)}
        </code>
      </div>
      <DevTable devs={sub.developers} />
    </div>
  );
}

function HistoryModal({ onClose }: { onClose: () => void }) {
  const records = getAllHashRecords();
  const [confirmClear, setConfirmClear] = useState(false);

  function handleClear() {
    if (!confirmClear) { setConfirmClear(true); return; }
    clearAllHashRecords();
    onClose();
  }

  return (
    <div
      className="si-modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="si-modal si-modal--history" role="dialog" aria-modal="true" aria-label="Histórico de consultas">
        <div className="si-modal__header">
          <span className="si-modal__title">Histórico de consultas ({records.length})</span>
          <button type="button" className="si-modal__close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <div className="si-modal__body si-modal__body--history">
          {records.length === 0 ? (
            <p className="si-modal__empty">Nenhuma consulta registrada ainda.</p>
          ) : (
            records.map((rec) => (
              <div key={rec.hash} className="si-history-record">
                <div className="si-history-record__header">
                  <code className="si-history-record__hash" title={rec.hash}>
                    {truncateHash(rec.hash)}
                  </code>
                  <div className="si-history-record__meta">
                    <span>Cadastrado: {formatDate(rec.createdAt)}</span>
                    <span>Última consulta: {formatDate(rec.lastQueriedAt)}</span>
                    <span>{rec.submissions.length} submissão(ões)</span>
                  </div>
                </div>
                <div className="si-history-record__submissions">
                  {rec.submissions.map((sub, i) => (
                    <SubmissionCard key={i} sub={sub} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="si-modal__footer">
          <button type="button" className="si-btn si-btn--secondary" onClick={onClose}>Fechar</button>
          {records.length > 0 && (
            <button
              type="button"
              className={`si-btn ${confirmClear ? 'si-btn--danger' : 'si-btn--secondary'}`}
              onClick={handleClear}
            >
              {confirmClear ? 'Confirmar exclusão de todo o histórico' : 'Limpar histórico'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function VerifyPage() {
  const [xml, setXml] = useState('');
  const [manualHash, setManualHash] = useState('');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleVerify = useCallback(async () => {
    setResult(null);
    setError(null);

    const trimmed = xml.trim();
    if (!trimmed) {
      setError('Cole o conteúdo do pom.xml antes de verificar.');
      return;
    }

    setLoading(true);
    try {
      const parsed = parsePomXml(trimmed);
      if (!parsed) {
        setError('XML inválido ou malformado. Verifique se colou o pom.xml completo.');
        return;
      }

      const usedManual = parsed.hashFound === null;
      const normalizedManual = manualHash.trim().toLowerCase();

      if (usedManual && !normalizedManual) {
        setError('Hash não encontrado no pom.xml. Cole o hash esperado no campo abaixo ou verifique se o arquivo foi gerado por este sistema.');
        return;
      }
      if (parsed.developers.length === 0) {
        setError('Nenhum desenvolvedor encontrado no bloco <developers>.');
        return;
      }

      const hashKey = usedManual ? normalizedManual : (parsed.hashFound as string);
      const hashRecalculated = await calculateHashFromExtracted(
        parsed.group, parsed.artifact, parsed.developers
      );
      const valid = hashRecalculated === hashKey;

      // Look up BEFORE saving so previousRecord is truly prior history
      const previousRecord = findHashRecord(hashKey);

      saveHashRecord(hashKey, {
        group: parsed.group,
        artifact: parsed.artifact,
        developers: parsed.developers,
        hashRecalculated,
        valid,
      });

      setResult({ parsed, hashRecalculated, hashKey, valid, usedManual, previousRecord });
    } finally {
      setLoading(false);
    }
  }, [xml, manualHash]);

  return (
    <div className="si-page si-page--verify">
      <header className="si-header">
        <Link to="/" className="si-header__logo">
          <div className="si-header__leaf" aria-hidden="true">🍃</div>
          <span className="si-header__title">
            <span>Spring</span> Initializr
          </span>
        </Link>
        <span className="si-header__badge">Verificador de Hash</span>
      </header>

      <main className="si-main">
        <div className="si-verify-container">

          {/* Input card */}
          <div className="si-verify-card">
            <h1 className="si-verify-title">Verificador de Autenticidade</h1>
            <p className="si-verify-subtitle">
              Cole o conteúdo do <code>pom.xml</code> gerado para verificar se o arquivo
              não foi adulterado.
            </p>

            <div className="si-verify-info">
              <p className="si-verify-info__title">Como o hash é calculado</p>
              <p className="si-verify-info__text">
                O hash SHA-256 é gerado a partir da combinação dos seguintes campos, extraídos do <code>pom.xml</code>:
              </p>
              <ul className="si-verify-info__list">
                <li><strong>Group ID</strong> — identificador do grupo do projeto (ex.: <code>br.senac.tads.dsw</code>)</li>
                <li><strong>Artifact ID</strong> — identificador do artefato (ex.: <code>demo</code>)</li>
                <li><strong>Desenvolvedores</strong> — para cada membro da equipe, na ordem alfabética do GitHub:
                  <ul>
                    <li>Nome completo</li>
                    <li>Usuário GitHub</li>
                    <li>E-mail</li>
                  </ul>
                </li>
              </ul>
              <p className="si-verify-info__formula">
                Fórmula: <code>SHA-256( groupId:artifactId::dev1|dev2|... )</code>
                &nbsp;onde cada dev é <code>nome|github|email</code> (em minúsculas, ordenados pelo GitHub).
              </p>
            </div>

            <textarea
              className="si-verify-textarea"
              placeholder="Cole aqui o conteúdo completo do pom.xml..."
              value={xml}
              onChange={(e) => setXml(e.target.value)}
              rows={14}
              spellCheck={false}
              aria-label="Conteúdo do pom.xml"
            />

            <div className="si-verify-manual-hash">
              <label htmlFor="manual-hash" className="si-verify-label">
                Hash esperado{' '}
                <span className="si-verify-label--optional">
                  (opcional — usado somente se o pom.xml não contiver hash)
                </span>
              </label>
              <input
                id="manual-hash"
                type="text"
                className="si-verify-hash-input"
                placeholder="Cole aqui o hash SHA-256 de 64 caracteres para comparação..."
                value={manualHash}
                onChange={(e) => setManualHash(e.target.value)}
                spellCheck={false}
                maxLength={64}
                aria-label="Hash esperado para comparação manual"
              />
            </div>

            <div className="si-verify-actions">
              <button
                type="button"
                className={`si-btn si-btn--primary${loading ? ' si-btn--loading' : ''}`}
                onClick={() => void handleVerify()}
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </button>
              {(xml || manualHash) && (
                <button
                  type="button"
                  className="si-btn si-btn--secondary"
                  onClick={() => { setXml(''); setManualHash(''); setResult(null); setError(null); }}
                >
                  Limpar
                </button>
              )}
            </div>

            {error && (
              <div className="si-validation-error" role="alert">
                ⚠ {error}
              </div>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className={`si-verify-result${result.valid ? ' si-verify-result--valid' : ' si-verify-result--invalid'}`}>
              <div className="si-verify-verdict">
                <span className="si-verify-verdict__icon" aria-hidden="true">
                  {result.valid ? '✓' : '✗'}
                </span>
                <div>
                  <p className="si-verify-verdict__title">
                    {result.valid
                      ? 'Hash válido — dados autênticos'
                      : 'Hash inválido — divergência detectada'}
                  </p>
                  <p className="si-verify-verdict__sub">
                    {result.valid
                      ? 'O hash recalculado corresponde ao hash informado.'
                      : 'O hash informado não corresponde ao recalculado. Os dados podem ter sido modificados.'}
                  </p>
                  {result.valid && result.previousRecord && (
                    <p className="si-verify-verdict__history-note">
                      Última consulta anterior registrada: {formatDate(result.previousRecord.lastQueriedAt)}
                    </p>
                  )}
                </div>
              </div>

              <div className="si-verify-details">
                <h2 className="si-verify-details__title">Dados extraídos do pom.xml</h2>

                <div className="si-verify-row">
                  <span className="si-verify-label">Group ID</span>
                  <code className="si-verify-value">{result.parsed.group}</code>
                </div>
                <div className="si-verify-row">
                  <span className="si-verify-label">Artifact ID</span>
                  <code className="si-verify-value">{result.parsed.artifact}</code>
                </div>

                <h3 className="si-verify-details__subtitle">Desenvolvedores</h3>
                <DevTable devs={result.parsed.developers} />

                <h3 className="si-verify-details__subtitle">Hashes</h3>
                <div className="si-verify-row si-verify-row--hash">
                  <span className="si-verify-label">Recalculado agora</span>
                  <code className="si-verify-hash">{result.hashRecalculated}</code>
                </div>
                <div className="si-verify-row si-verify-row--hash">
                  <span className="si-verify-label">
                    {result.usedManual ? 'Informado manualmente' : 'Encontrado no pom.xml'}
                  </span>
                  <code className={`si-verify-hash${result.valid ? ' si-verify-hash--match' : ' si-verify-hash--mismatch'}`}>
                    {result.hashKey}
                    <span className="si-verify-hash__badge">{result.valid ? ' ✓' : ' ✗'}</span>
                  </code>
                </div>
              </div>

              {/* Previous entries on mismatch */}
              {!result.valid && result.previousRecord && result.previousRecord.submissions.length > 0 && (
                <div className="si-verify-history">
                  <h3 className="si-verify-history__title">
                    Consultas anteriores para este hash ({result.previousRecord.submissions.length})
                  </h3>
                  <p className="si-verify-history__sub">
                    Este hash já foi registrado neste navegador com os seguintes dados:
                  </p>
                  {result.previousRecord.submissions.map((sub, i) => (
                    <SubmissionCard key={i} sub={sub} />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="si-verify-back">
            <Link to="/" className="si-btn si-btn--secondary">← Voltar ao gerador</Link>
            <button
              type="button"
              className="si-btn si-btn--secondary"
              onClick={() => setShowHistory(true)}
            >
              Histórico de consultas
            </button>
          </div>
        </div>
      </main>

      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
    </div>
  );
}
