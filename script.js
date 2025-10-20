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
        this.bgMusic = document.getElementById('bg-music');
        this.backgroundMusic = document.getElementById('background-music');
        this.backgroundMusic = document.getElementById('background-music');
        
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
        
        // Reposition numbers on screen resize
        window.addEventListener('resize', () => {
            this.positionFallingNumbers();
        });
        
        // Prevent context menu on long press (mobile)
        document.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('number')) {
                e.preventDefault();
            }
        });
    }

    positionFallingNumbers() {
        const numbers = document.querySelectorAll('.number');
        
        // Responsive positioning based on screen size
        const screenWidth = window.innerWidth;
        let positions;
        
        if (screenWidth <= 480) {
            // Mobile phones - tighter spacing
            positions = [
                { left: '12%', animationDelay: '0s' },
                { left: '30%', animationDelay: '0.5s' },
                { left: '55%', animationDelay: '1s' },
                { left: '75%', animationDelay: '1.5s' }
            ];
        } else if (screenWidth <= 768) {
            // Tablets - medium spacing  
            positions = [
                { left: '15%', animationDelay: '0s' },
                { left: '32%', animationDelay: '0.5s' },
                { left: '58%', animationDelay: '1s' },
                { left: '78%', animationDelay: '1.5s' }
            ];
        } else {
            // Desktop - original spacing
            positions = [
                { left: '20%', animationDelay: '0s' },
                { left: '35%', animationDelay: '0.5s' },
                { left: '55%', animationDelay: '1s' },
                { left: '75%', animationDelay: '1.5s' }
            ];
        }

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
        let touchIdentifier = null;

        // Mouse events
        element.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            this.startDrag(element, e.clientX, e.clientY);
            isDragging = true;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging && this.draggedElement === element) {
                e.preventDefault();
                const newX = e.clientX - offsetX;
                const newY = e.clientY - offsetY;
                
                this.updateDragPosition(newX, newY);
                this.highlightDropZone(e.clientX, e.clientY);
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (isDragging && this.draggedElement === element) {
                e.preventDefault();
                this.endDrag(e.clientX, e.clientY);
                isDragging = false;
            }
        });

        // Enhanced Touch events for mobile
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const touch = e.touches[0];
            touchIdentifier = touch.identifier;
            
            const rect = element.getBoundingClientRect();
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;
            
            this.startDrag(element, touch.clientX, touch.clientY);
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (this.draggedElement === element) {
                e.preventDefault();
                
                // Find the correct touch point
                let touch = null;
                for (let i = 0; i < e.touches.length; i++) {
                    if (e.touches[i].identifier === touchIdentifier) {
                        touch = e.touches[i];
                        break;
                    }
                }
                
                if (touch) {
                    const newX = touch.clientX - offsetX;
                    const newY = touch.clientY - offsetY;
                    
                    this.updateDragPosition(newX, newY);
                    this.highlightDropZone(touch.clientX, touch.clientY);
                }
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (this.draggedElement === element) {
                e.preventDefault();
                
                // Find the correct touch point in changedTouches
                let touch = null;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === touchIdentifier) {
                        touch = e.changedTouches[i];
                        break;
                    }
                }
                
                if (touch) {
                    this.endDrag(touch.clientX, touch.clientY);
                }
                touchIdentifier = null;
            }
        }, { passive: false });
    }

    startDrag(element, x, y) {
        this.draggedElement = element;
        this.draggedNumber = element.dataset.number;
        
        element.classList.add('dragging');
        element.style.position = 'fixed';
        element.style.zIndex = '1000';
        element.style.pointerEvents = 'none';
        element.style.animation = 'none';
        element.style.transition = 'transform 0.2s ease';
        
        // Get element dimensions for better centering
        const rect = element.getBoundingClientRect();
        const centerOffsetX = rect.width / 2;
        const centerOffsetY = rect.height / 2;
        
        this.updateDragPosition(x - centerOffsetX, y - centerOffsetY);
    }

    updateDragPosition(x, y) {
        if (this.draggedElement) {
            // Lấy kích thước phần tử và viewport
            const elementRect = this.draggedElement.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const elementWidth = elementRect.width;
            const elementHeight = elementRect.height;
            
            // Giới hạn vị trí trong khung hình với padding 10px
            const padding = 10;
            const constrainedX = Math.max(padding, Math.min(x, viewportWidth - elementWidth - padding));
            const constrainedY = Math.max(padding, Math.min(y, viewportHeight - elementHeight - padding));
            
            this.draggedElement.style.left = constrainedX + 'px';
            this.draggedElement.style.top = constrainedY + 'px';
        }
    }

    highlightDropZone(x, y) {
        // Remove previous highlights
        this.slots.forEach(slot => {
            slot.classList.remove('highlight', 'magnetic');
        });
        
        // Find closest slot with magnetic effect
        let closestSlot = null;
        let closestDistance = Infinity;
        const magneticRadius = 80; // Radius for magnetic effect
        
        this.slots.forEach(slot => {
            if (slot.textContent.trim()) return; // Skip filled slots
            
            const slotRect = slot.getBoundingClientRect();
            const slotCenterX = slotRect.left + slotRect.width / 2;
            const slotCenterY = slotRect.top + slotRect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(x - slotCenterX, 2) + Math.pow(y - slotCenterY, 2)
            );
            
            if (distance < magneticRadius && distance < closestDistance) {
                closestDistance = distance;
                closestSlot = slot;
            }
        });
        
        // Highlight closest slot if within range
        if (closestSlot) {
            closestSlot.classList.add('highlight');
            
            // Add magnetic effect if very close
            if (closestDistance < 50) {
                closestSlot.classList.add('magnetic');
                
                // Magnetic snap effect for dragged element
                if (this.draggedElement && closestDistance < 30) {
                    const slotRect = closestSlot.getBoundingClientRect();
                    const slotCenterX = slotRect.left + slotRect.width / 2;
                    const slotCenterY = slotRect.top + slotRect.height / 2;
                    
                    const elementRect = this.draggedElement.getBoundingClientRect();
                    const newX = slotCenterX - elementRect.width / 2;
                    const newY = slotCenterY - elementRect.height / 2;
                    
                    this.draggedElement.style.left = newX + 'px';
                    this.draggedElement.style.top = newY + 'px';
                    this.draggedElement.style.transform = 'scale(0.9)';
                }
            }
        }
        
        // Reset transform if no magnetic effect
        if (!closestSlot || closestDistance >= 30) {
            if (this.draggedElement) {
                this.draggedElement.style.transform = 'scale(1.1)';
            }
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
        
        // Add glow effect to slots with staggered timing
        this.slots.forEach((slot, index) => {
            setTimeout(() => {
                slot.classList.add('correct');
                // Play individual slot sound effect
                this.playSound(this.dropSound);
            }, index * 200);
        });
        
        // Add screen flash effect
        this.createScreenFlash();
        
        // Add explosion effect
        setTimeout(() => {
            this.createExplosionEffect();
        }, 1000);
        
        // After 3 seconds, show fire effect and transition to celebration
        setTimeout(() => {
            this.showCelebration();
        }, 3000);
    }

    showCelebration() {
        // Hide game screen and show celebration
        this.gameScreen.classList.add('hidden');
        this.celebrationScreen.classList.remove('hidden');
        
        // Play celebration music
        this.celebrationMusic.volume = 0.3;
        this.playSound(this.celebrationMusic);
        
        // Play background MP3 music after message appears
        setTimeout(() => {
            const bgMusic = document.getElementById('bg-music');
            if (bgMusic) {
                bgMusic.volume = 0.2;
                bgMusic.play().catch(e => {
                    console.log('Background music play failed:', e);
                });
            }
        }, 4000);
        
        // Create additional sparkle effects
        this.createSparkleEffects();
    }

    createSparkleEffects() {
        const sparkleContainer = document.querySelector('.sparkles');
        
        setInterval(() => {
            if (document.querySelector('.celebration-screen:not(.hidden)')) {
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        const sparkle = document.createElement('div');
                        sparkle.className = 'sparkle';
                        sparkle.style.left = Math.random() * 100 + '%';
                        sparkle.style.top = Math.random() * 100 + '%';
                        sparkle.style.animationDelay = Math.random() * 2 + 's';
                        sparkle.style.animationDuration = (1.5 + Math.random() * 1) + 's';
                        
                        sparkleContainer.appendChild(sparkle);
                        
                        setTimeout(() => {
                            sparkle.remove();
                        }, 3000);
                    }, i * 100);
                }
            }
        }, 2000);
    }

    createScreenFlash() {
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100vw';
        flash.style.height = '100vh';
        flash.style.background = 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,215,0,0.6) 30%, transparent 70%)';
        flash.style.zIndex = '9999';
        flash.style.pointerEvents = 'none';
        flash.style.animation = 'flash 1s ease-out forwards';
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.remove();
        }, 1000);
    }

    createExplosionEffect() {
        const explosionContainer = document.createElement('div');
        explosionContainer.style.position = 'fixed';
        explosionContainer.style.top = '50%';
        explosionContainer.style.left = '50%';
        explosionContainer.style.transform = 'translate(-50%, -50%)';
        explosionContainer.style.zIndex = '9998';
        explosionContainer.style.pointerEvents = 'none';
        
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '8px';
            particle.style.height = '8px';
            particle.style.background = `hsl(${Math.random() * 60 + 15}, 100%, 60%)`;
            particle.style.borderRadius = '50%';
            // Tăng thời gian explosion lên 3 lần (6s)
            particle.style.animation = `explode${i} 6s ease-out forwards`;
            explosionContainer.appendChild(particle);
        }
        document.body.appendChild(explosionContainer);
        setTimeout(() => {
            explosionContainer.remove();
        }, 6000);
    }

    playSound(audioElement) {
        if (audioElement) {
            audioElement.currentTime = 0;
            audioElement.play().catch(e => {
                console.log('Audio play prevented:', e);
            });
        }
    }

    playBackgroundMusic() {
        const backgroundMusic = document.getElementById('background-music');
        if (backgroundMusic) {
            backgroundMusic.volume = 0.2; // Volume nhẹ nhàng
            backgroundMusic.play().catch(e => {
                console.log('Background music play prevented:', e);
                // Fallback: thử phát nhạc celebration thay thế
                const celebMusic = document.getElementById('celebration-music');
                if (celebMusic) {
                    celebMusic.volume = 0.1;
                    celebMusic.play().catch(() => {});
                }
            });
        }
    }

    cleanup() {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
            this.draggedElement.style.pointerEvents = '';
            this.draggedElement.style.zIndex = '';
            this.draggedElement.style.transition = '';
            this.draggedElement.style.transform = '';
        }
        
        this.slots.forEach(slot => {
            slot.classList.remove('highlight', 'magnetic');
        });
        
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