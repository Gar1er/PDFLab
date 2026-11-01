/* ===== FOOTER COMPARTIDO PDFLab ===== */
(function () {
  function cargarFooter() {
    const contenedor = document.getElementById("pdflab-footer");

    if (!contenedor) return;

    contenedor.innerHTML = `
      <footer class="site-footer">
        <div class="site-footer-inner">
          <!-- MARCA -->
          <div class="site-footer-brand">
            <a href="index.html" class="logo" aria-label="PDFLab, página principal">
              <span class="logo-icon">✦</span>
              PDF<span>Lab</span>
            </a>

            <p>
              Herramientas gratuitas para trabajar con tus documentos PDF de forma
              sencilla, rápida y desde tu navegador.
            </p>

            <a
              href="https://ko-fi.com/pdflabapp"
              target="_blank"
              rel="noopener noreferrer"
              class="site-footer-donate"
            >
              ♥ Apoyar PDFLab
            </a>
          </div>

          <!-- EXPLORA -->
          <nav class="site-footer-column" aria-label="Explorar">
            <h2>Explora</h2>
            <a href="index.html">Inicio</a>
            <a href="index.html#herramientas">Herramientas PDF</a>
            <a href="sobre-pdflab.html">Sobre PDFLab</a>
            <a href="contacto.html">Contacto</a>
          </nav>

          <!-- INFORMACIÓN -->
          <nav class="site-footer-column" aria-label="Información">
            <h2>Información</h2>
            <a href="privacidad.html">Política de privacidad</a>
            <a href="terminos.html">Términos y condiciones</a>
          </nav>

          <!-- REDES SOCIALES -->
          <nav class="site-footer-column" aria-label="Redes sociales">
            <h2>Síguenos</h2>
            <a
              href="https://x.com/pdflab_app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="PDFLab en X, abre en una pestaña nueva"
            >𝕏 &nbsp; X (Twitter)</a>

            <a
              href="https://www.instagram.com/pdflab.app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="PDFLab en Instagram, abre en una pestaña nueva"
            >◎ &nbsp; Instagram</a>

            <a
              href="https://www.facebook.com/share/1EG7uRY4Ge/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="PDFLab en Facebook, abre en una pestaña nueva"
            >f &nbsp; Facebook</a>
          </nav>
        </div>

        <!-- COPYRIGHT -->
        <div class="site-footer-bottom">
          <p>© 2026 PDFLab. Todos los derechos reservados.</p>
          <p>Hecho para simplificar tus PDF. 💜</p>
        </div>
      </footer>
    `;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cargarFooter, { once: true });
  } else {
    cargarFooter();
  }
})();
