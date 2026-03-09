import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { calculateHashFromExtracted } from '../hash/identification';

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
  valid: boolean;
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

  // Comments are not accessible via querySelector — search in raw text
  const hashMatch = xml.match(/<!--\s*hash-identificacao:\s*([a-f0-9]{64})\s*-->/);
  const hashFound = hashMatch?.[1] ?? null;

  return { group, artifact, developers, hashFound };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function VerifyPage() {
  const [xml, setXml] = useState('');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      if (!parsed.hashFound) {
        setError('Hash não encontrado no pom.xml. Verifique se o arquivo foi gerado por este sistema.');
        return;
      }
      if (parsed.developers.length === 0) {
        setError('Nenhum desenvolvedor encontrado no bloco <developers>.');
        return;
      }

      const hashRecalculated = await calculateHashFromExtracted(
        parsed.group,
        parsed.artifact,
        parsed.developers
      );

      setResult({ parsed, hashRecalculated, valid: hashRecalculated === parsed.hashFound });
    } finally {
      setLoading(false);
    }
  }, [xml]);

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

            <textarea
              className="si-verify-textarea"
              placeholder="Cole aqui o conteúdo completo do pom.xml..."
              value={xml}
              onChange={(e) => setXml(e.target.value)}
              rows={14}
              spellCheck={false}
              aria-label="Conteúdo do pom.xml"
            />

            <div className="si-verify-actions">
              <button
                type="button"
                className={`si-btn si-btn--primary${loading ? ' si-btn--loading' : ''}`}
                onClick={() => void handleVerify()}
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </button>
              {xml && (
                <button
                  type="button"
                  className="si-btn si-btn--secondary"
                  onClick={() => { setXml(''); setResult(null); setError(null); }}
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
            <div
              className={`si-verify-result${
                result.valid ? ' si-verify-result--valid' : ' si-verify-result--invalid'
              }`}
            >
              <div className="si-verify-verdict">
                <span className="si-verify-verdict__icon" aria-hidden="true">
                  {result.valid ? '✓' : '✗'}
                </span>
                <div>
                  <p className="si-verify-verdict__title">
                    {result.valid
                      ? 'Hash válido — arquivo autêntico'
                      : 'Hash inválido — arquivo adulterado'}
                  </p>
                  <p className="si-verify-verdict__sub">
                    {result.valid
                      ? 'O conteúdo do pom.xml corresponde ao hash calculado a partir dos dados dos desenvolvedores.'
                      : 'O hash encontrado no arquivo não corresponde ao hash recalculado. Os dados podem ter sido modificados.'}
                  </p>
                </div>
              </div>

              <div className="si-verify-details">
                <h2 className="si-verify-details__title">Dados extraídos</h2>

                <div className="si-verify-row">
                  <span className="si-verify-label">Group ID</span>
                  <code className="si-verify-value">{result.parsed.group}</code>
                </div>
                <div className="si-verify-row">
                  <span className="si-verify-label">Artifact ID</span>
                  <code className="si-verify-value">{result.parsed.artifact}</code>
                </div>

                <h3 className="si-verify-details__subtitle">Desenvolvedores</h3>
                <table className="si-verify-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>GitHub</th>
                      <th>E-mail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.parsed.developers.map((dev) => (
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

                <h3 className="si-verify-details__subtitle">Hashes</h3>
                <div className="si-verify-row si-verify-row--hash">
                  <span className="si-verify-label">Encontrado no arquivo</span>
                  <code className={`si-verify-hash${result.valid ? '' : ' si-verify-hash--mismatch'}`}>
                    {result.parsed.hashFound}
                  </code>
                </div>
                <div className="si-verify-row si-verify-row--hash">
                  <span className="si-verify-label">Recalculado agora</span>
                  <code className="si-verify-hash">{result.hashRecalculated}</code>
                </div>
              </div>
            </div>
          )}

          <div className="si-verify-back">
            <Link to="/" className="si-btn si-btn--secondary">← Voltar ao gerador</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
