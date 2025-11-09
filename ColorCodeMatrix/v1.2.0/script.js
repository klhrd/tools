// v1.2.0
document.addEventListener('DOMContentLoaded', () => {

    // --- I. 獲取 DOM 元素 ---
    
    // v1.2.0: 選單系統
    const menuEncoder = document.getElementById('menu-encoder');
    const menuDecoder = document.getElementById('menu-decoder');
    const tabEncoder = document.getElementById('tab-encoder');
    const tabDecoder = document.getElementById('tab-decoder');

    // 生成器
    const textInput = document.getElementById('text-input');
    const blockWidthInput = document.getElementById('block-width');
    const blockHeightInput = document.getElementById('block-height');
    const generateButton = document.getElementById('generate-button');
    const canvas = document.getElementById('color-canvas');
    const ctx = canvas.getContext('2d');
    const tooltip = document.getElementById('tooltip');
    
    // 匯出
    const exportPngButton = document.getElementById('export-png-button');
    const exportPdfButton = document.getElementById('export-pdf-button');
    
    // 解碼器
    const imageUpload = document.getElementById('image-upload');
    const decodeButton = document.getElementById('decode-button');
    const decodedOutput = document.getElementById('decoded-output');
    const decodeCanvas = document.getElementById('decode-canvas');
    const decodeCtx = decodeCanvas.getContext('2d');

    // 全域變數
    let blockData = []; // 儲存色塊資訊
    const { jsPDF } = window.jspdf; // 從 window 獲取 jsPDF
    const CANVAS_BACKGROUND_COLOR = '#FFFFFF';
    const CANVAS_BACKGROUND_RGB = [255, 255, 255]; // v1.2.0
    const MAX_CANVAS_WIDTH = 16384; // v1.1.0

    // --- II. 輔助函式 ---

    const unicodeToHexColor = (codePoint) => {
        let hex = codePoint.toString(16);
        return '#' + hex.padStart(6, '0');
    };

    const hexColorToUnicode = (hexColor) => {
        const hex = hexColor.replace('#', '');
        return parseInt(hex, 16);
    };

    const getTimestamp = () => Math.floor(Date.now() / 1000);

    // --- III. v1.2.0: 選單切換邏輯 ---
    
    function switchTab(activeTab, activeMenu) {
        // 隱藏所有
        tabEncoder.classList.remove('active');
        tabDecoder.classList.remove('active');
        menuEncoder.classList.remove('active');
        menuDecoder.classList.remove('active');
        
        // 顯示目標
        activeTab.classList.add('active');
        activeMenu.classList.add('active');
    }
    
    menuEncoder.addEventListener('click', () => switchTab(tabEncoder, menuEncoder));
    menuDecoder.addEventListener('click', () => switchTab(tabDecoder, menuDecoder));


    // --- IV. 核心功能：生成器 (v1.1.0, 無變更) ---
    // v1.1.0 的自動換行邏輯已足夠穩健
    function generateColorBand() {
        const text = textInput.value;
        const blockWidth = parseInt(blockWidthInput.value);
        const blockHeight = parseInt(blockHeightInput.value);

        if (isNaN(blockWidth) || blockWidth < 5 || isNaN(blockHeight) || blockHeight < 5) {
            alert('區塊寬高必須為大於 5 的正整數！');
            return;
        }
        
        blockData = []; 
        const chars = Array.from(text);
        
        let currentX = 0;
        let currentY = 0;
        let max_x = 0; 

        for (const char of chars) {
            if (char === '\n') {
                if (currentX > max_x) max_x = currentX; 
                currentX = 0;
                currentY += blockHeight;
                continue;
            }

            if (currentX + blockWidth > MAX_CANVAS_WIDTH) {
                if (currentX > max_x) max_x = currentX; 
                currentX = 0;
                currentY += blockHeight;
            }
            
            const codePoint = char.codePointAt(0);
            const color = unicodeToHexColor(codePoint);
            const x = currentX;
            const y = currentY;

            blockData.push({
                x, y,
                width: blockWidth,
                height: blockHeight,
                char: char,
                color: color,
                unicodeDec: codePoint,
                unicodeHex: 'U+' + codePoint.toString(16).toUpperCase().padStart(4, '0')
            });

            currentX += blockWidth;
        }

        if (currentX > max_x) max_x = currentX; 
        if (max_x === 0 && blockData.length > 0) max_x = blockWidth; 
        if (text.length === 0) max_x = 0; 

        canvas.width = max_x > 0 ? max_x : 300; 
        canvas.height = (blockData.length > 0) ? currentY + blockHeight : blockHeight; 

        ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (const block of blockData) {
            ctx.fillStyle = block.color;
            ctx.fillRect(block.x, block.y, block.width, block.height);
        }
    }


    // --- V. 核心功能：匯出 ---

    function exportPNG() {
        if (blockData.length === 0) {
            alert('請先生成色塊矩陣！');
            return;
        }
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `color_matrix_${getTimestamp()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    /**
     * v1.2.0: 匯出 PDF (支援多頁)
     */
    function exportPDF() {
        if (blockData.length === 0) {
            alert('請先生成色塊矩陣！');
            return;
        }
        
        try {
            const pdf = new jsPDF('p', 'pt', 'a4');
            const a4Width = pdf.internal.pageSize.getWidth();
            const a4Height = pdf.internal.pageSize.getHeight();
            const padding = 40;
            const pageContentWidth = a4Width - 2 * padding;
            const pageContentHeight = a4Height - 2 * padding;

            // 1. 計算縮放
            const scaleFactor = pageContentWidth / canvas.width;
            const scaledHeight = canvas.height * scaleFactor;
            const scaledWidth = pageContentWidth;

            // 2. 建立臨時 canvas 用於分頁
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = canvas.width;

            // 3. 計算每頁需要裁切的原始高度
            const sourceChunkHeight = Math.floor(pageContentHeight / scaleFactor);
            
            let sourceY = 0;
            let pageIndex = 0;

            while (sourceY < canvas.height) {
                if (pageIndex > 0) {
                    pdf.addPage();
                }
                
                // 4. 計算當前頁要繪製的高度
                const h = Math.min(sourceChunkHeight, canvas.height - sourceY);
                tempCanvas.height = h;

                // 5. 將原始 canvas 的「一塊」繪製到臨時 canvas
                tempCtx.drawImage(canvas, 0, sourceY, canvas.width, h, 0, 0, canvas.width, h);
                const chunkDataUrl = tempCanvas.toDataURL('image/png');
                
                // 6. 將這「一塊」加入 PDF
                const chunkHeightInPdf = h * scaleFactor;
                pdf.addImage(chunkDataUrl, 'PNG', padding, padding, scaledWidth, chunkHeightInPdf);
                
                sourceY += h;
                pageIndex++;
            }

            pdf.save(`color_matrix_${getTimestamp()}.pdf`);

        } catch (e) {
            console.error(e);
            alert('匯出 PDF 失敗，請檢查主控台錯誤。');
        }
    }

    // --- VI. 核心功能：解碼器 (v1.2.0 重寫) ---

    async function decodeImage() {
        if (!imageUpload.files.length) {
            decodedOutput.textContent = '錯誤：請先選擇一個檔案。';
            return;
        }

        decodedOutput.textContent = '解碼中...';
        decodeButton.disabled = true;
        
        try {
            const file = imageUpload.files[0];
            const img = await loadImageFromFile(file);
            
            decodeCanvas.width = img.width;
            decodeCanvas.height = img.height;
            decodeCtx.drawImage(img, 0, 0);
            
            const imageData = decodeCtx.getImageData(0, 0, img.width, img.height);
            
            // v1.2.0: 執行穩健的資料查找
            const dataMatrix = findDataMatrix(imageData);
            
            if (!dataMatrix) {
                throw new Error('無法偵測到有效的資料矩陣。請確認圖片未嚴重失真，且非純色背景。');
            }

            // v1.2.0: 執行穩健的採樣
            const decodedText = sampleAndDecode(imageData, dataMatrix);
            decodedOutput.textContent = decodedText;

        } catch (e) {
            console.error(e);
            decodedOutput.textContent = `解碼失敗：${e.message}`;
        } finally {
            decodeButton.disabled = false;
        }
    }

    /**
     * 輔助函式：將 File 物件載入為 Image 物件 (v1.0.0)
     */
    function loadImageFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const tempImg = new Image();
                tempImg.onload = () => resolve(tempImg);
                tempImg.onerror = (err) => reject(new Error('圖片載入失敗。'));
                tempImg.src = event.target.result;
            };
            reader.onerror = () => reject(new Error('讀取檔案失敗。'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * v1.2.0: 智慧查找資料矩陣
     * 掃描圖像，跳過邊框和背景，找到第一個有效資料塊的座標和尺寸。
     */
    function findDataMatrix(imageData) {
        const { data, width, height } = imageData;
        const [R_BG, G_BG, B_BG] = CANVAS_BACKGROUND_RGB;

        const getPixel = (x, y) => {
            if (x >= width || y >= height) return null;
            const index = (y * width + x) * 4;
            return [data[index], data[index+1], data[index+2]];
        };

        const isBg = (pixel) => {
            return pixel[0] === R_BG && pixel[1] === G_BG && pixel[2] === B_BG;
        };

        // 1. 尋找第一個非背景的像素 (dataX, dataY)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelA = getPixel(x, y);
                
                if (isBg(pixelA)) continue; 
                // 找到了第一個非背景像素 A at (x, y)
                
                // 2. 測量 A 的寬度 (blockWidth)
                let w = 1;
                while (x + w < width) {
                    const nextPixel = getPixel(x + w, y);
                    if (nextPixel[0] !== pixelA[0] || nextPixel[1] !== pixelA[1] || nextPixel[2] !== pixelA[2]) {
                        break;
                    }
                    w++;
                }
                const blockWidth = w;
                
                // 3. 測量 A 的高度 (blockHeight)
                let h = 1;
                while (y + h < height) {
                    const nextPixel = getPixel(x, y + h);
                    if (nextPixel[0] !== pixelA[0] || nextPixel[1] !== pixelA[1] || nextPixel[2] !== pixelA[2]) {
                        break;
                    }
                    h++;
                }
                const blockHeight = h;

                // 4. 穩健性檢查
                if (blockWidth < 5 || blockHeight < 5) continue; // 忽略雜訊
                
                // 檢查 (x + blockWidth, y) 處的像素 B
                const pixelB = getPixel(x + blockWidth, y);
                
                // 檢查 (x, y + blockHeight) 處的像素 C
                const pixelC = getPixel(x, y + blockHeight);

                // 條件：如果 A, B, C 都是同色，或 A, B, C 都是背景色，
                // 這可能是邊框或無效資料。
                
                // 理想的資料矩陣：
                // 1. A 不是背景色
                // 2. B 不是背景色 (或 B 是背景色，如果 A 是行尾)
                // 3. C 不是背景色 (或 C 是背景色，如果 A 是列尾)
                
                // 只要找到的第一個色塊A，其右側(B)或下方(C)
                // 不是同色，也不是背景，就是一個強訊號。
                if (pixelB && !isBg(pixelB) && (pixelB[0] !== pixelA[0] || pixelB[1] !== pixelA[1] || pixelB[2] !== pixelA[2])) {
                    // A B 顏色不同，且都不是背景 -> 找到資料！
                    return { dataX: x, dataY: y, blockWidth, blockHeight };
                }
                
                if (pixelC && !isBg(pixelC) && (pixelC[0] !== pixelA[0] || pixelC[1] !== pixelA[1] || pixelC[2] !== pixelA[2])) {
                    // A C 顏色不同，且都不是背景 -> 找到資料！
                    return { dataX: x, dataY: y, blockWidth, blockHeight };
                }
                
                // 如果 A 的右側和下方都是背景色（單個色塊），也將其視為有效資料
                if ( (pixelB && isBg(pixelB)) || (pixelC && isBg(pixelC)) ) {
                     return { dataX: x, dataY: y, blockWidth, blockHeight };
                }
                
                // 如果 A 的右側或下方是同色，這可能是邊框，
                // 繼續掃描 (y, x) 迴圈會自動跳過這個區塊。
            }
        }
        
        return null; // 找不到
    }

    /**
     * v1.2.0: 穩健的採樣與解碼
     * 根據 findDataMatrix 提供的偏移量和尺寸進行採樣。
     */
    function sampleAndDecode(imageData, dataMatrix) {
        const { data, width: imgWidth, height: imgHeight } = imageData;
        const { dataX, dataY, blockWidth, blockHeight } = dataMatrix;
        
        const totalRows = Math.floor((imgHeight - dataY) / blockHeight);
        const totalCols = Math.floor((imgWidth - dataX) / blockWidth);

        const sampleOffsetX = Math.floor(blockWidth / 2);
        const sampleOffsetY = Math.floor(blockHeight / 2);
        
        let robustText = '';
        
        for (let r = 0; r < totalRows; r++) {
             let lineHasChar = false;
             let lineText = '';
             
             for (let c = 0; c < totalCols; c++) {
                 const sampleX = dataX + c * blockWidth + sampleOffsetX;
                 const sampleY = dataY + r * blockHeight + sampleOffsetY;

                 if (sampleX >= imgWidth || sampleY >= imgHeight) continue; // 超出邊界

                 const dataIndex = (sampleY * imgWidth + sampleX) * 4;
                 const R = data[dataIndex];
                 const G = data[dataIndex + 1];
                 const B = data[dataIndex + 2];
                 const A = data[dataIndex + 3];

                 // v1.2.0: 增加透明度檢查，和背景色檢查
                 if (A < 128) continue; // 忽略透明
                 if (R === CANVAS_BACKGROUND_RGB[0] && G === CANVAS_BACKGROUND_RGB[1] && B === CANVAS_BACKGROUND_RGB[2]) {
                     if (lineHasChar) lineText += ' '; // 補空格
                     continue;
                 }
                 
                 lineHasChar = true;
                 
                 const hexR = R.toString(16).padStart(2, '0');
                 const hexG = G.toString(16).padStart(2, '0');
                 const hexB = B.toString(16).padStart(2, '0');
                 const hexColor = `#${hexR}${hexG}${hexB}`;
                 
                 try {
                     lineText += String.fromCodePoint(hexColorToUnicode(hexColor));
                 } catch (e) { 
                     lineText += '?'; // 無效碼點
                 }
             }
             
             if (lineHasChar) {
                 robustText += lineText.trimEnd() + '\n';
             }
        }
        
        return robustText.trim(); // 移除末尾多餘的換行
    }

    // --- VII. 事件監聽器 ---

    // 生成
    generateButton.addEventListener('click', generateColorBand);

    // 匯出
    exportPngButton.addEventListener('click', exportPNG);
    exportPdfButton.addEventListener('click', exportPDF);

    // 懸停
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        let hit = false;
        for (const block of blockData) {
            if (mouseX >= block.x && mouseX < (block.x + block.width) &&
                mouseY >= block.y && mouseY < (block.y + block.height)) {
                
                const charDisplay = block.char === ' ' ? '(空白)' : block.char;
                tooltip.innerHTML = `
                    <b>字元:</b> ${charDisplay}<br>
                    <b>色號:</b> ${block.color}<br>
                    <b>Unicode:</b> ${block.unicodeHex} (${block.unicodeDec})
                `;
                
                tooltip.style.left = `${e.pageX + 10}px`;
                tooltip.style.top = `${e.pageY + 10}px`;
                tooltip.style.display = 'block';
                hit = true;
                break;
            }
        }
        if (!hit) {
            tooltip.style.display = 'none';
        }
    });

    canvas.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });

    // 解碼
    imageUpload.addEventListener('change', () => {
        if (imageUpload.files.length > 0) {
            decodeButton.disabled = false;
            decodedOutput.textContent = '準備就緒，請點擊「開始解碼」。';
        } else {
            decodeButton.disabled = true;
        }
    });

    decodeButton.addEventListener('click', decodeImage);
    
    // --- VIII. 初始執行 ---
    
    // 頁面載入時自動生成一次
    generateColorBand();
});
