// Función para convertir un árbol de Huffman a formato D3
function convertToD3Tree(node, pathCode = "") {
  if (!node) return null;
  
  // Crear objeto en formato que D3 pueda usar
  const d3Node = {
    name: node.char !== null ? node.char : (node.freq!== null ) ? node.freq.toString() : '0',
    isChar: node.char !== null,
    freq: node.freq === null ? 0 : node.freq,
    code: pathCode,
    children: []
  };
  
  // Convertir caracteres especiales para visualización
  if (node.char === " ") d3Node.name = "␣";
  else if (node.char === "\n") d3Node.name = "⏎";
  else if (node.char === "\t") d3Node.name = "⇥";
  
  // Procesar nodos hijos recursivamente
  if (node.left) {
    d3Node.children.push(convertToD3Tree(node.left, pathCode + "0"));
  }
  if (node.right) {
    d3Node.children.push(convertToD3Tree(node.right, pathCode + "1"));
  }
  
  return d3Node;
}

// Función principal para visualizar el árbol usando D3
function visualizeHuffmanTree(root, containerId) {
  // Convertir el árbol de Huffman al formato que necesita D3
  const d3Data = convertToD3Tree(root);
  
  // Configurar dimensiones y márgenes
  const margin = {top: 40, right: 120, bottom: 20, left: 120};
  const width = 960 - margin.left - margin.right;
  const height = 800 - margin.top - margin.bottom;
  
  // Limpiar el contenedor
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  // Crear el SVG
  const svg = d3.select(`#${containerId}`)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("overflow", "visible")
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
  // Definir gradientes y filtros para efectos visuales
  const defs = svg.append("defs");
  
  // Filtro de sombra
  const filter = defs.append("filter")
    .attr("id", "drop-shadow")
    .attr("height", "130%");
  
  filter.append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 3)
    .attr("result", "blur");
  
  filter.append("feOffset")
    .attr("in", "blur")
    .attr("dx", 2)
    .attr("dy", 2)
    .attr("result", "offsetBlur");
  
  const feComponentTransfer = filter.append("feComponentTransfer")
    .attr("in", "offsetBlur")
    .attr("result", "offsetBlurColor");
  
  feComponentTransfer.append("feFuncA")
    .attr("type", "linear")
    .attr("slope", 0.3);
  
  const feMerge = filter.append("feMerge");
  feMerge.append("feMergeNode")
    .attr("in", "offsetBlurColor");
  feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");

  // Gradiente para nodos hoja
  const leafGradient = defs.append("linearGradient")
    .attr("id", "leafGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");
  
  leafGradient.append("stop")
    .attr("offset", "0%")
    .attr("style", "stop-color:#5ba4fc;stop-opacity:1");
  
  leafGradient.append("stop")
    .attr("offset", "100%")
    .attr("style", "stop-color:#2563eb;stop-opacity:1");
  
  // Gradiente para nodos internos
  const internalGradient = defs.append("linearGradient")
    .attr("id", "internalGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");
  
  internalGradient.append("stop")
    .attr("offset", "0%")
    .attr("style", "stop-color:#a5f3fc;stop-opacity:1");
  
  internalGradient.append("stop")
    .attr("offset", "100%")
    .attr("style", "stop-color:#67e8f9;stop-opacity:1");
  
  // Crear jerarquía D3
  const treeData = d3.hierarchy(d3Data);
  
  // Contar nodos para determinar el tipo de visualización
  const totalNodes = treeData.descendants().length;
  const maxDepth = treeData.height;
  
  
  // Determinar si necesitamos un modo compacto
  const isLargeTree = totalNodes > 30 || maxDepth > 5;
  
  // Ajustar tamaño según la complejidad del árbol
  let nodeSize, fontSize, showLabels;
  
  // Crear el layout del árbol - IMPORTANTE: definir esto antes de usarlo
  const treeLayout = d3.tree();
  
  if (isLargeTree) {
    
    // Ajustes para árboles grandes
    nodeSize = 10; // Nodos más pequeños
    fontSize = 8; // Texto más pequeño
    showLabels = false; // No mostrar etiquetas adicionales
    
    // Ajustar el layout para árboles grandes
    treeLayout.nodeSize([20, 40]) // Espacio entre nodos más compacto
      .separation((a, b) => { 
        return (a.parent == b.parent ? 1 : 1.2); 
      });
  } else {
    // Ajustes normales para árboles pequeños
    nodeSize = 22;
    fontSize = 14;
    showLabels = true;
    
    // Layout estándar
    treeLayout.size([width, height])
      .separation((a, b) => {
        return (a.parent == b.parent ? 1.5 : 2);
      });
  }
  
  // Calcular posiciones de los nodos con el layout adaptado
  const nodes = treeLayout(treeData);
  
  // Añadir enlaces con transición
  const links = svg.selectAll(".link")
    .data(nodes.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", "#94a3b8")
    .attr("stroke-width", isLargeTree ? 1 : 2)
    .attr("d", d3.linkVertical()
      .x(d => d.x+width/2)
      .y(d => d.y)
    );
  
  // Añadir grupo para cada nodo
  const nodeGroups = svg.selectAll(".node")
    .data(nodes.descendants())
    .enter()
    .append("g")
    .attr("class", d => `node ${d.data.isChar ? 'leaf-node' : 'internal-node'} ${isLargeTree ? 'compact' : ''}`)
    .attr("transform", d => `translate(${d.x+width/2},${d.y})`);
  
  // Añadir círculo para cada nodo con tamaño adaptativo
  nodeGroups.append("circle")
    .attr("r", d => d.data.isChar ? nodeSize : nodeSize * 0.9)
    .attr("fill", d => d.data.isChar ? "url(#leafGradient)" : "url(#internalGradient)")
    .attr("stroke", d => d.data.isChar ? "#1e40af" : "#0891b2")
    .attr("stroke-width", isLargeTree ? 1 : 2)
    .style("filter", isLargeTree ? "none" : "url(#drop-shadow)"); // Quitar sombras en modo compacto
  
  // Añadir texto para el nombre del nodo (carácter o frecuencia)
  nodeGroups.append("text")
    .attr("dy", fontSize * 0.35)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .style("font-weight", d => d.data.isChar ? "bold" : "normal")
    .style("font-size", `${fontSize}px`)
    .text(d => {
      // Para árboles grandes, acortar los textos largos
      if (isLargeTree && d.data.freq > 999) {
        return Math.round(d.data.freq/100)/10 + "k";
      }
      return d.data.name;
    });
  
  // Para nodos hoja, añadir etiquetas de frecuencia y código solo si se debe mostrar etiquetas
  if (showLabels) {
    nodeGroups.filter(d => d.data.isChar)
      .append("text")
      .attr("class", "freq-label")
      .attr("y", nodeSize * 1.8)
      .attr("text-anchor", "middle")
      .attr("fill", "#64748b")
      .style("font-size", "12px")
      .text(d => `Freq: ${d.data.freq}`);
    
    nodeGroups.filter(d => d.data.isChar)
      .append("text")
      .attr("class", "code-label")
      .attr("y", nodeSize * 2.7)
      .attr("text-anchor", "middle")
      .attr("fill", "#2563eb")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(d => `Código: ${d.data.code}`);
  }
  
  // Añadir etiquetas de bit en los enlaces, adaptando según el tamaño del árbol
  const bitLabels = svg.selectAll(".bit-label")
    .data(nodes.links())
    .enter();
  
  if (!isLargeTree) {
    // Etiquetas detalladas para árboles pequeños
    bitLabels.append("g")
      .attr("class", "bit-label")
      .attr("transform", d => {
        const midX = (d.source.x + d.target.x) / 2;
        const midY = (d.source.y + d.target.y) / 2;
        return `translate(${midX}, ${midY})`;
      })
      .each(function(d) {
        const isLeftLink = d.target.x < d.source.x;
        const bit = isLeftLink ? "0" : "1";
        
        // Círculo de fondo
        d3.select(this).append("circle")
          .attr("r", 12)
          .attr("fill", isLeftLink ? "#3b82f6" : "#ef4444");
        
        // Texto del bit
        d3.select(this).append("text")
          .attr("text-anchor", "middle")
          .attr("dy", 5)
          .attr("fill", "white")
          .style("font-weight", "bold")
          .style("font-size", "12px")
          .text(bit);
      });
  } else {
    // Etiquetas minimalistas para árboles grandes
    bitLabels.append("text")
      .attr("class", "bit-label-compact")
      .attr("x", d => (d.source.x + d.target.x) / 2 + width/2)
      .attr("y", d => (d.source.y + d.target.y) / 2 - 2)
      .attr("text-anchor", "middle")
      .style("font-size", "9px")
      .style("font-weight", "bold")
      .style("fill", d => d.target.x < d.source.x ? "#3b82f6" : "#ef4444")
      .text(d => d.target.x < d.source.x ? "0" : "1");
  }
  
  // Añadir tooltip interactivo para los nodos
  nodeGroups.append("title")
    .text(d => {
      if (d.data.isChar) {
        const charDisplay = d.data.name === "␣" ? "espacio" : 
                           d.data.name === "⏎" ? "salto de línea" : 
                           d.data.name === "⇥" ? "tabulación" : 
                           d.data.name;
        return `Carácter: ${charDisplay}\nFrecuencia: ${d.data.freq}\nCódigo: ${d.data.code}`;
      } else {
        return `Frecuencia acumulada: ${d.data.freq}`;
      }
    });
  
  // Añadir controles de navegación para árboles grandes
  if (isLargeTree) {
    const controls = d3.select(`#${containerId}`)
      .append("div")
      .attr("class", "tree-controls")
      .html(`
        <div class="zoom-controls">
          <button class="zoom-in" title="Acercar">+</button>
          <button class="zoom-out" title="Alejar">−</button>
          <button class="zoom-reset" title="Reiniciar zoom">↺</button>
        </div>
      `);
      
    // Implementar funcionalidad de los controles
    controls.select(".zoom-in").on("click", () => {
      zoom.scaleBy(d3.select(`#${containerId} svg`).transition().duration(300), 1.3);
    });
    
    controls.select(".zoom-out").on("click", () => {
      zoom.scaleBy(d3.select(`#${containerId} svg`).transition().duration(300), 0.7);
    });
    
    controls.select(".zoom-reset").on("click", () => {
      d3.select(`#${containerId} svg`).transition().duration(500)
        .call(zoom.transform, d3.zoomIdentity);
    });
  }
  
  // Configuración mejorada de zoom
  const zoom = d3.zoom()
    .scaleExtent([0.2, 5]) // Permitir más zoom out/in
    .on("zoom", (event) => {
      svg.attr("transform", event.transform);
    });
  
  // Aplicar zoom con una transición inicial para árboles grandes
  const svgElement = d3.select(`#${containerId} svg`);
  
  svgElement.call(zoom);
  
  if (isLargeTree) {
    // Para árboles grandes, hacer zoom out automático para mostrar más contexto
    setTimeout(() => {
      const initialScale = 0.7;
      svgElement.transition()
        .duration(800)
        .call(zoom.transform, d3.zoomIdentity.scale(initialScale));
    }, 100);
  }
}
