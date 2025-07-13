// Mix colors and generate similar palette
const mixInput1 = document.getElementById('mix-color-1');
const mixInput2 = document.getElementById('mix-color-2');
const mixBtn = document.getElementById('mix-generate-btn');
const similarInput = document.getElementById('similar-color-input');
const similarBtn = document.getElementById('similar-generate-btn');

// Utility: set input background if valid hex
function setInputBgIfValid(input) {
    const val = input.value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        input.style.background = val;
        input.style.color = '#fff';
        input.style.borderColor = '';
    } else {
        input.style.background = '';
        input.style.color = '';
        input.style.borderColor = '';
    }
}

// Live update for all color inputs
[mixInput1, mixInput2, similarInput].forEach(input => {
    input.addEventListener('input', function() { setInputBgIfValid(input); });
});

mixBtn.addEventListener('click', function() {
    let hex1 = mixInput1.value.trim();
    let hex2 = mixInput2.value.trim();
    let valid = true;
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex1)) {
        mixInput1.style.borderColor = '#e11d48';
        mixInput1.style.background = '#ffe4e6';
        valid = false;
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex2)) {
        mixInput2.style.borderColor = '#e11d48';
        mixInput2.style.background = '#ffe4e6';
        valid = false;
    }
    if (!valid) {
        setTimeout(() => {
            setInputBgIfValid(mixInput1);
            setInputBgIfValid(mixInput2);
        }, 1200);
        return;
    }
    setInputBgIfValid(mixInput1);
    setInputBgIfValid(mixInput2);
    const mixed = mixHexColors(hex1, hex2);
    const palette = generateSimilarColors(mixed, 5);
    palette[0] = mixed;
    updatePaletteDisplay(palette);
});

similarBtn.addEventListener('click', function() {
    let hex = similarInput.value.trim();
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        similarInput.style.borderColor = '#e11d48';
        similarInput.style.background = '#ffe4e6';
        setTimeout(() => {
            setInputBgIfValid(similarInput);
        }, 1200);
        return;
    }
    setInputBgIfValid(similarInput);
    const similarColors = generateSimilarColors(hex.toUpperCase(), 5);
    updatePaletteDisplay(similarColors);
});

// Mix two hex colors (average RGB)
function mixHexColors(hex1, hex2) {
    function hexToRgb(hex) {
        return [1, 3, 5].map(i => parseInt(hex.slice(i, i+2), 16));
    }
    function rgbToHex([r, g, b]) {
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    }
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    const mixed = rgb1.map((v, i) => Math.round((v + rgb2[i]) / 2));
    return rgbToHex(mixed);
}
const generateBtn = document.getElementById('generate-btn');
const paletteContainer = document.querySelector('.palette-container');

generateBtn.addEventListener('click', generatePalette);

function generatePalette() {
    const colors = [];
    for(let i = 0; i < 5; i++) {
        colors.push(generateRandomColor());
    }
    updatePaletteDisplay(colors);
}

function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for(let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function updatePaletteDisplay(colors) {
    const colorBoxes = document.querySelectorAll('.color-box');
    colorBoxes.forEach((box, index) => {
        const color = colors[index];
        const colorDiv = box.querySelector('.color');
        const hexValue = box.querySelector('.hex-value');
        const copyBtn = box.querySelector('.copy-btn');

        colorDiv.style.backgroundColor = color;
        hexValue.textContent = color;

        // Reset icon to original (do not change color)
        copyBtn.classList.remove('copied', 'copy-failed', 'fa-check', 'fa-times', 'fa-solid');
        copyBtn.classList.add('fa-copy', 'far');
    });
}


// Clipboard copy logic with icon feedback and color click for similar colors
paletteContainer.addEventListener('click', function(e) {
    // Clipboard copy
    if (e.target.classList.contains('copy-btn')) {
        const colorBox = e.target.closest('.color-box');
        const hexValue = colorBox.querySelector('.hex-value').textContent;
        navigator.clipboard.writeText(hexValue).then(() => {
            // Success: green check
            e.target.classList.remove('fa-copy', 'fa-times', 'copy-failed', 'far');
            e.target.classList.add('fa-solid', 'fa-check', 'copied');
            setTimeout(() => {
                e.target.classList.remove('fa-solid', 'fa-check', 'copied');
                e.target.classList.add('fa-copy', 'far');
            }, 1200);
        }).catch(() => {
            // Failure: red x
            e.target.classList.remove('fa-copy', 'fa-check', 'copied', 'far');
            e.target.classList.add('fa-solid', 'fa-times', 'copy-failed');
            setTimeout(() => {
                e.target.classList.remove('fa-solid', 'fa-times', 'copy-failed');
                e.target.classList.add('fa-copy', 'far');
            }, 1200);
        });
    }
    // Generate similar colors on color click
    if (e.target.classList.contains('color')) {
        const colorBox = e.target.closest('.color-box');
        const hexValue = colorBox.querySelector('.hex-value').textContent;
        const similarColors = generateSimilarColors(hexValue, 5);
        updatePaletteDisplay(similarColors);
    }
});

// Generate n similar colors to a base hex color
function generateSimilarColors(baseHex, n) {
    // Convert hex to HSL
    function hexToHSL(hex) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 7) {
            r = parseInt(hex.slice(1, 3), 16) / 255;
            g = parseInt(hex.slice(3, 5), 16) / 255;
            b = parseInt(hex.slice(5, 7), 16) / 255;
        }
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h * 360, s * 100, l * 100];
    }
    // Convert HSL to hex
    function hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        let c = (1 - Math.abs(2 * l - 1)) * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1));
        let m = l - c / 2;
        let r = 0, g = 0, b = 0;
        if (0 <= h && h < 60) { r = c; g = x; b = 0; }
        else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
        else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    }
    const [h, s, l] = hexToHSL(baseHex);
    const colors = [];
    for (let i = 0; i < n; i++) {
        // Vary hue slightly, and lightness/saturation a bit
        let newH = (h + (i - Math.floor(n/2)) * 12 + 360) % 360;
        let newS = Math.min(100, Math.max(30, s + (Math.random() - 0.5) * 10));
        let newL = Math.min(95, Math.max(10, l + (Math.random() - 0.5) * 10));
        colors.push(hslToHex(newH, newS, newL));
    }
    return colors;
}

// Utility: set input background if valid hex
function setInputBgIfValid(input) {
    const val = input.value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        input.style.background = val;
        input.style.color = '#fff';
        input.style.borderColor = '';
    } else {
        input.style.background = '';
        input.style.color = '';
        input.style.borderColor = '';
    }
}

// Live update for mix inputs
mixInput1.addEventListener('input', function() { setInputBgIfValid(mixInput1); });
mixInput2.addEventListener('input', function() { setInputBgIfValid(mixInput2); });

// Live update for similar input
similarInput.addEventListener('input', function() { setInputBgIfValid(similarInput); });

generatePalette();