import { gsap } from "gsap";

// Particles animation
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initCardsAnimation();
    addButtonEffects();
    initModalInteractions();
});

function initParticles() {
    const particlesContainer = document.querySelector('.particles');
    const particleCount = 50;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random particle style
        const size = Math.random() * 5 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const opacity = Math.random() * 0.5 + 0.2;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            left: ${posX}%;
            top: ${posY}%;
            background: ${i % 3 === 0 ? '#ff7b00' : i % 3 === 1 ? '#ff00d4' : '#00aaff'};
            opacity: ${opacity};
            pointer-events: none;
        `;
        
        particlesContainer.appendChild(particle);
        
        // Animation
        gsap.to(particle, {
            y: `${Math.random() * 100 - 50}vh`,
            x: `${Math.random() * 100 - 50}vw`,
            opacity: 0,
            duration: duration,
            delay: delay,
            repeat: -1,
            ease: "power1.inOut",
            onRepeat: () => {
                gsap.set(particle, {
                    x: `${posX}vw`,
                    y: `${posY}vh`,
                    opacity: opacity
                });
            }
        });
    }
}

function initCardsAnimation() {
    // Stagger animation for cards on load
    gsap.from('.game-card', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.5
    });
    
    // Hero text animation
    gsap.from('.hero h1', {
        y: -50,
        opacity: 0,
        duration: 1.2,
        ease: "elastic.out(1, 0.5)"
    });
    
    gsap.from('.hero p', {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.3
    });
}

function addButtonEffects() {
    // Game cards hover effects
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            const iconElement = this.querySelector('.game-icon');
            gsap.to(iconElement, {
                rotationY: 180,
                duration: 0.8,
                ease: "power2.out"
            });
        });
        
        card.addEventListener('mouseleave', function() {
            const iconElement = this.querySelector('.game-icon');
            gsap.to(iconElement, {
                rotationY: 0,
                duration: 0.8,
                ease: "power2.out"
            });
        });
    });
    
    // Play button click effect
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            this.appendChild(ripple);
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            // Cleanup
            setTimeout(() => {
                ripple.remove();
                
                // For demo purposes, show a notification
                const gameType = this.closest('.game-card').id.split('-')[0];
                showGameStartNotification(gameType);
                
            }, 500);
        });
    });
}

function showGameStartNotification(gameType) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'game-notification';
    
    let gameName = '';
    switch(gameType) {
        case 'rpg':
            gameName = 'Aventura Mística';
            break;
        case 'puzzle':
            gameName = 'Enigmas Infinitos';
            break;
        case 'arcade':
            gameName = 'Clássicos Renovados';
            break;
    }
    
    notification.innerHTML = `<p>Iniciando ${gameName}...</p>`;
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(20, 20, 35, 0.9);
        color: #fff;
        padding: 15px 30px;
        border-radius: 50px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        z-index: 100;
    `;
    
    document.body.appendChild(notification);
    
    // Animation
    gsap.from(notification, {
        y: 50,
        opacity: 0,
        duration: 0.5
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        gsap.to(notification, {
            y: 50,
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                notification.remove();
            }
        });
    }, 3000);
}

function initModalInteractions() {
    const gameCards = document.querySelectorAll('.play-btn');
    const modal = document.getElementById('game-modal');
    const closeModal = document.querySelector('.close-modal');
    const startGameButtons = document.querySelectorAll('.start-game');

    // Open modal
    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            modal.style.display = 'flex';
            gsap.from('.modal-content', {
                scale: 0.7,
                opacity: 0,
                duration: 0.5,
                ease: "back.out(1.7)"
            });
        });
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        gsap.to('.modal-content', {
            scale: 0.7,
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                modal.style.display = 'none';
            }
        });
    });

    // Start game buttons
    startGameButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const gameType = e.target.closest('.modal-game-option').dataset.game;
            redirectToGame(gameType);
        });
    });
}

function redirectToGame(gameType) {
    switch(gameType) {
        case 'rpg':
            window.location.href = 'rpg-game.html';
            break;
        case 'puzzle':
            window.location.href = 'puzzle-game.html';
            break;
        case 'arcade':
            window.location.href = 'arcade-game.html';
            break;
    }
}