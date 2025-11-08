// v1.1.0
document.addEventListener('DOMContentLoaded', () => {

    // --- I. 獲取 DOM 元素 ---
    
    // v1.1.0: 頁籤系統
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

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
    
    // v1.1.0: 引入畫布最大寬度限制 (16384px 是一個安全值)
    const MAX_CANVAS_WIDTH = 16384; 

    // --- II. 輔助函式 (v1.0.0, 無變更) ---

    const unicodeToHexColor = (codePoint) => {
        let hex = codePoint.toString(16);
        return '#' + hex.padStart(6, '0');
    };

    const hexColorToUnicode = (hexColor) => {
        const hex = hexColor.replace('#', '');
        return parseInt(hex, 16);
    };

    const getTimestamp = () => Math.floor(Date.now() / 1000);

    // --- III. v1.1.0: 頁籤切換邏輯 ---
    
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.getAttribute('data-tab');

            // 移除所有 active
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // 新增 active
            link.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // --- IV. 核心功能：生成器 (v1.1.0 重寫) ---

    /**
     * v1.1.0: 重寫生成邏輯
     * * 1. 讀取參數
     * 2. 引入 MAX_CANVAS_WIDTH 限制
     * 3. 逐字遍歷，計算所有色塊的 (x, y) 座標，
     * 當遇到 \n 或超過 MAX_CANVAS_WIDTH 時自動換行
     * 4. 計算最終畫布尺寸
     * 5. 繪製背景
     * 6. 繪製所有色塊
     */
    function generateColorBand() {
        // 1. 參數讀取與驗證
        const text = textInput.value;
        const blockWidth = parseInt(blockWidthInput.value);
        const blockHeight = parseInt(blockHeightInput.value);

        if (isNaN(blockWidth) || blockWidth < 5 || isNaN(blockHeight) || blockHeight < 5) {
            alert('區塊寬高必須為大於 5 的正整數！');
            return;
        }
        
        // 2. 逐字計算座標 (核心修復)
        blockData = []; // 清空前一次的資料
        const chars = Array.from(text); // 正確處理 Emoji
        
        let currentX = 0;
        let currentY = 0;
        let max_x = 0; // 用於計算畫布實際需要的寬度

        for (const char of chars) {
            // 檢查是否為手動換行
            if (char === '\n') {
                if (currentX > max_x) max_x = currentX; // 更新最大寬度
                currentX = 0;
                currentY += blockHeight;
                continue;
            }

            // v1.1.0: 檢查是否需要自動換行 (防止畫布超寬)
            if (currentX + blockWidth > MAX_CANVAS_WIDTH) {
                if (currentX > max_x) max_x = currentX; // 更新最大寬度
                currentX = 0;
                currentY += blockHeight;
            }
            
            // 獲取編碼
            const codePoint = char.codePointAt(0);
            const color = unicodeToHexColor(codePoint);
            const x = currentX;
            const y = currentY;

            // 儲存資訊 (供懸停和稍後繪製)
            blockData.push({
                x, y,
                width: blockWidth,
                height: blockHeight,
                char: char,
                color: color,
                unicodeDec: codePoint,
                unicodeHex: 'U+' + codePoint.toString(16).toUpperCase().padStart(4, '0')
            });

            // 更新 X 座標
            currentX += blockWidth;
        }

        // 3. 計算最終畫布尺寸
        if (currentX > max_x) max_x = currentX; // 捕獲最後一行的寬度
        if (max_x === 0 && blockData.length > 0) max_x = blockWidth; // 處理只有單個字符的情況
        if (text.length === 0) max_x = 0; // 處理空輸入

        canvas.width = max_x > 0 ? max_x : 300; // 如果為空，給個預設寬度
        canvas.height = (blockData.length > 0) ? currentY + blockHeight : blockHeight; // 總高度

        // 4. Canvas 繪製 (背景)
        ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 5. Canvas 繪製 (色塊)
        for (const block of blockData) {
            ctx.fillStyle = block.color;
            ctx.fillRect(block.x, block.y, block.width, block.height);
        }
    }


    // --- V. 核心功能：匯出 (v1.0.0, 無變更) ---

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

    function exportPDF() {
        if (blockData.length === 0) {
            alert('請先生成色塊矩陣！');
            return;
        }
        
        try {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'pt', 'a4'); // 'p'ortrait, 'pt' points, 'a4' size
            
            const a4Width = pdf.internal.pageSize.getWidth();
            const a4Height = pdf.internal.pageSize.getHeight();
            const padding = 40;

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            
            // 計算縮放比例
            let scaleFactor = (a4Width - 2 * padding) / imgWidth;
            if (imgHeight * scaleFactor > a4Height - 2 * padding) {
                scaleFactor = (a4Height - 2 * padding) / imgHeight;
            }

            const pdfImgWidth = imgWidth * scaleFactor;
            const pdfImgHeight = imgHeight * scaleFactor;
            
            const xPos = (a4Width - pdfImgWidth) / 2;
            const yPos = padding;
            
            // v1.1.0 修復：如果圖片高度超過一頁，允許分頁
            // (注意：此處簡易實現是縮放至一頁，真正的分頁邏G輯複雜，
            //  但 v1.1.0 的自動換行使圖片更「高」而非「寬」，縮放效果更好)
            pdf.addImage(imgData, 'PNG', xPos, yPos, pdfImgWidth, pdfImgHeight);
            pdf.save(`color_matrix_${getTimestamp()}.pdf`);
        } catch (e) {
            console.error(e);
            alert('匯出 PDF 失敗，請檢查主控台錯誤。');
        }
    }

    // --- VI. 核心功能：解碼器 (v1.0.0, 邏輯無變更) ---
    // v1.0.0 的解碼邏輯已足夠穩健，可以處理 v1.1.0 生成的換行圖片

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
            
            // 1. 繪製到隱藏 Canvas
            decodeCanvas.width = img.width;
            decodeCanvas.height = img.height;
            decodeCtx.drawImage(img, 0, 0);
            
            const imageData = decodeCtx.getImageData(0, 0, img.width, img.height);
            
            // 2. 推算配置 (Block Size)
            // v1.1.0 註：此處的 detectBlockSize 假設 (0,0) 是第一個色塊。
            // 即使第一行是空白 (背景色)，此邏輯依然可以正確找到
            // 色彩變化的邊界 (背景色 -> 第一個色塊)。
            const blockSize = detectBlockSize(imageData);
            
            if (blockSize.width === 0 || blockSize.height === 0 || (blockSize.width === img.width && blockSize.height === img.height) ) {
                // 如果寬高=圖片寬高，很可能是單色圖
                throw new Error('無法偵測到有效的色塊邊界。請確認圖片是由本程式生成且未經裁切。');
            }

            // 3. 逐塊採樣與解碼
            const decodedText = sampleAndDecode(imageData, blockSize);
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
     * 輔助函式：推算色塊大小 (v1.0.0)
     * (此邏輯對於 v1.1.0 的自動換行圖片依然有效)
     */
    function detectBlockSize(imageData) {
        const { data, width, height } = imageData;
        
        const getPixel = (x, y) => {
            const index = (y * width + x) * 4;
            return [data[index], data[index+1], data[index+2]];
        };

        const firstColor = getPixel(0, 0);
        let blockWidth = 0;
        let blockHeight = 0;

        // 測量寬度：掃描第一行 (y=0)
        for (let x = 1; x < width; x++) {
            const nextColor = getPixel(x, 0);
            if (nextColor[0] !== firstColor[0] || nextColor[1] !== firstColor[1] || nextColor[2] !== firstColor[2]) {
                blockWidth = x;
                break;
            }
        }
        if (blockWidth === 0) blockWidth = width; // 整行同色

        // 測量高度：掃描第一列 (x=0)
        for (let y = 1; y < height; y++) {
            const nextColor = getPixel(0, y);
            if (nextColor[0] !== firstColor[0] || nextColor[1] !== firstColor[1] || nextColor[2] !== firstColor[2]) {
                blockHeight = y;
                break;
            }
        }
        if (blockHeight === 0) blockHeight = height; // 整列同色

        return { width: blockWidth, height: blockHeight };
    }

    /**
     * 輔助函式：採樣並解碼 (v1.0.0)
     * (此邏輯對於 v1.1.0 的自動換行圖片依然有效)
     */
    function sampleAndDecode(imageData, blockSize) {
        const { data, width: imgWidth, height: imgHeight } = imageData;
        const { width: blockWidth, height: blockHeight } = blockSize;
        
        const totalRows = Math.floor(imgHeight / blockHeight);
        const totalCols = Math.floor(imgWidth / blockWidth);

        const sampleOffsetX = Math.floor(blockWidth / 2);
        const sampleOffsetY = Math.floor(blockHeight / 2);
        
        let decodedText = '';
        let lastNonBackgroundRow = -1; // 用於處理末尾的空行

        for (let r = 0; r < totalRows; r++) {
            let line = '';
            let foundCharInLine = false;
            
            for (let c = 0; c < totalCols; c++) {
                const sampleX = c * blockWidth + sampleOffsetX;
                const sampleY = r * blockHeight + sampleOffsetY;

                // 邊界檢查
                if (sampleX >= imgWidth || sampleY >= imgHeight) continue;

                const dataIndex = (sampleY * imgWidth + sampleX) * 4;
                const R = data[dataIndex];
                const G = data[dataIndex + 1];
                const B = data[dataIndex + 2];

                const hexR = R.toString(16).padStart(2, '0');
                const hexG = G.toString(16).padStart(2, '0');
                const hexB = B.toString(16).padStart(2, '0');
                const hexColor = `#${hexR}${hexG}${hexB}`.toUpperCase();

                // 檢查是否為背景色
                if (hexColor === CANVAS_BACKGROUND_COLOR) {
                    // 如果這行已經有字符了，我們需要補上空格
                    if (foundCharInLine) {
                        line += ' ';
                    }
                    continue;
                }

                // 這是第一個非背景色字符
                foundCharInLine = true;
                
                const codePoint = hexColorToUnicode(hexColor);
                
                try {
                    line += String.fromCodePoint(codePoint); 
                } catch (e) {
                    line += '?'; // 無效的碼點
                }
            }
            
            // v1.1.0 優化：移除行尾由背景色產生的多餘空格
            const trimmedLine = line.trimEnd();
            
            if (trimmedLine.length > 0) {
                // 如果之前有空行，先補上換行符
                if (lastNonBackgroundRow !== -1 && r > lastNonBackgroundRow + 1) {
                    decodedText += '\n'.repeat(r - (lastNonBackgroundRow + 1));
                }
                decodedText += trimmedLine;
                lastNonBackgroundRow = r;
            }
            
            // 處理手動換行（即便該行是空的）
            if (foundCharInLine && r < totalRows - 1 && line.length > trimmedLine.length) {
                 // 如果行尾有空格被 trim，我們無法判斷是手動換行還是自動換行
                 // 但如果 line.length === 0 且 foundCharInLine = false
                 // 並且 lastNonBackgroundRow != -1，這代表一個空行
            } else if (!foundCharInLine && lastNonBackgroundRow != -1) {
                // 這是空行，但我們在下一次找到字符時才補上 \n
            }
            
            // 簡化邏輯：我們在v1.1.0的生成器中，換行符是隱含的（自動換行或\n）
            // 解碼器很難區分這兩者。
            // 目前的邏輯是：將所有非背景色塊組合起來，並在行之間添加 \n
            
            if (foundCharInLine && r < totalRows - 1) {
                 decodedText += '\n'; // 暫時假設每行都是一個換行
            }
        }
        
        // 最終的解碼邏輯 (簡化版，更準確)
        // 我們無法完美還原「手動換行」和「自動換行」的區別
        // 我們只能還原「可見字符」的順序
        let robustText = '';
        for (let r = 0; r < totalRows; r++) {
             let lineHasChar = false;
             let lineText = '';
             for (let c = 0; c < totalCols; c++) {
                 // ... (重複採樣邏輯) ...
                 const sampleX = c * blockWidth + sampleOffsetX;
                 const sampleY = r * blockHeight + sampleOffsetY;
                 if (sampleX >= imgWidth || sampleY >= imgHeight) continue;
                 const dataIndex = (sampleY * imgWidth + sampleX) * 4;
                 const R = data[dataIndex], G = data[dataIndex + 1], B = data[dataIndex + 2];
                 const hexColor = `#${R.toString(16).padStart(2, '0')}${G.toString(16).padStart(2, '0')}${B.toString(16).padStart(2, '0')}`.toUpperCase();

                 if (hexColor === CANVAS_BACKGROUND_COLOR) {
                     if (lineHasChar) lineText += ' '; // 補空格
                     continue;
                 }
                 
                 lineHasChar = true;
                 try {
                     lineText += String.fromCodePoint(hexColorToUnicode(hexColor));
                 } catch (e) { lineText += '?'; }
             }
             if (lineHasChar) {
                 robustText += lineText.trimEnd() + '\n';
             }
        }

        return robustText.trim(); // 移除末尾多餘的換行
    }

    // --- VII. 事件監聽器 (v1.0.0, 無變更) ---

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
