document.getElementById('input-range').addEventListener('input',(event =>{
    const block = parseInt(event.target.value);
    document.getElementById('range-ind').innerHTML = block;
    
    compressCanvas(block,'canvas-img','img-input');
    

}))

function compressCanvas(depth,canvasId ,imgId){
    // in: depth:integer ,canvasId:string, imgId:string
    // out: void

    const img = new Image();
    img.src = document.getElementById(imgId).src;

    const canvas = document.getElementById(canvasId);
    const context = canvas.getContext('2d');

    img.onload = function (){
    
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img,0,0, img.width, img.height);

        const imageData = context.getImageData(0,0,canvas.width,canvas.height);
    

        //- Обработка пикселей

        for (let rowBlock = 0; rowBlock < canvas.height; rowBlock += depth){
            for (let colBlock = 0; colBlock < canvas.width * 4; colBlock += depth * 4){
                // Усредненный цвет
                let rgb = [1,2,3];
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
            }
        }

        context.putImageData(imageData,0,0);
    }
}
