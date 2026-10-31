/* ===== PROGRESO COMPARTIDO DE PDFLAB ===== */
function progresoProceso(id, porcentaje, titulo, detalle = "") {
  const panel = document.getElementById(`${id}Progress`);
  if (!panel) return;
  const valor = Math.max(0, Math.min(100, Math.round(porcentaje)));
  panel.hidden = false;
  panel.setAttribute("aria-valuenow", String(valor));
  panel.querySelector(".process-progress-label").textContent = titulo;
  panel.querySelector(".process-progress-percent").textContent = `${valor}%`;
  panel.querySelector(".process-progress-fill").style.width = `${valor}%`;
  panel.querySelector(".process-progress-detail").textContent = detalle || "Procesando en este dispositivo";
  panel.classList.toggle("completed", valor === 100);
}
function reiniciarProgreso(id) {
  const panel = document.getElementById(`${id}Progress`);
  if (panel) {
    panel.hidden = true;
    panel.classList.remove("completed");
  }
}
async function permitirRepintado() {
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

const uploadZone = document.getElementById("uploadZone");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const mergeControls = document.getElementById("mergeControls");
const mergeButton = document.getElementById("mergeButton");
const fileCounter = document.getElementById("fileCounter");
const mergeMessage = document.getElementById("mergeMessage");
const splitControls = document.getElementById("splitControls");
const splitButton = document.getElementById("splitButton");
const splitMessage = document.getElementById("splitMessage");

// Elementos del selector visual
const pageGrid = document.getElementById("pageGrid");
const pageTotal = document.getElementById("pageTotal");
const selectedPageCounter = document.getElementById("selectedPageCounter");
const selectAllPages = document.getElementById("selectAllPages");
// Elementos de división automática
const autoSplitControls = document.getElementById("autoSplitControls");
const splitInterval = document.getElementById("splitInterval");
const autoSplitButton = document.getElementById("autoSplitButton");
const autoSplitMessage = document.getElementById("autoSplitMessage");

// Elementos de compresión PDF
const compressControls = document.getElementById("compressControls");
const compressionLevel = document.getElementById("compressionLevel");
const compressButton = document.getElementById("compressButton");
const compressMessage = document.getElementById("compressMessage");

// Elementos del comparador
const compressionResults = document.getElementById("compressionResults");
const originalSize = document.getElementById("originalSize");
const compressedSize = document.getElementById("compressedSize");
const originalBar = document.getElementById("originalBar");
const compressedBar = document.getElementById("compressedBar");
const compressionSaving = document.getElementById("compressionSaving");
const compressionStatus = document.getElementById("compressionStatus");

// Páginas seleccionadas
let selectedPageIndices = new Set();

// Control para evitar cargar dos veces el mismo documento
let selectorVersion = 0;
// Configuración del trabajador de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

let selectedFiles = [];

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function renderFiles() {
  fileList.replaceChildren();
  mergeControls.hidden =
    herramientaActiva !== "merge" || selectedFiles.length < 2;
  splitControls.hidden =
    herramientaActiva !== "split" || selectedFiles.length !== 1;
  autoSplitControls.hidden =
    herramientaActiva !== "split" || selectedFiles.length !== 1;
  compressControls.hidden =
    herramientaActiva !== "compress" || selectedFiles.length !== 1;

  fileCounter.textContent = `${selectedFiles.length} archivos seleccionados`;

  selectedFiles.forEach((file, index) => {
    const item = document.createElement("div");
    item.className = "file-item";

    const symbol = document.createElement("span");
    symbol.className = "file-symbol";
    symbol.textContent = "PDF";

    const info = document.createElement("div");
    info.className = "file-info";

    const name = document.createElement("strong");
    name.textContent = file.name;

    const size = document.createElement("small");
    size.textContent = formatFileSize(file.size);

    const removeButton = document.createElement("button");
    removeButton.className = "file-remove";
    removeButton.type = "button";
    removeButton.textContent = "Quitar";
    removeButton.setAttribute("aria-label", `Quitar ${file.name}`);

    removeButton.addEventListener("click", () => {
      selectedFiles.splice(index, 1);
      renderFiles();
    });

    const moveUpButton = document.createElement("button");
    moveUpButton.className = "file-remove";
    moveUpButton.textContent = "↑";
    moveUpButton.type = "button";
    moveUpButton.disabled = index === 0;
    moveUpButton.title = "Mover hacia arriba";

    moveUpButton.addEventListener("click", () => {
      [selectedFiles[index - 1], selectedFiles[index]] = [
        selectedFiles[index],
        selectedFiles[index - 1],
      ];

      renderFiles();
    });

    const moveDownButton = document.createElement("button");
    moveDownButton.className = "file-remove";
    moveDownButton.textContent = "↓";
    moveDownButton.type = "button";
    moveDownButton.disabled = index === selectedFiles.length - 1;
    moveDownButton.title = "Mover hacia abajo";

    moveDownButton.addEventListener("click", () => {
      [selectedFiles[index], selectedFiles[index + 1]] = [
        selectedFiles[index + 1],
        selectedFiles[index],
      ];

      renderFiles();
    });

    info.append(name, size);
    item.append(symbol, info, moveUpButton, moveDownButton, removeButton);
    fileList.append(item);
  });

  if (herramientaActiva === "split") {
    actualizarSelectorPaginas();
  } else {
    selectorVersion++;
  }
}

function addFiles(files) {
  for (const file of files) {
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      alert(`${file.name} no parece ser un archivo PDF.`);
      continue;
    }

    const alreadyAdded = selectedFiles.some(
      (existing) =>
        existing.name === file.name &&
        existing.size === file.size &&
        existing.lastModified === file.lastModified,
    );

    if (!alreadyAdded) {
      selectedFiles.push(file);
    }
  }

  renderFiles();
}

fileInput.addEventListener("change", (event) => {
  addFiles(event.target.files);

  // Permite volver a seleccionar el mismo archivo.
  fileInput.value = "";
});

uploadZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  uploadZone.classList.add("dragging");
});

uploadZone.addEventListener("dragleave", (event) => {
  if (!uploadZone.contains(event.relatedTarget)) {
    uploadZone.classList.remove("dragging");
  }
});

uploadZone.addEventListener("drop", (event) => {
  event.preventDefault();
  uploadZone.classList.remove("dragging");

  addFiles(event.dataTransfer.files);
});

console.log("PDFLab está listo.");

async function unirPDF() {
  // Necesitamos al menos dos documentos.
  if (selectedFiles.length < 2) {
    mergeMessage.textContent = "Selecciona al menos dos archivos PDF.";

    return;
  }

  // Evitamos ejecutar dos uniones simultáneamente.
  mergeButton.disabled = true;
  progresoProceso("mergeMessage", 0, "Preparando documentos...", `${selectedFiles.length} archivos en cola`);
  await permitirRepintado();
  mergeMessage.textContent = "Preparando tus documentos...";

  try {
    // Creamos un documento PDF vacío.
    const pdfFinal = await PDFLib.PDFDocument.create();

    // Recorremos los archivos seleccionados.
    for (const [indice, file] of selectedFiles.entries()) {
      progresoProceso("mergeMessage", Math.round((indice / selectedFiles.length) * 90), `Uniendo archivo ${indice + 1} de ${selectedFiles.length}`, file.name);
      await permitirRepintado();
      mergeMessage.textContent = `Procesando: ${file.name}`;

      // Leemos el contenido del archivo.
      const bytes = await file.arrayBuffer();

      // Abrimos el documento PDF original.
      const pdfOriginal = await PDFLib.PDFDocument.load(bytes);

      // Obtenemos todas sus páginas.
      const paginas = await pdfFinal.copyPages(
        pdfOriginal,
        pdfOriginal.getPageIndices(),
      );

      // Agregamos las páginas al documento final.
      paginas.forEach((pagina) => {
        pdfFinal.addPage(pagina);
      });
      progresoProceso("mergeMessage", Math.round(((indice + 1) / selectedFiles.length) * 90), `Archivo ${indice + 1} completado`, `${pdfFinal.getPageCount()} páginas acumuladas`);
    }

    // Generamos los bytes del nuevo PDF.
    progresoProceso("mergeMessage", 94, "Guardando documento...", "Generando el PDF unido");
    await permitirRepintado();
    const pdfBytes = await pdfFinal.save();

    // Creamos un archivo descargable.
    const blob = new Blob([pdfBytes], {
      type: "application/pdf",
    });

    const url = URL.createObjectURL(blob);

    // Creamos un enlace temporal de descarga.
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = "PDF_Unido.pdf";

    // Iniciamos la descarga.
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    // Liberamos la memoria utilizada por la URL.
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    progresoProceso("mergeMessage", 100, "¡Unión completada!", `${pdfFinal.getPageCount()} páginas · ${formatFileSize(pdfBytes.length)}`);
    mergeMessage.textContent =
      "¡PDF unido correctamente! Tu descarga está lista.";
  } catch (error) {
    reiniciarProgreso("mergeMessage");
    console.error("Error al unir PDF:", error);

    mergeMessage.textContent =
      "No se pudieron unir los documentos. Comprueba que sean PDF válidos y que no estén protegidos.";
  } finally {
    // Volvemos a habilitar el botón.
    mergeButton.disabled = false;
  }
}

mergeButton.addEventListener("click", unirPDF);

function interpretarPaginas(texto, totalPaginas) {
  // Separamos los rangos por comas.
  const rangos = texto.split(",");

  // Aquí guardaremos las páginas solicitadas.
  const paginas = [];

  for (const rango of rangos) {
    const elemento = rango.trim();

    // Comprobamos el formato.
    if (!/^\d+(\s*-\s*\d+)?$/.test(elemento)) {
      throw new Error(`El formato "${elemento}" no es válido.`);
    }

    // Comprobamos si es una página o un rango.
    const partes = elemento.split("-").map(Number);

    const inicio = partes[0];
    const final = partes.length === 2 ? partes[1] : inicio;

    // Validamos los números.
    if (
      inicio < 1 ||
      final < 1 ||
      inicio > totalPaginas ||
      final > totalPaginas
    ) {
      throw new Error(`Las páginas deben estar entre 1 y ${totalPaginas}.`);
    }

    if (inicio > final) {
      throw new Error(`El rango ${elemento} está invertido.`);
    }

    // Agregamos cada página al resultado.
    for (let numero = inicio; numero <= final; numero++) {
      if (paginas.includes(numero)) {
        throw new Error(`La página ${numero} está repetida.`);
      }

      // PDF-lib utiliza índices que comienzan en cero.
      paginas.push(numero - 1);
    }
  }

  return paginas;
}

async function dividirPDF() {
  // Comprobamos que exista exactamente un documento.
  if (selectedFiles.length !== 1) {
    splitMessage.textContent = "Selecciona exactamente un archivo PDF.";

    return;
  }

  splitButton.disabled = true;
  progresoProceso("splitMessage", 5, "Analizando documento...", "Leyendo páginas seleccionadas");
  await permitirRepintado();
  splitMessage.textContent = "Analizando documento...";

  try {
    // Obtenemos el PDF seleccionado.
    const archivo = selectedFiles[0];

    // Leemos su contenido.
    const bytes = await archivo.arrayBuffer();

    // Abrimos el PDF original.
    const pdfOriginal = await PDFLib.PDFDocument.load(bytes);

    // Obtenemos el total de páginas.
    const totalPaginas = pdfOriginal.getPageCount();

    // Obtenemos las páginas seleccionadas visualmente.
    const indices = Array.from(selectedPageIndices).sort((a, b) => a - b);

    // Comprobamos que haya páginas seleccionadas.
    if (indices.length === 0) {
      throw new Error("Selecciona al menos una página para continuar.");
    }

    // Comprobamos que los índices pertenezcan al documento.
    if (indices.some((index) => index < 0 || index >= totalPaginas)) {
      throw new Error(
        "Hay páginas seleccionadas que no pertenecen al documento.",
      );
    }

    // Creamos un PDF vacío.
    const pdfNuevo = await PDFLib.PDFDocument.create();

    // Copiamos las páginas seleccionadas.
    progresoProceso("splitMessage", 30, "Extrayendo páginas...", `${indices.length} páginas seleccionadas`);
    await permitirRepintado();
    const paginasCopiadas = await pdfNuevo.copyPages(pdfOriginal, indices);

    // Agregamos las páginas al nuevo documento.
    paginasCopiadas.forEach((pagina) => {
      pdfNuevo.addPage(pagina);
    });

    // Generamos el nuevo PDF.
    progresoProceso("splitMessage", 85, "Generando PDF...", "Preparando la descarga");
    await permitirRepintado();
    const pdfBytes = await pdfNuevo.save();

    // Creamos el archivo descargable.
    const blob = new Blob([pdfBytes], {
      type: "application/pdf",
    });

    const url = URL.createObjectURL(blob);

    // Preparamos la descarga.
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = "PDF_Dividido.pdf";

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    // Liberamos la URL temporal.
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    progresoProceso("splitMessage", 100, "¡Extracción completada!", `${indices.length} páginas · ${formatFileSize(pdfBytes.length)}`);
    splitMessage.textContent = `¡PDF creado correctamente! Se extrajeron ${indices.length} páginas de ${totalPaginas} páginas.`;
  } catch (error) {
    reiniciarProgreso("splitMessage");
    console.error("Error al dividir PDF:", error);

    splitMessage.textContent =
      error.message || "No se pudo dividir el documento.";
  } finally {
    splitButton.disabled = false;
  }
}

async function dividirAutomaticamente() {
  // Comprobamos que exista un documento.
  if (selectedFiles.length !== 1) {
    autoSplitMessage.textContent = "Selecciona exactamente un archivo PDF.";
    return;
  }

  // Validamos el intervalo.
  const intervalo = Number(splitInterval.value);

  if (!Number.isInteger(intervalo) || intervalo < 1 || intervalo > 1000) {
    autoSplitMessage.textContent = "Introduce un número entero entre 1 y 1000.";
    return;
  }

  autoSplitButton.disabled = true;
  progresoProceso("autoSplitMessage", 0, "Preparando división...", "Leyendo el documento");
  await permitirRepintado();
  autoSplitMessage.textContent = "Preparando la división del documento...";

  try {
    // Obtenemos el archivo original.
    const archivo = selectedFiles[0];

    // Leemos el documento.
    const bytes = await archivo.arrayBuffer();

    const pdfOriginal = await PDFLib.PDFDocument.load(bytes);

    // Averiguamos cuántas páginas contiene.
    const totalPaginas = pdfOriginal.getPageCount();

    // Calculamos cuántos PDF se crearán.
    const totalPartes = Math.ceil(totalPaginas / intervalo);

    // Creamos el archivo ZIP.
    const zip = new JSZip();

    // Obtenemos el nombre original sin extensión.
    const nombreBase = archivo.name.replace(/\.pdf$/i, "");

    // Recorremos los bloques de páginas.
    for (let inicio = 0; inicio < totalPaginas; inicio += intervalo) {
      const final = Math.min(inicio + intervalo, totalPaginas);

      const numeroActual = Math.floor(inicio / intervalo) + 1;
      progresoProceso("autoSplitMessage", Math.round(((numeroActual - 1) / totalPartes) * 85), `Generando parte ${numeroActual} de ${totalPartes}`, `Páginas ${inicio + 1} a ${final}`);
      await permitirRepintado();
      autoSplitMessage.textContent = `Generando parte ${numeroActual} de ${totalPartes}...`;

      // Creamos un PDF nuevo para cada bloque.
      const pdfNuevo = await PDFLib.PDFDocument.create();

      // Creamos los índices de las páginas.
      const indices = Array.from(
        { length: final - inicio },
        (_, i) => inicio + i,
      );

      // Copiamos las páginas originales.
      const paginas = await pdfNuevo.copyPages(pdfOriginal, indices);

      // Agregamos las páginas al nuevo PDF.
      paginas.forEach((pagina) => {
        pdfNuevo.addPage(pagina);
      });

      // Generamos el contenido del nuevo documento.
      const pdfBytes = await pdfNuevo.save();

      // Generamos el nombre de cada parte.
      const numeroParte = String(Math.floor(inicio / intervalo) + 1).padStart(
        2,
        "0",
      );

      const nombreArchivo = `${nombreBase}_parte_${numeroParte}.pdf`;

      // Agregamos el PDF al ZIP.
      zip.file(nombreArchivo, pdfBytes);
      progresoProceso("autoSplitMessage", Math.round((numeroActual / totalPartes) * 85), `Parte ${numeroActual} completada`, `${totalPartes} archivos en total`);
    }

    autoSplitMessage.textContent = "Comprimiendo los documentos...";

    // Generamos el ZIP.
    const contenidoZip = await zip.generateAsync(
      {
        type: "blob",
        compression: "STORE",
      },
      (progreso) => {
        autoSplitMessage.textContent = `Creando ZIP: ${Math.round(progreso.percent)}%`;
        progresoProceso("autoSplitMessage", 85 + Math.round(progreso.percent * 0.14), "Empaquetando archivos...", `ZIP: ${Math.round(progreso.percent)}%`);
      },
    );

    // Creamos el enlace de descarga.
    const url = URL.createObjectURL(contenidoZip);

    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = `${nombreBase}_Division.zip`;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    // Liberamos la URL temporal.
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    progresoProceso("autoSplitMessage", 100, "¡División completada!", `${totalPartes} PDF en un ZIP`);
    autoSplitMessage.textContent = `¡División completada! Se crearon ${totalPartes} archivos con ${totalPaginas} páginas en total.`;
  } catch (error) {
    reiniciarProgreso("autoSplitMessage");
    console.error("Error en división automática:", error);

    autoSplitMessage.textContent =
      "No se pudo dividir el documento. Comprueba que el PDF sea válido y no esté protegido.";
  } finally {
    autoSplitButton.disabled = false;
  }
}

autoSplitButton.addEventListener("click", dividirAutomaticamente);

async function comprimirPDF() {
  // Comprobar que exista un PDF seleccionado.
  if (selectedFiles.length !== 1) {
    compressMessage.textContent = "Selecciona exactamente un archivo PDF.";
    return;
  }

  // Configuración de los niveles de compresión.
  const configuraciones = {
    light: {
      scale: 1.5,
      quality: 0.85,
    },
    recommended: {
      scale: 1.1,
      quality: 0.68,
    },
    extreme: {
      scale: 0.75,
      quality: 0.45,
    },
  };

  const nivel = compressionLevel.value;
  const configuracion = configuraciones[nivel];

  if (!configuracion) {
    compressMessage.textContent = "Selecciona un nivel de compresión válido.";
    return;
  }

  compressButton.disabled = true;
  compressionResults.hidden = true;
  progresoProceso("compressMessage", 0, "Preparando compresión...", "Analizando el PDF");
  await permitirRepintado();

  try {
    const archivo = selectedFiles[0];

    compressMessage.textContent = "Abriendo documento original...";

    // Leemos el archivo original.
    const bytes = await archivo.arrayBuffer();

    // Abrimos el documento con PDF.js.
    const documento = await pdfjsLib.getDocument({
      data: new Uint8Array(bytes.slice(0)),
    }).promise;

    // Creamos el PDF de salida.
    const pdfComprimido = await PDFLib.PDFDocument.create();

    const totalPaginas = documento.numPages;

    // Procesamos cada página.
    for (let numero = 1; numero <= totalPaginas; numero++) {
      progresoProceso("compressMessage", Math.round(((numero - 1) / totalPaginas) * 90), `Comprimiendo página ${numero} de ${totalPaginas}`, `Nivel: ${compressionLevel.options[compressionLevel.selectedIndex].text}`);
      await permitirRepintado();
      compressMessage.textContent = `Comprimiendo página ${numero} de ${totalPaginas}...`;

      // Obtenemos la página original.
      const pagina = await documento.getPage(numero);

      // Calculamos su resolución.
      const viewport = pagina.getViewport({
        scale: configuracion.scale,
      });

      // Creamos un canvas temporal.
      const canvas = document.createElement("canvas");

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      const contexto = canvas.getContext("2d");

      if (!contexto) {
        throw new Error("No se pudo crear el espacio de procesamiento.");
      }

      // Dibujamos la página.
      await pagina.render({
        canvasContext: contexto,
        viewport: viewport,
      }).promise;

      // Convertimos la página en una imagen JPEG.
      const blobImagen = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("No se pudo generar la imagen."));
            }
          },
          "image/jpeg",
          configuracion.quality,
        );
      });

      // Obtenemos los bytes de la imagen.
      const bytesImagen = new Uint8Array(await blobImagen.arrayBuffer());

      // Incorporamos la imagen al nuevo PDF.
      const imagen = await pdfComprimido.embedJpg(bytesImagen);

      // Conservamos las dimensiones visuales de la página.
      const nuevaPagina = pdfComprimido.addPage([
        viewport.width / configuracion.scale,
        viewport.height / configuracion.scale,
      ]);

      nuevaPagina.drawImage(imagen, {
        x: 0,
        y: 0,
        width: viewport.width / configuracion.scale,
        height: viewport.height / configuracion.scale,
      });

      // Liberamos los recursos temporales.
      canvas.width = 0;
      canvas.height = 0;

      pagina.cleanup();
      progresoProceso("compressMessage", Math.round((numero / totalPaginas) * 90), `Página ${numero} completada`, `${numero} de ${totalPaginas} páginas`);
    }

    // Generamos el documento comprimido.
    compressMessage.textContent = "Generando documento final...";
    progresoProceso("compressMessage", 94, "Guardando PDF optimizado...", "Calculando el tamaño final");
    await permitirRepintado();

    const resultado = await pdfComprimido.save();

    // Calculamos los tamaños.
    const blobFinal = new Blob([resultado], {
      type: "application/pdf",
    });

    const tamañoOriginal = archivo.size;
    const tamañoFinal = blobFinal.size;

    const formatoKB = (bytes) => (bytes / 1024).toFixed(2) + " KB";

    const diferencia = tamañoOriginal - tamañoFinal;

    const porcentaje = (diferencia / tamañoOriginal) * 100;

    // Mostramos la comparación de tamaños.
    compressionResults.hidden = false;

    originalSize.textContent = formatoKB(tamañoOriginal);
    compressedSize.textContent = formatoKB(tamañoFinal);

    // Calculamos el ancho proporcional de las barras.
    const tamañoMayor = Math.max(tamañoOriginal, tamañoFinal);

    originalBar.style.width = `${(tamañoOriginal / tamañoMayor) * 100}%`;

    compressedBar.style.width = `${(tamañoFinal / tamañoMayor) * 100}%`;

    // Mostramos el ahorro o aumento.
    if (diferencia > 0) {
      compressionSaving.textContent = `-${porcentaje.toFixed(1)}%`;

      compressionSaving.classList.remove("increased");

      compressionStatus.textContent =
        "¡Excelente! El nuevo documento ocupa menos espacio.";
    } else if (diferencia < 0) {
      compressionSaving.textContent = `+${Math.abs(porcentaje).toFixed(1)}%`;

      compressionSaving.classList.add("increased");

      compressionStatus.textContent =
        "El documento aumentó de tamaño. El original ya estaba más optimizado.";
    } else {
      compressionSaving.textContent = "0%";

      compressionSaving.classList.remove("increased");

      compressionStatus.textContent = "El tamaño del documento no cambió.";
    }

    // Descargamos solamente si conseguimos reducir el tamaño.
    if (tamañoFinal < tamañoOriginal) {
      const url = URL.createObjectURL(blobFinal);

      const enlace = document.createElement("a");

      enlace.href = url;

      enlace.download = archivo.name.replace(/\.pdf$/i, "_comprimido.pdf");

      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      compressMessage.textContent =
        "¡Excelente! Se redujo el tamaño y se descargó el PDF optimizado.";
    } else {
      compressMessage.textContent =
        "No se consiguió reducir el tamaño. Se evitó descargar una versión más pesada. Tu documento original permanece intacto.";
    }

    progresoProceso("compressMessage", 100, "¡Proceso completado!", `${formatFileSize(tamañoOriginal)} → ${formatFileSize(tamañoFinal)}`);
    await documento.destroy();
  } catch (error) {
    reiniciarProgreso("compressMessage");
    console.error("Error al comprimir PDF:", error);

    compressMessage.textContent =
      "No se pudo comprimir el documento. Comprueba que sea un PDF válido.";
  } finally {
    compressButton.disabled = false;
  }
}

compressButton.addEventListener("click", comprimirPDF);

splitButton.addEventListener("click", dividirPDF);

async function actualizarSelectorPaginas() {
  const versionActual = ++selectorVersion;

  if (selectedFiles.length !== 1) {
    pageGrid.replaceChildren();
    pageTotal.textContent = "0 páginas";
    selectedPageCounter.textContent = "0 páginas seleccionadas";
    selectedPageIndices.clear();
    selectAllPages.textContent = "Seleccionar todas";
    return;
  }

  const archivo = selectedFiles[0];

  pageGrid.textContent = "Generando vistas previas...";
  pageTotal.textContent = "Leyendo documento...";

  try {
    const bytes = await archivo.arrayBuffer();

    // Comprobamos el documento con pdf-lib.
    const documento = await PDFLib.PDFDocument.load(bytes.slice(0));

    // Abrimos el mismo PDF con PDF.js.
    const pdfVista = await pdfjsLib.getDocument({
      data: new Uint8Array(bytes.slice(0)),
    }).promise;

    if (versionActual !== selectorVersion) {
      await pdfVista.destroy();
      return;
    }

    const total = documento.getPageCount();

    if (total !== pdfVista.numPages) {
      throw new Error("No coincide el número de páginas.");
    }

    selectedPageIndices = new Set(
      Array.from({ length: total }, (_, index) => index),
    );

    pageTotal.textContent = `${total} páginas`;

    selectAllPages.textContent = "Deseleccionar todas";

    await renderizarTarjetas(pdfVista);

    if (versionActual !== selectorVersion) {
      await pdfVista.destroy();
      return;
    }
  } catch (error) {
    if (versionActual !== selectorVersion) return;

    console.error("Error al generar miniaturas:", error);

    pageGrid.textContent = "No se pudieron generar las vistas previas.";

    pageTotal.textContent = "Error";

    splitMessage.textContent = "Comprueba que el documento sea un PDF válido.";
  }
}

// Construye las tarjetas visuales.
async function renderizarTarjetas(pdf) {
  const versionActual = selectorVersion;

  pageGrid.replaceChildren();

  for (let index = 0; index < pdf.numPages; index++) {
    if (versionActual !== selectorVersion) return;

    const tarjeta = document.createElement("button");

    tarjeta.type = "button";
    tarjeta.className = "page-card";

    // Creamos el espacio para la miniatura.
    const canvas = document.createElement("canvas");

    canvas.className = "page-preview";

    // Creamos el número de página.
    const numero = document.createElement("span");

    numero.className = "page-number";
    numero.textContent = index + 1;

    tarjeta.append(canvas, numero);

    actualizarAparienciaTarjeta(tarjeta, index);

    tarjeta.addEventListener("click", () => {
      if (selectedPageIndices.has(index)) {
        selectedPageIndices.delete(index);
      } else {
        selectedPageIndices.add(index);
      }

      actualizarAparienciaTarjeta(tarjeta, index);
      actualizarContadorPaginas();
    });

    pageGrid.append(tarjeta);

    // Obtenemos la página real.
    const pagina = await pdf.getPage(index + 1);

    // Reducimos su tamaño para generar una miniatura.
    const viewport = pagina.getViewport({
      scale: 0.4,
    });

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    const contexto = canvas.getContext("2d");

    await pagina.render({
      canvasContext: contexto,
      viewport: viewport,
    }).promise;

    pagina.cleanup();
  }

  actualizarContadorPaginas();
}

// Cambia el aspecto de cada tarjeta.
function actualizarAparienciaTarjeta(tarjeta, index) {
  const seleccionada = selectedPageIndices.has(index);

  tarjeta.classList.toggle("selected", seleccionada);

  tarjeta.setAttribute("aria-pressed", String(seleccionada));
}

// Actualiza el contador.
function actualizarContadorPaginas() {
  const cantidad = selectedPageIndices.size;

  selectedPageCounter.textContent = `${cantidad} ${cantidad === 1 ? "página seleccionada" : "páginas seleccionadas"}`;
}

selectAllPages.addEventListener("click", () => {
  const total = selectedFiles.length === 1 ? pageGrid.children.length : 0;

  const todasSeleccionadas = selectedPageIndices.size === total;

  if (todasSeleccionadas) {
    selectedPageIndices.clear();
  } else {
    selectedPageIndices = new Set(
      Array.from({ length: total }, (_, index) => index),
    );
  }

  Array.from(pageGrid.children).forEach((tarjeta, index) => {
    actualizarAparienciaTarjeta(tarjeta, index);
  });

  actualizarContadorPaginas();

  selectAllPages.textContent = todasSeleccionadas
    ? "Seleccionar todas"
    : "Deseleccionar todas";
});

/* ===== NAVEGACIÓN PDFLAB 2.0 ===== */

const homeScreen = document.getElementById("homeScreen");
const workspaceScreen = document.getElementById("workspaceScreen");
const workspaceTitle = document.getElementById("workspaceTitle");
const workspaceDescription = document.getElementById("workspaceDescription");
const workspaceContent = document.getElementById("workspaceContent");
const imagePdfControls = document.getElementById("imagePdfControls");
const imagePageSize = document.getElementById("imagePageSize");
const imageOrientation = document.getElementById("imageOrientation");
const imageMargin = document.getElementById("imageMargin");
/* ===== IMÁGENES A PDF ===== */

const imageInput = document.getElementById("imageInput");
const imageUploadArea = document.getElementById("imageUploadArea");
const imagePreviewGrid = document.getElementById("imagePreviewGrid");
const imagePdfCounter = document.getElementById("imagePdfCounter");
const imageCount = document.getElementById("imageCount");
const clearImagesButton = document.getElementById("clearImagesButton");
const convertImagesButton = document.getElementById("convertImagesButton");
const imagePdfMessage = document.getElementById("imagePdfMessage");
const imagePdfProgress = document.getElementById("imagePdfProgress");
const imageProgressText = document.getElementById("imageProgressText");
const imageProgressPercent = document.getElementById("imageProgressPercent");
const imageProgressBar = document.getElementById("imageProgressBar");

/* ===== ELEMENTOS DE VISTA PREVIA ===== */

const imagePdfPreview = document.getElementById("imagePdfPreview");

const imagePdfPreviewCanvas = document.getElementById("imagePdfPreviewCanvas");

const previewPreviousPage = document.getElementById("previewPreviousPage");

const previewNextPage = document.getElementById("previewNextPage");

const previewPageCounter = document.getElementById("previewPageCounter");

let previewPdfDocument = null;
let previewCurrentPage = 1;

// Guardaremos aquí las fotografías seleccionadas.
let selectedImages = [];

let convirtiendoImagenes = false;

/* ===== ACTUALIZAR PROGRESO ===== */

function actualizarProgresoImagenes(actual, total) {
  const porcentaje = Math.round((actual / total) * 100);

  imagePdfProgress.hidden = false;

  imageProgressText.textContent = `Procesando imagen ${actual} de ${total}`;

  imageProgressPercent.textContent = `${porcentaje}%`;

  imageProgressBar.style.width = `${porcentaje}%`;
}

/* ===== ROTACIÓN INDIVIDUAL DE IMÁGENES ===== */

let imageRotations = [];

function obtenerRotacion(indice) {
  return imageRotations[indice] || 0;
}

function girarImagen(indice, grados) {
  const rotacionActual = obtenerRotacion(indice);

  imageRotations[indice] = (rotacionActual + grados + 360) % 360;

  renderImages();
}

const backToTools = document.getElementById("backToTools");

const toolsSection = document.getElementById("herramientas");
const howSection = document.getElementById("como-funciona");

let herramientaActiva = null;
const herramientas = {
  merge: {
    titulo: "Unir PDF",
    descripcion: "Combina varios archivos PDF en un documento.",
  },
  split: {
    titulo: "Dividir PDF",
    descripcion: "Selecciona las páginas que quieres extraer.",
  },
  compress: {
    titulo: "Comprimir PDF",
    descripcion: "Intenta reducir el tamaño de tu documento.",
  },
  images: {
    titulo: "Imágenes a PDF",
    descripcion: "Convierte tus fotografías en un documento PDF.",
  },
};

document.querySelectorAll(".tool-card[data-tool]").forEach((tarjeta) => {
  tarjeta.style.cursor = "pointer";

  tarjeta.addEventListener("click", () => {
    const herramienta = tarjeta.dataset.tool;
    if (herramientaActiva !== herramienta) {
      selectedFiles = [];
      renderFiles();
    }
    herramientaActiva = herramienta;
    const configuracion = herramientas[herramienta];

    if (!configuracion) return;

    workspaceTitle.textContent = configuracion.titulo;
    workspaceDescription.textContent = configuracion.descripcion;

    homeScreen.hidden = true;
    toolsSection.hidden = true;
    howSection.hidden = true;

    workspaceScreen.hidden = false;

    if (herramienta === "images") {
      workspaceContent.appendChild(imagePdfControls);
      imagePdfControls.hidden = false;
    }

    if (herramienta === "merge") {
      workspaceContent.appendChild(uploadZone);
      workspaceContent.appendChild(fileList);
      workspaceContent.appendChild(mergeControls);

      uploadZone.hidden = false;
      mergeControls.hidden = selectedFiles.length < 2;
    }

    if (herramienta === "split") {
      workspaceContent.appendChild(uploadZone);
      workspaceContent.appendChild(fileList);
      workspaceContent.appendChild(splitControls);
      workspaceContent.appendChild(autoSplitControls);

      uploadZone.hidden = false;
      mergeControls.hidden = true;
      splitControls.hidden = selectedFiles.length !== 1;
      autoSplitControls.hidden = selectedFiles.length !== 1;
    }

    if (herramienta === "compress") {
      workspaceContent.appendChild(uploadZone);
      workspaceContent.appendChild(fileList);
      workspaceContent.appendChild(compressControls);

      uploadZone.hidden = false;
      mergeControls.hidden = true;
      splitControls.hidden = true;

      compressControls.hidden = selectedFiles.length !== 1;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

backToTools.addEventListener("click", () => {
  imagePdfControls.hidden = true;
  uploadZone.hidden = true;
  mergeControls.hidden = true;
  splitControls.hidden = true;
  autoSplitControls.hidden = true;
  compressControls.hidden = true;
  herramientaActiva = null;
  selectedFiles = [];
  fileList.replaceChildren();
  fileInput.value = "";

  workspaceScreen.hidden = true;

  homeScreen.hidden = false;
  toolsSection.hidden = false;
  howSection.hidden = false;

  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ===== MOSTRAR MINIATURAS ===== */

function renderImages() {
  imagePreviewGrid.innerHTML = "";

  imageCount.textContent = `${selectedImages.length} imagen(es) seleccionada(s)`;

  imagePdfCounter.hidden = selectedImages.length === 0;
  convertImagesButton.disabled =
    convirtiendoImagenes || selectedImages.length === 0;

  selectedImages.forEach((archivo, indice) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "image-preview-card";

    const contenedorImagen = document.createElement("div");
    contenedorImagen.className = "image-preview-container";

    const imagen = document.createElement("img");
    const url = URL.createObjectURL(archivo);

    imagen.src = url;
    const rotacion = obtenerRotacion(indice);

    imagen.style.transform = `rotate(${rotacion}deg)`;

    imagen.classList.toggle(
      "image-rotated-sideways",
      rotacion === 90 || rotacion === 270,
    );

    imagen.alt = `Vista previa de ${archivo.name}`;

    imagen.addEventListener(
      "load",
      () => {
        URL.revokeObjectURL(url);
      },
      { once: true },
    );

    imagen.addEventListener(
      "error",
      () => {
        URL.revokeObjectURL(url);
      },
      { once: true },
    );

    const nombre = document.createElement("span");
    nombre.textContent = archivo.name;
    nombre.title = archivo.name;

    /* ===== BOTÓN DUPLICAR IMAGEN ===== */

    const botonDuplicar = document.createElement("button");

    botonDuplicar.type = "button";
    botonDuplicar.className = "image-duplicate-button";
    botonDuplicar.textContent = "⧉";
    botonDuplicar.title = "Duplicar imagen";

    botonDuplicar.setAttribute("aria-label", `Duplicar ${archivo.name}`);

    botonDuplicar.addEventListener("click", () => {
      selectedImages.splice(indice + 1, 0, archivo);

      imageRotations.splice(indice + 1, 0, obtenerRotacion(indice));

      renderImages();
    });

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.textContent = "×";
    botonEliminar.setAttribute("aria-label", `Eliminar ${archivo.name}`);

    botonEliminar.addEventListener("click", () => {
      selectedImages.splice(indice, 1);
      imageRotations.splice(indice, 1);
      renderImages();
    });

    /* ===== CONTROLES PARA GIRAR IMÁGENES ===== */

    const controlesRotacion = document.createElement("div");
    controlesRotacion.className = "image-rotation-controls";

    const botonGirarIzquierda = document.createElement("button");
    botonGirarIzquierda.type = "button";
    botonGirarIzquierda.textContent = "↶";
    botonGirarIzquierda.title = "Girar 90° a la izquierda";
    botonGirarIzquierda.setAttribute(
      "aria-label",
      `Girar ${archivo.name} a la izquierda`,
    );

    const botonGirarDerecha = document.createElement("button");
    botonGirarDerecha.type = "button";
    botonGirarDerecha.textContent = "↷";
    botonGirarDerecha.title = "Girar 90° a la derecha";
    botonGirarDerecha.setAttribute(
      "aria-label",
      `Girar ${archivo.name} a la derecha`,
    );

    botonGirarIzquierda.addEventListener("click", () => {
      girarImagen(indice, -90);
    });

    botonGirarDerecha.addEventListener("click", () => {
      girarImagen(indice, 90);
    });

    controlesRotacion.appendChild(botonGirarIzquierda);
    controlesRotacion.appendChild(botonGirarDerecha);

    /* ===== CONTROLES PARA ORDENAR IMÁGENES ===== */

    const controlesOrden = document.createElement("div");
    controlesOrden.className = "image-order-controls";

    const botonIzquierda = document.createElement("button");
    botonIzquierda.type = "button";
    botonIzquierda.textContent = "←";
    botonIzquierda.title = "Mover imagen hacia atrás";
    botonIzquierda.disabled = indice === 0;

    const botonDerecha = document.createElement("button");
    botonDerecha.type = "button";
    botonDerecha.textContent = "→";
    botonDerecha.title = "Mover imagen hacia adelante";
    botonDerecha.disabled = indice === selectedImages.length - 1;

    botonIzquierda.addEventListener("click", () => {
      const temporal = selectedImages[indice - 1];

      selectedImages[indice - 1] = selectedImages[indice];
      selectedImages[indice] = temporal;

      const rotacionTemporal = imageRotations[indice - 1];

      imageRotations[indice - 1] = imageRotations[indice];
      imageRotations[indice] = rotacionTemporal;

      renderImages();
    });

    botonDerecha.addEventListener("click", () => {
      const temporal = selectedImages[indice + 1];

      selectedImages[indice + 1] = selectedImages[indice];
      selectedImages[indice] = temporal;

      const rotacionTemporal = imageRotations[indice + 1];

      imageRotations[indice + 1] = imageRotations[indice];
      imageRotations[indice] = rotacionTemporal;

      renderImages();
    });

    controlesOrden.appendChild(botonIzquierda);
    controlesOrden.appendChild(botonDerecha);

    /* ===== CONSTRUIR TARJETA ===== */

    contenedorImagen.appendChild(imagen);
    tarjeta.appendChild(contenedorImagen);
    tarjeta.appendChild(nombre);
    tarjeta.appendChild(botonEliminar);
    tarjeta.appendChild(botonDuplicar);
    tarjeta.appendChild(controlesRotacion);
    tarjeta.appendChild(controlesOrden);

    imagePreviewGrid.appendChild(tarjeta);
  });
}

/* ===== AGREGAR IMÁGENES ===== */

function agregarImagenes(archivos) {
  const lista = Array.from(archivos);

  const imagenesValidas = lista.filter((archivo) =>
    ["image/jpeg", "image/png", "image/webp"].includes(archivo.type),
  );

  selectedImages.push(...imagenesValidas);
  imagenesValidas.forEach(() => {
    imageRotations.push(0);
  });

  imagePdfMessage.textContent =
    imagenesValidas.length !== lista.length
      ? "Algunos archivos no son imágenes compatibles."
      : "";

  renderImages();
}

/* ===== SELECCIONAR DESDE EL DISPOSITIVO ===== */

imageInput.addEventListener("change", (evento) => {
  agregarImagenes(evento.target.files);

  // Permite volver a seleccionar la misma fotografía.
  imageInput.value = "";
});

/* ===== ARRASTRAR Y SOLTAR IMÁGENES ===== */

imageUploadArea.addEventListener("dragover", (evento) => {
  evento.preventDefault();

  evento.dataTransfer.dropEffect = "copy";
  imageUploadArea.classList.add("dragging");
});

imageUploadArea.addEventListener("dragleave", (evento) => {
  if (!imageUploadArea.contains(evento.relatedTarget)) {
    imageUploadArea.classList.remove("dragging");
  }
});

imageUploadArea.addEventListener("drop", (evento) => {
  evento.preventDefault();

  imageUploadArea.classList.remove("dragging");

  agregarImagenes(evento.dataTransfer.files);
});

/* ===== ELIMINAR TODAS LAS IMÁGENES ===== */

clearImagesButton.addEventListener("click", () => {
  selectedImages = [];
  imageRotations = [];
  imageInput.value = "";
  imagePdfMessage.textContent = "";

  renderImages();
});

/* ===== FORMATEAR TAMAÑO DE ARCHIVO ===== */

function formatearTamanoPDF(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/* ===== MOSTRAR PAGINA DEL PDF ===== */

let previewRenderTask = null;

async function mostrarPaginaPreview() {
  if (!previewPdfDocument) return;

  // Esperar si hay una página anterior dibujándose
  if (previewRenderTask) {
    previewRenderTask.cancel();

    try {
      await previewRenderTask.promise;
    } catch (error) {
      if (error.name !== "RenderingCancelledException") {
        console.error(error);
      }
    }

    previewRenderTask = null;
  }

  const numeroPagina = previewCurrentPage;

  const pagina = await previewPdfDocument.getPage(numeroPagina);

  const viewportOriginal = pagina.getViewport({ scale: 1 });

  // Limitar el tamaño del visor
  const anchoMaximo = 650;

  const escala = Math.min(1.5, anchoMaximo / viewportOriginal.width);

  const viewport = pagina.getViewport({ scale: escala });

  const contexto = imagePdfPreviewCanvas.getContext("2d");

  imagePdfPreviewCanvas.width = Math.ceil(viewport.width);
  imagePdfPreviewCanvas.height = Math.ceil(viewport.height);

  previewRenderTask = pagina.render({
    canvasContext: contexto,
    viewport: viewport,
  });

  try {
    await previewRenderTask.promise;
  } catch (error) {
    if (error.name !== "RenderingCancelledException") {
      throw error;
    }
  } finally {
    previewRenderTask = null;
  }

  previewPageCounter.textContent = `Página ${numeroPagina} de ${previewPdfDocument.numPages}`;

  previewPreviousPage.disabled = numeroPagina <= 1;

  previewNextPage.disabled = numeroPagina >= previewPdfDocument.numPages;
}

/* ===== ABRIR VISTA PREVIA ===== */

async function abrirVistaPreviaPDF(pdfBytes) {
  // Crear una copia para PDF.js
  const datos = new Uint8Array(pdfBytes);

  if (previewPdfDocument) {
    await previewPdfDocument.destroy();
    previewPdfDocument = null;
  }

  previewPdfDocument = await pdfjsLib.getDocument({
    data: datos,
  }).promise;

  previewCurrentPage = 1;

  imagePdfPreview.hidden = false;

  await mostrarPaginaPreview();
}

/* ===== NAVEGACION DE LA VISTA PREVIA ===== */

previewPreviousPage.addEventListener("click", async () => {
  if (!previewPdfDocument || previewCurrentPage <= 1) return;

  previewCurrentPage--;

  await mostrarPaginaPreview();
});

previewNextPage.addEventListener("click", async () => {
  if (!previewPdfDocument || previewCurrentPage >= previewPdfDocument.numPages)
    return;

  previewCurrentPage++;

  await mostrarPaginaPreview();
});

/* ===== CONVERTIR IMÁGENES A PDF ===== */

async function convertirImagenesAPDF() {
  if (selectedImages.length === 0) {
    imagePdfMessage.textContent = "Primero selecciona al menos una imagen.";
    return;
  }

  if (convirtiendoImagenes) {
    return;
  }

  convirtiendoImagenes = true;

  const imagenesParaPDF = [...selectedImages];
  const rotacionesParaPDF = [...imageRotations];

  imagePdfProgress.hidden = false;
  imageProgressBar.style.width = "0%";
  imageProgressPercent.textContent = "0%";
  imageProgressText.textContent = "Preparando imágenes...";

  convertImagesButton.disabled = true;
  imagePdfMessage.textContent = "Creando tu PDF...";

  try {
    const pdf = await PDFLib.PDFDocument.create();

    for (const [indice, archivo] of imagenesParaPDF.entries()) {
      const bytes = await archivo.arrayBuffer();
      let imagen;

      if (archivo.type === "image/jpeg") {
        const bitmap = await createImageBitmap(archivo, {
          imageOrientation: "from-image",
        });

        try {
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;

          const contexto = canvas.getContext("2d");
          contexto.drawImage(bitmap, 0, 0);

          const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(
              (resultado) => {
                if (resultado) resolve(resultado);
                else reject(new Error("No se pudo procesar la fotografía."));
              },
              "image/jpeg",
              0.95,
            );
          });

          imagen = await pdf.embedJpg(await blob.arrayBuffer());
        } finally {
          bitmap.close();
        }
      } else if (archivo.type === "image/png") {
        imagen = await pdf.embedPng(bytes);
      } else if (archivo.type === "image/webp") {
        // Convertimos WEBP a PNG para que pdf-lib lo acepte.
        const bitmap = await createImageBitmap(archivo);

        try {
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;

          const contexto = canvas.getContext("2d");
          contexto.drawImage(bitmap, 0, 0);

          const pngBlob = await new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error("No se pudo convertir WEBP."));
            }, "image/png");
          });

          imagen = await pdf.embedPng(await pngBlob.arrayBuffer());
        } finally {
          bitmap.close();
        }
      } else {
        throw new Error("Formato de imagen no compatible.");
      }

      /* ===== APLICAR ROTACIÓN A LA IMAGEN ===== */

      const grados = rotacionesParaPDF[indice] || 0;

      let anchoRotado = imagen.width;
      let altoRotado = imagen.height;

      if (grados === 90 || grados === 270) {
        anchoRotado = imagen.height;
        altoRotado = imagen.width;
      }

      /* ===== CONFIGURAR PAGINA ===== */

      const tamaño = imagePageSize.value;
      const orientacion = imageOrientation.value;
      const margenElegido = Number(imageMargin.value);

      let anchoPagina;
      let altoPagina;

      if (tamaño === "a4") {
        anchoPagina = 595.28;
        altoPagina = 841.89;
      } else if (tamaño === "letter") {
        anchoPagina = 612;
        altoPagina = 792;
      } else {
        anchoPagina = anchoRotado;
        altoPagina = altoRotado;
      }

      // Orientación automática según la fotografía
      const horizontal = anchoRotado > altoRotado;

      if (
        orientacion === "landscape" ||
        (orientacion === "auto" && horizontal)
      ) {
        if (anchoPagina < altoPagina) {
          [anchoPagina, altoPagina] = [altoPagina, anchoPagina];
        }
      } else if (
        orientacion === "portrait" ||
        (orientacion === "auto" && !horizontal)
      ) {
        if (anchoPagina > altoPagina) {
          [anchoPagina, altoPagina] = [altoPagina, anchoPagina];
        }
      }

      // Evitar márgenes mayores que el espacio disponible
      const margen = Math.min(
        margenElegido,
        Math.max(0, (Math.min(anchoPagina, altoPagina) - 1) / 2),
      );

      const anchoDisponible = anchoPagina - margen * 2;
      const altoDisponible = altoPagina - margen * 2;

      // Mantener proporciones sin deformar la imagen
      /* ===== AJUSTAR IMAGEN GIRADA A LA PAGINA ===== */

      const escala = Math.min(
        anchoDisponible / anchoRotado,
        altoDisponible / altoRotado,
      );

      const anchoImagen = imagen.width * escala;
      const altoImagen = imagen.height * escala;

      const pagina = pdf.addPage([anchoPagina, altoPagina]);

      const centroX = anchoPagina / 2;
      const centroY = altoPagina / 2;

      const radianes = (-grados * Math.PI) / 180;

      // Centro de la imagen después de aplicar la rotación
      const desplazamientoX =
        (anchoImagen / 2) * Math.cos(radianes) -
        (altoImagen / 2) * Math.sin(radianes);

      const desplazamientoY =
        (anchoImagen / 2) * Math.sin(radianes) +
        (altoImagen / 2) * Math.cos(radianes);

      pagina.drawImage(imagen, {
        x: centroX - desplazamientoX,
        y: centroY - desplazamientoY,
        width: anchoImagen,
        height: altoImagen,
        rotate: PDFLib.degrees(-grados),
      });

      actualizarProgresoImagenes(indice + 1, imagenesParaPDF.length);

      // Dar oportunidad al navegador de actualizar la barra.
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
    }

    imageProgressText.textContent = "Guardando documento PDF...";
    const pdfBytes = await pdf.save();
    const tamanoFinalPDF = formatearTamanoPDF(pdfBytes.length);
    /* ===== MOSTRAR VISTA PREVIA ===== */

    try {
      await abrirVistaPreviaPDF(pdfBytes);
    } catch (errorPreview) {
      console.error("Error al mostrar vista previa:", errorPreview);

      imagePdfPreview.hidden = true;
    }

    const blob = new Blob([pdfBytes], {
      type: "application/pdf",
    });

    const nombreInput = document.getElementById("imagePdfName");

    const nombre =
      nombreInput.value
        .trim()
        .replace(/\.pdf$/i, "")
        .replace(/[\\/:*?"<>|]/g, "_") || "PDFLab_Documento";

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = `${nombre}.pdf`;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    imagePdfMessage.textContent =
      `¡PDF creado correctamente! ` +
      `${imagenesParaPDF.length} imágenes convertidas. ` +
      `Tamaño final: ${tamanoFinalPDF}`;

    imageProgressText.textContent = "¡Documento terminado!";
    imageProgressPercent.textContent = "100%";
    imageProgressBar.style.width = "100%";
  } catch (error) {
    console.error("Error al convertir imágenes:", error);

    imagePdfMessage.textContent =
      "No se pudo crear el PDF. Revisa que las imágenes sean válidas.";

    imagePdfProgress.hidden = true;
  } finally {
    convirtiendoImagenes = false;

    convertImagesButton.disabled = selectedImages.length === 0;
  }
}

/* ===== BOTÓN DE CONVERSIÓN ===== */

convertImagesButton.addEventListener("click", convertirImagenesAPDF);
