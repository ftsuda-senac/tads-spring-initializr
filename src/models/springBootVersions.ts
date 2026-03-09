export interface SpringBootVersion {
  version: string;
  enabled: boolean;
  default: boolean;
}

export const SPRING_BOOT_VERSIONS: readonly SpringBootVersion[] = [
  { version: '4.0.3', enabled: true, default: true },
  { version: '3.5.10', enabled: false, default: false },
] as const;

export const DEFAULT_SPRING_BOOT_VERSION = SPRING_BOOT_VERSIONS.find(
  (v) => v.default && v.enabled
)!.version;
