let canvas = document.getElementById("graph");
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.8;
let firstColor = getComputedStyle(document.documentElement).getPropertyValue('--firstColor');
let secondColor = getComputedStyle(document.documentElement).getPropertyValue('--secondColor');
let thirdColor = getComputedStyle(document.documentElement).getPropertyValue('--thirdColor');
let ctx = canvas.getContext('2d');
let textBox = document.getElementById("equation");

let zeroX = Math.floor(canvas.width / 2);
let zeroY = Math.floor(canvas.height / 2);

let scale = 50
let lineWidth = 3

function evaluate(x) {
    try {
        let equation = textBox.value;
        return Function("x", `return ${equation}`)(x);
    } catch {
        return null;
    }
}

function drawLine(x1, y1, x2, y2) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = secondColor;
    ctx.fillStyle = secondColor;
    ctx.alpha = 1
    ctx.beginPath();
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
}
function drawGrid(){
    ctx.lineWidth = 1
    ctx.strokeStyle = thirdColor;
    ctx.alpha = 1
    ctx.beginPath();
    ctx.moveTo(zeroX,0);
    ctx.lineTo(zeroX,canvas.height);
    ctx.stroke();
    ctx.beginPath()
    ctx.moveTo(0, zeroY);
    ctx.lineTo(canvas.width, zeroY)
    ctx.stroke()
}

function graph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid()
    for (let x = -zeroX - 1; x <= zeroX; x++) {
        let y = evaluate(x / scale);
        if (y === null) continue;
        let pixelX = x + zeroX;
        let pixelY = -y * scale + zeroY;
        let nextY = evaluate((x + 1) / scale);
        if (nextY === null) continue;
        let nextPixelX = x + 1 + zeroX;
        let nextPixelY = -nextY * scale + zeroY;
        if (pixelY >= 0 && pixelY < canvas.height) {
            drawLine(pixelX, pixelY, nextPixelX, nextPixelY);
        }
    }
}

function setScale(s){
    scale = s
    graph()
}

textBox.addEventListener("input", () => graph());
graph();
