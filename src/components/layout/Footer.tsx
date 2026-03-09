import { useEffect } from 'react';

interface FooterProps {
  onGenerate: () => void;
  onExplore: () => void;
  onShare: () => void;
  loading?: boolean;
}

export default function Footer({ onGenerate, onExplore, onShare, loading = false }: FooterProps) {
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
      </div>
    </footer>
  );
}
