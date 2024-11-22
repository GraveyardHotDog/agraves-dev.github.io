let canvas = document.getElementById("bgCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let firstColor = getComputedStyle(document.documentElement).getPropertyValue('--firstColor');
let secondColor = getComputedStyle(document.documentElement).getPropertyValue('--secondColor');
let thirdColor = getComputedStyle(document.documentElement).getPropertyValue('--thirdColor');
let ctx = canvas.getContext('2d');

let dotRadius = 2 // px
let alphaSpeed = .001
let numberOfDots = 25
let collisionAvoidanceDistance = 10
let avoidFactor = .1
let centeringFactor = .00001
let viewDistance = 30
let edgeMargin = 30
let edgeAvoidanceFactor = .2
let alignmentFactor = .05
let minimumSpeed = .5
let maximumSpeed = 2
let cursorViewDistance = 50

let mousePos = { x: null, y: null };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let newNumberOfDots = Math.floor(canvas.width * canvas.height / 5000);

    if (newNumberOfDots > numberOfDots) {
        points = createRandomPoints(newNumberOfDots, points);
    } else {
        points = points.slice(0, newNumberOfDots);
    }

    numberOfDots = newNumberOfDots;
}

class Point {
    constructor(x, y, dx, dy, alpha, positiveAlpha) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.alpha = 1;
        this.positiveAlpha = positiveAlpha;
    }
}

let points = createRandomPoints(numberOfDots);

function createRandomPoints(number, previousPoints = []) {
    let points = [];
    for (let i = 0; i < number; i++) {
        if (previousPoints[i] === undefined)
            points[i] = new Point(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                ((Math.random() * 2) - 1) * minimumSpeed,
                ((Math.random() * 2) - 1) * minimumSpeed,
                Math.random() * 2 - 1,
                Math.round(Math.random())
            );
        else points[i] = previousPoints[i];
    }
    return points;
}

function pointDistance(point1, point2) {
    return Math.hypot(point1.x - point2.x, point1.y - point2.y);
}

function getMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = event.clientX - rect.left;
    mousePos.y = event.clientY - rect.top;
}
window.addEventListener('mousemove', getMousePos);

function plotPoints(timestamp) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = firstColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = thirdColor;

    for (let point of points) {
        let closeDx = 0, closeDy = 0;
        for (let evalPoint of points) {
            if (point !== evalPoint && pointDistance(point, evalPoint) < collisionAvoidanceDistance) {
                closeDx += point.x - evalPoint.x;
                closeDy += point.y - evalPoint.y;
            }
        }
        point.dx += closeDx * avoidFactor;
        point.dy += closeDy * avoidFactor;

        if (mousePos.x !== null && mousePos.y !== null && pointDistance(point, mousePos) < cursorViewDistance) {
            point.dx += (point.x - mousePos.x) * avoidFactor;
            point.dy += (point.y - mousePos.y) * avoidFactor;
        }

        let dxAverage = 0, dyAverage = 0, numNearbyDots = 0;
        for (let evalPoint of points) {
            if (point !== evalPoint && pointDistance(point, evalPoint) < viewDistance) {
                dxAverage += evalPoint.dx;
                dyAverage += evalPoint.dy;
                numNearbyDots++;
            }
        }
        if (numNearbyDots > 0) {
            dxAverage /= numNearbyDots;
            dyAverage /= numNearbyDots;
            point.dx += (dxAverage - point.dx) * alignmentFactor;
            point.dy += (dyAverage - point.dy) * alignmentFactor;
        }

        let xAverage = 0, yAverage = 0;
        numNearbyDots = 0;
        for (let evalPoint of points) {
            if (point !== evalPoint && pointDistance(point, evalPoint) < viewDistance) {
                xAverage += evalPoint.x;
                yAverage += evalPoint.y;
                numNearbyDots++;
            }
        }
        if (numNearbyDots > 0) {
            xAverage /= numNearbyDots;
            yAverage /= numNearbyDots;
            point.dx += (xAverage - point.x) * centeringFactor;
            point.dy += (yAverage - point.y) * centeringFactor;
        }

        if (point.x < edgeMargin) point.dx += edgeAvoidanceFactor;
        if (point.y < edgeMargin) point.dy += edgeAvoidanceFactor;
        if (point.x > (canvas.width - edgeMargin)) point.dx -= edgeAvoidanceFactor;
        if (point.y > (canvas.height - edgeMargin)) point.dy -= edgeAvoidanceFactor;

        let speed = Math.hypot(point.dx, point.dy);
        if (speed > maximumSpeed) {
            point.dx = (point.dx / speed) * maximumSpeed;
            point.dy = (point.dy / speed) * maximumSpeed;
        }
        if (speed < minimumSpeed) {
            point.dx = (point.dx / speed) * minimumSpeed;
            point.dy = (point.dy / speed) * minimumSpeed;
        }

        point.x += point.dx;
        point.y += point.dy;

        ctx.beginPath();
        ctx.arc(point.x, point.y, dotRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }

    requestAnimationFrame(plotPoints);
}

resize();
requestAnimationFrame(plotPoints);
