class WomensDay2010Game {
    constructor() {
        this.numbers = ['2', '0', '1', '0'];
        this.correctOrder = ['2', '0', '1', '0'];
        this.currentSlots = ['', '', '', ''];
        this.draggedElement = null;
        this.draggedNumber = null;
        
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.celebrationScreen = document.getElementById('celebration-screen');
        this.startBtn = document.getElementById('start-btn');
        this.numberElements = document.querySelectorAll('.number');
        this.slots = document.querySelectorAll('.slot');
        
        // Audio elements
        this.dropSound = document.getElementById('drop-sound');
        this.successSound = document.getElementById('success-sound');
        this.celebrationMusic = document.getElementById('celebration-music');
        
        this.positionFallingNumbers();
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        
        // Setup drag and drop for numbers
        this.numberElements.forEach(numberEl => {
            this.setupDragEvents(numberEl);
        });
        
        // Setup drop zones for slots
        this.slots.forEach(slot => {
            this.setupDropZone(slot);
        });
    }

    positionFallingNumbers() {
        const numbers = document.querySelectorAll('.number');
        const positions = [
            { left: '15%', animationDelay: '0s' },
            { left: '35%', animationDelay: '0.5s' },
            { left: '65%', animationDelay: '1s' },
            { left: '85%', animationDelay: '1.5s' }
        ];

        numbers.forEach((number, index) => {
            const pos = positions[index];
            number.style.left = pos.left;
            number.style.animationDelay = pos.animationDelay;
        });
    }

    startGame() {
        this.welcomeScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        
        // Start falling animation
        setTimeout(() => {
            this.numberElements.forEach(el => {
                el.style.animationPlayState = 'running';
            });
        }, 500);
    }

    setupDragEvents(element) {
        let isDragging = false;
        let startX, startY, offsetX, offsetY;

        // Mouse events
        element.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.startDrag(element, e.clientX, e.clientY);
            isDragging = true;
            
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging && this.draggedElement === element) {
                this.updateDragPosition(e.clientX - offsetX, e.clientY - offsetY);
                this.highlightDropZone(e.clientX, e.clientY);
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (isDragging && this.draggedElement === element) {
                this.endDrag(e.clientX, e.clientY);
                isDragging = false;
            }
        });

        // Touch events for mobile
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrag(element, touch.clientX, touch.clientY);
            
            const rect = element.getBoundingClientRect();
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;
        });

        document.addEventListener('touchmove', (e) => {
            if (this.draggedElement === element) {
                e.preventDefault();
                const touch = e.touches[0];
                this.updateDragPosition(touch.clientX - offsetX, touch.clientY - offsetY);
                this.highlightDropZone(touch.clientX, touch.clientY);
            }
        });

        document.addEventListener('touchend', (e) => {
            if (this.draggedElement === element) {
                const touch = e.changedTouches[0];
                this.endDrag(touch.clientX, touch.clientY);
            }
        });
    }

    startDrag(element, x, y) {
        this.draggedElement = element;
        this.draggedNumber = element.dataset.number;
        
        element.classList.add('dragging');
        element.style.position = 'fixed';
        element.style.zIndex = '1000';
        element.style.pointerEvents = 'none';
        element.style.animation = 'none';
        
        this.updateDragPosition(x - 30, y - 30); // Center the element on cursor
    }

    updateDragPosition(x, y) {
        if (this.draggedElement) {
            this.draggedElement.style.left = x + 'px';
            this.draggedElement.style.top = y + 'px';
        }
    }

    highlightDropZone(x, y) {
        // Remove previous highlights
        this.slots.forEach(slot => slot.classList.remove('highlight'));
        
        // Find slot under cursor
        const elementBelow = document.elementFromPoint(x, y);
        if (elementBelow && elementBelow.classList.contains('slot')) {
            elementBelow.classList.add('highlight');
        }
    }

    endDrag(x, y) {
        if (!this.draggedElement) return;

        const elementBelow = document.elementFromPoint(x, y);
        
        if (elementBelow && elementBelow.classList.contains('slot') && !elementBelow.textContent.trim()) {
            // Valid drop
            this.dropNumberInSlot(elementBelow);
        } else {
            // Invalid drop - return to original position
            this.returnToOriginalPosition();
        }

        this.cleanup();
    }

    dropNumberInSlot(slot) {
        const position = parseInt(slot.dataset.position);
        const number = this.draggedNumber;
        
        // Update slot
        slot.textContent = number;
        slot.classList.add('filled');
        this.currentSlots[position] = number;
        
        // Hide the dragged number
        this.draggedElement.style.display = 'none';
        
        // Play drop sound
        this.playSound(this.dropSound);
        
        // Check if game is complete
        if (this.checkWin()) {
            setTimeout(() => this.showSuccess(), 500);
        }
    }

    returnToOriginalPosition() {
        // Reset the dragged element to its original state
        this.draggedElement.style.position = '';
        this.draggedElement.style.left = '';
        this.draggedElement.style.top = '';
        this.draggedElement.style.animation = '';
        
        // Restart falling animation
        setTimeout(() => {
            if (this.draggedElement) {
                this.draggedElement.style.animation = 'fall 3s ease-in-out infinite';
            }
        }, 100);
    }

    setupDropZone(slot) {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.draggedElement && !slot.textContent.trim()) {
                this.dropNumberInSlot(slot);
            }
        });
    }

    checkWin() {
        return this.currentSlots.every((slot, index) => slot === this.correctOrder[index]);
    }

    showSuccess() {
        // Play success sound
        this.playSound(this.successSound);
        
        // Add glow effect to slots
        this.slots.forEach(slot => {
            slot.classList.add('correct');
        });
        
        // After 2 seconds, show fire effect and transition to celebration
        setTimeout(() => {
            this.showCelebration();
        }, 2000);
    }

    showCelebration() {
        // Hide game screen and show celebration
        this.gameScreen.classList.add('hidden');
        this.celebrationScreen.classList.remove('hidden');
        
        // Play celebration music
        this.celebrationMusic.volume = 0.3;
        this.playSound(this.celebrationMusic);
        
        // Create additional sparkle effects
        this.createSparkleEffects();
    }

    createSparkleEffects() {
        const sparkleContainer = document.querySelector('.sparkles');
        
        setInterval(() => {
            if (document.querySelector('.celebration-screen:not(.hidden)')) {
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        const sparkle = document.createElement('div');
                        sparkle.className = 'sparkle';
                        sparkle.style.left = Math.random() * 100 + '%';
                        sparkle.style.top = Math.random() * 100 + '%';
                        sparkle.style.animationDelay = Math.random() * 2 + 's';
                        
                        sparkleContainer.appendChild(sparkle);
                        
                        setTimeout(() => {
                            sparkle.remove();
                        }, 2000);
                    }, i * 200);
                }
            }
        }, 3000);
    }

    playSound(audioElement) {
        if (audioElement) {
            audioElement.currentTime = 0;
            audioElement.play().catch(e => {
                console.log('Audio play prevented:', e);
            });
        }
    }

    cleanup() {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
            this.draggedElement.style.pointerEvents = '';
            this.draggedElement.style.zIndex = '';
        }
        
        this.slots.forEach(slot => slot.classList.remove('highlight'));
        this.draggedElement = null;
        this.draggedNumber = null;
    }
}

// Audio Context for better browser compatibility
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.setupAudioContext();
    }

    setupAudioContext() {
        // Create audio context on first user interaction
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });

        document.addEventListener('touchstart', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const audioManager = new AudioManager();
    const game = new WomensDay2010Game();
    
    // Add some background animation to the welcome screen
    const welcomeScreen = document.getElementById('welcome-screen');
    
    // Create floating hearts
    function createFloatingHeart() {
        const heart = document.createElement('div');
        heart.innerHTML = '💖';
        heart.style.position = 'absolute';
        heart.style.fontSize = '20px';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.top = '100%';
        heart.style.pointerEvents = 'none';
        heart.style.animation = 'floatUp 4s ease-out forwards';
        
        welcomeScreen.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 4000);
    }
    
    // Add CSS for floating hearts
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Start floating hearts
    setInterval(createFloatingHeart, 2000);
});

// Service Worker registration for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}