import { useState } from 'react';
import type { DependencyCategory } from '../../models/dependencies';
import { getDependenciesByCategory } from '../../models/dependencies';

interface CategoryListProps {
  category: DependencyCategory;
  query: string;
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export default function CategoryList({
  category,
  query,
  selectedIds,
  onToggle,
}: CategoryListProps) {
  const [collapsed, setCollapsed] = useState(false);

  const q = query.trim().toLowerCase();
  const allDeps = getDependenciesByCategory(category);
  const deps = q
    ? allDeps.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      )
    : allDeps;

  if (deps.length === 0) return null;

  return (
    <div className="si-dep-category">
      <button
        type="button"
        className="si-dep-category__header"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        <span className="si-dep-category__name">{category}</span>
        <span className="si-dep-category__chevron" aria-hidden="true">
          {collapsed ? '▶' : '▼'}
        </span>
      </button>

      {!collapsed && (
        <ul className="si-dep-list" role="list">
          {deps.map((dep) => {
            const selected = selectedIds.includes(dep.id);
            return (
              <li key={dep.id}>
                <button
                  type="button"
                  className={`si-dep-item${selected ? ' si-dep-item--selected' : ''}`}
                  onClick={() => onToggle(dep.id)}
                  aria-pressed={selected}
                >
                  <span className="si-dep-item__check" aria-hidden="true">
                    {selected ? '✓' : ''}
                  </span>
                  <span className="si-dep-item__info">
                    <span className="si-dep-item__name">{dep.name}</span>
                    <span className="si-dep-item__desc">{dep.description}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
