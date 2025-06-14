// Esperar a que el DOM esté completamente cargado antes de inicializar
document.addEventListener('DOMContentLoaded', () => {
  // Referencias a elementos DOM
  const input = document.getElementById("fileInput");
  const continueButton = document.getElementById("continueButton");
  const uploadArea = document.getElementById("uploadArea");
  const fileNameDisplay = document.getElementById("fileNameDisplay");
  const fileLabel = document.querySelector(".file-label");
  const bgAnimation = document.getElementById("bgAnimation");
  
  // Variables para el manejo de archivos
  let file = null;
  let fileContent = '';
  let fileLoaded = false;
  
  // Estado global del archivo
  const fileState = {
    content: '',
    fileName: '',
    isLoaded: false,
    fileSize: 0,
    fileType: ''
  };
  
  // Función para crear animación del fondo
  function createBackgroundAnimation() {
    for (let i = 0; i < 30; i++) {
      const bit = document.createElement('div');
      bit.classList.add('bit');
      bit.style.top = `${Math.random() * 100}%`;
      bit.style.left = `${Math.random() * 100}%`;
      bit.style.animationDuration = `${8 + Math.random() * 10}s`;
      bit.style.animationDelay = `${Math.random() * 5}s`;
      bit.textContent = Math.round(Math.random());
      document.body.appendChild(bit);
    }
  }
  
  // Función para mostrar un feedback visual del proceso
  function showProcessingFeedback() {
    const feedback = document.createElement('div');
    feedback.className = 'file-processing';
    feedback.innerHTML = `
      <div class="processing-spinner"></div>
      <p>Procesando archivo...</p>
    `;
    uploadArea.appendChild(feedback);
    
    setTimeout(() => {
      feedback.classList.add('processing-complete');
      feedback.innerHTML = `
        <div class="processing-check">✓</div>
        <p>¡Archivo listo para compresión!</p>
      `;
    }, 1500);
  }
  
  // Función para mostrar mensaje de error en la interfaz
  function showErrorFeedback(message) {
    const existingFeedback = uploadArea.querySelector('.file-processing');
    if (existingFeedback) {
      existingFeedback.remove();
    }
    
    const feedback = document.createElement('div');
    feedback.className = 'file-processing error-feedback';
    feedback.innerHTML = `
      <div class="error-icon">⚠️</div>
      <p>${message}</p>
    `;
    uploadArea.appendChild(feedback);
    
    // Eliminar después de unos segundos
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.remove();
      }
    }, 4000);
  }
  
  // Función para leer el archivo
  function readFile(fileToRead) {
    if (!fileToRead) {
      console.error("No se proporcionó ningún archivo para leer");
      return;
    }
    
    const reader = new FileReader();
    
    // Añadir clase de procesando
    uploadArea.classList.add('processing');
    
    reader.onloadstart = () => {
      showProcessingFeedback();
    };
    
    reader.onload = (e) => {
      try {
        fileContent = e.target.result;
        
        // Actualizar el estado global del archivo
        fileState.content = e.target.result;
        fileState.fileName = fileToRead.name;
        fileState.isLoaded = true;
        fileState.fileSize = fileToRead.size;
        fileState.fileType = fileToRead.type;
        
        console.log("Archivo leído con éxito");
        
        // Pequeña demora para mejorar el UX :)
        setTimeout(() => {
          // Habilitar el botón de continuar cuando el archivo se carga con éxito
          continueButton.disabled = false;
          uploadArea.classList.remove('processing');
          uploadArea.classList.add("active");
          
          // Añadir efecto de pulso al botón continuar
          continueButton.classList.add('pulse-animation');
          
          // Agregar una pequeña animación de "bits" en el área
          createBitParticles();
          
        }, 1800);
      } catch (error) {
        console.error("Error al procesar el archivo:", error);
        uploadArea.classList.remove('processing');
        showErrorFeedback("Ocurrió un error al procesar el archivo.");
      }
    };
    
    reader.onerror = () => {
      console.error("Error al leer el archivo");
      uploadArea.classList.remove('processing');
      showErrorFeedback("No se pudo leer el archivo. Inténtalo nuevamente.");
    };
    
    try {
      reader.readAsText(fileToRead);
    } catch (error) {
      console.error("Error al iniciar la lectura del archivo:", error);
      uploadArea.classList.remove('processing');
      showErrorFeedback("Error al acceder al archivo.");
    }
  }
  
  // Función para crear partículas de bits cuando el archivo es cargado
  function createBitParticles() {
    for (let i = 0; i < 10; i++) {
      const bit = document.createElement('div');
      bit.classList.add('success-bit');
      bit.textContent = Math.round(Math.random());
      bit.style.left = `${20 + Math.random() * 60}%`;
      bit.style.animationDelay = `${i * 0.1}s`;
      uploadArea.appendChild(bit);
      
      // Eliminar después de la animación
      setTimeout(() => bit.remove(), 2000);
    }
  }
  
  // Función para mostrar el nombre del archivo seleccionado
  function showSelectedFile(fileName) {
    // Ocultar el botón de seleccionar archivo
    fileLabel.style.display = 'none';
    // Mostrar el nombre del archivo con animación
    fileNameDisplay.textContent = '';
    fileNameDisplay.classList.add('selected-file');
    
    // Efecto de tipeo para el nombre del archivo
    let i = 0;
    fileNameDisplay.style.display = 'inline-block';
    
    const typeEffect = setInterval(() => {
      if (i < fileName.length) {
        fileNameDisplay.textContent += fileName.charAt(i);
        i++;
      } else {
        clearInterval(typeEffect);
        
        // Añadir botón para cambiar el archivo
        const changeFileBtn = document.createElement('button');
        changeFileBtn.className = 'change-file-btn';
        changeFileBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
        fileNameDisplay.appendChild(changeFileBtn);
        
        changeFileBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          resetFileUpload();
          input.click();
        });
      }
    }, 50);
  }
  
  // Función para resetear la subida de archivos
  function resetFileUpload() {
    fileLoaded = false;
    file = null;
    fileContent = '';
    fileNameDisplay.textContent = '';
    fileNameDisplay.style.display = 'none';
    fileNameDisplay.classList.remove('selected-file');
    fileLabel.style.display = 'inline-block';
    uploadArea.classList.remove('active');
    continueButton.disabled = true;
    continueButton.classList.remove('pulse-animation');
    
    // Remover elementos de procesamiento si existen
    const processingElement = uploadArea.querySelector('.file-processing');
    if (processingElement) {
      processingElement.remove();
    }
  }
  
  // Evento: Cambio en el input de archivo
  input.addEventListener('change', (event) => {
    try {
      if (event.target.files && event.target.files.length > 0) {
        file = event.target.files[0];
        if (file) {
          fileLoaded = true;
          showSelectedFile(file.name);
          
          // Leer el archivo automáticamente al seleccionarlo
          readFile(file);
        }
      } else {
        console.warn("No hay archivos seleccionados");
      }
    } catch (error) {
      console.error("Error al acceder a los archivos seleccionados:", error);
    }
  });
  
  // Evento: Arrastrar archivo sobre la zona de carga
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-active');
  });
  
  // Evento: Arrastrar archivo fuera de la zona de carga
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-active');
    if (!fileLoaded) {
      uploadArea.classList.remove('active');
    }
  });
  
  // Evento: Soltar archivo en la zona de carga
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-active');
    
    if (e.dataTransfer.files.length > 0) {
      file = e.dataTransfer.files[0];
      input.files = e.dataTransfer.files;
      
      fileLoaded = true;
      showSelectedFile(file.name);
      
      // Leer el archivo automáticamente al soltarlo
      readFile(file);
    }
  });
  
  // Evento: Clic en el botón continuar
  continueButton.addEventListener('click', () => {
    // Efecto visual al hacer clic
    continueButton.classList.add('clicked');
    
    setTimeout(() => {
      continueButton.classList.remove('clicked');
      
      // Guardar los datos del archivo en localStorage para que estén disponibles en la página de huffman
      localStorage.setItem('fileData', JSON.stringify({
        content: fileState.content,
        fileName: fileState.fileName,
        fileSize: fileState.fileSize
      }));
      
      // Redirigir a la página de compresión Huffman
      window.location.href = './pages/huffman.html';
    }, 300);
  });
  
  // Inicializaciones
  continueButton.disabled = true;
  createBackgroundAnimation();
  
  // Estilos adicionales para efectos visuales
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse-animation {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
      70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    
    .pulse-animation {
      animation: pulse-animation 2s infinite;
    }
    
    .clicked {
      transform: scale(0.98);
    }
    
    .success-bit {
      position: absolute;
      font-family: monospace;
      font-size: 16px;
      color: #10b981;
      pointer-events: none;
      animation: success-float 2s forwards;
    }
    
    @keyframes success-float {
      0% { transform: translateY(20px); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translateY(-40px); opacity: 0; }
    }
    
    .file-processing {
      margin-top: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      transition: all 0.3s;
    }
    
    .processing-spinner {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(37, 99, 235, 0.2);
      border-radius: 50%;
      border-top-color: #2563eb;
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 8px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .processing-check {
      width: 24px;
      height: 24px;
      background: #10b981;
      border-radius: 50%;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      animation: scale-in 0.3s;
    }
    
    @keyframes scale-in {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }
    
    .drag-active {
      background-color: rgba(37, 99, 235, 0.05);
      transform: scale(1.02);
      border: 2px dashed #2563eb;
    }
    
    .processing {
      pointer-events: none;
    }

    .selected-file {
      font-weight: bold;
      font-size: 18px;
      color: #2563eb;
      margin-top: 10px;
    }

    .change-file-btn {
      background: none;
      border: none;
      cursor: pointer;
      margin-left: 8px;
      transition: transform 0.2s;
    }

    .change-file-btn:hover {
      transform: scale(1.1);
    }
    
    .error-feedback {
      background-color: rgba(239, 68, 68, 0.1);
      border-radius: 8px;
      padding: 10px 15px;
    }
    
    .error-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
    
    .file-processing.error-feedback p {
      color: #ef4444;
      font-weight: 500;
    }
  `;
  
  document.head.appendChild(style);
  
});

