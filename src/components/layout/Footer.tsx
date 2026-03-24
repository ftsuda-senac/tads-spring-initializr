import { useEffect } from 'react';

interface FooterProps {
  onGenerate: () => void;
  onExplore: () => void;
  onShare: () => void;
  onSave: () => void;
  onLoad: () => void;
  hasSaved: boolean;
  loading?: boolean;
}

export default function Footer({
  onGenerate,
  onExplore,
  onShare,
  onSave,
  onLoad,
  hasSaved,
  loading = false,
}: FooterProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onGenerate();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onGenerate]);

  return (
    <footer className="si-footer">
      <div className="si-footer__buttons">
        <button
          type="button"
          className={`si-btn si-btn--primary si-btn--lg${loading ? ' si-btn--loading' : ''}`}
          onClick={onGenerate}
          disabled={loading}
          aria-busy={loading}
          title="Gerar projeto (Ctrl+Enter)"
        >
          <span>{loading ? 'Gerando...' : '⬇ GENERATE'}</span>
          {!loading && <kbd className="si-btn__shortcut">Ctrl + ⏎</kbd>}
        </button>

        <button
          type="button"
          className="si-btn si-btn--secondary si-btn--lg"
          onClick={onExplore}
          title="Explorar arquivos gerados"
        >
          EXPLORE
        </button>

        <button
          type="button"
          className="si-btn si-btn--secondary si-btn--lg"
          onClick={onShare}
          title="Compartilhar configuração"
        >
          SHARE
        </button>

        <button
          type="button"
          className="si-btn si-btn--secondary si-btn--lg"
          onClick={onSave}
          title="Salvar configuração atual no navegador"
        >
          💾 SALVAR
        </button>

        {hasSaved && (
          <button
            type="button"
            className="si-btn si-btn--secondary si-btn--lg si-btn--saved"
            onClick={onLoad}
            title="Carregar configuração salva"
          >
            ↩ CARREGAR
          </button>
        )}
      </div>

      <div className="si-footer__credit">
        Desenvolvido por{' '}
        <a
          href="https://github.com/ftsuda-senac"
          target="_blank"
          rel="noopener noreferrer"
        >
          @ftsuda-senac
        </a>
        {' '}usando Claude Code — v{__APP_VERSION__}
        <span className="si-footer__credit-sep">·</span>
        <a
          href="https://github.com/ftsuda-senac/tads-spring-initializr"
          target="_blank"
          rel="noopener noreferrer"
          className="si-footer__github-link"
          title="Ver projeto no GitHub"
          aria-label="Ver projeto no GitHub"
        >
          <svg className="si-footer__github-icon" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
              0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
              -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
              .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
              -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27
              .68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
              .51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
              0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          GitHub
        </a>
      </div>
    </footer>
  );
}
