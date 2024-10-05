const canvas = document.getElementById('rainfall');
const ctx = canvas.getContext('2d');

// Set canvas size to match window size
canvas.width = window.innerWidth;   
canvas.height = window.innerHeight;

// Create an array to store the raindrops
const raindrops = [];

// Function to create a new raindrop
function createRaindrop() {
    const x = canvas.width + 1; // Start off the right side of the canvas
    const y = Math.random() * canvas.height; // Random vertical position
    const speed = Math.random() * 3 + 3; // Speed of the raindrop
    const length = Math.random() * 9 + 2; // Length of the raindrop

    raindrops.push({ x, y, speed, length });
}

// Function to update the raindrops' positions
function updateRaindrops() {
    for (let i = 0; i < raindrops.length; i++) {
        const raindrop = raindrops[i];

        raindrop.x -= raindrop.speed; // Move left

        // Remove raindrop if it goes off the left side of the canvas
        if (raindrop.x < -raindrop.length) {
            raindrops.splice(i, 1);
            i--;
        }
    }
}

// Function to draw the raindrops
function drawRaindrops() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    for (let i = 0; i < raindrops.length; i++) {
        const raindrop = raindrops[i];

        ctx.beginPath();
        ctx.moveTo(raindrop.x, raindrop.y);
        ctx.lineTo(raindrop.x - raindrop.length, raindrop.y); // Draw line to the left
        ctx.stroke();
    }
}

// Function to animate the raindrops
function animate() {
    createRaindrop();
    updateRaindrops();
    drawRaindrops();

    requestAnimationFrame(animate);
}

// Start the animation
animate();
