import type { Dependency } from '../../models/dependencies';

interface DependencyTagProps {
  dependency: Dependency;
  onRemove: () => void;
}

export default function DependencyTag({ dependency, onRemove }: DependencyTagProps) {
  return (
    <div className="si-dep-card">
      <div className="si-dep-card__header">
        <span className="si-dep-card__name">{dependency.name}</span>
        <span className="si-dep-card__badge">{dependency.category}</span>
        <button
          type="button"
          className="si-dep-card__remove"
          onClick={onRemove}
          aria-label={`Remover ${dependency.name}`}
          title="Remover dependência"
        >
          −
        </button>
      </div>
      <p className="si-dep-card__desc">{dependency.description}</p>
    </div>
  );
}
