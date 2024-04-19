
document.getElementById('input-range').addEventListener('change', (event)=>{
    
    document.getElementById('range-ind').innerHTML = event.target.value;
    
    const img = new Image();
    img.src = document.getElementById('img-input').src;


    // const stepX = img.width / event.target.value;
    const block = event.target.value;

    const canvas = document.getElementById('canvas-output');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img,0,0,img.width,img.height);

        const  pixels =  ctx.getImageData(0,0,canvas.width,canvas.height);


        var pixel = 4;

        console.log(pixels.data.length)

        for (let i = 0; i < pixels.data.length; i += pixel * block){
            
            // средний цвет блока
            var r = 0
            var g = 0
            var b = 0
            for (let j = i; j < i + pixel * block; j += 4){
                r += pixels.data[j]
                g += pixels.data[j + 1]
                b += pixels.data[j + 2]
            }
            for (let j = i; j < i + pixel * block; j += 4){
                pixels.data[j] = r / block
                pixels.data[j + 1] = g / block
                pixels.data[j + 2] = b / block
            }
        }

        ctx.putImageData(pixels,0,0);    
});

