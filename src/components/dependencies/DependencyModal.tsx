import { useEffect, useRef, useState } from 'react';
import { DEPENDENCY_CATEGORIES, DEPENDENCIES } from '../../models/dependencies';
import CategoryList from './CategoryList';

interface DependencyModalProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
}

export default function DependencyModal({
  selectedIds,
  onToggle,
  onClose,
}: DependencyModalProps) {
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Auto-focus search on open
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const q = query.trim().toLowerCase();
  const hasResults =
    q === '' ||
    DEPENDENCIES.some(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
    );

  return (
    <div
      className="si-modal-backdrop"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        className="si-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Adicionar dependências"
      >
        {/* Header */}
        <div className="si-modal__header">
          <h2 className="si-modal__title">Dependências</h2>
          <button
            type="button"
            className="si-modal__close"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="si-modal__search-wrap">
          <input
            ref={searchRef}
            type="search"
            className="si-input si-modal__search"
            placeholder="Buscar dependências..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar dependências"
          />
        </div>

        {/* Body */}
        <div className="si-modal__body">
          {hasResults ? (
            DEPENDENCY_CATEGORIES.map((cat) => (
              <CategoryList
                key={cat}
                category={cat}
                query={query}
                selectedIds={selectedIds}
                onToggle={onToggle}
              />
            ))
          ) : (
            <p className="si-modal__empty">
              Nenhuma dependência encontrada para &ldquo;{query}&rdquo;.
            </p>
          )}
        </div>

        {/* Footer hint */}
        <div className="si-modal__footer">
          <span>
            {selectedIds.length > 0
              ? `${selectedIds.length} dependência${selectedIds.length > 1 ? 's' : ''} selecionada${selectedIds.length > 1 ? 's' : ''}`
              : 'Nenhuma dependência selecionada'}
          </span>
          <button
            type="button"
            className="si-btn si-btn--secondary"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
