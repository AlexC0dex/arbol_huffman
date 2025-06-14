
document.addEventListener('DOMContentLoaded', function() {
  // Recuperar datos del archivo
  const fileData = JSON.parse(localStorage.getItem('fileData') || '{}');
  const fileName = fileData.fileName || 'archivo.txt';
  const fileContent = fileData.content || '';
  
  // Iniciar la compresión con los datos recuperados
  processCompression(fileContent, fileName);
});

let resultHuffman;
let huffman;


// Función para iniciar la compresión y mostrar resultados
function processCompression(fileContent, fileName) {
  // Mostrar sección de carga
  const loadingSection = document.getElementById('loadingSection');
  const resultsSection = document.getElementById('resultsSection');
  
  if (loadingSection) loadingSection.style.display = 'flex';
  if (resultsSection) resultsSection.style.display = 'none';
  
  // Comprimir el texto
  setTimeout(() => {
    try {
      huffman = new HuffmanCompression();
      resultHuffman = huffman.compress(fileContent);
      
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
  
  // Actualizar estadísticas de compresión
  const compressionRatioElement = document.getElementById('compressionRatio');
  const compressedSizeElement = document.getElementById('compressedSize');
  const uniqueCharsElement = document.getElementById('uniqueChars');
  
  if (compressionRatioElement) compressionRatioElement.textContent = `${result.compressionRatio}%`;
  if (compressedSizeElement) compressedSizeElement.textContent = result.compressedSize + ' Bits';
  if (uniqueCharsElement) uniqueCharsElement.textContent = result.uniqueChars;
  
  // Mostrar los códigos de Huffman
  const codesContainer = document.getElementById('huffmanCodesContainer');
  if (codesContainer) {
    let codesHTML = '<div class="codes-grid">';
    for (const char in result.huffmanCodes) {
      const displayChar = char === ' ' ? '␣' : 
                         char === '\n' ? '⏎' : 
                         char === '\t' ? '⇥' : 
                         char;
      
      codesHTML += `
        <div class="code-item">
          <div class="char">${displayChar}</div>
          <div class="code">Codigo: ${result.huffmanCodes[char]}</div>
          <div class="code">Frecuencia: ${result.frequency[char]}</div>
        </div>
      `;
    }
    
    codesHTML += '</div>';
    codesContainer.innerHTML = codesHTML;
  }
  
  // Mostrar vista previa del texto codificado
  const encodedTextPreview = document.getElementById('encodedTextPreview');
  if (encodedTextPreview) {
    const previewLength = 200;
    const preview = result.encodedText.substring(0, previewLength);
    encodedTextPreview.textContent = preview + (result.encodedText.length > previewLength ? '...' : '');
  }

  let isExpanded = false;
  const encodedFullText = document.querySelector(".complete-text")
  encodedFullText.addEventListener("click", () => {
    if (isExpanded) {
        const preview = result.encodedText.substring(0, 200);
        encodedTextPreview.textContent = preview + (result.encodedText.length > 200 ? '...' : '');
        encodedFullText.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          Mostrar codificación completa
        `;
        encodedFullText.classList.remove('expanded');
      } else {
        encodedTextPreview.textContent = result.encodedText;
        encodedFullText.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
          Mostrar menos
        `;
        encodedFullText.classList.add('expanded');
      }
      isExpanded = !isExpanded;
  })

  // Configurar botón de descarga
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      // console.log(resultHuffman);
      let compressedData = ``;
      for (const char in resultHuffman.huffmanCodes) {
        compressedData += `${result.huffmanCodes[char]}${char === '\n' ? '\\n' : 
                                                        (char === null || char === undefined) ? ' ' : 
                                                        (char === '0' || char === '1') ? `\\${char}` : char }`;
      }
      
      compressedData += `\n${result.encodedText}`
      const blob = new Blob([compressedData], {type: 'text/plain'});
      
      // Crear un enlace de descarga
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.replace(/\.[^/.]+$/, '') + '_comprimido.txt';
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

// Añadir manejo para el botón de decodificación
document.addEventListener('DOMContentLoaded', function() {
  const decodeBtn = document.getElementById('decodeBtn');
  const decodeInput = document.getElementById('decodeText');
  
  if (decodeBtn && decodeInput) {
    decodeBtn.addEventListener('click', function() {
      const inputText = decodeInput.value.trim();
      if (!inputText) {
        showDecodeError("Por favor, ingresa un texto codificado.");
        return;
      }
      
      // Mostrar efecto de carga
      decodeBtn.classList.add('loading');
      decodeBtn.textContent = "Decodificando...";
      
      setTimeout(() => {
        try {
          const decodedText = huffman.decode(inputText);
          showDecodedResult(decodedText);
        } catch (error) {
          console.error("Error al decodificar:", error);
          showDecodeError("El texto ingresado no parece ser una codificación Huffman válida.");
        } finally {
          // Restaurar el botón
          decodeBtn.classList.remove('loading');
          decodeBtn.textContent = "Decodificar texto";
          decodeBtn.innerHTML = '<span>Decodificar texto</span>';
        }
      }, 800);
    });
  }
});

// Función para mostrar el resultado de la decodificación
function showDecodedResult(text) {
  resultContainer = document.querySelector(".decode-result")
  if(!resultContainer){
    resultContainer = document.createElement('div');
    resultContainer.className = 'decode-result';
    

    // Insertar después del botón de decodificación
    
    const decodeBtn = document.getElementById('decodeBtn');
    if (decodeBtn && decodeBtn.parentNode) {
      decodeBtn.parentNode.insertBefore(resultContainer, decodeBtn.nextSibling);
    }
  }
  // Actualizar contenido
  let formattedText = text.replaceAll('\n', '<br/>')
  resultContainer.innerHTML = `<div class="decode-result-text">${text}</div>`;
  resultContainer.style.display = 'block';
  
  // Animar la aparición
  resultContainer.style.opacity = 0;
  setTimeout(() => {
    resultContainer.style.transition = 'opacity 0.5s ease';
    resultContainer.style.opacity = 1;
  }, 10);
}

// Función para mostrar errores de decodificación
function showDecodeError(message) {
  let resultContainer = document.querySelector('.decode-result');
  
  if (!resultContainer) {
    resultContainer = document.createElement('div');
    resultContainer.className = 'decode-result error';
    
    const decodeBtn = document.getElementById('decodeBtn');
    if (decodeBtn && decodeBtn.parentNode) {
      decodeBtn.parentNode.insertBefore(resultContainer, decodeBtn.nextSibling);
    }
  }
  
  resultContainer.classList.add('error');
  resultContainer.innerHTML = `<div class="decode-result-text">${message}</div>`;
  resultContainer.style.display = 'block';
  
  // Animar aparición
  resultContainer.style.opacity = 0;
  setTimeout(() => {
    resultContainer.style.transition = 'opacity 0.5s ease';
    resultContainer.style.opacity = 1;
  }, 10);
  
  // Desaparecer después de un tiempo
  setTimeout(() => {
    resultContainer.style.opacity = 0;
    setTimeout(() => {
      resultContainer.style.display = 'none';
      resultContainer.classList.remove('error');
    }, 500);
  }, 4000);
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
