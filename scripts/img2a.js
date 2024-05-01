document.getElementById('control-panel').addEventListener('input', (event) =>{
    if (event.target.tagName != 'INPUT'){
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


function renderImage(){
    // range-input
    const block =  parseInt(document.getElementById('input-range').value);
    document.getElementById('range-ind').innerHTML = block;
    
    const data = (compressCanvas(block,'canvas-pixel','img-input'));
    const canvasImg = document.getElementById('canvas-pixel');

    // ASCII params
    const bgColor = document.getElementById('input-color').value;

    // Hide images
    document.getElementById('image').hidden = !document.getElementById('chk-source').checked;
    document.getElementById('pixel').hidden = !document.getElementById('chk-pixel').checked;
    document.getElementById('ascii').hidden = !document.getElementById('chk-ascii').checked;


    asciifyCanvas(block,data,bgColor,'Monospace','canvas-ascii',canvasImg.width,canvasImg.height);
}


function asciifyCanvas(depth,data,bgColor,font,canvasId,canvasWidth,canvasHeight){
    const canvasAscii = document.getElementById(canvasId);
    const context = canvasAscii.getContext('2d');
    canvasAscii.height = canvasHeight;
    canvasAscii.width = canvasWidth; 
    context.font = depth + `px ${font}`;

    context.fillStyle = bgColor;
    context.fillRect(0,0,canvasAscii.width,canvasAscii.height);

    const ascii = " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@"

    let rows = data.length;
    let cols = data[0].length;

    for (let row = 0; row < rows; row += 1){
        for (let col = 0; col < cols; col += 1){
            let index = Math.floor(ascii.length * ((data[row][col][0] + data[row][col][1] + data[row][col][2]) / (255 * 3)));
            context.fillStyle =`rgb(${data[row][col][0]},${data[row][col][1]},${data[row][col][2]})`;
            context.fillText(ascii[index],depth * col + depth * 0.2,depth * row + depth)   
        }
    }
}


function compressCanvas(depth,canvasId ,imgId){
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
