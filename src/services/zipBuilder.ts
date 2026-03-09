import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Assembles all generated files into a ZIP archive and triggers browser download.
 * @param files  Map of `{ "path/to/file": "content" }` from generateAllFiles()
 * @param artifactId  Used as the download filename (e.g. "demo.zip")
 */
export async function buildAndDownloadZip(
  files: Record<string, string>,
  artifactId: string
): Promise<void> {
  const zip = new JSZip();

  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${artifactId}.zip`);
}
