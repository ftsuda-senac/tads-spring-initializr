export default function Banner() {
  return (
    <div className="si-banner" role="note">
      <span className="si-banner__icon" aria-hidden="true">⚠️</span>
      <span>
        Esta é uma versão didática baseada no Spring Initializr com opções reduzidas e desabilitadas. Para o gerador oficial, acesse{' '}
        <a
          href="https://start.spring.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          start.spring.io
        </a>
        .
        <br />
        Após gerar o projeto, descompacte o arquivo <strong>.zip</strong> e abra a pasta resultante na IDE de sua preferência.
      </span>
    </div>
  );
}
