var font = null;
var fontSize = 32;
var textToRender = 'Grumpy wizards make toxic brew for the evil Queen and Jack.';
var previewPath = null;

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/\u0022/g, '&quot;')
         .replace(/\u0027/g, '&#039;');
}

function enableHighDPICanvas(canvas) {
    if (typeof canvas === 'string') {
        canvas = document.getElementById(canvas);
    }
    var pixelRatio = window.devicePixelRatio || 1;
    if (pixelRatio === 1) return;
    var oldWidth = canvas.width;
    var oldHeight = canvas.height;
    canvas.width = oldWidth * pixelRatio;
    canvas.height = oldHeight * pixelRatio;
    canvas.style.width = oldWidth + 'px';
    canvas.style.height = oldHeight + 'px';
    canvas.getContext('2d').scale(pixelRatio, pixelRatio);
}

function renderText() {
    if (!font) return;

    var previewCanvas = document.getElementById('preview');
    var previewCtx = previewCanvas.getContext("2d");
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    font.draw(previewCtx, textToRender, 0, 32, fontSize, {
        kerning: true,
        features: [
        /**
         * these 4 features are required to render Arabic text properly
         * and shouldn't be turned off when rendering arabic text.
         */
            { script: 'arab', tags: ['init', 'medi', 'fina', 'rlig'] },
            { script: 'latn', tags: ['liga', 'rlig'] }
        ]
    });
}

function showErrorMessage(message) {
    var el = document.getElementById('message');
    if (!message || message.trim().length === 0) {
        el.style.display = 'none';
    } else {
        el.style.display = 'block';
    }
    el.innerHTML = message;
}

function onFontLoaded(font) {
    window.font = font;
    renderText();
}

function onReadFile(e) {
    document.getElementById('font-name').innerHTML = '';
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            font = opentype.parse(e.target.result, {lowMemory:true});
            onFontLoaded(font);
            showErrorMessage('');
        } catch (err) {
            showErrorMessage(err.toString());
            if (err.stack) console.log(err.stack);
      throw(err);
        }
    };
    reader.onerror = function(err) {
        showErrorMessage(err.toString());
    };

    reader.readAsArrayBuffer(file);
}

function getDefaultFont(fonts) {
  const defaultFontNames = ["Monaco", "Tahoma", "DejaVuSansMono", "ArialMT"];
  for (const f of defaultFontNames) {
    if (f in fonts) {
      return fonts[f];
    }
  }
  return fonts[Object.keys(fonts)[0]];
}

(() => {
  window.addEventListener("EnumerationReady", async () => {
    enableHighDPICanvas('preview');

    const setFont = async (fontMeta) => {
      document.getElementById('font-name').innerHTML = fontMeta.fullName;
      if (!('blob' in fontMeta)) {
        alert('Error: FontMetadata needs blob() for this to work.');
      }
      try {
        let bytes = await fontMeta.blob();
        let buf = await bytes.arrayBuffer();

        let font = await opentype.parse(buf);
        onFontLoaded(font);
      } catch(e) {
        showErrorMessage(e.toString());
      }

    };

    if (!window.fontIsSet) {
      // Only set the font the first time.
      setFont(getDefaultFont(window.fonts));
      window.fontIsSet = true;
    }

    const fontSelectedHandler = async (e) => {
      const postscriptName = e.detail;
      if (postscriptName in window.fonts) {
        setFont(window.fonts[postscriptName]);
      } else {
        console.log(`Font not found: ${postscriptName}`);
      }
      document.removeEventListener('font-selected', fontSelectedHandler);
    };

    document.addEventListener('font-selected', fontSelectedHandler.bind(this));
  }, false);

  const showFontChooser = async () => {
    const fonts = {};
    const fontMetadata = await navigator.fonts.query({select: ['ArialMT']});
    for (const f of fontMetadata) {
      fonts[f.postscriptName] = f;
    }
    return fonts;
  };

  const importButton = document.querySelector("#import-fonts");

  if (!navigator.fonts || !navigator.fonts.query) {
    alert("Please use Chromium Canary and enable #enable-experimental-web-platform-features, #font-access and #font-access-chooser in chrome://flags");
    importButton.setAttribute("disabled", "true");
    return;
  }

  importButton.onclick = async () => {
    if (!window.fonts) {
      window.fonts = {};
    }
    window.fonts = Object.assign(window.fonts, await showFontChooser());
    window.dispatchEvent(new Event("EnumerationReady"));
  };

})();
