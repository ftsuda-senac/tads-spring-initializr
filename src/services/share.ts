import type { Developer, ProjectState } from '../models/projectState';
import { INITIAL_STATE } from '../models/projectState';

// Developer fields joined by pipe: "nome|github|email"
const DEV_SEP = '|';

function encodeDeveloper(dev: Developer): string {
  return [dev.name, dev.github, dev.email].join(DEV_SEP);
}

function decodeDeveloper(raw: string): Developer {
  const [name = '', github = '', email = ''] = raw.split(DEV_SEP);
  return { name, github, email };
}

export function encodeState(state: ProjectState): URLSearchParams {
  const p = new URLSearchParams();
  p.set('project',  state.project);
  p.set('lang',     state.language);
  p.set('boot',     state.springBootVersion);
  p.set('group',    state.group);
  p.set('artifact', state.artifact);
  p.set('name',     state.name);
  p.set('desc',     state.description);
  p.set('pkg',      state.packageName);
  p.set('packaging', state.packaging);
  p.set('config',   state.configuration);
  p.set('java',     state.javaVersion);
  for (const dep of state.dependencies) {
    p.append('dep', dep);
  }
  for (const dev of state.developers) {
    p.append('dev', encodeDeveloper(dev));
  }
  return p;
}

export function decodeState(params: URLSearchParams): ProjectState | null {
  try {
    const project  = (params.get('project')  ?? INITIAL_STATE.project)  as ProjectState['project'];
    const language = (params.get('lang')      ?? INITIAL_STATE.language) as ProjectState['language'];
    const boot     =  params.get('boot')      ?? INITIAL_STATE.springBootVersion;
    const group    =  params.get('group')     ?? INITIAL_STATE.group;
    const artifact =  params.get('artifact')  ?? INITIAL_STATE.artifact;
    const name     =  params.get('name')      ?? INITIAL_STATE.name;
    const desc     =  params.get('desc')      ?? INITIAL_STATE.description;
    const pkg      =  params.get('pkg')       ?? INITIAL_STATE.packageName;
    const packaging   = (params.get('packaging') ?? INITIAL_STATE.packaging)    as ProjectState['packaging'];
    const configuration = (params.get('config') ?? INITIAL_STATE.configuration) as ProjectState['configuration'];
    const javaVersion   = (params.get('java')   ?? INITIAL_STATE.javaVersion)   as ProjectState['javaVersion'];

    const dependencies = params.getAll('dep');
    const rawDevs      = params.getAll('dev');
    const developers   = rawDevs.length > 0
      ? rawDevs.map(decodeDeveloper)
      : INITIAL_STATE.developers;

    return {
      project, language, springBootVersion: boot,
      group, artifact, name, description: desc, packageName: pkg,
      packaging, configuration, javaVersion,
      dependencies, developers,
    };
  } catch {
    return null;
  }
}

/** Returns the shareable URL for the given state. */
export function buildShareUrl(state: ProjectState): string {
  const url = new URL(window.location.href);
  // Replace all existing search params with the encoded state
  url.search = encodeState(state).toString();
  return url.toString();
}

/** Reads query params from the current URL and returns decoded state, or null. */
export function readStateFromUrl(): ProjectState | null {
  const params = new URLSearchParams(window.location.search);
  // Only attempt decode if at least one known param is present
  if (!params.has('group') && !params.has('artifact') && !params.has('dep')) return null;
  return decodeState(params);
}

/** Updates the browser URL to reflect the current state without navigation. */
export function pushStateToUrl(state: ProjectState): void {
  const url = new URL(window.location.href);
  url.search = encodeState(state).toString();
  window.history.replaceState(null, '', url.toString());
}
