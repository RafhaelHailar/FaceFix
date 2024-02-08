const con = document.querySelector("#container");
let cells;
const GRID = 3;
const States = {
    SELECT: "SELECT",
    PLACE: "PLACE"
}

let state = States.SELECT;
let target = null;

let startTime;
let isWin = false;

let loopId;

const IMAGES = [];

function handleClick() {
    const id = Number(this.getAttribute("data-id"));
    switch (state) {
        case States.SELECT:
            selectCell(id);
            break;
        case States.PLACE:
            placeCell(id);        
            break;
    }
}

function selectCell(id) {
    let adjacentCells = [
        id - 1,
        id - GRID,
        id + 1,
        id + GRID
    ];

    target = id;

    cells[target].classList.add("target");

    for (let i = 0;i < adjacentCells.length;i++) {
        let index = adjacentCells[i];
        if (index < 0 || index > cells.length - 1 ||
            (id % 3 == 0 && index % 3 == 2) ||
            (id % 3 == 2 && index % 3 == 0)) continue;
        
        let adjacentCell = cells[index];
        if (adjacentCell.innerHTML == "") {
            adjacentCell.classList.add("adjacend");
        }
    }
    
    state = States.PLACE;
}

function placeCell(id) {
    const cell = cells[id];

    if (cell.classList.contains("adjacend")) {
        let temp = cells[target].innerHTML;
        cells[target].innerHTML = cell.innerHTML;
        cell.innerHTML = temp;
    }

    cells[target].classList.remove("target");

    state = States.SELECT;
    removeAdjacent();
}

function removeAdjacent() {
    const adjacents = document.querySelectorAll("#container div.adjacend");
    
    for (let i = 0;i < adjacents.length;i++) {
        adjacents[i].classList.remove("adjacend");
    }
}

function getImages() {
    for (let y = 0;y < 3;y++) {
        for (let x = 0;x < 3;x++) {
            let image = `./images/image_${x}${y}.png`;
            IMAGES.push(image);
        }
    }
}

function getEmptyCell() {
    let index = -1;
    for (let i = 0;i < cells.length;i++) {
        let cell = cells[i];
        let img = cell.querySelector("img");
        
        if (!img) index = i;
    }

    return index;
}

function shuffle() {
    let a = getEmptyCell();

    let adjacentCells = [
        a - 1,
        a - GRID,
        a + 1,
        a + GRID
    ];
    let b = adjacentCells[Math.floor(Math.random() * adjacentCells.length)];
    if (b < 0 || b > cells.length - 1 ||
            (a % 3 == 0 && b % 3 == 2) ||
            (a % 3 == 2 && b % 3 == 0)) return;


    let first = cells[a];
    let second = cells[b];

    let temp = first.innerHTML;
    first.innerHTML = second.innerHTML;
    second.innerHTML = temp;
}

function trackTime() {
    const currTime = new Date();
    const deltaTime = currTime - startTime;

    let seconds = deltaTime / 1000;
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    const secondsDisplay = document.querySelector("#timer .seconds");
    const minutesDisplay = document.querySelector("#timer .minutes");

    secondsDisplay.innerHTML = String(seconds).split(".")[0].padStart(2,"0");
    minutesDisplay.innerHTML = String(minutes).padStart(2,"0");
}

function logic() {
    let win = true;
    for (let i = 0;i < cells.length;i++) {
        const cell = cells[i];
        const image = cell.querySelector("img");
        if (!image) continue; 
        const cellID = Number(cell.getAttribute("data-id"));
        const imgID = Number(image.getAttribute("data-id"));

        if (cellID != imgID) win = false;
    }

    isWin = win;
}

function track() {
   if (isWin) {
       alert("YOU WIN!");
       return;
   }
   logic();
   trackTime();
   loopId = requestAnimationFrame(track);
}

function addImage() {
   const image = this.files[0]; 
   const src = URL.createObjectURL(image);
   const canvasImage = new Image();
   const origImgHTML = document.querySelector("#orig-img");
   canvasImage.src = src;
   origImgHTML.src = src;

   canvasImage.onload = function() {
       removeImages();
       con.style.aspectRatio = String(this.width / this.height);
        
       const sw = this.width / GRID;
       const sh = this.height / GRID;
       
       for (let y = 0;y < GRID;y++) {
          for (let x = 0;x < GRID;x++) {

             const canvas = document.createElement("canvas");
             canvas.width = this.width / GRID;
             canvas.height = this.height / GRID;

             const context = canvas.getContext("2d");

             context.drawImage(canvasImage,x * sw,y * sh,sw,sh,0,0,canvas.width,canvas.height);

             const canvasData = canvas.toDataURL("image/jpg");

             IMAGES.push(canvasData);
          }
       }

       cancelAnimationFrame(loopId);
       displayImages();
       reinit();
   };
}

function displayImages() {
    removeChilds();

    for (let i = 0;i < GRID * GRID;i++) {
        const div = document.createElement("div");
        if (i != 0) {
            const img = document.createElement("img");
            img.setAttribute("data-id",i)
            img.src = `${IMAGES[i]}`;
            div.appendChild(img);
        }
        div.setAttribute("data-id",i);
        div.addEventListener("click", handleClick);
        con.appendChild(div);
    }

    cells = document.querySelectorAll("#container > div");
}

function init() {
    for (let i = 0;i < 100;i++) {
        shuffle();
    }

    startTime = new Date();
    isWin = false;
    requestAnimationFrame(track);
}

function reinit() {
    init();
}

function removeImages() {
    let image;
    while (image = IMAGES.pop()) {
        URL.revokeObjectURL(image);
    }
}

function removeChilds() {
    const conChilds = con.querySelectorAll("div");
    for (let i = 0;i < conChilds.length;i++) conChilds[i].remove();
}

window.addEventListener("DOMContentLoaded",function() {
    getImages();

    displayImages();
    init();
   
    const addImgBtn = document.querySelector("#add-img-btn");
    const addImgFile = document.querySelector(".add-img-container input[type=file");

    addImgBtn.addEventListener("click",function() {
        addImgFile.click();
    });

    addImgFile.addEventListener("change",addImage);
});
