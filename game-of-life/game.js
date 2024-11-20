let size = 25;
let running = false;
let animationFrameId = null;
let simulationSpeed = 500;
let lastUpdateTime = 0;

let game = document.getElementById("gameOfLife").getContext("2d");
let canvas = document.getElementById("gameOfLife");
document.getElementById("gameOfLife").width = (window.innerWidth * .9) - ((window.innerWidth * .9) % size)
document.getElementById("gameOfLife").height = ((window.innerHeight - canvas.getBoundingClientRect().top) * .95) - (((window.innerHeight - canvas.getBoundingClientRect().top) * .95) % size)
let width = canvas.width;
let height = canvas.height;

function draw(xSize, ySize, style, squareWidth, squareHeight = squareWidth) {
    game.fillStyle = style;
    game.fillRect(xSize, ySize, squareWidth, squareHeight);
}

function gridInit(w, h) {
    let grid = [];
    for (let i = 0; i < w; i++) {
        grid[i] = [];
        for (let j = 0; j < h; j++) {
            grid[i][j] = 1;
        }
    }
    return grid;
}

let grid = [];

function create() {
    grid[0] = gridInit(width / size, height / size);
    grid[1] = gridInit(width / size, height / size);
    drawGrid();
}

function drawGrid() {
    game.clearRect(0, 0, width, height);
    draw(0, 0, getComputedStyle(document.documentElement).getPropertyValue('--firstColor') , width);
    for (let x = 0; x < width / size; x++) {
        for (let y = 0; y < height / size; y++) {
            if (grid[0][x][y] === 0) {
                draw(x * size, y * size, getComputedStyle(document.documentElement).getPropertyValue('--secondColor'), size);
            }
        }
    }
    for (let x = 0; x < width / size; x++) {
        if(x !== 0) draw(x * size, 0, getComputedStyle(document.documentElement).getPropertyValue('--thirdColor'), 1, height);
    }
    for (let y = 0; y < height / size; y++) {
        if(y !== 0) draw(0, y * size, getComputedStyle(document.documentElement).getPropertyValue('--thirdColor'), width, 1);
    }
}

function simulate(timestamp) {
    if (!running) return;

    if (timestamp - lastUpdateTime >= simulationSpeed) {
        // Run simulation step
        drawGrid();

        for (let x = 0; x < width / size; x++) {
            for (let y = 0; y < height / size; y++) {
                grid[1][x][y] = updateCell(x, y);
            }
        }

        grid[0] = JSON.parse(JSON.stringify(grid[1]));
        lastUpdateTime = timestamp;
    }

    animationFrameId = requestAnimationFrame(simulate);
}

function updateCell(x, y) {
    let count = 0;
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            let nx = x + dx;
            let ny = y + dy;
            if (nx >= 0 && nx < width / size && ny >= 0 && ny < height / size) {
                if (grid[0][nx][ny] === 0) count++;
            }
        }
    }
    if (count >= 4 || count < 2) return 1;
    if (grid[0][x][y] === 1 && count === 3) return 0;
    if (grid[0][x][y] === 0 && count === 2) return 0;
    return 1;
}

canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const gridX = Math.floor(mouseX / size);
    const gridY = Math.floor(mouseY / size);

    grid[0][gridX][gridY] = grid[0][gridX][gridY] === 0 ? 1 : 0;

    drawGrid();
});

function startSimulation() {
    if (!running) {
        running = true;
        requestAnimationFrame(simulate);
    }
}

function stopSimulation() {
    running = false;
    cancelAnimationFrame(animationFrameId);
}

function resetGrid() {
    stopSimulation();
    create();
}

function setSimulationSpeed(speed) {
    simulationSpeed = speed;
    document.getElementById("speedValue").textContent = speed;
}

document.getElementById("speed").value = simulationSpeed
document.getElementById("speedValue").textContent = simulationSpeed;
create();
