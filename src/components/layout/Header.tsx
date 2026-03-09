import { useTheme } from '../../hooks/useTheme';

export default function Header() {
  const [theme, toggleTheme] = useTheme();

  return (
    <header className="si-header">
      <a href="/" className="si-header__logo">
        <div className="si-header__leaf" aria-hidden="true">🍃</div>
        <span className="si-header__title">
          <span>TADS</span> Spring Initializr
        </span>
      </a>

      <span className="si-header__badge">Versão Didática</span>

      <button
        type="button"
        className="si-theme-toggle"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      >
        {theme === 'dark' ? '☀' : '☾'}
      </button>
    </header>
  );
}
