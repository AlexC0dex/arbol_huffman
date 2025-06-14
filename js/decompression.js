
document.addEventListener('DOMContentLoaded', function() {
  // Recuperar datos del archivo
  const fileData = JSON.parse(localStorage.getItem('fileData') || '{}');
  const fileName = fileData.fileName || 'archivo.txt';
  const fileContent = fileData.content || '';
  
  const iLast = fileContent.lastIndexOf('\n');
  const codes = fileContent.slice(0, iLast);
  const codified  = fileContent.slice(iLast);

  // Iniciar la compresión con los datos recuperados
  processDecompression(codes, codified, fileName);
});

let resultHuffman;
let huffman;


// Función para iniciar la compresión y mostrar resultados
function processDecompression(codes, codified, fileName) {
  // Mostrar sección de carga
  const loadingSection = document.getElementById('loadingSection');
  const resultsSection = document.getElementById('resultsSection');
  
  if (loadingSection) loadingSection.style.display = 'flex';
  if (resultsSection) resultsSection.style.display = 'none';
  
  // Comprimir el texto
  setTimeout(() => {
    try {
      huffman = new HuffmanCompression();
      resultHuffman = huffman.decompress(codes, codified);
      
      updateUI(resultHuffman, fileName);
      
      // Ocultar carga y mostrar resultados
      if (loadingSection) loadingSection.style.display = 'none';
      if (resultsSection) resultsSection.style.display = 'block';
    } catch (error) {
      console.error("Error durante la compresión:", error);
      showError("Ocurrió un error al comprimir el archivo.");
    }
  }, 1500); // Pequeño retraso para mostrar la animación de carga
}

// Función para actualizar la UI con los resultados
function updateUI(result, fileName) {
  // Actualizar información del archivo
  const fileNameElement = document.getElementById('fileName');
  const originalSizeElement = document.getElementById('originalSize');
  
  if (fileNameElement) fileNameElement.textContent = fileName;
  if (originalSizeElement) originalSizeElement.textContent = result.originalSize + ' Bits';
  console.log(result.decompressedSize);
  // Actualizar estadísticas de compresión
  const decompressedSizeElement = document.getElementById('decompressedSize');
  const uniqueCharsElement = document.getElementById('uniqueChars');
  if (decompressedSizeElement) decompressedSizeElement.textContent = result.decompressedSize*8 + ' Bits';
  if (uniqueCharsElement) uniqueCharsElement.textContent = result.uniqueChars;
  
  // Mostrar los códigos de Huffman
  const codesContainer = document.getElementById('huffmanCodesContainer');
  if (codesContainer) {
    let codesHTML = '<div class="codes-grid">';
    console.log(resultHuffman);
    for (const char in result.huffmanCodes) {
      const displayChar = char === ' ' ? '␣' : 
                         char === '\n' ? '⏎' : 
                         char === '\t' ? '⇥' : 
                         char;
      
      codesHTML += `
        <div class="code-item">
          <div class="char">${displayChar}</div>
          <div class="code">Codigo: ${result.huffmanCodes[char]}</div>
        </div>
      `;
    }
    
    codesHTML += '</div>';
    codesContainer.innerHTML = codesHTML;
  }
  
  // Mostrar vista previa del texto codificado
  const decodedTextPreview = document.getElementById('decodedTextPreview');
  const formattedTextToHtml = result.decompressed.replaceAll('\\n','<br/>')
  if (decodedTextPreview) {
    const previewLength = 200;
    const preview = formattedTextToHtml.substring(0, previewLength);
    decodedTextPreview.innerHTML = preview + (result.decompressed.length > previewLength ? '...' : '');
  }

  let isExpanded = false;
  const decodedFullText = document.querySelector(".complete-text")
  decodedFullText.addEventListener("click", () => {
    if (isExpanded) {
        const preview = formattedTextToHtml.substring(0, 200);
        decodedTextPreview.innerHTML = preview + (result.decompressed.length > 200 ? '...' : '');
        decodedFullText.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          Mostrar decodificación completa
        `;
        decodedFullText.classList.remove('expanded');
      } else {
        decodedTextPreview.innerHTML = formattedTextToHtml;
        decodedFullText.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
          Mostrar menos
        `;
        decodedFullText.classList.add('expanded');
      }
      isExpanded = !isExpanded;
  })

  // Configurar botón de descarga
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      // console.log(resultHuffman);
      let decompressedData = result.decompressed.replace(/\\n/g, '\n');
      const blob = new Blob([decompressedData], {type: 'text/plain'});
      
      // Crear un enlace de descarga
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.replace(/\.[^/.]+$/, '') + '_decompressed.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }
  
  // Configurar botón para volver al inicio
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '../index.html';
    });
  }

  const treeContainer = document.getElementById('huffmanTreeContainer');
  if (treeContainer) {
    // Limpiar el contenedor antes de dibujar
    treeContainer.innerHTML = '';
    
    visualizeHuffmanTree(result.tree, 'huffmanTreeContainer');

  }
}

// Función para mostrar error
function showError(message) {
  const loadingSection = document.getElementById('loadingSection');
  if (loadingSection) {
    loadingSection.innerHTML = `
      <div class="error-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12" y2="16"></line>
        </svg>
        <p>${message}</p>
        <button id="errorBackBtn" class="action-button">Volver al inicio</button>
      </div>
    `;
    
    const errorBackBtn = document.getElementById('errorBackBtn');
    if (errorBackBtn) {
      errorBackBtn.addEventListener('click', () => {
        window.location.href = '../index.html';
      });
    }
  }
}
