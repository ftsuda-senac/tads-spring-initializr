interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  hint?: string;
}

export default function TextInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  readOnly,
  hint,
}: TextInputProps) {
  return (
    <div className="si-field">
      <label htmlFor={id} className="si-field__label">
        {label}
      </label>
      <input
        id={id}
        type="text"
        className="si-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint && (
        <span id={`${id}-hint`} className="si-field__hint">
          {hint}
        </span>
      )}
    </div>
  );
}
