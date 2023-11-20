class Particle {
    constructor(x, y, mass, vx = Math.random() * 1 - 0.5, vy = Math.random() * 1 - 0.5) {
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.radius = Math.pow(mass, 0.25); // Scale radius to mass for visibility
        this.vx = vx;
        this.vy = vy;
        this.glow = (this.mass > 1000) ? true : false;

        // pulse effect
        this.glowIntensity = 0; // Initial Intensity
        this.isPulsing = false; // Is the particle currently pulsing
        this.pulseTimer = 0; // Timer for the pulse animation

        if (this.glow) this.startPulse();

    }

    // Check if the particle is within the canvas bounds
    isInBounds(canvasWidth, canvasHeight) {
        const isInsideHorizontalBounds = this.x + this.radius > 0 && this.x - this.radius < canvasWidth;
        const isInsideVerticalBounds = this.y + this.radius > 0 && this.y - this.radius < canvasHeight;
        return isInsideHorizontalBounds && isInsideVerticalBounds;
    }

    // New method to start the pulse
    startPulse() {
        if (!this.isPulsing) {
            this.isPulsing = true;
            this.pulseTimer = 0; // Reset the timer
            this.glowIntensity = 0;
            // Start the pulse effect by setting the glow intensity
            // This logic will need to be expanded based on the desired pulse effect
        }
    }

    // New method to update the pulse
    updatePulse(deltaTime) {
        if (this.isPulsing) {
            const pulseDuration = 100; // duration of the pulse in milliseconds
            const maxIntensity = 1.0; // maximum intensity of the pulse

            // Increment the timer
            this.pulseTimer += deltaTime;

            // Calculate the current phase of the pulse
            if (this.pulseTimer < pulseDuration) {
                // Calculate intensity as a function of time, for example:
                this.glowIntensity = maxIntensity * Math.sin((Math.PI * this.pulseTimer) / pulseDuration);
            } else {
                // If the pulse is complete, reset the pulse properties
                this.isPulsing = false;
                this.glowIntensity = 0;
                this.pulseTimer = 0;
            }
        }
    }

    draw(ctx, deltaTime) {
        if (this.isInBounds(ctx.canvas.width, ctx.canvas.height)) {
            
            // Create a radial gradient
            // The inner circle i/gls at the particle's position
            // The outer circle's radius defines the extent of the glow
            let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);

            let alpha = this.glowIntensity;
            gradient.addColorStop(0, `rgba(255, 255, 255, ${Math.min(alpha + 0.8, 1)})`); // White center
            gradient.addColorStop(0.33, `rgba(255, 255, 255, ${Math.min(alpha + 0.8, 1)})`); // White edge
            gradient.addColorStop(0.34, `rgba(255, 255, 255, ${0.5 * alpha})`); // White edge
            gradient.addColorStop(0.5, `rgba(255, 255, 220, ${0.4 * alpha})`); // Light yellow
            gradient.addColorStop(1, 'rgba(255, 255, 0, 0)'); // Transparent yellow
            
            if (this.isPulsing) {
                this.updatePulse(deltaTime);
            }
            
            // Draw Particle
            ctx.beginPath();
            ctx.arc(
                this.x, 
                this.y, 
                (this.glow) ? this.radius * 3 : this.radius, 
                0, 
                2 * Math.PI
            );
            ctx.fillStyle = (this.glow) ? gradient : "#fff";
            ctx.fill();
        }
    }

    updatePosition() {
        this.x += this.vx;
        this.y += this.vy;
    }

    applyForce(fx, fy) {
        this.vx += fx / this.mass;
        this.vy += fy / this.mass;
    }

    distanceTo(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    hasCollision(other) {
        return this.distanceTo(other) < this.radius + other.radius;
    }
}


class Simulation {
    constructor() {
        this.particles = [];
    }

    addParticle(x, y, mass) {
        const newParticle = new Particle(x, y, mass);
        this.particles.push(newParticle);
    }

    updatePhysics() {
        let newParticles = [];
    
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
            
                // Calculate forces and update velocities
                this.applyGravity(p1, p2);
            
                // Check for collision and create new particles if necessary
                if (p1.hasCollision(p2)) {
                    const newParticle = this.combineParticles(p1, p2);
                    newParticles.push(newParticle);
                    this.particles.splice(j, 1); // Remove p2
                    this.particles.splice(i, 1); // Remove p1
                    i--; // Adjust index after removal
                    break;
                }
            }
        }
    
        this.particles = this.particles.concat(newParticles);
        this.updatePositions();
    }

    applyGravity(p1, p2) {

        const G = 0.01
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = (G * p1.mass * p2.mass) / (distance * distance);
    
        const fx = (force * dx) / distance;
        const fy = (force * dy) / distance;
    
        p1.applyForce(fx, fy);
        p2.applyForce(-fx, -fy);
    }

    combineParticles(p1, p2) {
        const combinedMass = p1.mass + p2.mass;
        const combinedVelocityX = (p1.vx * p1.mass + p2.vx * p2.mass) / combinedMass;
        const combinedVelocityY = (p1.vy * p1.mass + p2.vy * p2.mass) / combinedMass;
        const newX = (p1.x * p1.mass + p2.x * p2.mass) / combinedMass;
        const newY = (p1.y * p1.mass + p2.y * p2.mass) / combinedMass;
    
        return new Particle(newX, newY, combinedMass, combinedVelocityX, combinedVelocityY);
    }

    updatePositions() {
        for (const particle of this.particles) {
            particle.updatePosition();
        }
    }
    drawAstronomicalObjectsGradient(ctx) {
        // Define the gradient start and end points
        const gradientHeight = 50; // Height of the gradient rectangle
        const gradientWidth = 500; // width of the gradient rectangle
        const gradient = ctx.createLinearGradient(0, 0, gradientWidth, 0); // Horizontal gradient
        // const gradientX =

        // Define color stops for each astronomical object
        gradient.addColorStop(0, '#303030'); // Asteroid: Dark grey
        gradient.addColorStop(0.1, '#8B8B83'); // Moon: Light grey
        gradient.addColorStop(0.2, '#A52A2A'); // Terrestrial Planet: Reddish-brown
        gradient.addColorStop(0.4, '#FFD700'); // Gas Giant: Pale yellow
        gradient.addColorStop(0.4, '#FFD700'); // Brown dwarf star: Pale yellow
        gradient.addColorStop(0.6, '#FF4500'); // red dwarf Star: Red
        gradient.addColorStop(0.6, '#FF4500'); // Small Star: orange
        gradient.addColorStop(0.6, '#FF4500'); // Normal Yellow Star: Yellow
        gradient.addColorStop(0.6, '#FF4500'); // Normal White Star: White  
        gradient.addColorStop(0.6, '#FF4500'); // Normal Blue Star: Blue  
        gradient.addColorStop(0.7, '#FF4500'); // Red Giant Star: Deep red
        gradient.addColorStop(0.8, '#ADD8E6'); // Blue Giant Star: Bright blue
        gradient.addColorStop(0.85, '#FFFFFF'); // Supernova: White
        gradient.addColorStop(0.9, '#B0C4DE'); // Neutron Star: Silver
        gradient.addColorStop(1, '#2F0F4C'); // Black Hole: Dark purple to black

        // Set the fill style to the gradient
        ctx.fillStyle = gradient;

        // Draw the rectangle
        ctx.fillRect(0, 0, gradientWidth, gradientHeight);
    }

// Call this function in your animation loop or wherever you handle the canvas drawing
    draw(ctx, deltaTime) {
        this.drawAstronomicalObjectsGradient(ctx);
        for (const particle of this.particles) {
            particle.draw(ctx, deltaTime);
        }
    }
}


// Set up canvas and context
const canvas = document.getElementById('simulation');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Create simulation instance
const simulation = new Simulation();

// Populate the simulation with initial particles
function initializeParticles() {
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * (canvas.width / 1.3) + (canvas.width / 8);
        const y = Math.random() * (canvas.height / 1.3) + (canvas.height / 8);
        const mass = Math.random() * 10 + 1;
        simulation.addParticle(x, y, mass);
    }
}

initializeParticles();

let lastTime = 0;

// Animation loop
function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    simulation.updatePhysics();
    simulation.draw(ctx, deltaTime);

    requestAnimationFrame(animate); // Call animate for the next frame
}

animate(); // Start the animation loop

// Handle window resize
window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});