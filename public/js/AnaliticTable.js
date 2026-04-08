

export default class AnaliticTable{

    constructor(idTable, columnsBlock=false){
      
       try{
 
          //selecionar tabela
          this.table = document.querySelector(`#${idTable}`);
 
          //remover barra comandos caso exista
          this.removeBarCommand();
 
          //criar barra comandos
          this.commandBar();
 
          //adicionar evento as colunas
          this.addEventoClickTh();
 
          //congelar cabeçalho
          this.headerFreeze();
 
          //evento marcar linhas
          this.marcarLinhas();
 
          this.idcoluna = -1;
          this.indexColumnselect = -1;
 
          //colunas bloqueadas
          this.columnsBlock = columnsBlock;
 
          //colunas para sub totais
          this.columnsSubTotais=[];
 
          //controle de subTotais
          this.subTotalAtivo = false;
 
          //controle de filtro
          this.filtroAtivo = false;

          this.screenSize = window.screen.width;

          this.fontPix = 14;

          this.paletaColor = "#f39f31b9";    
 
 
       }catch(e){
 
          console.log("Id de tabela inválido!");
 
       }
  
    }

    expandTable()
    {


      if(this.table.parentElement.style.height == "100%" )
      {
         this.table.parentElement.style.height = "370px"
         return
      }

      this.table.parentElement.style.height = "100%"


    }
 
    marcarLinhas()
    {
 
       let mytable = document.querySelector(`#${this.table.id}`);
       let body = mytable.getElementsByTagName("tbody");
       let rows = body[0].getElementsByTagName("tr");
 
       for(let row of rows)
       {
          row.addEventListener('click',()=>this.marcarDesmarcar(row));
       }
 
    }
 
    marcarDesmarcar(row)
    {
 
       //caso exista backgroudColor remover, se não aplicar
       if(row.style.backgroundColor)
       {
          row.style.backgroundColor = '';
       }
       else
       {
         
          row.style.backgroundColor = this.paletaColor;
       }
 
    }
 
    removeBarCommand()
    {
       //selecionar container
       let barra = this.table.parentElement.parentElement.children[0];
 
       //validar classe
       if( barra.classList[0]== "div-comad-analitic") barra.remove();
    }
 
    addEventoClickTh(){
 
      let coluns =  this.obterCabecalhoTable();
 
      for(let column of coluns){
 
          column.addEventListener("dblclick",()=>this.addSelecao(column.cellIndex,column),false);
 
          //eventos mouse
          column.addEventListener('mouseover',()=>column.style.cursor = "pointer" );
          column.addEventListener('mouseout',()=>column.style.cursor = 'none' ); 
 
      }
 
 
    }
 
    obterCabecalhoTable()
    {
       let cabecalho = this.table.getElementsByTagName('thead');
       let coluns = cabecalho[0].getElementsByTagName('th');
 
       return coluns;
    }
 
    validaNcolumnsSelecionadas()
    {
 
       let coluns = this.obterCabecalhoTable();
       let cont = 0;
 
       //limpar lista de colunas
       this.clearColumnsSubTotal();
  
       for(let column of coluns){ 
 
        if(column.classList[0] == `${this.table.id}-selectede-column`)
        {
 
          //adicionar coluna a lista
          this.columnsSubTotais.push(column.cellIndex);
          cont++;
          
          //retornar true para para processo de calculo de subtotal
          if(cont > 2) return true;
        }
  
       }
 
       //retornar true para para processo de calculo de subtotal
       if(cont < 2 )
       {
          return true;
       }
 
       //retornar false para proseguir com o calculo de subtotais
       return false;
 
    }
 
    addSelecao(columnIndex,column){
 
       //exibir coluna seleciona entre mover coluna
       let notfilColumn = document.querySelector(`#${this.table.id}-column-selected`);
           notfilColumn.innerHTML = '';
 
       //validar se subtotal ativo e mais de uma coluna selecionada
       if( this.subTotalAtivo)
       {
          if( this.columnsSubTotais.length == 2)
          {
             alert("Existe subtotal ativo. para selecionar mais de uma remova os subtotais!");
             return;
          }
       }
 
       if(column.classList[0] == `${this.table.id}-selectede-column` ){
 
          //remover seleção
          column.classList.remove(`${this.table.id}-selectede-column`);
          column.style.backgroundColor = "";
 
       }else{
          
          //adicionar seleção
          column.classList.add(`${this.table.id}-selectede-column`);
          column.style.backgroundColor =  this.paletaColor;
          
 
       }
 
       let conteudo = this.table.getElementsByTagName('tbody');
       let linhas = conteudo[0].getElementsByTagName('tr');
 
       for(let linha of linhas){
 
 
          if(linha.children[columnIndex].classList[0] == `${this.table.id}-selectede-column` ){
 
             //remover seleção
             linha.children[columnIndex].classList.remove(`${this.table.id}-selectede-column`);
             linha.children[columnIndex].style.backgroundColor = "";
             this.indexColumnselect = -1;
             notfilColumn.innerHTML = '';
 
 
          }else{
 
             //adicionar seleção
             linha.children[columnIndex].classList.add(`${this.table.id}-selectede-column`);
             linha.children[columnIndex].style.backgroundColor =  this.paletaColor;
             this.indexColumnselect = columnIndex;
             notfilColumn.innerHTML = columnIndex;           
 
          }     
 
 
       }
 
 
       //this.addColumnSubTotal(columnIndex);
    
 
 
    }
 
    headerFreeze(){
       //congelar cabeçalhos
       let cabecalho = this.table.getElementsByTagName('thead');
       //cabecalho[0].classList.add('congelarTopo');
       cabecalho[0].style.position = "sticky";
       cabecalho[0].style.top = "0px";
 
    }
 
    commandBar(){
 
       //criar container comandos
       let barra = document.createElement("div");
           barra.classList.add("div-comad-analitic");
           //barra.style.position = "sticky";
           barra.style.position = "relative";
           barra.style.top = "0px";
           /* barra.style.backgroundColor = "#ffffff"; */
           /* barra.style.borderTop = "2px dashed"; */
           barra.style.marginLeft = "5px";
           barra.style.marginRight = "5px";
           /* barra.style.overflow = 'scroll'; */
           barra.style.border = "1px solid #ddd";
           barra.style.padding = "5px";
           barra.style.borderRadius = "5px";
           /* barra.style.whiteSpace = 'nowrap'; */
         /*   barra.style.whiteSpace = 'nowrap'; */

/*       const tamTela = window.screen.width

      if(tamTela <= 415)
      {
         barra.style.display = 'flex';
         barra.style.flexDirection = 'row';
         barra.style.justifyContent = 'left';
       

      } */


 /*           barra.style.display = "flex";
           barra.style.flexDirection = "row"; */
 
       //criar comandos da barra
       //comando exportar
       let exportTable  = this.criateCommad("command-export-table","Salvar tabela CSV","archive");
           exportTable = this.aplicarStyle(exportTable);
           exportTable = this.aplicarHoverHout(exportTable);

       //criar comand expandir tabela       
       let btExpandTable  = this.criateCommad("command-expand-table","Expandir tabela","grid_on");
           btExpandTable = this.aplicarStyle(btExpandTable);
           btExpandTable = this.aplicarHoverHout(btExpandTable);
           
       //comando colocar botões de filtros colunas  
       let btsFindColumns  = this.criateCommad("command-find-columns","Adicionar filtros","filter_list");
           btsFindColumns = this.aplicarStyle(btsFindColumns);
           btsFindColumns = this.aplicarHoverHout(btsFindColumns);
 
       //comando para remover filtros
       let commandRemoveFind = this.criateCommad(`${this.table.id}-command-clear-filter`,"Limpar filtros","remove_circle_outline");
           commandRemoveFind = this.aplicarStyle(commandRemoveFind);
           commandRemoveFind = this.aplicarHoverHout(commandRemoveFind);
 
       //comando para ocultar colunas
       let commandOcultColumn = this.criateCommad(`${this.table.id}-command-ocult-column`,"Ocultar Colunas","do_not_disturb_off");
           commandOcultColumn = this.aplicarStyle(commandOcultColumn);
           commandOcultColumn = this.aplicarHoverHout(commandOcultColumn);
 
       //comando para ocultar colunas
       let commandExibirColumn = this.criateCommad(`${this.table.id}-command-exibir-column`,"Exibir Colunas","do_not_disturb_on");
           commandExibirColumn = this.aplicarStyle(commandExibirColumn);
           commandExibirColumn = this.aplicarHoverHout(commandExibirColumn);
 
       //comando mover coluna a esquerda
       let moveColumLeft = this.criateCommad(`${this.table.id}-command-mover-column-esquerda`,"Mover coluna para esquerda","first_page");
           moveColumLeft = this.aplicarStyle(moveColumLeft);
           moveColumLeft = this.aplicarHoverHout(moveColumLeft);
 
       //comando mover coluna a direita
       let moveColumnRight = this.criateCommad(`${this.table.id}-command-mover-column-direita`,"mover coluna para direita","last_page");
           moveColumnRight = this.aplicarStyle(moveColumnRight);
           moveColumnRight = this.aplicarHoverHout(moveColumnRight);
           
       //criar comando de alinhamento
       //direita
       let alignLeft = this.criateCommad(`${this.table.id}-command-align-left`,"Alinhar a esquerda","format_align_left");
       alignLeft = this.aplicarStyle(alignLeft);
       alignLeft = this.aplicarHoverHout(alignLeft);
 
       //centro
       let alignCenter = this.criateCommad(`${this.table.id}-command-align-left`,"Alinhar no centro","format_align_center");
       alignCenter = this.aplicarStyle(alignCenter);
       alignCenter = this.aplicarHoverHout(alignCenter);
 
       //esquerda
       let alignRight = this.criateCommad(`${this.table.id}-command-align-left`,"Alinhar a direita","format_align_right");
       alignRight = this.aplicarStyle(alignRight);
       alignRight = this.aplicarHoverHout(alignRight);
 
       //criar comando de classificação
       let classificar = this.criateCommad(`${this.table.id}-command-sort`,"Classificar","sort");
       classificar = this.aplicarStyle(classificar);
       classificar = this.aplicarHoverHout(classificar);
 
       //criar comando subtotal
       let comandSubTotal = this.criateCommad(`${this.table.id}-command-subtotal`,"subtotal","functions");
       comandSubTotal = this.aplicarStyle(comandSubTotal);
       comandSubTotal = this.aplicarHoverHout(comandSubTotal);


      //criar comando almentar fonte tabela
      let comandFontUp = this.criateCommad(`${this.table.id}-command-fontUp`,"Aumentar fonte","format_size");
      comandFontUp = this.aplicarStyle(comandFontUp);
      comandFontUp = this.aplicarHoverHout(comandFontUp);
      
       //criar comando diminuir fonte tabela
      let comandFontDown = this.criateCommad(`${this.table.id}-command-fontDown`,"Diminuir fonte","text_fields");
      comandFontDown = this.aplicarStyle(comandFontDown);
      comandFontDown = this.aplicarHoverHout(comandFontDown);

      //criar paleta de cores
      const paleta = document.createElement("input");
            paleta.setAttribute("id", "paleta-cor");
            paleta.setAttribute("name", "paleta-cor");
            paleta.setAttribute("type", "color");
            paleta.setAttribute("value", "#f3f3f3");
            paleta.setAttribute("title", "Escolher cor para marcar linha ou coluna");
            paleta.style.height = "21px"
            paleta.style.width = "30px"
            paleta.style.marginBottom = "0px"


       //adicionar eventos
       exportTable.addEventListener("click", ()=> this.exportTable(),false);
       btExpandTable.addEventListener("click", ()=> this.expandTable(),false);
       btsFindColumns.addEventListener("click", ()=> this.addBotaoFind(),false);
       commandRemoveFind.addEventListener("click", ()=> this.removeFilters(),false);
       commandOcultColumn.addEventListener("click", ()=> this.ocultarColumns(),false);
       commandExibirColumn.addEventListener("click", ()=> this.exibirColumns(),false);
       moveColumLeft.addEventListener("click", ()=> this.moveColumnLeft(),false);
       moveColumnRight.addEventListener("click", ()=> this.moveColumnRight(),false);
       comandSubTotal.addEventListener("click", ()=> this.calcSubTotais(),false);
 
       //enventos alinhamentos
       alignLeft.addEventListener("click", ()=> this.alignLeftM(),false);
       alignCenter.addEventListener("click", ()=> this.alignCenterM(),false);
       alignRight.addEventListener("click", ()=> this.alignRightM(),false);
 
       //eventos classificar
       classificar.addEventListener("click", ()=> this.classificar(),false);

       //eventos font
       comandFontUp.addEventListener("click", ()=> this.fontUp(),false);
       comandFontDown.addEventListener("click", ()=> this.fontDown(),false);
       
       //envento paleta cor
        paleta.addEventListener("change", ()=> this.updateColorPaleta(paleta),false);
 
       //nome para ferramenta
       let nameFerramenta = document.createElement("span");
           nameFerramenta.classList.add('titulo-ferramenta-analises');
           nameFerramenta.innerHTML = ``;
        /*    nameFerramenta.style.float = "right"; */
           nameFerramenta.style.padding = "1px 1px 1px 20px";
           nameFerramenta.style.fontWeight = "bold"; 
           nameFerramenta.style.color = "black";
           nameFerramenta.style.fontSize = "18px";
           
 
       //let divid = this.createDivisorCommands();
          // divid.style.marginLeft = '15px';
           //divid.style.marginLeft = '15px';
 
       let nofiColumnAtiva = this.createNotificationSpan();
           nofiColumnAtiva.setAttribute("id", `${this.table.id}-column-selected`);
           nofiColumnAtiva.style.color = "black";
           nofiColumnAtiva.style.backgroundColor = "#ffb555ce";
 
       //criar link de ajuda
       let help =  document.createElement('a');
           help.setAttribute('href','https://sipet.polealimentos.com.br/wms/pc/10.%20Doc_SIPET/ajudaAnalysisTools.html');
           help.setAttribute('target','_blank');
           help.setAttribute('title','Ajuda sobre o uso da ferramenta');
           help.style.color = "black";
           help.innerHTML = "<i class='material-icons'  style='font-size: 18px'>help</i>";
     
           
           //help = this.aplicarStyle(help);
           help = this.aplicarHoverHout(help); 
 
       //adicionar comando a barra
       barra.appendChild(exportTable);
       barra.appendChild(btExpandTable);
       barra.appendChild(btsFindColumns);
       barra.appendChild(commandRemoveFind);     
       barra.appendChild(this.createDivisorCommands());
       barra.appendChild(commandOcultColumn);
       barra.appendChild(commandExibirColumn);
       barra.appendChild(moveColumLeft);
       barra.appendChild(nofiColumnAtiva);
       barra.appendChild(moveColumnRight);
       barra.appendChild(this.createDivisorCommands());
       barra.appendChild(alignLeft);
       barra.appendChild(alignCenter);
       barra.appendChild(alignRight);
       barra.appendChild(this.createDivisorCommands());
       barra.appendChild(classificar);
       barra.appendChild(this.createDivisorCommands());
       barra.appendChild(comandSubTotal);
       barra.appendChild(this.createDivisorCommands());
       barra.appendChild(comandFontUp);
       barra.appendChild(comandFontDown);
       barra.appendChild(this.createDivisorCommands());
       barra.appendChild(paleta);
       barra.appendChild(this.createDivisorCommands());
       barra.appendChild(help);
       barra.appendChild(nameFerramenta);
 
       //adicionar barra antes da tabela
       this.table.parentElement.insertAdjacentElement('beforebegin',barra);
 
    }

    updateColorPaleta(paleta)
    {
        this.paletaColor = paleta.value;
    }

    fontUp()
    {
         
      this.fontPix++;
      this.table.style.fontSize = `${this.fontPix}px`;

    }

    fontDown()
    {
      this.fontPix--;
      this.table.style.fontSize = `${this.fontPix}px`;
    }
 
    calcSubTotais()
    {
 
       let elAddBeforeLoader =  this.table.parentElement.parentElement;
       let divCprogresso = document.createElement("div");
           divCprogresso.setAttribute("id",`${this.table.id}-loader-progresso-subTotal`);
           divCprogresso = this.addBarraProgresso(divCprogresso);
           divCprogresso = this.aplicarStyleDivCprogressoClassific(divCprogresso);
           divCprogresso.style.display = "block";
           divCprogresso.style.maxWidth = "50%";
           divCprogresso.style.left = "50%";
           divCprogresso.style.top = "10%";
           divCprogresso.style.marginLeft = "-25%";
           divCprogresso.style.height = "200px";
           divCprogresso.style.zIndex = "99";
 
           elAddBeforeLoader.insertAdjacentElement('beforebegin',divCprogresso);
       
  
          setTimeout(() => {       
 
                   let btSubTotal = document.querySelector(`.${this.table.id}-command-subtotal`);
 
                   //validar se existi fitros, caso sim não calcular subtotais
                   if(this.filtroAtivo)
                   {
                      alert("Remova os filtros para executar está ação!");
                      return;
                   }
 
                   if(this.subTotalAtivo)
                   {
                      //remover linhas do subtotal
                      this.removerSubTotais();
                      //desativar subtotal
                      this.subTotalAtivo = false;
                      //mudar a cor do botão para preto
                      btSubTotal.style.color = "#161615";              
 
                      //remover loader
                      this. removerLoadSubtotal();
 
                      //parar execução da função
                      return;
                   }
 
                   //validar numero de colunas selecionadas
                   if(this. validaNcolumnsSelecionadas())
                   {
                      alert("Numero de colunas inválido! Selecione duas colunas." + JSON.stringify(this.columnsSubTotais));
                      //remover loader
                      this. removerLoadSubtotal();
                      return;
                   }
 
                   //validar numero de colunas
                   if(this.columnsSubTotais.length < 2 || this.columnsSubTotais.length > 2)
                   {
                      alert("Numero de colunas inválido! Selecione duas colunas.");
                     //remover loader
                      this. removerLoadSubtotal();
                     return;
                   }
 
                   let tipoClassificar = '';
 
                   //obter tipo de coluna item
                   if(this.tipoColunaIsNumber(this.columnsSubTotais[0]))
                   {
                      //do menor para o maior
                      tipoClassificar = 0;  
                   }
                   else if(this.tipoColunaIsDate(this.columnsSubTotais[0]))
                   {
                      //do mais antigo para o mais novo
                      tipoClassificar = 4;
                   }
                   else
                   {
                      //de A a Z
                      tipoClassificar = 2;
                   } 
 
                   //classificar coluna do item                 
                   this.classificarEmNiveisPrincipal(this.columnsSubTotais[0], tipoClassificar);
 
                   //obter linhas da tabela
                   let rows = this.rowsTabla();
 
                   //validar quantidade de linhas
                   if(rows.length <= 0) return;
 
                   //ativar sub total
                   this.subTotalAtivo = true;
 
                   //mudar a cor do botão para laranja
                   btSubTotal.style.color = "#F4601E";
 
                   let columnItem = this.columnsSubTotais[0];
                   let columnCalcSubtotal = this.columnsSubTotais[1];
                   let contador=0;
                   let subtotal=0;
                   let contarItens = true;
 
                   if(this.tipoColunaIsNumber(columnCalcSubtotal)) contarItens = false;
 
                   let linhas = rows.length;
 
                   for(let i=0;i <= linhas ;i++)
                   {
 
                      if(i==0)
                      {
 
                         if(contarItens)
                         {
                               contador++;
                         }
                         else
                         {
                            //transformar em numero
                            let valor = rows[i].children[columnCalcSubtotal].textContent.replaceAll('.', '').replaceAll(',', '.');               
                            subtotal = Number(valor);
                         }
 
                      //validar se é 
                      
                      }
                      else
                      {
 
                         if(contarItens)
                         {
                               contador++;
                         }
                         else
                         {
                            //transformar em numero
                            let valor = rows[i].children[columnCalcSubtotal].textContent.replaceAll('.', '').replaceAll(',', '.');               
                            subtotal += Number(valor);
                         }
 
 
                      }
 
                      //validar item próxima linha, caso diferente inserir linha com subTotal
                      let itemAtual = rows[i].children[columnItem].textContent;
                      let itemSeguinte = "";
                      if(i+1 < linhas)
                      {
                         itemSeguinte = rows[i+1].children[columnItem].textContent;
                      }
 
                      if(itemAtual &&  itemSeguinte)
                      {
 
 
                         if(itemSeguinte != itemAtual)
                         {
                         let newRowSubtotal = this.createRowSubtotal(rows[i],subtotal,columnCalcSubtotal, columnItem,contarItens,contador);
 
                         let el =  rows[i];
 
                         //table.insertAdjacentElement('beforebegin',div);
                         el.insertAdjacentElement("afterend", newRowSubtotal);
 
                         i++;
                         subtotal = 0;
                         contador = 0;
 
                         linhas = rows.length;
                         }
 
                      }
                      else if(itemAtual)
                      {
 
                         let newRowSubtotal = this.createRowSubtotal(rows[i],subtotal,columnCalcSubtotal, columnItem,contarItens,contador);
 
                         let el =  rows[i];
 
                         //table.insertAdjacentElement('beforebegin',div);
                         el.insertAdjacentElement("afterend", newRowSubtotal);
 
                         i++;
 
                         //linhas = rows.length;
 
                      }
 
                   }
 
             this. removerLoadSubtotal();
 
      }, 1000);
 
 
 
    }
 
    removerLoadSubtotal()
    {
       //remover loader
       let loaderProgresso = document.querySelector(`#${this.table.id}-loader-progresso-subTotal`);
       if(loaderProgresso)
       {
          loaderProgresso.remove();
       }
    }
 
    removerSubTotais()
    {
 
       let rows = this.rowsTabla();
 
       if(rows.length <= 0) return;
 
       let linhas = rows.length;
 
       for(let i=0;i < linhas ;i++)
       {
 
          let el =  rows[i];
 
          if(el.style.backgroundColor == 'black')
          {
             el.remove();
             linhas = rows.length;
          }
 
         
 
       }
 
 
    }
 
    createRowSubtotal(row, valor, columnCalcSubtotal, columnItem, contarItens, qtdItens )
    {
       let tr = document.createElement('tr');
           tr.style.backgroundColor = "black";
           tr.style.color = "white";
       let tds = row.getElementsByTagName('td');
 
      for(let i=0; i < tds.length;i++)
      {
          let td = document.createElement('td');
            
         //validar se é coluna do calculo
         if(i == columnCalcSubtotal)
         {
            if(contarItens)
            {
             td.innerHTML = qtdItens;
             td.setAttribute("class",`${this.table.id}-selectede-column`);
            }
            else
            {
               td.innerHTML = this.formatNumero3Casas(valor);
               td.style.textAlign = "right";
               td.setAttribute("class",`${this.table.id}-selectede-column`);
            }
 
         }
         else if(i == columnItem)
         {
          td.innerHTML = tds[columnItem].textContent;
          td.setAttribute("class",`${this.table.id}-selectede-column`);
         }
         else if(i == 0)
         {
          td.innerHTML = "*";
         }
 
         tr.appendChild(td);
      }
 
       return tr;
           
    }
 
 
    clearColumnsSubTotal()
    {
 
       //limpar colunas que foram selecionadas para subtotal
       while(this.columnsSubTotais.length > 0)
       {
          this.columnsSubTotais.pop();
       }
 
    }
 
 
    classificar()
    {
 
       if(this.subTotalAtivo)
       {
          alert("Remova os subtotais para poder realizar está ação!");
          return;
 
       }
 
       this.popupClassificacao();
 
 
    }
 
    popupClassificacao()
    {
 
       //remover poup caso exista
       this.removePopupC();
 
       //criar div popup
        let divPopupClassificacao = document.createElement("div");
            divPopupClassificacao.setAttribute("id", `${this.table.id}-popup-c`);
            divPopupClassificacao = this.aplicarStylePopupClassific(divPopupClassificacao);
 
        //criar titulo popup
        let divTitulo = document.createElement("div");
            divTitulo = this.aplicarStyleSpTituloPopupClassific(divTitulo);
 
        let titulo = document.createElement("p");
            titulo =  this.aplicarStyleTituloPopupClassific(titulo);
 
        let close = this.criateCommad("close-popup-c","fechar","close");
            close =  this.aplicarStyleClosePopupClassific(close);
            close =  this.aplicarEventClosePopupClassific(close);
 
        //criar barra de botões
        let divBotoes = document.createElement("div");
            divBotoes =  this.aplicarStyleBarraBotoesPopupClassific(divBotoes);
 
        //comando mais nivel classificação
        let btNewLivel = this.criateCommad("create-level-popup-c","Nova classificação","add_circle");
            btNewLivel =  this.aplicarStyleAddLevelBtPopupClassific(btNewLivel);
            btNewLivel =  this.aplicarEventAddLevelBtPopupClassific(btNewLivel);    
 
            divBotoes.appendChild(btNewLivel);
 
 
       //criar div campos classificar
       let divCampos = document.createElement("div");
           divCampos = this.aplicarStyleCampos(divCampos);
           divCampos.setAttribute("id",`${this.table.id}-camposNivel`);
           divCampos = this.addCampos(divCampos);
 
       let divBtAplicar = document.createElement("div");
           divBtAplicar = this.addBotaoAplicarClassificacao(divBtAplicar);
           divBtAplicar = this.aplicarStyleDivBtAppClassific(divBtAplicar);
 
       //criar barra de progresso
       let divCprogresso = document.createElement("div");
           divCprogresso.setAttribute("id",`${this.table.id}-loader-progresso`);
           divCprogresso = this.addBarraProgresso(divCprogresso);
           divCprogresso = this.aplicarStyleDivCprogressoClassific(divCprogresso);
 
        divTitulo.appendChild(titulo);
        divTitulo.appendChild(close);
            
        
        divPopupClassificacao.appendChild(divTitulo);       
        divPopupClassificacao.appendChild(divBotoes);       
        divPopupClassificacao.appendChild(divCampos);       
        divPopupClassificacao.appendChild(divBtAplicar);       
        divPopupClassificacao.appendChild(divCprogresso);       
 
        //selecionar tabela
        this.table.insertAdjacentElement('beforebegin',divPopupClassificacao);
 
    }
 
    removePopupC()
    {
 
       let popup = document.querySelector(`#${this.table.id}-popup-c`);
 
       if(popup) popup.remove();
 
    }
 
    addBotaoAplicarClassificacao(divBtAplicar)
    {
       let bt = document.createElement("button");
           bt.style.backgroundColor = "black";
           bt.style.color = "#ffcc49";
           bt.style.borderRadius = "5px";
           bt.style.padding = "5px";
           bt.innerText = "Aplicar Classificação";
 
          //eventos mouse
          bt.addEventListener('mouseover',()=>{
             bt.style.backgroundColor = "#F4601E";         
             
          } );
 
          bt.addEventListener('mouseout',()=> {         
             bt.style.backgroundColor = "black";          
          });
 
 
           bt.addEventListener("click",()=>this.apClassificar(),false);
           
           divBtAplicar.appendChild(bt);
 
           return divBtAplicar;
 
    }
 
   async apClassificar()
    {
       //validar se foi selecionado colunas
       const colunasSelecionada = this.validColumnsSelected();
 
       if(colunasSelecionada) 
       {
 
          //aguardar exibição 
          await this.exibirLoader();
 
          setTimeout(() => {
 
             this.aplicarClassificacaoColumns();
             
          }, 1000);
     
       }
       
    }
 
    async exibirLoader()
    {
 
       //exibir loader
       let loader = document.querySelector(`#${this.table.id}-loader-progresso`);
       loader.style.display = "block";
 
    }
 
    aplicarClassificacaoColumns()
    {
 
       let idColPrev, idColuna, idClassificacao;
 
       //selecionar div campos classificar
       const divCampos = document.querySelector(`#${this.table.id}-camposNivel`);
 
       //selecionar campos
       const campos = divCampos.querySelectorAll(".colunasClassifique");
       
       //seleciontar tipos
       const tipos = divCampos.querySelectorAll(".tipoClassifique");      
 
 
       //recorrer todos os campos para classificação
       for(let x =0; x < campos.length; x++)
       {
          //validar se foi selecionado coluna no campo , se não continuar
          if(!campos[x].value) continue;
 
          //capturar coluna e classificação
          idColuna = campos[x].value;
          idClassificacao = tipos[x].value;
 
          if (x === 0) {
 
             //classificar primeira coluna
             this.classificarEmNiveisPrincipal(idColuna, idClassificacao);
       
             idColPrev = idColuna;
       
          } 
          else 
          {
       
             //classificar sube colunas
             this.classificarEmNiveisSegundario(idColuna, idClassificacao, idColPrev);
       
             idColPrev = idColuna;
 
          } 
 
       }
 
       //fechar popup
       this.removePopupC();
 
 
 
    }
 
    rowsTabla()
    {
 
       let mytable = document.querySelector(`#${this.table.id}`);
       let body = mytable.getElementsByTagName("tbody");
       let b = body[0].getElementsByTagName("tr");
 
       return b;
 
    }
 
    classificarEmNiveisPrincipal(coluna, tipoClassifica)
    {
 
       let i, switching, b, shouldSwitch;
 
       b = this.rowsTabla();
 
       coluna = Number(coluna);
       tipoClassifica = Number(tipoClassifica);
 
       switching = true;
     
       while (switching) 
       {
     
          switching = false;
          // b = bodyTable.getElementsByTagName("tr");
     
          //loop nas linhas da tabela
          for (i = 0; i < (b.length - 1); i++) 
          {
       
             shouldSwitch = false;
       
             //se a solicitação for classificar do menor para maior ou vice versa
             if (tipoClassifica === 0 || tipoClassifica === 1) 
             {
       
                let num1 = b[i].children[coluna].textContent.replaceAll('.', '').replaceAll(',', '.');
                num1 = Number(num1);
                let num2 = b[i + 1].children[coluna].textContent.replaceAll('.', '').replaceAll(',', '.');
                num2 = Number(num2);
       
                //classificar tipo 0 do menor para maior
                if (tipoClassifica === 0) 
                {
                   if (num1 > num2) {
                      shouldSwitch = true;
                      break;
                   }         
                } 
                else 
                {
                   if (num1 < num2) {
                      shouldSwitch = true;
                      break;
                   }
                }
       
                //se solicitação de classificação for por data
             } 
             else if (tipoClassifica === 4 || tipoClassifica === 5)
             {
       
                const dtaStr = b[i].children[coluna].textContent;
                const dtaStr2 = b[i + 1].children[coluna].textContent;
       
                const dataArray1 = dtaStr.split("/");
                const dataArray2 = dtaStr2.split("/");
       
                const data = new Date(dataArray1[2], dataArray1[1], dataArray1[0]);
                const data1 = new Date(dataArray2[2], dataArray2[1], dataArray2[0]);
       
                //se tipo for 4 do mais antigo para o mais novo
                if (tipoClassifica === 4) 
                {      
                   if (data > data1) {
                      shouldSwitch = true;
                      break;
                   }      
                } 
                else 
                {
                   if (data < data1) {
                      shouldSwitch = true;
                      break;
                   }      
                }
       
                //else para classificação de texto e para colunas em que tenha texto e numeros
             } 
             else 
             {
       
                //se ambos da classificação for texto
                if (isNaN(b[i].children[coluna].textContent.toLowerCase()) && isNaN(b[i + 1].children[coluna].textContent.toLowerCase())) 
                {
       
                   //classifica de texto  2 de A a Z
                   if (tipoClassifica === 2) 
                   {
          
                      if (b[i].children[coluna].textContent.toLowerCase() > b[i + 1].children[coluna].textContent.toLowerCase()) 
                      {
                         shouldSwitch = true;
                         break;
                      }
          
                   } 
                   else 
                   {
          
                      if (b[i].children[coluna].textContent.toLowerCase() < b[i + 1].children[coluna].textContent.toLowerCase())
                      {
                         shouldSwitch = true;
                         break;
                      }
          
                   }
       
                } 
                else 
                {      
                   //se primeiro for numero e segundo for texto
                   if (!isNaN(b[i].children[coluna].textContent.toLowerCase()) && isNaN(b[i + 1].children[coluna].textContent.toLowerCase())) 
                   {
          
                      shouldSwitch = true;
                      break;
          
                   }
          
                   //se ambos for numero
                   if (!isNaN(b[i].children[coluna].textContent.toLowerCase()) && !isNaN(b[i + 1].children[coluna].textContent.toLowerCase())) 
                   {
          
                      let num1 = b[i].children[coluna].textContent.replace('.', '').replace(',', '.');
                      num1 = Number(num1);
                      let num2 = b[i + 1].children[coluna].textContent.replace('.', '').replace(',', '.');
                      num2 = Number(num2);
          
                      //classificar se classificação igual a zero acendente do menor para maior caso contrario descendente do maior para menor
                      if (tipoClassifica === 2)
                      {
                         if (num1 > num2)
                         {
                           shouldSwitch = true;
                           break;
                         }
                      }
                      else 
                      {
                         if (num1 < num2)
                         {
                           shouldSwitch = true;
                            break;
                         }
          
                      }
          
                   }
       
                }
       
             }
       
          }
       
          //trocar posição
          if (shouldSwitch) 
          {      
             b[i].parentNode.insertBefore(b[i + 1], b[i]);
             switching = true;
          }
       }
 
    }
 
    classificarEmNiveisSegundario(coluna, tipoClassifica, colPrev)
    {
       let i, switching, b, shouldSwitch, valColPraClas, valColClasAbaixo, valColAnterior, valColAnteriorAbaixo;
 
       b = this.rowsTabla();
 
       coluna = Number(coluna);
       tipoClassifica = Number(tipoClassifica);
       colPrev = Number(colPrev);
 
       switching = true;
     
       while (switching) 
       {
     
          switching = false;
          //b = bodyTable.getElementsByTagName("tr");
     
          for (i = 0; i < (b.length - 1); i++) 
          {
     
              shouldSwitch = false;
     
             //classificação de numeros
             if (tipoClassifica === 0 || tipoClassifica === 1) 
             {
     
                //valores da coluna a ser classificada 
                valColPraClas = b[i].children[coluna].textContent.replace('.', '').replace(',', '.');
                valColPraClas = Number(valColPraClas);
                valColClasAbaixo = b[i + 1].children[coluna].textContent.replace('.', '').replace(',', '.');
                valColClasAbaixo = Number(valColClasAbaixo);
       
                //valores da coluna anterior
                valColAnterior = b[i].children[colPrev].textContent.replace('.', '').replace(',', '.');
                valColAnterior = Number(valColAnterior);
                valColAnteriorAbaixo = b[i + 1].children[colPrev].textContent.replace('.', '').replace(',', '.');
                valColAnteriorAbaixo = Number(valColAnteriorAbaixo);
       
                //classificar se classificação igual a zero acendente do menor para maior caso contrario descendente do maior para menor
                if (tipoClassifica === 0) 
                {
                   if (valColAnterior === valColAnteriorAbaixo && valColPraClas > valColClasAbaixo) 
                   {
                      shouldSwitch = true;
                      break;
                   }         
                } 
                else 
                {
                   if (valColAnterior === valColAnteriorAbaixo && valColPraClas < valColClasAbaixo) 
                   {
                      shouldSwitch = true;
                      break;
                   }
                }
     
              //classificação de data
             }
             else if (tipoClassifica === 4 || tipoClassifica === 5) 
             {
     
                const dtaStr = b[i].children[coluna].textContent;
                const dtaStr2 = b[i + 1].children[coluna].textContent;
       
                const dataArray1 = dtaStr.split("/");
                const dataArray2 = dtaStr2.split("/");
       
                const data = new Date(dataArray1[2], dataArray1[1], dataArray1[0]);
                const data1 = new Date(dataArray2[2], dataArray2[1], dataArray2[0]);
       
                //valores da coluna anterior
                valColAnterior = b[i].children[colPrev].textContent.trim();
                valColAnteriorAbaixo = b[i + 1].children[colPrev].textContent.trim();
       
                //classificar de acodo com a data
                if (tipoClassifica === 4) 
                {      
                   if (valColAnterior === valColAnteriorAbaixo && data > data1) 
                   {
                      shouldSwitch = true;
                      break;
                   }      
                } 
                else
                {
                   if (valColAnterior === valColAnteriorAbaixo && data < data1) 
                   {
                      shouldSwitch = true;
                      break;
                   }
       
                }    
     
             } 
             else 
             {
     
                //valores da coluna anterior
                valColAnterior = b[i].children[colPrev].textContent.trim();
                valColAnteriorAbaixo = b[i + 1].children[colPrev].textContent.trim();
       
                //se ambos for texto 
                if (valColAnterior === valColAnteriorAbaixo && isNaN(b[i].children[coluna].textContent.toLowerCase()) && isNaN(b[i + 1].children[coluna].textContent.toLowerCase())) 
                {      
                   //classifica de texto  2 de A a Z
                   if (tipoClassifica === 2) 
                   {         
                      if (b[i].children[coluna].textContent.toLowerCase() > b[i + 1].children[coluna].textContent.toLowerCase()) 
                      {
                         shouldSwitch = true;
                         break;
                      }         
                   } 
                   else 
                   {
                      if (b[i].children[coluna].textContent.toLowerCase() < b[i + 1].children[coluna].textContent.toLowerCase()) 
                      {
                         shouldSwitch = true;
                         break;
                      }         
                   }
       
                } 
                else 
                {
       
                   //se preinmeio for numero sempre retornar verdadeiro
                   if (valColAnterior === valColAnteriorAbaixo && !isNaN(b[i].children[coluna].textContent.toLowerCase()) && isNaN(b[i + 1].children[coluna].textContent.toLowerCase())) 
                   {         
                      shouldSwitch = true;
                      break;         
                   }
          
                   //se ambos for numero
                   if (valColAnterior === valColAnteriorAbaixo && !isNaN(b[i].children[coluna].textContent.toLowerCase()) && !isNaN(b[i + 1].children[coluna].textContent.toLowerCase())) 
                   {
          
                      let num1 = b[i].children[coluna].textContent.replace('.', '').replace(',', '.');
                      num1 = Number(num1);
                      let num2 = b[i + 1].children[coluna].textContent.replace('.', '').replace(',', '.');
                      num2 = Number(num2);
          
                      //classificar se classificação igual a zero acendente do menor para maior caso contrario descendente do maior para menor
                      if (tipoClassifica === 2) 
                      {
                         if (num1 > num2) 
                         {
                            shouldSwitch = true;
                            break;
                         }
                      } 
                      else 
                      {
                         if (num1 < num2) 
                         {
                            shouldSwitch = true;
                            break;
                         }
          
                      }
          
                   }
       
                }
     
             }
     
          }
     
          if (shouldSwitch) 
          {
             b[i].parentNode.insertBefore(b[i + 1], b[i]);
             switching = true;
          }
       }
 
    }
 
    validColumnsSelected()
    {
 
       //selecionar div campos classificar
       const divCampos = document.querySelector(`#${this.table.id}-camposNivel`);
 
       //selecionar campos
       const campos = divCampos.querySelectorAll(".colunasClassifique");
 
       //pintar bordar primeiro campo cor padrão
       campos[0].style.border = "1px solid #ccc";
 
       //validar se foi selecionado coluna da primeira classificação
       if(!campos[0].value){
          campos[0].style.border = "2px solid red";
          alert("Campo Classificar Por é obrigatório!");
          return false;
       }
 
       return true;
 
    }
 
    addCampos(divCampos)
    {

 
       let divCamposNivel = this.criarDivNivelCampo(); 
           divCamposNivel.style.padding = "2px";
 
       let spanName = document.createElement("span");
           spanName.innerHTML = "Classificar Por:*";
           spanName.style.fontSize = "small";
           spanName.style.minWidth = "100px";
           spanName.style.color = "black";
 
       let spanNameClassificar = document.createElement("span");
           spanNameClassificar.innerHTML = "Classificar:";
           spanNameClassificar.style.fontSize = "small";
           spanNameClassificar.style.marginLeft = "5px";
           spanNameClassificar.style.color = "black";

      if(this.screenSize <= 768)
      {

         spanName.style.display = "block";
         spanName.style.width = "90%";

         spanNameClassificar.style.display = "block";
         spanNameClassificar.style.width = "90%";

         divCamposNivel.style.display = 'flex';
         divCamposNivel.style.flexDirection = 'column';

      }
 
       let cbColuns = this.createColuns();   
 
 
       let cbColunsClassificar = this.createColunsClassificar();   
 
           divCamposNivel.appendChild(spanName);
           divCamposNivel.appendChild(cbColuns);
           divCamposNivel.appendChild(spanNameClassificar);
           divCamposNivel.appendChild(cbColunsClassificar);
 
           divCampos.appendChild(divCamposNivel);
 
       return divCampos;
 
    }
 
    addBarraProgresso(divCprogresso)
    {
 
 
 
       //criar style css
       let textoStyle = ".loaderProgresso {\n";
           textoStyle += "border: 16px solid #161615;\n";
           textoStyle += "border-radius: 50%;\n";
           textoStyle += "border-top: 16px solid #F4601E;\n";
           textoStyle += "background-color: #ffcc49;\n";
           textoStyle += "width: 80px;\n";
           textoStyle += "height: 80px;\n";
           textoStyle += "position: absolute;\n";
           textoStyle += "left: 50%;\n";
           textoStyle += "top: 50%;\n";
           textoStyle += "margin-left: -40px;\n";
           textoStyle += "margin-top: -40px;\n";
           textoStyle += "-webkit-animation: spin 2s linear infinite;\n";
           textoStyle += "animation: spin 2s linear infinite;\n";
           textoStyle += "}\n";
 
           textoStyle += "@-webkit-keyframes spin {\n";
           textoStyle += "0% { -webkit-transform: rotate(0deg); }\n";
           textoStyle += "100% { -webkit-transform: rotate(360deg); }\n";
           textoStyle += "}\n";
 
           textoStyle += "@keyframes spin {\n";
           textoStyle += "0% { transform: rotate(0deg); }\n";
           textoStyle += "100% { transform: rotate(360deg); }\n";
           textoStyle += "}\n";
 
 
       let styleLoader = document.createElement("style");
           styleLoader.innerHTML = textoStyle;
 
       let barra = document.createElement("div");
           barra.setAttribute("class","loaderProgresso");          
 
           divCprogresso.appendChild(styleLoader);
           divCprogresso.appendChild(barra);
 
       return divCprogresso;
    }
 
    addCamposSubNivel()
    {
 
       let divCamposNivel = this.criarDivNivelCampo(); 
           divCamposNivel.style.padding = "2px";
 
       let spanName = document.createElement("span");
           spanName.innerHTML = "E depois Por:";
           spanName.style.fontSize = "small";
           spanName.style.minWidth = "100px";
           spanName.style.color = "black";
 
       let spanNameClassificar = document.createElement("span");
           spanNameClassificar.innerHTML = "Classificar:";
           spanNameClassificar.style.fontSize = "small";
           spanNameClassificar.style.marginLeft = "5px";
           spanNameClassificar.style.color = "black";

         if(this.screenSize <= 768)
         {

            spanName.style.display = "block";
            spanName.style.width = "90%";

            spanNameClassificar.style.display = "block";
            spanNameClassificar.style.width = "90%";

            divCamposNivel.style.display = 'flex';
            divCamposNivel.style.flexDirection = 'column';

         }
 
       let cbColuns = this.createColuns();   
 
 
       let cbColunsClassificar = this.createColunsClassificar();   
 
           divCamposNivel.appendChild(spanName);
           divCamposNivel.appendChild(cbColuns);
           divCamposNivel.appendChild(spanNameClassificar);
           divCamposNivel.appendChild(cbColunsClassificar);
 
 
       let containerCamposClassificacao = document.querySelector(`#${this.table.id}-camposNivel`);
 
           containerCamposClassificacao.appendChild(divCamposNivel);
 
    }
 
    createColunsClassificar()
    {
 
       let selectColuns = document.createElement("select");
           selectColuns.setAttribute("class","tipoClassifique");

        if(this.screenSize <= 768)
        {
         selectColuns.style.width = "90%";
        }
        else
        {
           //style
           selectColuns.style.maxWidth = "250px";
           selectColuns.style.minWidth = "100px";
        }         

 
       return   selectColuns;    
 
 
    }
 
    createColuns()
    {
 
       //alert("Classificar");
       let coluns =  this.obterCabecalhoTable();
 
       let selectColuns = document.createElement("select");
           selectColuns.setAttribute("class","colunasClassifique");

           if(this.screenSize <= 768)
           {
            selectColuns.style.width = '90%'
           }
           else
           {
             selectColuns.style.maxWidth = "150px";
           }
 
       let option = document.createElement("option");
           option.value = "";
           option.innerHTML = "selecione";   
 
           selectColuns.appendChild(option);
    
       for(let column of coluns)
       {
 
          let option = document.createElement("option");
              option.value = column.cellIndex;
              option.innerHTML = column.textContent.replace('arrow_drop_down','');           
 
              selectColuns.appendChild(option);
    
       }
 
       selectColuns.addEventListener("change",()=>this.changeClassificar(selectColuns));
       
       return selectColuns;
 
    }
 
    changeClassificar(selectColuns)
    {

 
       let columnNumber = selectColuns.value;
       let selectOp  = selectColuns.parentElement.children[3];
           selectOp.innerHTML = "";
 
       if(!selectColuns.value) return;          
 
       //validar linha vazia
       //if(!this.rowEmpty(columnNumber)){
 
             if(this.tipoColunaIsNumber(columnNumber))
             {
                selectOp.appendChild(this.criarSeletClassificacao("do menor para o maior", 0));
                selectOp.appendChild(this.criarSeletClassificacao("do maior para o menor", 1));
 
             }
             else if(this.tipoColunaIsDate(columnNumber))
             {
 
                selectOp.appendChild(this.criarSeletClassificacao("do mais antigo para o mais novo", 4));
                selectOp.appendChild(this.criarSeletClassificacao("do mais novo para o mais antigo",5));
 
             }
             else{
 
                selectOp.appendChild(this.criarSeletClassificacao("de A a Z",2));
                selectOp.appendChild(this.criarSeletClassificacao("de Z a A",3));
 
             } 
 
 /*        }else{
 
          alert("Existe linhas vazia na tabela!");
 
        } */
 
 
    }
 
    criarSeletClassificacao(texto, tipo){
       let option = document.createElement("option");
 
       option.value = tipo;
       option.innerHTML = texto;
 
       return option;
    }
 
 
    rowEmpty(columnNumber)
    {
 
       let texto = false;
 
       //selecionar bary tabela
       let tbody = this.table.getElementsByTagName("tbody");
       let linhas = tbody[0].getElementsByTagName('tr');
 
       //validar linhas
       for(let linha of linhas)
       {
 
          if(linha.children[columnNumber].textContent == "")
          {
             texto = true;
             break;
          }
 
       }
 
       if(texto){
          return true;
       }
 
       return false;
 
    }
 
    tipoColunaIsNumber(columnNumber)
    {
 
       let texto = false;
 
       //selecionar bary tabela
       let tbody = this.table.getElementsByTagName("tbody");
       let linhas = tbody[0].getElementsByTagName('tr');
 
       //validar linhas
       for(let linha of linhas)
       {
 
          if(isNaN(linha.children[columnNumber].innerHTML.replaceAll(".","").replaceAll(",","")))
          {
             texto = true;
             break;
          }
 
       }
 
       if( texto){
          return false;
       }
 
       return true;
 
    }
 
    tipoColunaIsDate(columnNumber)
    {
 
       let texto = false;
 
       //selecionar bary tabela
       let tbody = this.table.getElementsByTagName("tbody");
       let linhas = tbody[0].getElementsByTagName('tr');
 
       //validar linhas
       for(let linha of linhas)
       {
 
          let str = linha.children[columnNumber].innerHTML.replaceAll(".","").replaceAll(",","");
 
          let ocorrencias = (str.match(/\//g) || []).length;
 
          if(ocorrencias < 2 || ocorrencias > 2)
          {
             texto = true;
             break;
          }
 
       }
 
       if(texto){
          return false;
       }
 
       return true;
 
    }
 
    aplicarStyleDivCprogressoClassific(divCprogresso)
    {
       divCprogresso.style.display = "none";
       //loader.style.display = "block";
       divCprogresso.style.width = "100%";
       divCprogresso.style.position = "absolute";
       divCprogresso.style.height = "100%";
       divCprogresso.style.left = "0";
       divCprogresso.style.top = "0";
       divCprogresso.style.marginTop = "0";
       divCprogresso.style.backgroundColor = " #ffcc49";
 
       return divCprogresso;
    }
 
    aplicarStyleDivBtAppClassific(divBtAplicar)
    {
 
       divBtAplicar.style.display = "flex";
       divBtAplicar.style.flexDirection = "column";
       divBtAplicar.style.alignItems = "center";
       divBtAplicar.style.backgroundColor = "#eee"; 
 
       return divBtAplicar;
 
    }
 
    criarDivNivelCampo()
    {
 
       let div = document.createElement("div");
           div.style.display = "flex";
           div.style.flexDirection = "row";
           div.style.alignItems = "center";
 
           return div;
    }
 
    aplicarStyleBarraBotoesPopupClassific(divBotoes)
    {
 
       divBotoes.style.display = "flex";
       divBotoes.style.flexDirection = "row";
       divBotoes.style.alignItems = "center";
       divBotoes.style.backgroundColor = "#ffcc49";
       divBotoes.style.marginTop = "1px";
 
 
       return divBotoes;
 
    }
 
    aplicarStyleCampos(divCampos)
    {
 
       divCampos.style.minHeight = "300px";
       divCampos.style.maxHeight = "300px";
       divCampos.style.overflow = "scroll";
      
      return divCampos;
 
    }
 
    aplicarStylePopupClassific(divPopupClassificacao)
    {

        //valitar tamanho da tela



        if(this.screenSize <= 768)
        {

         divPopupClassificacao.style.width = "90%";
         divPopupClassificacao.style.height = "500px";
         divPopupClassificacao.style.left = "3px";


        }
        else
        {
 
            divPopupClassificacao.style.width = "600px";
            divPopupClassificacao.style.height = "500px";
            divPopupClassificacao.style.left = "20%";


        }

        //divPopupClassificacao.style.width = "600px";
        //divPopupClassificacao.style.height = "500px";
        divPopupClassificacao.style.position = "absolute";
        //divPopupClassificacao.style.left = "20%";
        divPopupClassificacao.style.top = "5px";
        divPopupClassificacao.style.zIndex = "99";
        divPopupClassificacao.style.border = "1px solid black";
        divPopupClassificacao.style.boxShadow = "black 2px 2px 10px";
        divPopupClassificacao.style.backgroundColor = "#eee";
 
        return divPopupClassificacao;      
    }
 
    aplicarStyleSpTituloPopupClassific(divTitulo)
    {
       divTitulo.style.display = "flex";
       divTitulo.style.flexDirection = "row";
       divTitulo.style.alignItems = "center";
       divTitulo.style.borderRadius = "2px";
       divTitulo.style.borderBottom = "2px solid #333";
   /*     divTitulo.style.boxShadow = "black 2px 0px 10px"; */
       divTitulo.style.width = "99%";
       divTitulo.style.backgroundColor = "#eee"; 
       divTitulo.style.padding = "3px 0px 3px 0px";
       divTitulo.style.margin = "1px 1px 1px 1px";
 
       
 
       return divTitulo;
 
    }
 
    aplicarStyleTituloPopupClassific(titulo)
    {
 
       titulo.innerHTML = "Classificar";
       titulo.style.marginTop = "0px";
       titulo.style.marginBottom = "0px";
       titulo.style.paddingLeft = "10px";
 
 
       return titulo;
 
    }
 
    aplicarStyleClosePopupClassific(close)
    {
 
       close.style.position = "absolute";
       close.style.right = "10px";
 
       return close;
 
    }
 
    aplicarStyleAddLevelBtPopupClassific(btNewLivel)
    {
 
       btNewLivel.style.padding = "1px";     
       btNewLivel.style.margin = "1px";     
 
       return btNewLivel;
 
    }
 
    aplicarEventClosePopupClassific(close)
    {
 
       //eventos mouse
       close.addEventListener('mouseover',()=>{
             close.style.cursor = "pointer";
             close.style.backgroundColor = "red";
             close.style.color = "white";
       } );
 
       close.addEventListener('mouseout',()=> {         
             close.style.cursor = 'none'; 
             close.style.backgroundColor = "";
             close.style.color = "";
       });
 
 
       close.addEventListener("click",()=>this.removePopupC());
 
       return close;
       
    }
 
    aplicarEventAddLevelBtPopupClassific(btNewLivel)
    {
 
       //eventos mouse
       btNewLivel.addEventListener('mouseover',()=>{
             btNewLivel.style.cursor = "pointer";
             btNewLivel.style.border = "1px solid black";
             
       } );
 
       btNewLivel.addEventListener('mouseout',()=> {         
             btNewLivel.style.cursor = 'none'; 
             btNewLivel.style.border = "";           
       });
 
 
       btNewLivel.addEventListener("click",()=>this.addCamposSubNivel());
 
       return btNewLivel;
       
    }
 
    //mover coluna a esquerda
    moveColumnLeft()
    {
 
       //validar se coluna pode ser movida
       let validMove = this.validColumnsMove("left");
       //mover coluna
 
      //alert(this.indexColumnselect);
      if(validMove)
      {
         let indexDestino = Number(this.indexColumnselect) - 1
         this. trocarPosicaoColumn(indexDestino,this.indexColumnselect,"left");
      }
      
    }
 
    alignLeftM()
    {
       this.align("left");
    }
 
    alignCenterM()
    {
       this.align("center");
    }
 
    alignRightM()
    {
       this.align("right");
    }
 
    align(align)
    {
 
       //obter intens selecionados
       let selecao = document.querySelectorAll(`.${this.table.id}-selectede-column`);
 
       for(let el of selecao)
       {
 
          if(el.tagName === "TD")
          {
             el.style.textAlign = align;
          }
          
       }  
 
    }
    
    //mover coluna a direita
    moveColumnRight()
    {
 
       //validar se coluna pode ser movida
       let validMove = this.validColumnsMove("right");
 
       //mover coluna
       if(validMove)
       {
         let indexDestino = Number(this.indexColumnselect) + 1;
         this.trocarPosicaoColumn(indexDestino,this.indexColumnselect,"right");
       }
 
 
    }
 
    trocarPosicaoColumn(indexDestino, indexAtual, position){
       //exibir coluna seleciona entre mover coluna
       let notfilColumn = document.querySelector(`#${this.table.id}-column-selected`);
       notfilColumn.innerHTML = '';
       
       //selecionar cabeçalho
       let lineColuns =  this.obterCabecalhoTable();
 
       //mover cabeçalho
       if(position == "right"){
 
          lineColuns[indexAtual].parentNode.insertBefore(lineColuns[indexDestino],lineColuns[indexAtual]);
          notfilColumn.innerHTML = indexDestino;
          this.indexColumnselect = indexDestino;
          this.idcoluna = indexDestino;
          
       }else{
          lineColuns[indexAtual].parentNode.insertBefore(lineColuns[indexDestino],lineColuns[indexAtual].nextSibling);
          notfilColumn.innerHTML = indexDestino;
          this.indexColumnselect = indexDestino;
          this.idcoluna = indexDestino;
       }
 
       //mover celular
       let conteudo = this.table.getElementsByTagName('tbody');
       let linhas = conteudo[0].getElementsByTagName('tr');
 
       for(let linha of linhas){
 
          //obter celulas
          let celulas = linha.getElementsByTagName('td');
 
          //mover celulas
          if(position == "right"){
 
             celulas[indexAtual].parentNode.insertBefore(celulas[indexDestino],celulas[indexAtual]);
             notfilColumn.innerHTML = indexDestino;
             
          }else{
             celulas[indexAtual].parentNode.insertBefore(celulas[indexDestino],celulas[indexAtual].nextSibling);
             notfilColumn.innerHTML = indexDestino;
         
          } 
 
       }
 
    }
 
    validColumnsMove(diretion){
        
       //validar se existe coluna selecionada
        if(this.indexColumnselect < 0) return false;
 
        if(diretion === "left")
        {
           //não mover esquerda se coluna for zero
           if(this.indexColumnselect == 0) return false;
 
           //validar se coluna está bloqueada se sim não movimentar
           if(this.columnsBlock)
           {
               let colunaDestinoIndex = Number(this.indexColumnselect) - 1;
               for(let column of this.columnsBlock)
               {
                   if(column === this.indexColumnselect || column === colunaDestinoIndex)
                   {
                      alert("Coluna bloqueada. Geralmente isso ocorre quando a coluna é usada pelo sistema.");
                      return false;
                   } 
               }
           }
 
        }else if(diretion === "right")
        {
          //não mover para direita se for ultima coluna
          let lineColuns =  this.obterCabecalhoTable();
          let nColunas = lineColuns.length-1;
          
          //retornar fulse se coluna selecionada for a ultima da tabela
          if(this.indexColumnselect === nColunas) return false;
 
          //validar se exist filho dentro da celula caso sim não será permitido mover
          if(this.columnsBlock)
          {
             let colunaDestinoIndex = Number(this.indexColumnselect) + 1;
             for(let column of this.columnsBlock)
             {
                 if(column === this.indexColumnselect || column === colunaDestinoIndex)
                 { 
                    alert("Coluna bloqueada. Geralmente isso ocorre quando a coluna é usada pelo sistema.");
                    return false;
                 }
             }
          }
 
        }
 
        return true;
    }
 
    ocultarColumns(){
      
      //selecionar todos marcados
      let columnsSelecteds = document.querySelectorAll(`.${this.table.id}-selectede-column`);
      let btExibirColumns = document.querySelector(`.${this.table.id}-command-exibir-column`);
 
      //validar se existe algum item selecionado
      if(!columnsSelecteds) return;
 
      //ocultar
      for(let selection of columnsSelecteds){
          selection.style.display = 'none';
          btExibirColumns.style.color = "#F4601E";
      }
 
    }
 
    exibirColumns(){
 
      //selecionar todos marcados
      let columnsSelecteds = document.querySelectorAll(`.${this.table.id}-selectede-column`);
      let btExibirColumns = document.querySelector(`.${this.table.id}-command-exibir-column`);
 
      //validar se existe algum item selecionado
      if(!columnsSelecteds) return;
 
      //exibir
      for(let selection of columnsSelecteds){
          selection.style.display = '';
          btExibirColumns.style.color = "#161615"; 
 
      }
 
    }
 
    aplicarStyle(command){
 
       command.style.cursor = "pointer";
       command.style.marginLeft = "10px";
       command.style.marginTop = "5px";
       command.style.fontSize = "18px";
 
       return command;
 
    }
 
    createDivisorCommands(){
   
       let divisor = document.createElement('span');
       divisor.style.maxWidth = "1px";
       divisor.style.minWidth = "1px";
       divisor.style.minHeight = "5px";
       divisor.style.marginLeft = '15px';
       divisor.style.marginRight = '5px';
       divisor.style.backgroundColor = "#f3f3e7";
       divisor.style.color = "#f3f3e7";
       divisor.style.borderLeft = "2px dashed black";
       divisor.innerHTML = "|";
 
       return divisor;
 
    }
 
    createNotificationSpan()
    {
 
       let notif = document.createElement('span');
       notif.style.maxWidth = "1px";
       notif.style.minWidth = "1px";
       notif.style.minHeight = "5px";
       notif.style.marginLeft = '15px';
       notif.style.marginRight = '5px';
       notif.style.backgroundColor = "bisque";
       notif.style.color = "bisque";
       //notif.style.borderLeft = "2px dashed black";
       notif.innerHTML = "";
 
       return notif;
 
 
    }
 
    aplicarHoverHout(command){
 
       //eventos mouse
       command.addEventListener('mouseover',()=>command.style.border = "solid 1px" );
       command.addEventListener('mouseout',()=>command.style.border = 'none' );  
       
       return command;
 
    }
 
 
    exportTable(){
 
       //validar se existe ao menos uma linha na tabela para
       //realizar o exportção
       let validarLinha = false;
 
       /* parar execução caso a tabela não exista*/
       if(!document.getElementById(this.table.id)) return;
 
       //Titulo para o relatório
       let csv = `${this.table.title} ;\n`;
   
       //cabeçalho colunas
       let cabe = document.getElementById(this.table.id).getElementsByTagName("th");
       for (let el of cabe) {
          if (el.style.display === "") 
          {
              csv += el.textContent.replaceAll("arrow_drop_down","") + ";";
          }
       }
   
       csv += '\n';
   
      for (let el of document.getElementById(this.table.id).getElementsByTagName("tr")) 
      {
   
           if (el.style.display === "") 
           {
       
               //looper nas celulas 
               for (let celulas of el.getElementsByTagName("td")) 
               {
           
 
                   if (celulas.style.display === "") 
                   {

                      validarLinha = true;

                     if(celulas.children[0])
                     {
                        let elCelula = celulas.children[0];

                        if(elCelula.tagName == "I")
                        {
                           csv += celulas.textContent + ";"; 
                        }
                        else
                        {
                          csv += elCelula.value + ";"; 
                        }

                        
                     }
                     else
                     {
                      //criar linha com conteudo das celulas
                      csv += celulas.textContent + ";";  
                     }
                   
                   }
           
               }
           
               if (validarLinha) csv += '\n';
           }
   
   
       }
   
       //caso não exista nenhuma linha não exportar
       if (!validarLinha) return;
   
       //exportar dados
       let bt = document.createElement('a');
       bt.setAttribute('href', `data:text/csv;charset=utf-8,%EF%BB%BF${encodeURIComponent(csv)}`);
       bt.setAttribute('download', `export_dados.csv`);  
       bt.click();
 
       
    }
 
    addBotaoFind(){
      let columns =  this.obterCabecalhoTable();;
      let indexColumn=0;
 
      //adicionar comandos as colunas
      for(let column of columns){
 
 
        if(!column.children[0]){
         
          //criar comando de filtro e classificaçã
          let crieteCommandFind = this.criateCommad("btCommad-find-analitic","Aplicar Filtros e Classificações","arrow_drop_down");
          crieteCommandFind.style.cursor = "pointer";
         /*  crieteCommandFind.style.float = "right"; */
          crieteCommandFind.style.marginLeft = "3px";
          crieteCommandFind.style.fontSize = "15px";
          crieteCommandFind.style.color = "brown";
 
          //eventos mouse
          crieteCommandFind.addEventListener('mouseover',()=>crieteCommandFind.style.border = "solid 1px" );
          crieteCommandFind.addEventListener('mouseout',()=>crieteCommandFind.style.border = 'none' );
 
          //adicionar index coluna como id do comando
          crieteCommandFind.setAttribute("id",indexColumn);
 
          //adicionar evento click
          crieteCommandFind.addEventListener("click",()=> this.createPopupFind(crieteCommandFind),false);
          
          //adicionar comando a coluna
          column.appendChild(crieteCommandFind);
 
        }else{
          //remover comando de filtro e classificação
          column.children[0].remove();
          this.removePopupsAtivos();
        }
 
        indexColumn++;
         
      }
  
    }
 
    criateCommad(classElement,titleElement, innerHTMLelement){
 
       let command = document.createElement("i");
           command.classList.add("material-icons");
           command.classList.add(classElement);
           command.setAttribute("title",titleElement);
           command.innerHTML = innerHTMLelement;
 
       //retornar comando
       return command;
 
    }
 
    criateCommadImg(classElement,titleElement, innerHTMLelement){
 
       let command = document.createElement("img");
           command.setAttribute('src', '../../icone/moveColumRigth.png');
           //command.classList.add("material-icons");
           command.classList.add(classElement);
           command.setAttribute("title",titleElement);
           //command.innerHTML = innerHTMLelement;
 
       //retornar comando
       return command;
 
    }
 
    createPopupFind(crieteCommandFind){
      //alert(crieteCommandFind.id);
 
      this.removePopupsAtivos();
 
      //criar container popup
      let popup = document.createElement("div");
          popup.setAttribute("class",`${this.table.id}-popupFiltosClassificacao`);
          popup.style.backgroundColor = "orange";
          popup.style.minWidth = "250px";
          popup.style.minHeight = "300px";
          popup.style.position = "absolute";
          popup.style.borderRadius = "10px";
          popup.style.overflow = "scroll";
          popup.style.color = "black";
 
          //add comando fechar popup
          popup.appendChild(this.criateBtClosePopup());
          
          //criar opções de filtros
          popup.appendChild(this.criateOptionFindRank());
 
          //adicionar id coluna popup ativa a classe
          this.idcoluna = crieteCommandFind.id;
 
          crieteCommandFind.parentElement.appendChild(popup);
 
 
    }
 
    criateOptionFindRank(){
 
       //criar container para as opções de
       //classificação e filtro
       let container = document.createElement("div");
           container.style.display = "flex";
           container.style.flexDirection = "column";
           container.style.backgroundColor = "orange";
 
       //opções de consulta
       container.appendChild(this.criateOptionsPopupRadio(`${this.table.id}-igualA`,"É Igual a...","find1",true));
       container.appendChild(this.criateOptionsPopupRadio(`${this.table.id}-contemVal`,"Contém...","find1"));
       
       //iputs values
       container.appendChild(this.criateInputPopupFind(`${this.table.id}-contemVal-imput`,"Contém...","find1"));
 
       return container;
 
    }
 
    criateOptionsPopupRadio(idOpcao,innerHTMLLabel,opConsultaClasse, checkedOp = false){
 
       let container = document.createElement("div");
           container.style.display = "flex";
           container.style.flexDirection = "row";
           container.style.marginTop = "5px";
           container.style.padding = "5px";
           //container.style.backgroundColor = "orange";
 
       //criar opções de filtro radio
       let opRadio = document.createElement("input");
           opRadio.setAttribute("type","radio");
           opRadio.setAttribute("id",idOpcao);
           opRadio.setAttribute("class",opConsultaClasse);
           opRadio.setAttribute("name",`${this.table.id}-igualA`);
 
           if(checkedOp){
             opRadio.checked = true;
           }
   
       let lbRadio = document.createElement("label");
           lbRadio.innerHTML = innerHTMLLabel;  
         
           container.appendChild(opRadio);
           container.appendChild(lbRadio);
 
       return container;
    }
 
    criateInputPopupFind(idOpcao,innerHTMLLabel,opConsultaClasse){
 
       let container = document.createElement("div");
           container.style.display = "flex";
           container.style.flexDirection = "column";
           container.style.alignItems = "center";
           container.style.marginTop = "5px";
           container.style.padding = "5px";
           //container.style.backgroundColor = "orange";
 
       //criar opções de filtro radio
       let inputValFind = document.createElement("input");
           inputValFind.setAttribute("type","text");
           inputValFind.setAttribute("id",idOpcao);
           inputValFind.setAttribute("class",opConsultaClasse);
           inputValFind.style.padding = "5px";
           //inputValFind.style.margin 
           inputValFind.style.width = "95%";
           
           let btFind = document.createElement("button");
           btFind.setAttribute("title", "Filtrar")
           btFind.style.marginTop = "2px";
           btFind.style.padding = "5px";
           btFind.style.backgroundColor = "#161615";
           btFind.style.color = "#ffcc49";
           btFind.innerHTML = "Filtrar"; 
           btFind.style.width = "100%";
 
           //adicionar evento click
           btFind.addEventListener('click',()=>this.filtrarDados(inputValFind),false);
           
          //eventos mouse
           btFind.addEventListener('mouseover',()=>btFind.style.backgroundColor = "#F4601E" );
           btFind.addEventListener('mouseout',()=>btFind.style.backgroundColor = '#161615' );
 
         
           container.appendChild(inputValFind);
           container.appendChild(btFind);
 
           return container;
    }
 
    criateBtClosePopup(){
 
       //criar bt fecha popup
       let commandClose = this.criateCommad("close-popup","Fechar","close");
       commandClose.style.cursor = "pointer"; 
       commandClose.style.fontSize = "14px"; 
       commandClose.style.float = "right"; 
       commandClose.style.marginRight = "2px"; 
       commandClose.style.marginTop = "2px"; 
 
       //adicionar evento click
       commandClose.addEventListener("click",()=>this.removePopupsAtivos(),false);
 
       //eventos mouse
       commandClose.addEventListener('mouseover',()=>commandClose.style.border = "solid 1px" );
       commandClose.addEventListener('mouseout',()=>commandClose.style.border = 'none' );
 
       //retiornar botão
       return commandClose;
 
    }
 
    filtrarDados(inputValFind){
       
       let idColumnFind = this.idcoluna;
       let valorConsulta = inputValFind.value;
       let opigualA = document.querySelector(`#${this.table.id}-igualA`);
       let opcontemVal = document.querySelector(`#${this.table.id}-contemVal`);
 
       if(!valorConsulta && valorConsulta != '0') return;
 
       if(opigualA.checked){
 
          //filtar valores iguais
          this.findValuesEquals(idColumnFind,valorConsulta);
          
       }else if(opcontemVal.checked){
          //filtar valores contem
          this.findValuesContains(idColumnFind,valorConsulta);
       }
 
    }
 
    findValuesEquals(idColumnFind,valorConsulta){
       
       //selecionar bary tabela
       let tbody = this.table.getElementsByTagName("tbody");
       let linhas = tbody[0].getElementsByTagName('tr');
       let commandClearFind = document.querySelector(`.${this.table.id}-command-clear-filter`);
 
       this.table.getElementsByTagName("thead")[0].getElementsByTagName('tr')[0].children[idColumnFind].style.color = '#F4601E';
 
       //validar linhas
       for(let linha of linhas){
 
          if(linha.children[idColumnFind].innerHTML != valorConsulta){
             linha.style.display = "none";
             commandClearFind.style.color = "#F4601E";
 
             //ativar variavel filtro para evitar calculo de subtotal
             this.filtroAtivo = true;
          }
       }
 
       this.removePopupsAtivos();
 
    }
 
    findValuesContains(idColumnFind,valorConsulta){
       
       //selecionar bary tabela
       let tbody = this.table.getElementsByTagName("tbody");
       let linhas = tbody[0].getElementsByTagName('tr');
       let commandClearFind = document.querySelector(`.${this.table.id}-command-clear-filter`);
 
       this.table.getElementsByTagName("thead")[0].getElementsByTagName('tr')[0].children[idColumnFind].style.color = '#F4601E';
 
       //validar linhas
       for(let linha of linhas){
 
          let validarLinha = linha.children[idColumnFind].innerHTML.toUpperCase().indexOf(valorConsulta.trim().toUpperCase()) > -1 ? true : false;
 
          if(!validarLinha){
             linha.style.display = "none";
             commandClearFind.style.color = "#F4601E";
             
            //ativar variavel filtro para evitar calculo de subtotal
             this.filtroAtivo = true;
          }
       }
 
       this.removePopupsAtivos();
 
    }
 
    removeFilters(){
 
       //selecionar bary tabela
       let tbody = this.table.getElementsByTagName("tbody");
       let linhas = tbody[0].getElementsByTagName('tr');
       let commandClearFind = document.querySelector(`.${this.table.id}-command-clear-filter`);
           commandClearFind.style.color = "black";
 
       //validar linhas
       for(let linha of linhas){
 
             linha.style.display = "";
       }
    
       //selecionar cabeçalho
       let cabecalho = this.table.getElementsByTagName("thead")[0].getElementsByTagName('tr')[0].getElementsByTagName('th');
 
       //remover cor vermelha
       for(let column of cabecalho){
 
          column.style.color = "black";
 
       }
 
       //subtotal so pode ser calculado se não existir filtro ativo
       this.filtroAtivo = false;
 
       this.removePopupsAtivos();
    }
 
    removePopupsAtivos(){
 
      //remover popups ativos   
      let popupsAtivos = document.querySelectorAll(`.${this.table.id}-popupFiltosClassificacao`);
 
      if(popupsAtivos.length > 0){
 
         for(let popup of popupsAtivos){
              popup.remove();
         }
 
      }
 
    }
 
    formatNumero3Casas(numero){
 
       if(isNaN(numero)) return 0;
   
       /* converter em numero */
       numero = Number(numero).toFixed(3);
   
       /* quebrar em duas partes */
       let numArray = numero.split('.');
   
       /* captuar a parte inteira */
       let numeroFormate = numArray[0];
   
       let cont=0;
       let numeros='';
   
       /* formatar a parte inteira dividindo por ponto de trás para frente */
       for(let x = numeroFormate.length-1; x >-1; x-- ){
           numeros+=numeroFormate[x];
           cont++;
           if(cont === 3){
               if(x > 0) numeros += '.';
               cont=0;
           }
       }
           
       let numeroFormatado='';
       /* reorganizar a ordem dos numeros */
       for(let x = numeros.length-1; x >-1; x-- ){
           numeroFormatado += numeros[x];
       }
   
       /* re atribuir novo numero formatado a posição */
       numArray[0] = numeroFormatado;
   
       /* juntar a parte decimal com a parte iteira que foi formatada */
       return numArray.join(',');
   
   }
 
  
 }