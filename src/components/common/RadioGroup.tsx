import Tooltip from './Tooltip';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  label: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
}

const DISABLED_TOOLTIP =
  'Opção não disponível nesta versão didática. Disponível no Spring Initializr oficial: start.spring.io';

export default function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
}: RadioGroupProps) {
  return (
    <fieldset className="si-section">
      <legend className="si-section__label">{label}</legend>
      <div className="si-pills" role="radiogroup" aria-label={label}>
        {options.map((opt) => {
          const pill = (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={value === opt.value}
              aria-disabled={opt.disabled ?? false}
              aria-label={`${name}: ${opt.label}${opt.disabled ? ' (indisponível)' : ''}`}
              className="si-pill"
              onClick={() => {
                if (!opt.disabled) onChange(opt.value);
              }}
              tabIndex={opt.disabled ? -1 : 0}
            >
              {opt.label}
            </button>
          );

          return opt.disabled ? (
            <Tooltip key={opt.value} text={DISABLED_TOOLTIP}>
              {pill}
            </Tooltip>
          ) : (
            pill
          );
        })}
      </div>
    </fieldset>
  );
}
