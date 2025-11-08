// 等待 DOM 內容完全載入後執行
document.addEventListener('DOMContentLoaded', () => {

    // --- I. 獲取 DOM 元素 ---
    
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
    const CANVAS_BACKGROUND_COLOR = '#FFFFFF'; // 畫布背景色 (重要：解碼時需依此判斷)

    // --- II. 輔助函式 ---

    /**
     * 將 Unicode 碼點轉換為 6 位十六進制顏色字串。
     * 這是確定性的一對一映射。
     * @param {number} codePoint - 字符的 Unicode 碼點。
     * @returns {string} - #RRGGBB 格式的色號。
     */
    const unicodeToHexColor = (codePoint) => {
        // 轉換為十六進制字串
        let hex = codePoint.toString(16);
        // 補零至 6 位長度 (確保 #RRGGBB 格式)
        return '#' + hex.padStart(6, '0');
    };

    /**
     * 將 #RRGGBB 格式的色號逆轉為十進制 Unicode 碼點。
     * @param {string} hexColor - #RRGGBB 格式的色號 (e.g., #000061)。
     * @returns {number} - 字符的十進制 Unicode 碼點。
     */
    const hexColorToUnicode = (hexColor) => {
        // 移除 # 符號
        const hex = hexColor.replace('#', '');
        // 直接將 6 位十六進制數解析為十進制整數
        return parseInt(hex, 16);
    };

    /**
     * 獲取當前時間戳 (用於檔名)
     * @returns {number}
     */
    const getTimestamp = () => Math.floor(Date.now() / 1000);

    // --- III. 核心功能：生成器 (Encoder) ---

    function generateColorBand() {
        // 1. 參數讀取與驗證
        const text = textInput.value;
        const blockWidth = parseInt(blockWidthInput.value);
        const blockHeight = parseInt(blockHeightInput.value);

        if (isNaN(blockWidth) || blockWidth < 5 || isNaN(blockHeight) || blockHeight < 5) {
            alert('區塊寬高必須為大於 5 的正整數！');
            return;
        }

        // 2. 換行與佈局計算
        const lines = text.split('\n');
        let maxCols = 0;
        lines.forEach(line => {
            // 使用 Array.from 來正確處理 Emoji 等補充平面字符的長度
            const charCount = Array.from(line).length;
            if (charCount > maxCols) maxCols = charCount;
        });

        const totalLines = lines.length;
        canvas.width = maxCols * blockWidth;
        canvas.height = totalLines * blockHeight;
        blockData = []; // 清空前一次的資料

        // 3. Canvas 繪製
        // 先繪製白色背景 (確保 PNG 匯出和解碼時背景統一)
        ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        lines.forEach((line, lineIndex) => {
            // 使用 Array.from 確保正確遍歷 Emoji
            const chars = Array.from(line);
            let colIndex = 0;

            for (const char of chars) {
                const codePoint = char.codePointAt(0);
                const color = unicodeToHexColor(codePoint);

                const x = colIndex * blockWidth;
                const y = lineIndex * blockHeight;

                // 繪製矩形
                ctx.fillStyle = color;
                ctx.fillRect(x, y, blockWidth, blockHeight);

                // 儲存資訊 (供懸停使用)
                blockData.push({
                    x, y,
                    width: blockWidth,
                    height: blockHeight,
                    char: char,
                    color: color,
                    unicodeDec: codePoint,
                    unicodeHex: 'U+' + codePoint.toString(16).toUpperCase().padStart(4, '0')
                });
                
                colIndex++;
            }
        });
    }

    // --- IV. 核心功能：匯出 (Export) ---

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

            pdf.addImage(imgData, 'PNG', xPos, yPos, pdfImgWidth, pdfImgHeight);
            pdf.save(`color_matrix_${getTimestamp()}.pdf`);
        } catch (e) {
            console.error(e);
            alert('匯出 PDF 失敗，請檢查主控台錯誤。');
        }
    }

    // --- V. 核心功能：解碼器 (Decoder) ---

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
            const blockSize = detectBlockSize(imageData);
            
            if (blockSize.width === 0 || blockSize.height === 0 || blockSize.width === img.width || blockSize.height === img.height) {
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
     * 輔助函式：將 File 物件載入為 Image 物件
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
     * 輔助函式：推算色塊大小
     */
    function detectBlockSize(imageData) {
        const { data, width, height } = imageData;
        
        // 獲取 (0,0) 點的顏色
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
     * 輔助函式：採樣並解碼
     */
    function sampleAndDecode(imageData, blockSize) {
        const { data, width: imgWidth, height: imgHeight } = imageData;
        const { width: blockWidth, height: blockHeight } = blockSize;
        
        const totalRows = Math.floor(imgHeight / blockHeight);
        const totalCols = Math.floor(imgWidth / blockWidth);

        // 採樣點：每個色塊的中心點
        const sampleOffsetX = Math.floor(blockWidth / 2);
        const sampleOffsetY = Math.floor(blockHeight / 2);
        
        let decodedText = '';

        for (let r = 0; r < totalRows; r++) {
            let line = '';
            for (let c = 0; c < totalCols; c++) {
                // 計算採樣點的像素座標
                const sampleX = c * blockWidth + sampleOffsetX;
                const sampleY = r * blockHeight + sampleOffsetY;

                // 計算 data 陣列的索引 (R component)
                const dataIndex = (sampleY * imgWidth + sampleX) * 4;

                const R = data[dataIndex];
                const G = data[dataIndex + 1];
                const B = data[dataIndex + 2];

                // 將 RGB 轉換為 #RRGGBB 格式
                const hexR = R.toString(16).padStart(2, '0');
                const hexG = G.toString(16).padStart(2, '0');
        const hexB = B.toString(16).padStart(2, '0');
                const hexColor = `#${hexR}${hexG}${hexB}`.toUpperCase();

                // 檢查是否為背景色
                if (hexColor === CANVAS_BACKGROUND_COLOR) {
                    // 這是背景色 (填充)，跳過
                    continue;
                }

                // 逆轉為 Unicode 碼點
                const codePoint = hexColorToUnicode(hexColor);
                
                // 轉換為字符
                try {
                    const char = String.fromCodePoint(codePoint); 
                    line += char;
                } catch (e) {
                    line += '?'; // 無效的碼點
                }
            }
            
            // 將行結果加入總文字 (移除尾部由背景色產生的多餘空格)
            // 注意：我們的邏輯是跳過背景色，所以不需要 trimEnd
            if (line.length > 0) {
                decodedText += line;
                if (r < totalRows - 1) {
                    decodedText += '\n'; // 在行與行之間添加換行符
                }
            }
        }
        
        return decodedText.trim(); // 移除末尾多餘的換行
    }

    // --- VI. 事件監聽器 (Event Listeners) ---

    // 生成
    generateButton.addEventListener('click', generateColorBand);

    // 匯出
    exportPngButton.addEventListener('click', exportPNG);
    exportPdfButton.addEventListener('click', exportPDF);

    // 懸停
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        // 修正：考慮頁面捲動和 Canvas 縮放
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
                
                // 定位提示框 (e.pageX/pageY 包含頁面捲動)
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
    
    // --- VII. 初始執行 ---
    
    // 頁面載入時自動生成一次
    generateColorBand();
});
