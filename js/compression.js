
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

class HuffmanNode {
  constructor(char, freq) {
    this.char = char;
    this.freq = freq;
    this.left = null;
    this.right = null;
  }
}

class HuffmanCompression {
  constructor() {
    this.root = null;
    this.codes = {};
    this.originalSize = 0;
    this.compressedSize = 0;
    this.compressionRatio = 0;
    this.uniqueChars = 0;
    this.frequency = {}
  }
  
  calculateFrequency(text) {
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (this.frequency[char]) {
        this.frequency[char]++;
      } else {
        this.frequency[char] = 1;
      }
    }
    this.uniqueChars = Object.keys(this.frequency).length;
  }
  
  // Construye el árbol de Huffman basado en las frecuencias
  buildHuffmanTree(text) {
    this.calculateFrequency(text);
    const priorityQueue = [];
    
    // Crear nodos para cada carácter
    for (const char in this.frequency) {
      priorityQueue.push(new HuffmanNode(char, this.frequency[char]));
    }
    
    // Ordenar por frecuencia
    priorityQueue.sort((a, b) => a.freq - b.freq);
    
    // Construir el árbol
    while (priorityQueue.length > 1) {
      // Sacar los dos nodos con menor frecuencia
      const left = priorityQueue.shift();
      const right = priorityQueue.shift();
      
      // Crear un nuevo nodo interno
      const newNode = new HuffmanNode(null, left.freq + right.freq);
      newNode.left = left;
      newNode.right = right;
      
      let inserted = false;
      for (let i = 0; i < priorityQueue.length; i++) {
        if (newNode.freq <= priorityQueue[i].freq) {
          priorityQueue.splice(i, 0, newNode);
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        priorityQueue.push(newNode);
      }
    }
    
    // La raíz del árbol
    this.root = priorityQueue[0] || new HuffmanNode('', 0);
    
    // Generar códigos para cada carácter
    this.generateCodes(this.root, "");
    
    return this.root;
  }
  
  generateCodes(node, code) {
    if (node === null) return;
    
    if (node.char !== null) {
      this.codes[node.char] = code || '0';
      return;
    }
    
    // Recorrer subárbol izquierdo (añadir 0)
    this.generateCodes(node.left, code + "0");
    // Recorrer subárbol derecho (añadir 1)
    this.generateCodes(node.right, code + "1");
  }
  
  encode(text) {
    if (text.length === 0) return '';
    
    let encodedString = "";
    for (let i = 0; i < text.length; i++) {
      encodedString += this.codes[text[i]];
    }
    
    this.originalSize = text.length * 8;
    this.compressedSize = encodedString.length;
    this.compressionRatio = this.originalSize > 0 ? 
      ((this.compressedSize / this.originalSize) * 100).toFixed(2) : 0;
    
    return encodedString;
  }
  
  // Para decodificar el texto comprimido
  decode(encodedText) {
    if (!encodedText || !this.root) return '';
    if (this.root.char !== null) return this.root.char.repeat(this.root.freq);
    
    let node = this.root;
    let decodedText = "";
    
    for (let i = 0; i < encodedText.length; i++) {
      // Moverse por el árbol según el bit actual
      if (encodedText[i] === '0') {
        node = node.left;
      } else {
        node = node.right;
      }
      
      // Si llegamos a una hoja, añadir el carácter al resultado
      if (node.char !== null) {
        
        decodedText += (node.char === '\n' ? '<br />' : node.char);
        // Volver a la raíz para el siguiente carácter
        node = this.root;
      }
    }
    console.log(decodedText);
    return decodedText;
  }
  
  // Método principal para comprimir
  compress(text) {
    if (!text) return {
      encodedText: '',
      huffmanCodes: {},
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      tree: null,
      uniqueChars: 0
    };
    
    this.buildHuffmanTree(text);
    const encoded = this.encode(text);
    
    return {
      encodedText: encoded,
      huffmanCodes: this.codes,
      originalSize: this.originalSize,
      compressedSize: this.compressedSize,
      compressionRatio: this.compressionRatio,
      tree: this.root,
      uniqueChars: this.uniqueChars,
      frequency: this.frequency
    };
  }
}
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
  
  // Configurar botón de descarga
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      // Crear un objeto con los datos comprimidos y los códigos para decodificar
      console.log(resultHuffman);
      let compressedData = ``;
      for (const char in resultHuffman.huffmanCodes) {
        compressedData += `${char === '\n' ? '\\n' : char}=${result.huffmanCodes[char]}\n`;
      }
      compressedData += `${result.encodedText}`
      // Convertir a JSON y crear un blob
      const blob = new Blob([compressedData], {type: 'text/plain'});
      
      // Crear un enlace de descarga
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.replace(/\.[^/.]+$/, '') + '.txt';
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
  // Manejar la decodificación de texto
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
      
      // Simular proceso (puedes eliminar este setTimeout en producción)
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
  // Buscar si ya existe un contenedor de resultados
  let resultContainer = document.querySelector('.decode-result');
  
  // Si no existe, crear uno
  if (!resultContainer) {
    resultContainer = document.createElement('div');
    resultContainer.className = 'decode-result';
    
    // Insertar después del botón de decodificación
    const decodeBtn = document.getElementById('decodeBtn');
    if (decodeBtn && decodeBtn.parentNode) {
      decodeBtn.parentNode.insertBefore(resultContainer, decodeBtn.nextSibling);
    }
  }
  
  // Actualizar contenido
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
  // Similar a showDecodedResult pero con estilo de error
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
