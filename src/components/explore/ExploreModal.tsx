import { useEffect, useState } from 'react';

interface ExploreModalProps {
  files: Record<string, string>;
  onClose: () => void;
}

// ── File tree ──────────────────────────────────────────────────────────────

interface TreeNode {
  name: string;
  path: string;
  isFile: boolean;
  children: TreeNode[];
}

function buildTree(files: Record<string, string>): TreeNode {
  const root: TreeNode = { name: '', path: '', isFile: false, children: [] };

  for (const path of Object.keys(files).sort()) {
    const parts = path.split('/');
    let node = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const fullPath = parts.slice(0, i + 1).join('/');
      const isFile = i === parts.length - 1;

      let child = node.children.find((c) => c.name === part);
      if (!child) {
        child = { name: part, path: fullPath, isFile, children: [] };
        node.children.push(child);
      }
      node = child;
    }
  }

  return root;
}

// ── Syntax highlighting ────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function detectLang(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'java') return 'java';
  if (ext === 'xml') return 'xml';
  if (ext === 'properties') return 'properties';
  if (ext === 'html') return 'html';
  return 'plain';
}

const JAVA_KW =
  /\b(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|try|var|void|volatile|while|record|sealed|permits)\b/g;

function highlightJava(code: string): string {
  return code
    .split('\n')
    .map((line) => {
      const ci = line.indexOf('//');
      const codePart = ci >= 0 ? line.slice(0, ci) : line;
      const cmtPart = ci >= 0 ? line.slice(ci) : '';

      const highlighted = escapeHtml(codePart)
        .replace(new RegExp(JAVA_KW.source, 'g'), "<span class='sh-kw'>$1</span>")
        .replace(/@[\w.]+/g, "<span class='sh-ann'>$&</span>")
        .replace(/"[^"]*"/g, '<span class="sh-str">$&</span>');

      return highlighted + (cmtPart ? `<span class="sh-cmt">${escapeHtml(cmtPart)}</span>` : '');
    })
    .join('\n');
}

function highlightXml(code: string): string {
  return code
    .split('\n')
    .map((line) => {
      const esc = escapeHtml(line);
      // full-line comment
      if (line.trimStart().startsWith('<!--')) {
        return `<span class="sh-cmt">${esc}</span>`;
      }
      return esc
        .replace(/(&lt;\/?[\w:.-]+)/g, "<span class='sh-tag'>$1</span>")
        .replace(/(\/&gt;|&gt;)/g, "<span class='sh-tag'>$1</span>")
        .replace(/([\w:.-]+=)("(?:[^"]*)")/g, '<span class="sh-attr">$1</span><span class="sh-str">$2</span>');
    })
    .join('\n');
}

function highlightProperties(code: string): string {
  return code
    .split('\n')
    .map((line) => {
      const esc = escapeHtml(line);
      if (line.trimStart().startsWith('#')) return `<span class="sh-cmt">${esc}</span>`;
      const eq = line.indexOf('=');
      if (eq >= 0) {
        return (
          `<span class="sh-attr">${escapeHtml(line.slice(0, eq + 1))}</span>` +
          `<span class="sh-str">${escapeHtml(line.slice(eq + 1))}</span>`
        );
      }
      return esc;
    })
    .join('\n');
}

function highlight(content: string, filename: string): string {
  switch (detectLang(filename)) {
    case 'java':       return highlightJava(content);
    case 'xml':        return highlightXml(content);
    case 'html':       return highlightXml(content); // same tokenizer
    case 'properties': return highlightProperties(content);
    default:           return escapeHtml(content);
  }
}

// ── TreeItem ───────────────────────────────────────────────────────────────

interface TreeItemProps {
  node: TreeNode;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  depth: number;
}

function TreeItem({ node, selectedPath, onSelect, depth }: TreeItemProps) {
  const [open, setOpen] = useState(depth < 4);
  const pad = depth * 14 + 8;

  if (node.isFile) {
    return (
      <button
        type="button"
        className={`si-explore-file${selectedPath === node.path ? ' si-explore-file--active' : ''}`}
        style={{ paddingLeft: `${pad}px` }}
        onClick={() => onSelect(node.path)}
        title={node.path}
      >
        <span className="si-explore-icon" aria-hidden="true">
          {node.name.endsWith('.xml') || node.name.endsWith('.html')
            ? '⟨/⟩'
            : node.name.endsWith('.java')
            ? 'J'
            : node.name.endsWith('.md')
            ? 'M'
            : '≡'}
        </span>
        {node.name}
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="si-explore-dir"
        style={{ paddingLeft: `${pad}px` }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="si-explore-chevron" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
        {node.name}
      </button>
      {open &&
        node.children.map((child) => (
          <TreeItem
            key={child.path}
            node={child}
            selectedPath={selectedPath}
            onSelect={onSelect}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}

// ── ExploreModal ───────────────────────────────────────────────────────────

export default function ExploreModal({ files, onClose }: ExploreModalProps) {
  const paths = Object.keys(files);
  const defaultPath = paths.find((p) => p.endsWith('pom.xml')) ?? paths[0] ?? null;
  const [selectedPath, setSelectedPath] = useState<string | null>(defaultPath);

  const tree = buildTree(files);
  const selectedFilename = selectedPath?.split('/').pop() ?? '';
  const selectedContent = selectedPath ? files[selectedPath] : null;
  const highlighted =
    selectedContent !== null ? highlight(selectedContent, selectedFilename) : '';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="si-modal-backdrop" role="presentation" onClick={handleBackdropClick}>
      <div
        className="si-modal si-modal--explore"
        role="dialog"
        aria-modal="true"
        aria-label="Explorar arquivos gerados"
      >
        {/* Header */}
        <div className="si-modal__header">
          <h2 className="si-modal__title">Explorar arquivos gerados</h2>
          <button
            type="button"
            className="si-modal__close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Body: tree + viewer */}
        <div className="si-explore-body">
          {/* File tree */}
          <nav className="si-explore-tree" aria-label="Árvore de arquivos">
            {tree.children.map((child) => (
              <TreeItem
                key={child.path}
                node={child}
                selectedPath={selectedPath}
                onSelect={setSelectedPath}
                depth={0}
              />
            ))}
          </nav>

          {/* Content viewer */}
          <div className="si-explore-viewer">
            {selectedPath ? (
              <>
                <div className="si-explore-viewer__path">{selectedPath}</div>
                <pre
                  className="si-explore-viewer__code"
                  // Content is generated by our own code, not user input.
                  // escapeHtml() is applied before any span injection.
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
              </>
            ) : (
              <p className="si-explore-viewer__empty">
                Selecione um arquivo na árvore para visualizar
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="si-modal__footer">
          <span>
            {paths.length} arquivo{paths.length !== 1 ? 's' : ''}
            {selectedPath && ` · ${selectedPath}`}
          </span>
          <button type="button" className="si-btn si-btn--secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
