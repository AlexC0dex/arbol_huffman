# Huffman Compressor Web

Una sencilla aplicación web para comprimir y descomprimir archivos de texto (.txt) usando el **algoritmo de Huffman**. La única dependencia externa es **d3.js** para la visualización interactiva del árbol de Huffman; el resto está implementado en JavaScript puro.

---

## 📦 Características

- **Compresión y descompresión** de archivos `.txt` cargados por el usuario.
- **Visualización** interactiva del **árbol de Huffman** con **zoom** y **desplazamiento** usando d3.js.
- Implementación en **JS puro** (sin frameworks adicionales).
- Interfaz minimalista y responsiva.

---

## 🔧 Instalación y uso

1. **Clona el repositorio**

   ```bash
   git clone https://github.com/tu-usuario/tu-repositorio.git
   cd tu-repositorio
   ```

2. **Abre **`` en tu navegador (no requiere servidor local).

3. **Carga un archivo **``:

   - Haz clic en "Seleccionar archivo" y elige tu documento de texto.
   - Elige "Comprimir" o "Descomprimir" según tu necesidad.

4. **Descarga el resultado**:

   - Después del proceso, usa el botón "Descargar" para guardar el archivo resultante.

---

## 🎨 Visualización con d3.js

La biblioteca **d3.js** se usa exclusivamente para renderizar y controlar el árbol de Huffman:

- Zoom (rueda del ratón o gesto táctil).
- Desplazamiento (arrastrar el lienzo).
- Animaciones suaves al expandir o colapsar nodos.

---

## 🗂 Estructura del proyecto

```plaintext
├── css/
│   ├── decompress.css
│   ├── huffman.css
│   └── style.css
├── js/
│   ├── HuffmanCompression.js
│   ├── HuffmanNode.js
│   ├── compression.js
│   ├── d3-tree.js
│   ├── decompression.js
│   └── main.js
├── pages/
│   ├── decompress.html
│   └── huffman.html
├── README.md
└── index.html
```

---

## 🚀 Demo en vivo

Visita la aplicación en línea: https://alexc0dex.github.io/arbol_huffman/

---
