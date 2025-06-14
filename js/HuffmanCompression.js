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

  // Generar codigos haciendo recorrido al árbol
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
  
  // Para codificar el texto
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
  
  // Para decodificar el texto
  decode(encodedText) {
    if (!encodedText || !this.root) return '';
    if (this.root.char !== null) return this.root.char.repeat(this.root.freq);
    
    let node = this.root;
    let decodedText = "";
    
    for (let i = 0; i < encodedText.length; i++) {
      // Moverse por el árbol según el bit actual
      if (encodedText[i] === '0') {
        node = node.left;
      } else if(encodedText[i] === '1') {
        node = node.right;
      }
      
      // Si llegamos a una hoja, añadir el carácter al resultado
      if (node.char !== null) {
        
        decodedText += node.char;
        // Volver a la raíz para el siguiente carácter
        node = this.root;
      }
    }
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

  // Metodo de descompresión de un archivo huffman
  decompress(textTree, codified) {
    this.root = new HuffmanNode(null, null);
    let node = this.root;
    let code = '';
    for (let i = 0; i < textTree.length; i++) {
      if(textTree[i] ==='0'){
        code += '0'
        if(node.left === null){
          node.left = new HuffmanNode(null, null);
        }
        node = node.left;
      }
      else if(textTree[i] ==='1') {
        code += '1';
        if(node.right === null){
          node.right = new HuffmanNode(null, null);
        }
        node = node.right;
      }
      else if(textTree[i] ==='\\') {
        if(textTree[i+1] === '0' || textTree[i+1] === '1'){
          node.char = textTree[i+1];
        }
        else {
          node.char = textTree[i] + textTree[i+1];
        }
        this.codes[node.char] = code || '0';
        i++;
        node = this.root;
        code = '';
      }
      else {
        node.char = textTree[i] || ' ';
        this.codes[node.char] = code || '0';
        node = this.root;
        code = '';
      }
    }

    let decoded = this.decode(codified);

    this.originalSize = codified.length;
    this.uniqueChars = Object.keys(this.codes).length;

    return {
      decompressed: decoded,
      decompressedSize: decoded.length,
      huffmanCodes: this.codes,
      originalSize: this.originalSize,
      tree: this.root,
      uniqueChars: this.uniqueChars,
    };
  }
}