import RadioGroup, { type RadioOption } from '../common/RadioGroup';
import type { ProjectAction } from '../../reducers/projectReducer';

const OPTIONS: RadioOption[] = [
  { value: 'false', label: 'Não' },
  { value: 'true', label: 'Sim' },
];

interface GenerateExamplesSectionProps {
  generateExamples: boolean;
  dispatch: React.Dispatch<ProjectAction>;
}

export default function GenerateExamplesSection({
  generateExamples,
  dispatch,
}: GenerateExamplesSectionProps) {
  return (
    <div className="si-generate-examples-section">
      <RadioGroup
        label="Gerar classes de exemplo?"
        name="generateExamples"
        options={OPTIONS}
        value={String(generateExamples)}
        onChange={(v) =>
          dispatch({ type: 'SET_GENERATE_EXAMPLES', payload: v === 'true' })
        }
      />
      <p className="si-generate-examples-section__hint">
        <strong>Não</strong>: gera apenas a classe principal e o arquivo de propriedades, semelhante ao Initializr original
        <br />
        <strong>Sim</strong>: gera Exemplo completo funcional para fins didáticos
      </p>
    </div>
  );
}
