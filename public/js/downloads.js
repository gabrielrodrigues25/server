const select = document.getElementById("versao");
const downloadBtn = document.getElementById("downloadBtn");

select.addEventListener("change", function(){
    downloadBtn.href = this.value;
});

const versao = document.getElementById("versao");

versao.addEventListener("change", () => {

    const arquivo = versao.value;

    if(arquivo){
        downloadBtn.href = arquivo;
        downloadBtn.classList.remove("disabled");
    }else{
        downloadBtn.href = "";
        downloadBtn.classList.add("disabled");
    }

});