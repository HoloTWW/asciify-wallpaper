document.getElementById('input-range').addEventListener('input',(event =>{
    const block = parseInt(event.target.value);
    document.getElementById('range-ind').innerHTML = block;
    
    // const compressed =  
    const data = (compressCanvas(block,'canvas-img','img-input'));
    const canvasImg = document.getElementById('canvas-img');
    asciifyCanvas(block,data,'black','Monospace','canvas-ascii',canvasImg.width,canvasImg.height);
    
}))


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
