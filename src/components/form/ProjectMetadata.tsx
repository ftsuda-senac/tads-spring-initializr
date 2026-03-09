import type { ProjectState } from '../../models/projectState';
import type { ProjectAction } from '../../reducers/projectReducer';
import TextInput from '../common/TextInput';

interface ProjectMetadataProps {
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
}

export default function ProjectMetadata({ state, dispatch }: ProjectMetadataProps) {
  return (
    <section aria-label="Metadados do Projeto" className="si-metadata">
      {/* Group + Artifact side-by-side (matches original layout) */}
      <div className="si-group-artifact-row">
        <TextInput
          id="field-group"
          label="Group"
          value={state.group}
          onChange={(v) => dispatch({ type: 'SET_GROUP', payload: v })}
          placeholder="br.senac.tads.dsw"
        />
        <TextInput
          id="field-artifact"
          label="Artifact"
          value={state.artifact}
          onChange={(v) => dispatch({ type: 'SET_ARTIFACT', payload: v })}
          placeholder="demo"
        />
      </div>
      <TextInput
        id="field-name"
        label="Name"
        value={state.name}
        onChange={(v) => dispatch({ type: 'SET_NAME', payload: v })}
        placeholder="demo"
      />
      <TextInput
        id="field-description"
        label="Description"
        value={state.description}
        onChange={(v) => dispatch({ type: 'SET_DESCRIPTION', payload: v })}
        placeholder="Projeto de demonstração com Spring Boot"
      />
      <TextInput
        id="field-package"
        label="Package name"
        value={state.packageName}
        onChange={(v) => dispatch({ type: 'SET_PACKAGE_NAME', payload: v })}
        placeholder="br.senac.tads.dsw.demo"
        hint="Auto-gerado a partir de Group + Artifact"
      />
    </section>
  );
}
