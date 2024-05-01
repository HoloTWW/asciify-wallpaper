const asciiKits = [
    " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@",
    " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
    " .'`,:;-+~!"
]

function main(){
    // Заполнить select набора ascii
    let selectAscii = document.getElementById('select-ascii');
    let opt;
    for (let i = 0; i < asciiKits.length; i += 1){
        opt = document.createElement('option');
        opt.innerHTML = `Набор ${i+1} <br> [${asciiKits[i].length}]`
        selectAscii.appendChild(opt);
    }

    // Первичный рендер
    const imgInput = document.getElementById('img-input');
    imgInput.onload = function(){
        renderImage();
    }
    
}

main();


document.getElementById('dwn-pixel').addEventListener('click',(event)=>{
    downloadImage('canvas-pixel');
});


document.getElementById('dwn-ascii').addEventListener('click',(event)=>{
    downloadImage('canvas-ascii');
});


document.getElementById('control-panel').addEventListener('input', (event) =>{
    if (event.target.tagName != 'INPUT' && event.target.tagName != 'SELECT'){
        return;
    }
    if (event.target.type == 'file'){
        return;
    }
    renderImage();
});


document.getElementById('input-image').addEventListener('change', (event)=>{
    if (event.target.files.length = 0){
        return;
    }
    
    const file = event.target.files[0]
    const reader = new FileReader();

    reader.onload = function(e) {
        document.getElementById('img-input').src = e.target.result;
        renderImage();  
    };

    reader.readAsDataURL(file)
});


function downloadImage(canvasId){
    let link = document.createElement('a');
    link.download = 'asciifyImage.png';
    link.href = document.getElementById(canvasId).toDataURL();
    link.click();
    link.remove();
}

function renderImage(){
    // Глубина сжатия
    const block =  parseInt(document.getElementById('input-range').value);
    document.getElementById('range-ind').innerHTML = block;

    // ASCII параметры
    const bgColor = document.getElementById('input-color').value;
    const colorDepth = parseInt(document.getElementById('select-color-depth').value);
    const asciiKit = asciiKits[document.getElementById('select-ascii').selectedIndex];

    const data = (compressCanvas(block,colorDepth,'canvas-pixel','img-input'));
    const canvasImg = document.getElementById('canvas-pixel');

    // Прячем изображения
    document.getElementById('image').hidden = !document.getElementById('chk-source').checked;
    document.getElementById('pixel').hidden = !document.getElementById('chk-pixel').checked;
    document.getElementById('ascii').hidden = !document.getElementById('chk-ascii').checked;


    asciifyCanvas(block,data,asciiKit,bgColor,'Monospace','canvas-ascii',canvasImg.width,canvasImg.height);
}


function asciifyCanvas(depth,data,asciiKit,bgColor,font,canvasId,canvasWidth,canvasHeight){
    const canvasAscii = document.getElementById(canvasId);
    const context = canvasAscii.getContext('2d');
    canvasAscii.height = canvasHeight;
    canvasAscii.width = canvasWidth; 
    context.font = depth + `px ${font}`;

    context.fillStyle = bgColor;
    context.fillRect(0,0,canvasAscii.width,canvasAscii.height);

    let rows = data.length;
    let cols = data[0].length;

    for (let row = 0; row < rows; row += 1){
        for (let col = 0; col < cols; col += 1){
            let index = Math.floor(asciiKit.length * ((data[row][col][0] + data[row][col][1] + data[row][col][2]) / (255 * 3)));
            context.fillStyle =`rgb(${data[row][col][0]},${data[row][col][1]},${data[row][col][2]})`;
            context.fillText(asciiKit[index],depth * col + depth * 0.2,depth * row + depth)   
        }
    }
}

function toColorDepth(rgb,colorDepth){
    return  rgb.map(value => (Math.round(value * (Math.pow(2,colorDepth) - 1) / 255) * 255 / (Math.pow(2,colorDepth) - 1)) * 0.99);
}


function compressCanvas(depth,colorDepth,canvasId ,imgId){
    // in: depth:integer ,canvasId:string, imgId:string
    // out: void

    const img = new Image();
    img.src = document.getElementById(imgId).src;

    const canvas = document.getElementById(canvasId);
    const context = canvas.getContext('2d');

    const compresedImg = [];
    
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img,0,0, img.width, img.height);

    const imageData = context.getImageData(0,0,canvas.width,canvas.height);


    //- Обработка пикселей

    for (let rowBlock = 0; rowBlock < canvas.height; rowBlock += depth){

        compresedImg.push([]);
        for (let colBlock = 0; colBlock < canvas.width * 4; colBlock += depth * 4){
            // Усредненный цвет
            let rgb = [0,0,0];
            for (let row = rowBlock; row < (rowBlock + depth) && (row < canvas.height); row += 1){
                for (let col = colBlock; (col < colBlock + depth * 4 ) && (col < canvas.width * 4); col += 4 ){
                    rgb[0] += imageData.data[canvas.width * row * 4 + col];
                    rgb[1] += imageData.data[canvas.width * row * 4 + col + 1];
                    rgb[2] += imageData.data[canvas.width * row * 4 + col + 2];
                }
            }
            rgb = rgb.map(value => value / (depth * depth));
            
            // Применяем глубину цвета
            rgb = toColorDepth(rgb,colorDepth);
    
            // Усредняем значения
            for (let row = rowBlock; row < rowBlock + depth; row += 1){
                for (let col = colBlock; (col < colBlock + depth * 4 ) && (col < canvas.width * 4); col += 4 ){
                        imageData.data[canvas.width * row * 4 + col] = rgb[0];
                        imageData.data[canvas.width * row * 4 + col + 1] = rgb[1];
                        imageData.data[canvas.width * row * 4 + col + 2] = rgb[2];
                }
            }

            // Сохраняем сжатый массив
            compresedImg[compresedImg.length - 1].push([rgb[0],rgb[1],rgb[2],imageData.data[3]]);
        }
        
    }

    context.putImageData(imageData,0,0);
    return compresedImg;
}
