let canvas = document.getElementById("bgCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight
let firstColor = getComputedStyle(document.documentElement).getPropertyValue('--firstColor')
let secondColor = getComputedStyle(document.documentElement).getPropertyValue('--secondColor')
let thirdColor = getComputedStyle(document.documentElement).getPropertyValue('--thirdColor')
let ctx = canvas.getContext('2d');

let dotRadius = 2 // px
let dotSpeed = .1
let alphaSpeed = .001
let numberOfDots = 20

let running = false;
let animationFrameId = null;
let updateFrequency = 100; // ms
let lastUpdateTime = 0; // ms


window.addEventListener('resize', () => resize());

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let newNumberOfDots = Math.floor(canvas.width * canvas.height / 2000);

    if (newNumberOfDots > numberOfDots) {
        points = createRandomPoints(newNumberOfDots, points);
    } else {
        points = points.slice(0, newNumberOfDots);
    }

    numberOfDots = newNumberOfDots;
}


class Point{
    constructor(x, y, direction, alpha, positive) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.alpha = alpha
        this.positive = positive;
    }
}

let points = createRandomPoints(numberOfDots)

function createRandomPoints(number, previousPoints = []){
    let points = [];
    for(let i = 0; i < number; i++){
        if(previousPoints[i] === undefined)
            points[i] =
                new Point(Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    Math.random() * 2 * Math.PI,
                    Math.random() * 2 - 1,
                    Math.round(Math.random()));
        else points[i] = previousPoints[i];
    }
    return points;
}

function plotPoints(timestamp){
    ctx.globalAlpha = 1;
    ctx.fillStyle = firstColor
    ctx.fillRect(0 , 0, canvas.width, canvas.height);
    ctx.fillStyle = thirdColor;
    for(let point of points){
        ctx.globalAlpha = Math.max(point.alpha, 0);
        if(point.alpha <= -1) point.positive = true
        if(point.alpha >= 1) point.positive = false
        if(point.positive) point.alpha += alphaSpeed
        else point.alpha -= alphaSpeed

        point.x = point.x + Math.cos(point.direction) * dotSpeed
        point.y = point.y + Math.sin(point.direction) * dotSpeed

        if((point.x <= dotRadius && Math.sign(Math.cos(point.direction)) < 0) || (point.x >= (canvas.width - dotRadius) && Math.sign(Math.cos(point.direction)) > 0)) point.direction = Math.PI - point.direction
        if((point.y <= dotRadius && Math.sign(Math.sin(point.direction)) < 0) || (point.y >= (canvas.height - dotRadius) && Math.sign(Math.sin(point.direction)) > 0)) point.direction = -point.direction

        ctx.beginPath();
        ctx.arc(point.x, point.y, dotRadius, 0, 2 * Math.PI);
        ctx.stroke()
        ctx.fill()
    }
    lastUpdateTime = timestamp;
    animationFrameId = requestAnimationFrame(plotPoints)
}

resize()
requestAnimationFrame(plotPoints);