/**
 * Bitigey Design Studio — Master Graphic & Painting Canvas Engine
 * Developed by Tunahan Haksever
 */

class DesignStudio {
  constructor() {
    this.canvas = document.getElementById('mainDesignCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Canvas Dimensions
    this.width = 800;
    this.height = 800;
    this.bgColor = '#0a0d14';

    // State
    this.layers = [];
    this.activeLayerId = null;
    this.activeTool = 'select'; // select, brush, text, rect, circle, star, arrow
    this.isDrawing = false;
    this.isDragging = false;
    this.isResizing = false;
    this.activeHandle = null;
    this.dragStart = { x: 0, y: 0 };
    this.layerStart = { x: 0, y: 0, w: 0, h: 0 };

    // Brush Settings
    this.brushColor = '#00f2fe';
    this.brushSize = 6;
    this.brushStyle = 'solid'; // solid, neon, highlighter

    // History (Undo / Redo)
    this.history = [];
    this.historyIndex = -1;

    this.init();
  }

  init() {
    this.resizeCanvas(this.width, this.height);
    this.bindEvents();
    this.loadSampleDesign();
    this.saveState();
  }

  resizeCanvas(w, h) {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
    document.getElementById('canvas-dimensions-display').innerText = `${w} × ${h} px`;
    this.render();
  }

  bindEvents() {
    // Canvas Mouse & Touch Events for Drag & Drop and Painting
    this.canvas.addEventListener('mousedown', (e) => this.onPointerDown(e));
    window.addEventListener('mousemove', (e) => this.onPointerMove(e));
    window.addEventListener('mouseup', () => this.onPointerUp());

    this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    window.addEventListener('touchend', () => this.onPointerUp());

    // Left Toolbar Tools
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTool = btn.getAttribute('data-tool');
        if (this.activeTool === 'brush') {
          document.querySelector('.inspector-tab-btn[data-tab="brush"]')?.click();
        }
      });
    });

    // Inspector Tabs
    document.querySelectorAll('.inspector-tab-btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.inspector-tab-btn[data-tab]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.inspector-tab-content').forEach(c => c.style.display = 'none');
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        const target = document.getElementById(`tab-content-${tabId}`);
        if (target) target.style.display = 'flex';
      });
    });

    // Preset Dimensions
    document.getElementById('preset-1080x1080')?.addEventListener('click', () => this.resizeCanvas(1080, 1080));
    document.getElementById('preset-1080x1920')?.addEventListener('click', () => this.resizeCanvas(1080, 1920));
    document.getElementById('preset-1280x720')?.addEventListener('click', () => this.resizeCanvas(1280, 720));

    // Add Element Buttons
    document.getElementById('btn-add-gold-badge')?.addEventListener('click', () => this.addGoldBadge());
    document.getElementById('btn-add-luxury-title')?.addEventListener('click', () => this.addLuxuryTitle());
    document.getElementById('btn-add-neon-card')?.addEventListener('click', () => this.addNeonCard());
    document.getElementById('btn-add-quote-box')?.addEventListener('click', () => this.addQuoteBox());
    document.getElementById('btn-add-callout')?.addEventListener('click', () => this.addCallout());
    document.getElementById('btn-add-author-tag')?.addEventListener('click', () => this.addAuthorTag());

    // Image Upload
    const fileInput = document.getElementById('image-upload-input');
    document.getElementById('btn-tool-upload')?.addEventListener('click', () => fileInput.click());
    fileInput?.addEventListener('change', (e) => this.handleImageUpload(e));

    // Delete Active Layer
    document.getElementById('btn-delete-active')?.addEventListener('click', () => {
      if (this.activeLayerId) this.deleteLayer(this.activeLayerId);
    });

    // Brush Controls
    const brushColorPicker = document.getElementById('brush-color-picker');
    brushColorPicker?.addEventListener('input', (e) => this.brushColor = e.target.value);
    
    document.querySelectorAll('.quick-color-btn').forEach(b => {
      b.addEventListener('click', () => {
        this.brushColor = b.getAttribute('data-color');
        if (brushColorPicker) brushColorPicker.value = this.brushColor;
      });
    });

    const brushSizeSlider = document.getElementById('brush-size-slider');
    brushSizeSlider?.addEventListener('input', (e) => {
      this.brushSize = parseInt(e.target.value, 10);
      document.getElementById('brush-size-val').innerText = `${this.brushSize} px`;
    });

    document.getElementById('brush-style-select')?.addEventListener('change', (e) => {
      this.brushStyle = e.target.value;
    });

    // Canvas Background Color
    document.getElementById('canvas-bg-color')?.addEventListener('input', (e) => {
      this.bgColor = e.target.value;
      this.render();
      this.saveState();
    });

    // Inspector Inputs Binding
    this.bindInspectorControls();

    // Export & Templates Modals
    document.getElementById('btn-open-export')?.addEventListener('click', () => {
      document.getElementById('export-modal')?.classList.add('active');
    });
    document.getElementById('btn-open-templates')?.addEventListener('click', () => {
      document.getElementById('templates-modal')?.classList.add('active');
    });

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
      });
    });

    // Export Triggers
    document.getElementById('btn-export-png')?.addEventListener('click', () => this.exportImage('png'));
    document.getElementById('btn-export-jpg')?.addEventListener('click', () => this.exportImage('jpeg'));
    document.getElementById('btn-export-svg')?.addEventListener('click', () => this.exportSVG());
    document.getElementById('btn-export-json')?.addEventListener('click', () => this.exportJSON());
    document.getElementById('btn-import-json-trigger')?.addEventListener('click', () => {
      document.getElementById('json-import-input')?.click();
    });
    document.getElementById('json-import-input')?.addEventListener('change', (e) => this.importJSON(e));

    // Undo / Redo
    document.getElementById('btn-undo')?.addEventListener('click', () => this.undo());
    document.getElementById('btn-redo')?.addEventListener('click', () => this.redo());

    // Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) this.redo();
        else this.undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        this.redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.activeLayerId) this.deleteLayer(this.activeLayerId);
      }
    });

    // Template Cards Selection
    document.querySelectorAll('.preset-card[data-template]').forEach(card => {
      card.addEventListener('click', () => {
        const tName = card.getAttribute('data-template');
        this.loadTemplate(tName);
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
      });
    });
  }

  bindInspectorControls() {
    const bindInput = (id, prop, isNumber = false) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', (e) => {
        const layer = this.getActiveLayer();
        if (!layer) return;
        layer[prop] = isNumber ? parseFloat(e.target.value) || 0 : e.target.value;
        this.render();
      });
      el.addEventListener('change', () => this.saveState());
    };

    bindInput('prop-x', 'x', true);
    bindInput('prop-y', 'y', true);
    bindInput('prop-w', 'width', true);
    bindInput('prop-h', 'height', true);
    bindInput('prop-opacity', 'opacity', true);
    bindInput('prop-fill-color', 'fill');
    bindInput('prop-stroke-color', 'stroke');
    bindInput('prop-stroke-width', 'strokeWidth', true);

    bindInput('prop-text-content', 'text');
    bindInput('prop-font-family', 'fontFamily');
    bindInput('prop-font-size', 'fontSize', true);
    bindInput('prop-letter-spacing', 'letterSpacing', true);

    const bindFilter = (id, filterProp) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', (e) => {
        const layer = this.getActiveLayer();
        if (!layer) return;
        if (!layer.filters) layer.filters = { brightness: 100, contrast: 100, saturate: 100, hueRotate: 0, blur: 0, sepia: 0, grayscale: 0 };
        layer.filters[filterProp] = parseFloat(e.target.value) || 0;
        this.render();
      });
      el.addEventListener('change', () => this.saveState());
    };

    bindFilter('filter-brightness', 'brightness');
    bindFilter('filter-contrast', 'contrast');
    bindFilter('filter-saturate', 'saturate');
    bindFilter('filter-hue', 'hueRotate');

    document.querySelectorAll('.filter-preset-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const layer = this.getActiveLayer();
        if (!layer) return;
        const preset = pill.getAttribute('data-preset');
        this.applyFilterPreset(layer, preset);
        this.updateInspectorUI();
        this.render();
        this.saveState();
      });
    });
  }

  applyFilterPreset(layer, preset) {
    if (!layer.filters) layer.filters = { brightness: 100, contrast: 100, saturate: 100, hueRotate: 0, blur: 0, sepia: 0, grayscale: 0 };
    if (preset === 'original') {
      layer.filters = { brightness: 100, contrast: 100, saturate: 100, hueRotate: 0, blur: 0, sepia: 0, grayscale: 0 };
    } else if (preset === 'cyberpunk') {
      layer.filters = { brightness: 115, contrast: 140, saturate: 180, hueRotate: 190, blur: 0, sepia: 0, grayscale: 0 };
    } else if (preset === 'noir') {
      layer.filters = { brightness: 95, contrast: 160, saturate: 0, hueRotate: 0, blur: 0, sepia: 0, grayscale: 100 };
    } else if (preset === 'vintage') {
      layer.filters = { brightness: 90, contrast: 110, saturate: 85, hueRotate: 15, blur: 0, sepia: 60, grayscale: 0 };
    } else if (preset === 'vibrant') {
      layer.filters = { brightness: 110, contrast: 130, saturate: 200, hueRotate: 0, blur: 0, sepia: 0, grayscale: 0 };
    }
  }

  getPointerPos(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.width / rect.width;
    const scaleY = this.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  onPointerDown(e) {
    const pos = this.getPointerPos(e.clientX, e.clientY);
    this.dragStart = pos;

    if (this.activeTool === 'select') {
      // 1. Check resize handle
      const activeLayer = this.getActiveLayer();
      if (activeLayer) {
        const handle = this.hitTestHandles(pos, activeLayer);
        if (handle) {
          this.isResizing = true;
          this.activeHandle = handle;
          this.layerStart = { x: activeLayer.x, y: activeLayer.y, w: activeLayer.width, h: activeLayer.height };
          return;
        }
      }

      // 2. Check layer selection
      const hit = this.hitTestLayers(pos);
      if (hit) {
        this.activeLayerId = hit.id;
        this.isDragging = true;
        this.layerStart = { x: hit.x, y: hit.y, w: hit.width, h: hit.height };
        document.querySelector('.inspector-tab-btn[data-tab="properties"]')?.click();
      } else {
        this.activeLayerId = null;
      }
      this.updateInspectorUI();
      this.render();
    } else if (this.activeTool === 'brush') {
      this.isDrawing = true;
      const brushLayer = {
        id: `layer-${Date.now()}`,
        name: 'Fırça Çizimi',
        type: 'brush',
        visible: true,
        locked: false,
        opacity: this.brushStyle === 'highlighter' ? 0.4 : 1.0,
        stroke: this.brushColor,
        strokeWidth: this.brushSize,
        brushStyle: this.brushStyle,
        points: [pos],
        x: 0, y: 0, width: this.width, height: this.height, rotation: 0
      };
      this.layers.push(brushLayer);
      this.activeLayerId = brushLayer.id;
      this.render();
    } else if (['rect', 'circle', 'triangle', 'star', 'arrow'].includes(this.activeTool)) {
      this.createShapeLayer(this.activeTool, pos.x, pos.y);
      this.activeTool = 'select';
      document.querySelector('.tool-btn[data-tool="select"]')?.click();
    } else if (this.activeTool === 'text') {
      this.createTextLayer(pos.x, pos.y);
      this.activeTool = 'select';
      document.querySelector('.tool-btn[data-tool="select"]')?.click();
    }
  }

  onPointerMove(e) {
    const pos = this.getPointerPos(e.clientX, e.clientY);
    const dx = pos.x - this.dragStart.x;
    const dy = pos.y - this.dragStart.y;

    if (this.isDragging && this.activeLayerId) {
      const layer = this.getActiveLayer();
      if (layer && !layer.locked) {
        layer.x = Math.round(this.layerStart.x + dx);
        layer.y = Math.round(this.layerStart.y + dy);
        this.updateInspectorUI();
        this.render();
      }
    } else if (this.isResizing && this.activeLayerId) {
      const layer = this.getActiveLayer();
      if (layer && !layer.locked) {
        if (this.activeHandle === 'br') {
          layer.width = Math.max(20, Math.round(this.layerStart.w + dx));
          layer.height = Math.max(20, Math.round(this.layerStart.h + dy));
        }
        this.updateInspectorUI();
        this.render();
      }
    } else if (this.isDrawing) {
      const layer = this.getActiveLayer();
      if (layer && layer.type === 'brush') {
        layer.points.push(pos);
        this.render();
      }
    }
  }

  onPointerUp() {
    if (this.isDragging || this.isResizing || this.isDrawing) {
      this.isDragging = false;
      this.isResizing = false;
      this.isDrawing = false;
      this.activeHandle = null;
      this.saveState();
    }
  }

  onTouchStart(e) {
    if (e.touches.length === 1) {
      e.preventDefault();
      this.onPointerDown({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    }
  }

  onTouchMove(e) {
    if (e.touches.length === 1) {
      e.preventDefault();
      this.onPointerMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    }
  }

  hitTestLayers(pos) {
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      if (!layer.visible) continue;
      if (layer.type === 'brush') continue; // brushes take whole canvas
      if (
        pos.x >= layer.x &&
        pos.x <= layer.x + layer.width &&
        pos.y >= layer.y &&
        pos.y <= layer.y + layer.height
      ) {
        return layer;
      }
    }
    return null;
  }

  hitTestHandles(pos, layer) {
    const handleSize = 16;
    const brX = layer.x + layer.width;
    const brY = layer.y + layer.height;
    if (Math.abs(pos.x - brX) <= handleSize && Math.abs(pos.y - brY) <= handleSize) {
      return 'br';
    }
    return null;
  }

  createShapeLayer(type, x, y) {
    const newLayer = {
      id: `layer-${Date.now()}`,
      name: `${type.toUpperCase()} Şekli`,
      type: type,
      x: x - 60, y: y - 60,
      width: 120, height: 120, rotation: 0,
      visible: true, locked: false, opacity: 1.0,
      fill: this.brushColor || '#00f2fe',
      stroke: '#0f172a', strokeWidth: 0,
      shadow: { color: 'rgba(0,0,0,0.4)', blur: 12, offsetX: 0, offsetY: 4 }
    };
    this.layers.push(newLayer);
    this.activeLayerId = newLayer.id;
    this.updateInspectorUI();
    this.render();
    this.saveState();
  }

  createTextLayer(x, y) {
    const newLayer = {
      id: `layer-${Date.now()}`,
      name: 'Metin Katmanı',
      type: 'text',
      text: 'YENİ METİN',
      fontFamily: "'Cinzel', serif",
      fontSize: 48,
      letterSpacing: 2,
      x: x - 100, y: y - 30,
      width: 260, height: 60, rotation: 0,
      visible: true, locked: false, opacity: 1.0,
      fill: '#f59e0b', stroke: '', strokeWidth: 0
    };
    this.layers.push(newLayer);
    this.activeLayerId = newLayer.id;
    this.updateInspectorUI();
    this.render();
    this.saveState();
  }

  // Pre-made Element Creators
  addGoldBadge() {
    const layer = {
      id: `layer-${Date.now()}`,
      name: 'Altın Rozet',
      type: 'star',
      x: this.width / 2 - 60, y: this.height / 2 - 60,
      width: 120, height: 120, rotation: 0,
      visible: true, locked: false, opacity: 1.0,
      fill: '#f59e0b', stroke: '#fff', strokeWidth: 2,
      shadow: { color: 'rgba(245, 158, 11, 0.4)', blur: 20, offsetX: 0, offsetY: 0 }
    };
    this.layers.push(layer);
    this.activeLayerId = layer.id;
    this.updateInspectorUI();
    this.render();
    this.saveState();
  }

  addLuxuryTitle() {
    const layer = {
      id: `layer-${Date.now()}`,
      name: 'Lüks Başlık',
      type: 'text',
      text: 'BİTİGEY DİJİTAL SANAT',
      fontFamily: "'Cinzel', serif",
      fontSize: 52,
      letterSpacing: 3,
      x: 100, y: 200, width: 600, height: 70, rotation: 0,
      visible: true, locked: false, opacity: 1.0,
      fill: '#f59e0b'
    };
    this.layers.push(layer);
    this.activeLayerId = layer.id;
    this.updateInspectorUI();
    this.render();
    this.saveState();
  }

  addNeonCard() {
    const layer = {
      id: `layer-${Date.now()}`,
      name: 'Neon Kart',
      type: 'rect',
      x: 100, y: 150, width: 600, height: 400, rotation: 0,
      visible: true, locked: false, opacity: 0.9,
      fill: '#0f172a', stroke: '#00f2fe', strokeWidth: 3,
      shadow: { color: 'rgba(0, 242, 254, 0.35)', blur: 25, offsetX: 0, offsetY: 8 }
    };
    this.layers.push(layer);
    this.activeLayerId = layer.id;
    this.updateInspectorUI();
    this.render();
    this.saveState();
  }

  addQuoteBox() {
    const layer = {
      id: `layer-${Date.now()}`,
      name: 'Edebi Alıntı',
      type: 'text',
      text: '"Söz, insanın zamana bıraktığı en soylu imzadır."',
      fontFamily: "'Playfair Display', serif",
      fontSize: 28,
      letterSpacing: 1,
      x: 120, y: 340, width: 560, height: 80, rotation: 0,
      visible: true, locked: false, opacity: 1.0,
      fill: '#f8fafc'
    };
    this.layers.push(layer);
    this.activeLayerId = layer.id;
    this.updateInspectorUI();
    this.render();
    this.saveState();
  }

  addCallout() {
    const layer = {
      id: `layer-${Date.now()}`,
      name: 'Not Kartı',
      type: 'rect',
      x: 150, y: 300, width: 300, height: 140, rotation: 0,
      visible: true, locked: false, opacity: 0.95,
      fill: '#1e293b', stroke: '#e2e8f0', strokeWidth: 1,
      shadow: { color: 'rgba(0,0,0,0.5)', blur: 15, offsetX: 0, offsetY: 4 }
    };
    this.layers.push(layer);
    this.activeLayerId = layer.id;
    this.updateInspectorUI();
    this.render();
    this.saveState();
  }

  addAuthorTag() {
    const layer = {
      id: `layer-${Date.now()}`,
      name: 'Yazar İmzası',
      type: 'text',
      text: 'Tunahan Haksever',
      fontFamily: "'Pacifico', cursive",
      fontSize: 32,
      x: 120, y: 640, width: 300, height: 50, rotation: 0,
      visible: true, locked: false, opacity: 1.0,
      fill: '#00f2fe'
    };
    this.layers.push(layer);
    this.activeLayerId = layer.id;
    this.updateInspectorUI();
    this.render();
    this.saveState();
  }

  handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        let w = Math.min(img.width, 500);
        let h = w / aspect;

        const newLayer = {
          id: `layer-${Date.now()}`,
          name: `Fotoğraf (${file.name.substring(0, 12)})`,
          type: 'image',
          imageSrc: event.target.result,
          x: (this.width - w) / 2, y: (this.height - h) / 2,
          width: Math.round(w), height: Math.round(h), rotation: 0,
          visible: true, locked: false, opacity: 1.0,
          fill: '', stroke: '', strokeWidth: 0,
          filters: { brightness: 100, contrast: 100, saturate: 100, hueRotate: 0, blur: 0, sepia: 0, grayscale: 0 }
        };
        this.layers.push(newLayer);
        this.activeLayerId = newLayer.id;
        this.updateInspectorUI();
        this.render();
        this.saveState();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  getActiveLayer() {
    return this.layers.find(l => l.id === this.activeLayerId) || null;
  }

  deleteLayer(id) {
    this.layers = this.layers.filter(l => l.id !== id);
    if (this.activeLayerId === id) this.activeLayerId = null;
    this.updateInspectorUI();
    this.render();
    this.saveState();
  }

  updateInspectorUI() {
    // Layers List
    const listContainer = document.getElementById('layers-tree-list');
    if (listContainer) {
      listContainer.innerHTML = this.layers.map((layer) => `
        <div class="layer-item ${layer.id === this.activeLayerId ? 'selected' : ''}" data-layer-id="${layer.id}">
          <span style="display:flex; align-items:center; gap:6px;">
            <span>${layer.type === 'text' ? '🔤' : (layer.type === 'image' ? '🖼️' : (layer.type === 'brush' ? '🖌️' : '📐'))}</span>
            <span>${layer.name}</span>
          </span>
          <div class="layer-actions">
            <button class="layer-action-btn btn-toggle-vis" data-id="${layer.id}">${layer.visible ? '👁️' : '🚫'}</button>
            <button class="layer-action-btn btn-toggle-lock" data-id="${layer.id}">${layer.locked ? '🔒' : '🔓'}</button>
            <button class="layer-action-btn btn-del-layer" data-id="${layer.id}">🗑️</button>
          </div>
        </div>
      `).reverse().join('');

      listContainer.querySelectorAll('.layer-item').forEach(el => {
        el.addEventListener('click', (e) => {
          if (e.target.classList.contains('layer-action-btn')) return;
          this.activeLayerId = el.getAttribute('data-layer-id');
          this.updateInspectorUI();
          this.render();
        });
      });

      listContainer.querySelectorAll('.btn-toggle-vis').forEach(b => {
        b.addEventListener('click', () => {
          const l = this.layers.find(item => item.id === b.getAttribute('data-id'));
          if (l) { l.visible = !l.visible; this.render(); this.updateInspectorUI(); }
        });
      });

      listContainer.querySelectorAll('.btn-del-layer').forEach(b => {
        b.addEventListener('click', () => this.deleteLayer(b.getAttribute('data-id')));
      });
    }

    // Property Inputs
    const active = this.getActiveLayer();
    if (active) {
      document.getElementById('prop-x').value = active.x;
      document.getElementById('prop-y').value = active.y;
      document.getElementById('prop-w').value = active.width;
      document.getElementById('prop-h').value = active.height;
      document.getElementById('prop-opacity').value = active.opacity ?? 1.0;
      document.getElementById('prop-fill-color').value = active.fill || '#00f2fe';
      document.getElementById('prop-stroke-color').value = active.stroke || '#000000';
      document.getElementById('prop-stroke-width').value = active.strokeWidth || 0;

      if (active.type === 'text') {
        document.getElementById('typography-controls-box').style.display = 'flex';
        document.getElementById('prop-text-content').value = active.text || '';
        document.getElementById('prop-font-family').value = active.fontFamily || "'Cinzel', serif";
        document.getElementById('prop-font-size').value = active.fontSize || 36;
      } else {
        document.getElementById('typography-controls-box').style.display = 'none';
      }

      if (active.filters) {
        document.getElementById('filter-brightness').value = active.filters.brightness || 100;
        document.getElementById('filter-contrast').value = active.filters.contrast || 100;
        document.getElementById('filter-saturate').value = active.filters.saturate || 100;
        document.getElementById('filter-hue').value = active.filters.hueRotate || 0;
      }
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.bgColor) {
      this.ctx.fillStyle = this.bgColor;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    this.layers.forEach(layer => {
      if (!layer.visible) return;

      this.ctx.save();
      this.ctx.globalAlpha = layer.opacity ?? 1.0;

      const cx = layer.x + layer.width / 2;
      const cy = layer.y + layer.height / 2;

      if (layer.shadow) {
        this.ctx.shadowColor = layer.shadow.color;
        this.ctx.shadowBlur = layer.shadow.blur;
        this.ctx.shadowOffsetX = layer.shadow.offsetX;
        this.ctx.shadowOffsetY = layer.shadow.offsetY;
      }

      if (layer.type === 'rect') {
        this.ctx.fillStyle = layer.fill;
        this.ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
        if (layer.strokeWidth > 0) {
          this.ctx.strokeStyle = layer.stroke;
          this.ctx.lineWidth = layer.strokeWidth;
          this.ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
        }
      } else if (layer.type === 'circle') {
        this.ctx.beginPath();
        this.ctx.ellipse(cx, cy, layer.width / 2, layer.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = layer.fill;
        this.ctx.fill();
        if (layer.strokeWidth > 0) {
          this.ctx.strokeStyle = layer.stroke;
          this.ctx.lineWidth = layer.strokeWidth;
          this.ctx.stroke();
        }
      } else if (layer.type === 'triangle') {
        this.ctx.beginPath();
        this.ctx.moveTo(cx, layer.y);
        this.ctx.lineTo(layer.x + layer.width, layer.y + layer.height);
        this.ctx.lineTo(layer.x, layer.y + layer.height);
        this.ctx.closePath();
        this.ctx.fillStyle = layer.fill;
        this.ctx.fill();
      } else if (layer.type === 'star') {
        this.drawStar(cx, cy, 5, layer.width / 2, layer.width / 4, layer.fill, layer.stroke, layer.strokeWidth);
      } else if (layer.type === 'text') {
        this.ctx.fillStyle = layer.fill;
        this.ctx.font = `${layer.fontSize || 36}px ${layer.fontFamily || "'Outfit', sans-serif"}`;
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(layer.text || '', layer.x, layer.y);
      } else if (layer.type === 'image' && layer.imageSrc) {
        const img = new Image();
        img.src = layer.imageSrc;
        if (layer.filters) {
          const f = layer.filters;
          this.ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) hue-rotate(${f.hueRotate}deg) blur(${f.blur || 0}px) sepia(${f.sepia || 0}%) grayscale(${f.grayscale || 0}%)`;
        }
        this.ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
      } else if (layer.type === 'brush' && layer.points) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = layer.stroke;
        this.ctx.lineWidth = layer.strokeWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        if (layer.brushStyle === 'neon') {
          this.ctx.shadowColor = layer.stroke;
          this.ctx.shadowBlur = 15;
        }
        layer.points.forEach((p, idx) => {
          if (idx === 0) this.ctx.moveTo(p.x, p.y);
          else this.ctx.lineTo(p.x, p.y);
        });
        this.ctx.stroke();
      }

      this.ctx.restore();
    });

    // Selection gizmo
    const active = this.getActiveLayer();
    if (active && this.activeTool === 'select' && active.type !== 'brush') {
      this.ctx.save();
      this.ctx.strokeStyle = '#00f2fe';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([4, 4]);
      this.ctx.strokeRect(active.x - 2, active.y - 2, active.width + 4, active.height + 4);
      this.ctx.setLineDash([]);

      // Resize Handle (Bottom-Right)
      this.ctx.fillStyle = '#00f2fe';
      this.ctx.fillRect(active.x + active.width - 6, active.y + active.height - 6, 12, 12);
      this.ctx.restore();
    }
  }

  drawStar(cx, cy, spikes, outerRadius, innerRadius, fill, stroke, strokeWidth) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      this.ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
    }
    this.ctx.lineTo(cx, cy - outerRadius);
    this.ctx.closePath();
    this.ctx.fillStyle = fill;
    this.ctx.fill();
    if (strokeWidth > 0) {
      this.ctx.strokeStyle = stroke;
      this.ctx.lineWidth = strokeWidth;
      this.ctx.stroke();
    }
  }

  saveState() {
    const state = JSON.stringify({
      width: this.width,
      height: this.height,
      bgColor: this.bgColor,
      layers: this.layers
    });

    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(state);
    this.historyIndex++;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.loadState(this.history[this.historyIndex]);
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.loadState(this.history[this.historyIndex]);
    }
  }

  loadState(stateJson) {
    const data = JSON.parse(stateJson);
    this.width = data.width;
    this.height = data.height;
    this.bgColor = data.bgColor;
    this.layers = data.layers;
    this.resizeCanvas(this.width, this.height);
    this.updateInspectorUI();
    this.render();
  }

  exportImage(type = 'png') {
    const link = document.createElement('a');
    link.download = `bitigey-design-${Date.now()}.${type}`;
    link.href = this.canvas.toDataURL(`image/${type}`, 0.95);
    link.click();
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
  }

  exportSVG() {
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}">\n`;
    svg += `  <rect width="100%" height="100%" fill="${this.bgColor}" />\n`;
    this.layers.forEach(l => {
      if (!l.visible) return;
      if (l.type === 'rect') {
        svg += `  <rect x="${l.x}" y="${l.y}" width="${l.width}" height="${l.height}" fill="${l.fill}" />\n`;
      } else if (l.type === 'circle') {
        svg += `  <ellipse cx="${l.x + l.width/2}" cy="${l.y + l.height/2}" rx="${l.width/2}" ry="${l.height/2}" fill="${l.fill}" />\n`;
      } else if (l.type === 'text') {
        svg += `  <text x="${l.x}" y="${l.y + l.fontSize}" font-family="${l.fontFamily}" font-size="${l.fontSize}" fill="${l.fill}">${l.text}</text>\n`;
      }
    });
    svg += `</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = `bitigey-vector-${Date.now()}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
  }

  exportJSON() {
    const project = {
      version: '1.0.0',
      title: 'Bitigey Design Project',
      author: 'Tunahan Haksever',
      canvasWidth: this.width,
      canvasHeight: this.height,
      backgroundColor: this.bgColor,
      layers: this.layers,
      createdAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'project.bitigey.json';
    link.href = URL.createObjectURL(blob);
    link.click();
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
  }

  importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        this.width = data.canvasWidth || 800;
        this.height = data.canvasHeight || 800;
        this.bgColor = data.backgroundColor || '#0a0d14';
        this.layers = data.layers || [];
        this.resizeCanvas(this.width, this.height);
        this.updateInspectorUI();
        this.render();
        this.saveState();
      } catch (err) {
        alert('Geçersiz proje JSON dosyası!');
      }
    };
    reader.readAsText(file);
  }

  loadSampleDesign() {
    this.layers = [
      {
        id: 'bg-card',
        name: 'Arkaplan Kartı',
        type: 'rect',
        x: 80, y: 80, width: 640, height: 640, rotation: 0,
        visible: true, locked: false, opacity: 1.0,
        fill: '#0f172a', stroke: '#00f2fe', strokeWidth: 2,
        shadow: { color: 'rgba(0, 242, 254, 0.25)', blur: 25, offsetX: 0, offsetY: 8 }
      },
      {
        id: 'brand-title',
        name: 'Lüks Başlık',
        type: 'text',
        text: 'BİTİGEY DİJİTAL SANAT',
        fontFamily: "'Cinzel', serif",
        fontSize: 44,
        x: 120, y: 180, width: 560, height: 60, rotation: 0,
        visible: true, locked: false, opacity: 1.0,
        fill: '#f59e0b'
      },
      {
        id: 'subtitle',
        name: 'Açıklama',
        type: 'text',
        text: 'Özgür Edebi Üretim & Yeni Nesil Vektör Tasarımı',
        fontFamily: "'Outfit', sans-serif",
        fontSize: 20,
        x: 120, y: 260, width: 560, height: 40, rotation: 0,
        visible: true, locked: false, opacity: 0.85,
        fill: '#cbd5e1'
      },
      {
        id: 'author-tag',
        name: 'Yazar İmzası',
        type: 'text',
        text: 'Tunahan Haksever',
        fontFamily: "'Pacifico', cursive",
        fontSize: 28,
        x: 120, y: 620, width: 300, height: 40, rotation: 0,
        visible: true, locked: false, opacity: 1.0,
        fill: '#00f2fe'
      }
    ];
  }

  loadTemplate(name) {
    if (name === 'instagram-post') {
      this.resizeCanvas(1080, 1080);
      this.bgColor = '#0a0d14';
      this.layers = [
        { id: '1', name: 'Glow Circle', type: 'circle', x: 290, y: 290, width: 500, height: 500, rotation: 0, visible: true, locked: false, opacity: 0.3, fill: '#00f2fe' },
        { id: '2', name: 'Post Title', type: 'text', text: 'YENİ ÇAĞIN ESTETİĞİ', fontFamily: "'Cinzel', serif", fontSize: 64, x: 140, y: 460, width: 800, height: 80, rotation: 0, visible: true, locked: false, opacity: 1, fill: '#f59e0b' }
      ];
    } else if (name === 'story-reels') {
      this.resizeCanvas(1080, 1920);
      this.bgColor = '#05070e';
      this.layers = [
        { id: '1', name: 'Banner Card', type: 'rect', x: 80, y: 500, width: 920, height: 900, rotation: 0, visible: true, locked: false, opacity: 1, fill: '#111827', stroke: '#f59e0b', strokeWidth: 4 },
        { id: '2', name: 'Story Quote', type: 'text', text: '"Söz, zamana atılan imzadır."', fontFamily: "'Playfair Display', serif", fontSize: 52, x: 140, y: 800, width: 800, height: 100, rotation: 0, visible: true, locked: false, opacity: 1, fill: '#ffffff' },
        { id: '3', name: 'Author', type: 'text', text: 'Tunahan Haksever', fontFamily: "'Outfit', sans-serif", fontSize: 36, x: 140, y: 1000, width: 400, height: 60, rotation: 0, visible: true, locked: false, opacity: 0.9, fill: '#00f2fe' }
      ];
    } else if (name === 'youtube-thumbnail') {
      this.resizeCanvas(1280, 720);
      this.bgColor = '#090a0f';
      this.layers = [
        { id: '1', name: 'Thumb Title', type: 'text', text: 'SÜPER HIZLI TASARIM!', fontFamily: "'Outfit', sans-serif", fontSize: 72, x: 80, y: 280, width: 1000, height: 100, rotation: 0, visible: true, locked: false, opacity: 1, fill: '#f59e0b' }
      ];
    } else if (name === 'book-cover') {
      this.resizeCanvas(800, 1200);
      this.bgColor = '#080a12';
      this.layers = [
        { id: '1', name: 'Cover Frame', type: 'rect', x: 50, y: 50, width: 700, height: 1100, rotation: 0, visible: true, locked: false, opacity: 1, fill: '#0f172a', stroke: '#f59e0b', strokeWidth: 3 },
        { id: '2', name: 'Book Title', type: 'text', text: 'MÂSİVÂ YOLCULUĞU', fontFamily: "'Cinzel', serif", fontSize: 48, x: 100, y: 260, width: 600, height: 70, rotation: 0, visible: true, locked: false, opacity: 1, fill: '#f59e0b' },
        { id: '3', name: 'Book Author', type: 'text', text: 'Tunahan Haksever', fontFamily: "'Playfair Display', serif", fontSize: 26, x: 100, y: 980, width: 400, height: 50, rotation: 0, visible: true, locked: false, opacity: 0.9, fill: '#00f2fe' }
      ];
    }
    this.updateInspectorUI();
    this.render();
    this.saveState();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.studio = new DesignStudio();
});
