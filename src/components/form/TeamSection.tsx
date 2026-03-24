import { useState, useCallback } from 'react';
import { z } from 'zod';
import type { Developer } from '../../models/projectState';
import type { ProjectAction } from '../../reducers/projectReducer';

// ── Zod schema ────────────────────────────────────────────────────────────

const developerSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  github: z
    .string()
    .min(1, 'Username GitHub é obrigatório')
    .regex(/^[a-zA-Z0-9-]+$/, 'Apenas letras, números e hífen'),
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
});

// ── Types ─────────────────────────────────────────────────────────────────

type FieldErrors = Partial<Record<keyof Developer, string>>;
type TouchedMap = Record<number, Partial<Record<keyof Developer, boolean>>>;
type ErrorMap = Record<number, FieldErrors>;

interface TeamSectionProps {
  developers: Developer[];
  dispatch: React.Dispatch<ProjectAction>;
  showAllErrors?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function validateDev(dev: Developer, override: Partial<Developer> = {}): FieldErrors {
  const result = developerSchema.safeParse({ ...dev, ...override });
  if (result.success) return {};
  const errs: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof Developer;
    if (!errs[field]) errs[field] = issue.message;
  }
  return errs;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function TeamSection({ developers, dispatch, showAllErrors = false }: TeamSectionProps) {
  const [touched, setTouched] = useState<TouchedMap>({});
  const [errors, setErrors] = useState<ErrorMap>({});

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleChange = useCallback(
    (index: number, field: keyof Developer, value: string) => {
      dispatch({ type: 'UPDATE_DEVELOPER', payload: { index, field, value } });
      // Re-validate immediately if the field was already touched
      if (touched[index]?.[field]) {
        const fieldErrors = validateDev(developers[index], { [field]: value });
        setErrors((prev) => ({
          ...prev,
          [index]: { ...prev[index], [field]: fieldErrors[field] },
        }));
      }
    },
    [developers, dispatch, touched]
  );

  const handleBlur = useCallback(
    (index: number, field: keyof Developer, value: string) => {
      setTouched((prev) => ({
        ...prev,
        [index]: { ...prev[index], [field]: true },
      }));
      const fieldErrors = validateDev(developers[index], { [field]: value });
      setErrors((prev) => ({
        ...prev,
        [index]: { ...prev[index], [field]: fieldErrors[field] },
      }));
    },
    [developers]
  );

  const handleAdd = () => {
    dispatch({ type: 'ADD_DEVELOPER' });
  };

  const handleRemove = (index: number) => {
    dispatch({ type: 'REMOVE_DEVELOPER', payload: index });
    // Re-index touched and errors maps
    setTouched((prev) => reIndex(prev, index));
    setErrors((prev) => reIndex(prev, index));
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <section className="si-team-section" aria-label="Equipe do Projeto">
      <div className="si-team-section__header">
        <span className="si-team-section__title">Equipe do Projeto</span>
        <button
          type="button"
          className="si-btn si-btn--secondary si-team-section__add"
          onClick={handleAdd}
          disabled={developers.length >= 10}
          title={
            developers.length >= 10
              ? 'Limite de 10 desenvolvedores atingido'
              : 'Adicionar desenvolvedor'
          }
        >
          + Adicionar desenvolvedor
        </button>
      </div>

      <p className="si-team-section__notice">
        ⚠ Os dados da equipe <strong>NÃO devem ser alterados manualmente</strong> no{' '}
        <code>pom.xml</code> — qualquer edição invalida o hash de identificação.
        Se necessário corrigir, regenere o projeto com as informações corretas.
      </p>

      <div className="si-team-list">
        {developers.map((dev, index) => {
          const computedErrors = showAllErrors ? validateDev(dev) : (errors[index] ?? {});
          const devErrors = computedErrors;
          const allTouched: Partial<Record<keyof Developer, boolean>> = { name: true, github: true, email: true };
          const devTouched = showAllErrors ? allTouched : (touched[index] ?? {});

          return (
            <div key={index} className="si-team-member">
              <div className="si-team-member__header">
                <span className="si-team-member__label">
                  Desenvolvedor {index + 1}
                </span>
                <button
                  type="button"
                  className="si-team-member__remove"
                  onClick={() => handleRemove(index)}
                  disabled={developers.length <= 1}
                  aria-label={`Remover desenvolvedor ${index + 1}`}
                  title={
                    developers.length <= 1
                      ? 'Ao menos um desenvolvedor é obrigatório'
                      : `Remover desenvolvedor ${index + 1}`
                  }
                >
                  ✕ Remover
                </button>
              </div>

              <div className="si-team-member__fields">
                {/* Nome */}
                <div className="si-field">
                  <label
                    htmlFor={`dev-${index}-name`}
                    className="si-field__label"
                  >
                    Nome completo
                  </label>
                  <input
                    id={`dev-${index}-name`}
                    type="text"
                    className={`si-input${devTouched.name && devErrors.name ? ' si-input--error' : ''}`}
                    value={dev.name}
                    placeholder="João da Silva"
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    onBlur={(e) => handleBlur(index, 'name', e.target.value)}
                    aria-describedby={
                      devTouched.name && devErrors.name
                        ? `dev-${index}-name-err`
                        : undefined
                    }
                    aria-invalid={!!(devTouched.name && devErrors.name)}
                  />
                  {devTouched.name && devErrors.name && (
                    <span
                      id={`dev-${index}-name-err`}
                      className="si-field__error"
                      role="alert"
                    >
                      ⚠ {devErrors.name}
                    </span>
                  )}
                </div>

                {/* GitHub */}
                <div className="si-field">
                  <label
                    htmlFor={`dev-${index}-github`}
                    className="si-field__label"
                  >
                    Username GitHub
                  </label>
                  <input
                    id={`dev-${index}-github`}
                    type="text"
                    className={`si-input${devTouched.github && devErrors.github ? ' si-input--error' : ''}`}
                    value={dev.github}
                    placeholder="joaosilva"
                    onChange={(e) =>
                      handleChange(index, 'github', e.target.value)
                    }
                    onBlur={(e) =>
                      handleBlur(index, 'github', e.target.value)
                    }
                    aria-describedby={
                      devTouched.github && devErrors.github
                        ? `dev-${index}-github-err`
                        : undefined
                    }
                    aria-invalid={!!(devTouched.github && devErrors.github)}
                  />
                  <span className="si-field__hint">Somente o username sem o prefixo "https://github.com/"</span>
                  {devTouched.github && devErrors.github && (
                    <span
                      id={`dev-${index}-github-err`}
                      className="si-field__error"
                      role="alert"
                    >
                      ⚠ {devErrors.github}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="si-field">
                  <label
                    htmlFor={`dev-${index}-email`}
                    className="si-field__label"
                  >
                    E-mail
                  </label>
                  <input
                    id={`dev-${index}-email`}
                    type="email"
                    className={`si-input${devTouched.email && devErrors.email ? ' si-input--error' : ''}`}
                    value={dev.email}
                    placeholder="joao@exemplo.com"
                    onChange={(e) =>
                      handleChange(index, 'email', e.target.value)
                    }
                    onBlur={(e) =>
                      handleBlur(index, 'email', e.target.value)
                    }
                    aria-describedby={
                      devTouched.email && devErrors.email
                        ? `dev-${index}-email-err`
                        : undefined
                    }
                    aria-invalid={!!(devTouched.email && devErrors.email)}
                  />
                  <span className="si-field__hint">Qualquer e-mail válido</span>
                  {devTouched.email && devErrors.email && (
                    <span
                      id={`dev-${index}-email-err`}
                      className="si-field__error"
                      role="alert"
                    >
                      ⚠ {devErrors.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Utilities ─────────────────────────────────────────────────────────────

/** Re-indexes a numeric-keyed map after removing entry at `removedIndex`. */
function reIndex<T>(map: Record<number, T>, removedIndex: number): Record<number, T> {
  const next: Record<number, T> = {};
  for (const [k, v] of Object.entries(map)) {
    const n = Number(k);
    if (n < removedIndex) next[n] = v;
    else if (n > removedIndex) next[n - 1] = v;
    // n === removedIndex → dropped
  }
  return next;
}
