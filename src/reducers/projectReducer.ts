import {
  ProjectState,
  INITIAL_STATE,
  Developer,
  ProjectType,
  Language,
  Packaging,
  Configuration,
  JavaVersion,
  derivePackageName,
} from '../models/projectState';

// ── Action types ──────────────────────────────────────────────────────────────

export type ProjectAction =
  | { type: 'SET_PROJECT'; payload: ProjectType }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_SPRING_BOOT_VERSION'; payload: string }
  | { type: 'SET_GROUP'; payload: string }
  | { type: 'SET_ARTIFACT'; payload: string }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_PACKAGE_NAME'; payload: string }
  | { type: 'SET_PACKAGING'; payload: Packaging }
  | { type: 'SET_CONFIGURATION'; payload: Configuration }
  | { type: 'SET_JAVA_VERSION'; payload: JavaVersion }
  | { type: 'ADD_DEPENDENCY'; payload: string }
  | { type: 'REMOVE_DEPENDENCY'; payload: string }
  | { type: 'SET_DEPENDENCIES'; payload: string[] }
  | { type: 'ADD_DEVELOPER' }
  | { type: 'REMOVE_DEVELOPER'; payload: number }
  | { type: 'UPDATE_DEVELOPER'; payload: { index: number; field: keyof Developer; value: string } }
  | { type: 'SET_GENERATE_EXAMPLES'; payload: boolean }
  | { type: 'RESET' }
  | { type: 'LOAD_STATE'; payload: ProjectState };

// ── Reducer ───────────────────────────────────────────────────────────────────

export function projectReducer(
  state: ProjectState,
  action: ProjectAction
): ProjectState {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, project: action.payload };

    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };

    case 'SET_SPRING_BOOT_VERSION':
      return { ...state, springBootVersion: action.payload };

    case 'SET_GROUP':
      return {
        ...state,
        group: action.payload,
        packageName: derivePackageName(action.payload, state.artifact),
      };

    case 'SET_ARTIFACT':
      return {
        ...state,
        artifact: action.payload,
        // Mirror artifact → name (Initializr behaviour)
        name: action.payload,
        packageName: derivePackageName(state.group, action.payload),
      };

    case 'SET_NAME':
      return { ...state, name: action.payload };

    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };

    case 'SET_PACKAGE_NAME':
      return { ...state, packageName: action.payload };

    case 'SET_PACKAGING':
      return { ...state, packaging: action.payload };

    case 'SET_CONFIGURATION':
      return { ...state, configuration: action.payload };

    case 'SET_JAVA_VERSION':
      return { ...state, javaVersion: action.payload };

    case 'ADD_DEPENDENCY':
      if (state.dependencies.includes(action.payload)) return state;
      return { ...state, dependencies: [...state.dependencies, action.payload] };

    case 'REMOVE_DEPENDENCY':
      return {
        ...state,
        dependencies: state.dependencies.filter((d) => d !== action.payload),
      };

    case 'SET_DEPENDENCIES':
      return { ...state, dependencies: action.payload };

    case 'ADD_DEVELOPER':
      if (state.developers.length >= 10) return state;
      return {
        ...state,
        developers: [...state.developers, { name: '', github: '', email: '' }],
      };

    case 'REMOVE_DEVELOPER':
      if (state.developers.length <= 1) return state;
      return {
        ...state,
        developers: state.developers.filter((_, i) => i !== action.payload),
      };

    case 'UPDATE_DEVELOPER': {
      const { index, field, value } = action.payload;
      const updated = state.developers.map((dev, i) =>
        i === index ? { ...dev, [field]: value } : dev
      );
      return { ...state, developers: updated };
    }

    case 'SET_GENERATE_EXAMPLES':
      return { ...state, generateExamples: action.payload };

    case 'RESET':
      return INITIAL_STATE;

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}
