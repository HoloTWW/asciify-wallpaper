


document.getElementById('input-image').addEventListener('change', (event)=>{
    if (event.target.files.length = 0){
        return;
    }
    
    const file = event.target.files[0]
    const reader = new FileReader();

    reader.onload = function(e) {
        document.getElementById('img-input').src = e.target.result
        const imgUrl = e.target.result
    };
    reader.readAsDataURL(file)
});
