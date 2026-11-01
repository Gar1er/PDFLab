# PDFLab

PDFLab es un sitio estático de herramientas PDF que se ejecutan en el navegador.

## Páginas

- `index.html`: portada y directorio de herramientas.
- `unir-pdf.html`: combinar varios PDF.
- `dividir-pdf.html`: extraer páginas o dividir un PDF en partes.
- `comprimir-pdf.html`: intentar reducir el tamaño de un PDF.
- `imagenes-a-pdf.html`: convertir imágenes JPG, PNG y WEBP a PDF.

## Archivos compartidos

- `style.css`: estilos compartidos.
- `script.js`: lógica de las herramientas; cada página indica su herramienta con `data-tool` en el elemento `<body>`.
- `robots.txt` y `sitemap.xml`: archivos para los buscadores.
- `netlify.toml`: mantiene la redirección del antiguo sitio de Netlify hacia Cloudflare Pages.

## Publicación

El proyecto está preparado para publicarse como sitio estático desde la raíz del repositorio en Cloudflare Pages. No requiere comando de compilación ni directorio de salida.

Antes de fusionar la rama de trabajo con `main`, prueba las cuatro páginas en la URL de previsualización de Cloudflare Pages.
