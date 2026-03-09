export interface Developer {
  name: string;
  github: string;
  email: string;
}

export type ProjectType = 'maven' | 'gradle-groovy' | 'gradle-kotlin';
export type Language = 'java' | 'kotlin' | 'groovy';
export type Packaging = 'jar' | 'war';
export type Configuration = 'properties' | 'yaml';
export type JavaVersion = '17' | '21' | '25';

export interface ProjectState {
  project: ProjectType;
  language: Language;
  springBootVersion: string;

  group: string;
  artifact: string;
  name: string;
  description: string;
  packageName: string;

  packaging: Packaging;
  configuration: Configuration;
  javaVersion: JavaVersion;

  dependencies: string[];
  developers: Developer[];
}

export const DEFAULT_DEVELOPER: Developer = {
  name: '',
  github: '',
  email: '',
};

/** Derives package name from group + artifact per R11:
 *  hyphens → underscores, invalid Java identifier chars removed. */
export function derivePackageName(group: string, artifact: string): string {
  const sanitize = (s: string) =>
    s
      .toLowerCase()
      .replace(/-/g, '_')
      .replace(/[^a-z0-9_.]/g, '');
  return `${sanitize(group)}.${sanitize(artifact)}`;
}

export const INITIAL_STATE: ProjectState = {
  project: 'maven',
  language: 'java',
  springBootVersion: '4.0.3',

  group: 'br.senac.tads.dsw',
  artifact: 'demo',
  name: 'demo',
  description: 'Projeto de demonstração com Spring Boot',
  packageName: 'br.senac.tads.dsw.demo',

  packaging: 'jar',
  configuration: 'properties',
  javaVersion: '21',

  dependencies: [],
  developers: [{ name: '', github: '', email: '' }],
};
