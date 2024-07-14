// ==UserScript==
// @name         ChatGPT Drawing Tool
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Adds a standalone drawing tool button to ChatGPT for drawing and copying images to clipboard
// @match        https://chatgpt.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chatgpt.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create the drawing button
    const drawingButton = document.createElement('button');
    drawingButton.innerHTML = '🖌️'; // Symbol for drawing
    drawingButton.style.position = 'fixed';
    drawingButton.style.right = '20px';
    drawingButton.style.bottom = '20px';
    drawingButton.style.padding = '10px';
    drawingButton.style.fontSize = '20px';
    drawingButton.style.cursor = 'pointer';
    drawingButton.style.backgroundColor = '#4CAF50';
    drawingButton.style.color = 'white';
    drawingButton.style.border = 'none';
    drawingButton.style.borderRadius = '5px';
    drawingButton.title = 'Draw';

    document.body.appendChild(drawingButton);

    // Create the drawing canvas modal
    const drawingModal = document.createElement('div');
    drawingModal.style.position = 'fixed';
    drawingModal.style.top = '0';
    drawingModal.style.left = '0';
    drawingModal.style.width = '100%';
    drawingModal.style.height = '100%';
    drawingModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    drawingModal.style.display = 'none';
    drawingModal.style.zIndex = '1000';
    drawingModal.style.alignItems = 'center';
    drawingModal.style.justifyContent = 'center';

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.border = '5px solid black';
    container.style.backgroundColor = 'white';
    container.style.position = 'relative';

    const canvasContainer = document.createElement('div');
    canvasContainer.id = 'canvas-container';
    canvasContainer.style.flex = '1';
    canvasContainer.style.display = 'block';
    canvasContainer.style.position = 'relative';
    canvasContainer.style.backgroundColor = 'white';

    const canvas = document.createElement('canvas');
    canvas.id = 'cfd';
    canvas.width = 500;
    canvas.height = 500;
    canvasContainer.appendChild(canvas);

    // Create options box
    const optionsBox = document.createElement('div');
    optionsBox.style.display = 'flex';
    optionsBox.style.flexDirection = 'column';
    optionsBox.style.alignItems = 'center';
    optionsBox.style.justifyContent = 'space-between';
    optionsBox.style.padding = '10px';
    optionsBox.style.backgroundColor = 'white';
    optionsBox.style.borderLeft = '5px solid black';
    optionsBox.style.height = '500px';

    const clearButton = document.createElement('button');
    clearButton.id = 'clear';
    clearButton.innerHTML = '🗑️'; // Trash can emoji
    clearButton.style.marginBottom = '10px';
    clearButton.style.fontSize = '20px';
    optionsBox.appendChild(clearButton);

    const copyButton = document.createElement('button');
    copyButton.id = 'copy';
    copyButton.innerHTML = '📋'; // Clipboard emoji
    copyButton.style.marginBottom = '10px';
    copyButton.style.fontSize = '20px';
    optionsBox.appendChild(copyButton);

    const colors = ['black', 'white'];
    colors.forEach(color => {
        const colorButton = document.createElement('button');
        colorButton.id = color;
        colorButton.className = 'color';
        colorButton.innerHTML = color === 'black' ? '⬛' : '⬜'; // Black and White Square emojis
        colorButton.style.backgroundColor = color;
        colorButton.style.color = color === 'white' ? 'black' : 'white';
        colorButton.style.margin = '2px';
        colorButton.style.width = '100%';
        colorButton.style.fontSize = '20px';
        optionsBox.appendChild(colorButton);
    });

    container.appendChild(canvasContainer);
    container.appendChild(optionsBox);
    drawingModal.appendChild(container);
    document.body.appendChild(drawingModal);

    // Drawing functionality
    const ctx = canvas.getContext('2d');
    let isPainting = false;
    let lineWidth = 5;
    let startX;
    let startY;
    ctx.strokeStyle = 'black';

    canvas.addEventListener('mousedown', (e) => {
        isPainting = true;
        startX = e.clientX - canvas.getBoundingClientRect().left;
        startY = e.clientY - canvas.getBoundingClientRect().top;
    });

    canvas.addEventListener('mouseup', () => {
        isPainting = false;
        ctx.beginPath();
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isPainting) return;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';

        const x = e.clientX - canvas.getBoundingClientRect().left;
        const y = e.clientY - canvas.getBoundingClientRect().top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    });

    clearButton.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    colors.forEach(color => {
        document.getElementById(color).addEventListener('click', () => {
            ctx.strokeStyle = color;
        });
    });

    drawingButton.onclick = () => {
        drawingModal.style.display = 'flex';
    };

    copyButton.onclick = async () => {
        const offScreenCanvas = document.createElement('canvas');
        const offScreenCtx = offScreenCanvas.getContext('2d');
        offScreenCanvas.width = canvas.width;
        offScreenCanvas.height = canvas.height;

        // Fill the offscreen canvas with a white background
        offScreenCtx.fillStyle = 'white';
        offScreenCtx.fillRect(0, 0, offScreenCanvas.width, offScreenCanvas.height);

        // Draw the original canvas on top of the white background
        offScreenCtx.drawImage(canvas, 0, 0);

        offScreenCanvas.toBlob(async (blob) => {
            const item = new ClipboardItem({ 'image/png': blob });
            try {
                await navigator.clipboard.write([item]);
                drawingModal.style.display = 'none';
            } catch (err) {
                console.error('Failed to copy image to clipboard: ', err);
            }
        });
    };

})();
