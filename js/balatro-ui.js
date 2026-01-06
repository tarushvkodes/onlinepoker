/**
 * Balatro UI Module
 * Handles all DOM manipulation and user interactions
 */

class BalatroUI {
    constructor() {
        this.game = null;
        this.elements = {};
    }

    /**
     * Initializes UI elements
     */
    init() {
        this.cacheElements();
        this.attachEventListeners();
    }

    /**
     * Caches DOM elements
     */
    cacheElements() {
        // Screens
        this.elements.menuScreen = document.getElementById('menu-screen');
        this.elements.tutorialScreen = document.getElementById('tutorial-screen');
        this.elements.gameScreen = document.getElementById('game-screen');
        this.elements.roundCompleteScreen = document.getElementById('round-complete-screen');
        this.elements.gameOverScreen = document.getElementById('game-over-screen');

        // Menu buttons
        this.elements.newGameBtn = document.getElementById('new-game-btn');
        this.elements.howToPlayBtn = document.getElementById('how-to-play-btn');
        this.elements.backToMenuBtn = document.getElementById('back-to-menu-btn');

        // Game header
        this.elements.anteNumber = document.getElementById('ante-number');
        this.elements.blindName = document.getElementById('blind-name');
        this.elements.blindTarget = document.getElementById('blind-target');
        this.elements.moneyDisplay = document.getElementById('money-display');

        // Score area
        this.elements.roundScore = document.getElementById('round-score');
        this.elements.chipsDisplay = document.getElementById('chips-display');
        this.elements.multDisplay = document.getElementById('mult-display');

        // Resources
        this.elements.handsLeft = document.getElementById('hands-left');
        this.elements.discardsLeft = document.getElementById('discards-left');

        // Hand display
        this.elements.detectedHand = document.getElementById('detected-hand');
        this.elements.playerHand = document.getElementById('player-hand');
        this.elements.selectionCount = document.getElementById('selection-count');

        // Action buttons
        this.elements.playHandBtn = document.getElementById('play-hand-btn');
        this.elements.discardBtn = document.getElementById('discard-btn');

        // Round complete screen
        this.elements.roundResultTitle = document.getElementById('round-result-title');
        this.elements.roundResultMessage = document.getElementById('round-result-message');
        this.elements.finalRoundScore = document.getElementById('final-round-score');
        this.elements.finalTarget = document.getElementById('final-target');
        this.elements.earningsBreakdown = document.getElementById('earnings-breakdown');
        this.elements.nextRoundBtn = document.getElementById('next-round-btn');

        // Game over screen
        this.elements.gameOverTitle = document.getElementById('game-over-title');
        this.elements.gameOverMessage = document.getElementById('game-over-message');
        this.elements.finalAnte = document.getElementById('final-ante');
        this.elements.gameOverScore = document.getElementById('game-over-score');
        this.elements.playAgainBtn = document.getElementById('play-again-btn');
        this.elements.mainMenuBtn = document.getElementById('main-menu-btn');
    }

    /**
     * Attaches event listeners
     */
    attachEventListeners() {
        // Menu
        this.elements.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.elements.howToPlayBtn.addEventListener('click', () => this.showScreen('tutorial'));
        this.elements.backToMenuBtn.addEventListener('click', () => this.showScreen('menu'));

        // Game actions
        this.elements.playHandBtn.addEventListener('click', () => this.handlePlayHand());
        this.elements.discardBtn.addEventListener('click', () => this.handleDiscard());

        // Round complete
        this.elements.nextRoundBtn.addEventListener('click', () => this.handleNextRound());

        // Game over
        this.elements.playAgainBtn.addEventListener('click', () => this.startNewGame());
        this.elements.mainMenuBtn.addEventListener('click', () => this.showScreen('menu'));
    }

    /**
     * Shows a specific screen
     */
    showScreen(screen) {
        this.elements.menuScreen.classList.add('hidden');
        this.elements.tutorialScreen.classList.add('hidden');
        this.elements.gameScreen.classList.add('hidden');
        this.elements.roundCompleteScreen.classList.add('hidden');
        this.elements.gameOverScreen.classList.add('hidden');

        switch (screen) {
            case 'menu':
                this.elements.menuScreen.classList.remove('hidden');
                break;
            case 'tutorial':
                this.elements.tutorialScreen.classList.remove('hidden');
                break;
            case 'game':
                this.elements.gameScreen.classList.remove('hidden');
                break;
            case 'roundComplete':
                this.elements.roundCompleteScreen.classList.remove('hidden');
                break;
            case 'gameOver':
                this.elements.gameOverScreen.classList.remove('hidden');
                break;
        }
    }

    /**
     * Starts a new game
     */
    startNewGame() {
        this.game = new window.BalatroGame();
        this.game.newGame();
        this.showScreen('game');
        this.updateDisplay();
    }

    /**
     * Updates all display elements
     */
    updateDisplay() {
        const state = this.game.getState();

        // Header info
        this.elements.anteNumber.textContent = state.ante;
        this.elements.blindName.textContent = state.blindName;
        this.elements.blindTarget.textContent = state.targetScore.toLocaleString();
        this.elements.moneyDisplay.textContent = state.money;

        // Score
        this.elements.roundScore.textContent = state.roundScore.toLocaleString();
        
        // Resources
        this.elements.handsLeft.textContent = state.handsLeft;
        this.elements.discardsLeft.textContent = state.discardsLeft;

        // Render hand
        this.renderHand(state.hand, state.selectedCards);

        // Update selection count
        this.elements.selectionCount.textContent = state.selectedCards.length;

        // Update hand preview
        this.updateHandPreview();

        // Update button states
        this.updateButtons(state);
    }

    /**
     * Renders the player's hand
     */
    renderHand(hand, selectedIndices) {
        this.elements.playerHand.innerHTML = '';

        hand.forEach((card, index) => {
            const cardEl = document.createElement('div');
            const isSelected = selectedIndices.includes(index);
            cardEl.className = `card ${card.isRed ? 'red' : 'black'} ${isSelected ? 'selected' : ''} card-deal`;
            cardEl.style.animationDelay = `${index * 0.05}s`;
            
            cardEl.innerHTML = `
                <span class="rank">${card.rank}</span>
                <span class="suit">${card.symbol}</span>
            `;

            cardEl.addEventListener('click', () => this.handleCardClick(index));
            
            this.elements.playerHand.appendChild(cardEl);
        });
    }

    /**
     * Handles card click
     */
    handleCardClick(cardIndex) {
        if (this.game.toggleCardSelection(cardIndex)) {
            this.updateDisplay();
        }
    }

    /**
     * Updates the hand preview display
     */
    updateHandPreview() {
        const preview = this.game.getScorePreview();
        
        if (preview) {
            this.elements.detectedHand.textContent = preview.handName;
            this.elements.chipsDisplay.textContent = preview.chips;
            this.elements.multDisplay.textContent = preview.mult;
        } else {
            this.elements.detectedHand.textContent = 'Select cards to play';
            this.elements.chipsDisplay.textContent = '0';
            this.elements.multDisplay.textContent = '0';
        }
    }

    /**
     * Updates button states
     */
    updateButtons(state) {
        const hasSelection = state.selectedCards.length > 0;
        
        this.elements.playHandBtn.disabled = !hasSelection || state.handsLeft <= 0;
        this.elements.discardBtn.disabled = !hasSelection || state.discardsLeft <= 0;
    }

    /**
     * Handles play hand action
     */
    handlePlayHand() {
        const result = this.game.playHand();
        
        if (result.success) {
            // Animate score
            this.elements.roundScore.classList.add('score-animate');
            setTimeout(() => {
                this.elements.roundScore.classList.remove('score-animate');
            }, 300);

            this.updateDisplay();
            
            // Check if round is complete
            const status = this.game.checkRoundStatus();
            if (status.complete) {
                this.handleRoundComplete(status.won);
            }
        }
    }

    /**
     * Handles discard action
     */
    handleDiscard() {
        const result = this.game.discardCards();
        
        if (result.success) {
            this.updateDisplay();
        }
    }

    /**
     * Handles round completion
     */
    handleRoundComplete(won) {
        const result = this.game.endRound();
        const state = this.game.getState();

        if (won) {
            this.elements.roundResultTitle.textContent = '🎉 Blind Beaten!';
            this.elements.roundResultMessage.textContent = 'You scored enough points to advance!';
            this.elements.finalRoundScore.textContent = state.roundScore.toLocaleString();
            this.elements.finalTarget.textContent = state.targetScore.toLocaleString();

            // Show earnings
            this.elements.earningsBreakdown.innerHTML = result.breakdown.map(item => 
                `<div><span>${item.label}</span><span>+$${item.amount}</span></div>`
            ).join('');

            this.showScreen('roundComplete');
        } else {
            this.elements.gameOverTitle.textContent = '💔 Game Over';
            this.elements.gameOverMessage.textContent = `You couldn't reach ${state.targetScore.toLocaleString()} points!`;
            this.elements.finalAnte.textContent = state.ante;
            this.elements.gameOverScore.textContent = state.roundScore.toLocaleString();

            this.showScreen('gameOver');
        }
    }

    /**
     * Handles advancing to next round
     */
    handleNextRound() {
        this.game.advanceToNext();
        this.showScreen('game');
        this.updateDisplay();
    }
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const ui = new BalatroUI();
    ui.init();
});
