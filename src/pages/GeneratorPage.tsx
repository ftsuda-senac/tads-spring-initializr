import { useReducer, useCallback, useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import { projectReducer } from '../reducers/projectReducer';
import { INITIAL_STATE } from '../models/projectState';
import { getDependencyById } from '../models/dependencies';
import { generateAllFiles } from '../generators/index';
import { buildAndDownloadZip } from '../services/zipBuilder';
import { buildShareUrl, pushStateToUrl, readStateFromUrl } from '../services/share';
import { useSpringVersions } from '../hooks/useSpringVersions';
import { useJavaVersions } from '../hooks/useJavaVersions';
import { saveState, hasSavedState, loadSavedState } from '../services/localSave';

import Header from '../components/layout/Header';
import Banner from '../components/layout/Banner';
import Footer from '../components/layout/Footer';
import RadioGroup, { type RadioOption } from '../components/common/RadioGroup';
import ProjectMetadata from '../components/form/ProjectMetadata';
import DependencyModal from '../components/dependencies/DependencyModal';
import DependencyTag from '../components/dependencies/DependencyTag';
import TeamSection from '../components/form/TeamSection';
import GenerateExamplesSection from '../components/form/GenerateExamplesSection';
import ExploreModal from '../components/explore/ExploreModal';

// ── Static option lists ───────────────────────────────────────────────────

const PROJECT_OPTIONS: RadioOption[] = [
  { value: 'maven', label: 'Maven' },
  { value: 'gradle-groovy', label: 'Gradle - Groovy', disabled: true },
  { value: 'gradle-kotlin', label: 'Gradle - Kotlin', disabled: true },
];

const LANGUAGE_OPTIONS: RadioOption[] = [
  { value: 'java', label: 'Java' },
  { value: 'kotlin', label: 'Kotlin', disabled: true },
  { value: 'groovy', label: 'Groovy', disabled: true },
];

const PACKAGING_OPTIONS: RadioOption[] = [
  { value: 'jar', label: 'Jar' },
  { value: 'war', label: 'War', disabled: true },
];

const CONFIGURATION_OPTIONS: RadioOption[] = [
  { value: 'properties', label: 'Properties' },
  { value: 'yaml', label: 'YAML', disabled: true },
];

// ── Validation ────────────────────────────────────────────────────────────

const developerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  github: z
    .string()
    .min(1, 'Username GitHub é obrigatório')
    .regex(/^[a-zA-Z0-9-]+$/, 'Apenas letras, números e hífen'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
});

const formSchema = z.object({
  group: z.string().min(1, 'Group é obrigatório'),
  artifact: z.string().min(1, 'Artifact é obrigatório'),
  name: z.string().min(1, 'Name é obrigatório'),
  packageName: z.string().min(1, 'Package name é obrigatório'),
  developers: z.array(developerSchema).min(1),
});

// ── Component ─────────────────────────────────────────────────────────────

export default function GeneratorPage() {
  const [state, dispatch] = useReducer(projectReducer, INITIAL_STATE);
  const [modalOpen, setModalOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [exploreFiles, setExploreFiles] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(() => hasSavedState());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Spring Boot versions — rule: major >= 4 enabled, older disabled
  const springVersions = useSpringVersions();

  // Auto-select the default enabled version whenever the version list updates
  // (e.g. after the GitHub API response resolves and replaces the static list)
  useEffect(() => {
    if (springVersions.length === 0) return;
    const current = springVersions.find((v) => v.version === state.springBootVersion);
    if (!current || !current.enabled) {
      const defaultVersion = springVersions.find((v) => v.default) ?? springVersions.find((v) => v.enabled);
      if (defaultVersion) {
        dispatch({ type: 'SET_SPRING_BOOT_VERSION', payload: defaultVersion.version });
      }
    }
  }, [springVersions]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load state from URL on first render
  useEffect(() => {
    const loaded = readStateFromUrl();
    if (loaded) dispatch({ type: 'LOAD_STATE', payload: loaded });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const springBootOptions: RadioOption[] = springVersions.map((v) => ({
    value: v.version,
    label: v.version,
    disabled: !v.enabled,
  }));

  // Java versions — fetched from start.spring.io metadata API
  const javaVersions = useJavaVersions();

  // Auto-select the default version whenever the Java version list updates
  useEffect(() => {
    if (javaVersions.length === 0) return;
    const current = javaVersions.find((v) => v.version === state.javaVersion);
    if (!current) {
      const defaultVersion = javaVersions.find((v) => v.default) ?? javaVersions[0];
      if (defaultVersion) {
        dispatch({ type: 'SET_JAVA_VERSION', payload: defaultVersion.version });
      }
    }
  }, [javaVersions]); // eslint-disable-line react-hooks/exhaustive-deps

  const javaOptions: RadioOption[] = javaVersions.map((v) => ({
    value: v.version,
    label: v.version,
  }));

  // Ctrl+B → open dependency modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setModalOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleToggleDep = useCallback(
    (id: string) => {
      if (state.dependencies.includes(id)) {
        dispatch({ type: 'REMOVE_DEPENDENCY', payload: id });
      } else {
        dispatch({ type: 'ADD_DEPENDENCY', payload: id });
      }
    },
    [state.dependencies]
  );

  const handleGenerate = useCallback(async () => {
    const result = formSchema.safeParse({
      group: state.group,
      artifact: state.artifact,
      name: state.name,
      packageName: state.packageName,
      developers: state.developers,
    });

    if (!result.success) {
      setShowAllErrors(true);
      const topError = result.error.issues[0]?.message ?? 'Preencha todos os campos obrigatórios.';
      setValidationError(topError);
      return;
    }

    setValidationError(null);
    setShowAllErrors(false);
    setLoading(true);

    try {
      const files = await generateAllFiles(state);
      await buildAndDownloadZip(files, state.artifact);
    } catch (err) {
      console.error('[generate] erro:', err);
      setValidationError('Erro ao gerar o projeto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [state]);

  const handleExplore = useCallback(async () => {
    setLoading(true);
    setValidationError(null);
    try {
      const files = await generateAllFiles(state);
      setExploreFiles(files);
      setExploreOpen(true);
    } catch (err) {
      console.error('[explore] erro:', err);
      setValidationError('Erro ao gerar preview. Verifique os dados do formulário.');
    } finally {
      setLoading(false);
    }
  }, [state]);

  const handleShare = useCallback(async () => {
    const url = buildShareUrl(state);
    pushStateToUrl(state);
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copiado para a área de transferência!');
    } catch {
      showToast('Link gerado — copie da barra de endereços.');
    }
  }, [state, showToast]);

  const handleSave = useCallback(() => {
    saveState(state);
    setHasSaved(true);
    showToast('Configuração salva no navegador!');
  }, [state, showToast]);

  const handleLoad = useCallback(() => {
    const loaded = loadSavedState(springVersions);
    if (loaded) {
      dispatch({ type: 'LOAD_STATE', payload: loaded });
      showToast('Configuração carregada!');
    }
  }, [springVersions, showToast]);

  return (
    <div className="si-page">
      <Header />
      <Banner />

      <main className="si-main">
        <div className="si-form-container">
          {validationError && (
            <div className="si-validation-error" role="alert">
              ⚠ {validationError}
            </div>
          )}

          <form
            className="si-form-layout"
            onSubmit={(e) => {
              e.preventDefault();
              void handleGenerate();
            }}
            noValidate
          >
            {/* ── Left column: everything except dependencies ──────────── */}
            <div className="si-col-left">

              {/* Project + Language side by side */}
              <div className="si-project-lang-row">
                <RadioGroup
                  label="Project"
                  name="project"
                  options={PROJECT_OPTIONS}
                  value={state.project}
                  onChange={(v) =>
                    dispatch({ type: 'SET_PROJECT', payload: v as 'maven' })
                  }
                />
                <RadioGroup
                  label="Language"
                  name="language"
                  options={LANGUAGE_OPTIONS}
                  value={state.language}
                  onChange={(v) =>
                    dispatch({ type: 'SET_LANGUAGE', payload: v as 'java' })
                  }
                />
              </div>

              {/* Spring Boot — full width */}
              <RadioGroup
                label="Spring Boot"
                name="springBootVersion"
                options={springBootOptions}
                value={state.springBootVersion}
                onChange={(v) =>
                  dispatch({ type: 'SET_SPRING_BOOT_VERSION', payload: v })
                }
              />

              {/* Project Metadata subsection */}
              <div className="si-metadata-section">
                <span className="si-metadata-section__label">Project Metadata</span>

                <ProjectMetadata state={state} dispatch={dispatch} />

                {/* Packaging / Configuration / Java */}
                <div className="si-options-row">
                  <RadioGroup
                    label="Packaging"
                    name="packaging"
                    options={PACKAGING_OPTIONS}
                    value={state.packaging}
                    onChange={(v) =>
                      dispatch({ type: 'SET_PACKAGING', payload: v as 'jar' })
                    }
                  />
                  <RadioGroup
                    label="Configuration"
                    name="configuration"
                    options={CONFIGURATION_OPTIONS}
                    value={state.configuration}
                    onChange={(v) =>
                      dispatch({
                        type: 'SET_CONFIGURATION',
                        payload: v as 'properties',
                      })
                    }
                  />
                  <div className="si-java-section">
                    <RadioGroup
                      label="Java (JDK)"
                      name="javaVersion"
                      options={javaOptions}
                      value={state.javaVersion}
                      onChange={(v) =>
                        dispatch({
                          type: 'SET_JAVA_VERSION',
                          payload: v,
                        })
                      }
                    />
                    <p className="si-java-section__hint">
                      Verifique sua versão com o comando{' '}
                      <strong><code>java -version</code></strong> no terminal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right column: Dependencies only ─────────────────────── */}
            <div className="si-col-right">
              <div className="si-deps-section">
                <div className="si-deps-section__top">
                  <span className="si-section__label">Dependencies</span>
                  <button
                    type="button"
                    className="si-btn si-btn--secondary si-deps-add-btn"
                    onClick={() => setModalOpen(true)}
                    title="Adicionar dependências (Ctrl+B)"
                  >
                    ADD DEPENDENCIES... <kbd>CTRL + B</kbd>
                  </button>
                </div>

                {state.dependencies.length === 0 ? (
                  <p className="si-deps-empty">No dependency selected</p>
                ) : (
                  <div
                    className="si-dep-list-selected"
                    role="list"
                    aria-label="Dependências selecionadas"
                  >
                    {state.dependencies.map((id) => {
                      const dep = getDependencyById(id);
                      if (!dep) return null;
                      return (
                        <DependencyTag
                          key={id}
                          dependency={dep}
                          onRemove={() =>
                            dispatch({ type: 'REMOVE_DEPENDENCY', payload: id })
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Generate examples section — full width, between metadata and team */}
          <GenerateExamplesSection
            generateExamples={state.generateExamples}
            dispatch={dispatch}
          />

          {/* Team section — full width below the two columns */}
          <TeamSection
            developers={state.developers}
            dispatch={dispatch}
            showAllErrors={showAllErrors}
          />
        </div>
      </main>

      <Footer
        onGenerate={() => void handleGenerate()}
        onExplore={() => void handleExplore()}
        onShare={() => void handleShare()}
        onSave={handleSave}
        onLoad={handleLoad}
        hasSaved={hasSaved}
        loading={loading}
      />

      {modalOpen && (
        <DependencyModal
          selectedIds={state.dependencies}
          onToggle={handleToggleDep}
          onClose={() => setModalOpen(false)}
        />
      )}

      {exploreOpen && exploreFiles && (
        <ExploreModal
          files={exploreFiles}
          onClose={() => setExploreOpen(false)}
        />
      )}

      {toast && (
        <div className="si-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
