/**
 * Blackjack UI Module
 */

class BlackjackUI {
    constructor() {
        this.game = null;
        this.elements = {};
    }

    /**
     * Initialize UI
     */
    init() {
        this.cacheElements();
        this.attachEventListeners();
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        // Screens
        this.elements.menuScreen = document.getElementById('menu-screen');
        this.elements.rulesScreen = document.getElementById('rules-screen');
        this.elements.gameScreen = document.getElementById('game-screen');
        this.elements.gameoverScreen = document.getElementById('gameover-screen');

        // Menu
        this.elements.startingChips = document.getElementById('starting-chips');
        this.elements.startGameBtn = document.getElementById('start-game-btn');
        this.elements.rulesBtn = document.getElementById('rules-btn');
        this.elements.backFromRulesBtn = document.getElementById('back-from-rules-btn');

        // Game
        this.elements.playerChips = document.getElementById('player-chips');
        this.elements.dealerCards = document.getElementById('dealer-cards');
        this.elements.playerCards = document.getElementById('player-cards');
        this.elements.dealerScore = document.getElementById('dealer-score');
        this.elements.playerScore = document.getElementById('player-score');
        this.elements.gameStatus = document.getElementById('game-status');
        this.elements.statusText = document.getElementById('status-text');

        // Betting
        this.elements.bettingArea = document.getElementById('betting-area');
        this.elements.currentBet = document.getElementById('current-bet');
        this.elements.chipBtns = document.querySelectorAll('.chip-btn');
        this.elements.clearBetBtn = document.getElementById('clear-bet-btn');
        this.elements.dealBtn = document.getElementById('deal-btn');

        // Actions
        this.elements.actionButtons = document.getElementById('action-buttons');
        this.elements.hitBtn = document.getElementById('hit-btn');
        this.elements.standBtn = document.getElementById('stand-btn');
        this.elements.doubleBtn = document.getElementById('double-btn');

        // New hand
        this.elements.newHandArea = document.getElementById('new-hand-area');
        this.elements.newHandBtn = document.getElementById('new-hand-btn');

        // Game over
        this.elements.restartBtn = document.getElementById('restart-btn');
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Menu
        this.elements.startGameBtn.addEventListener('click', () => this.startGame());
        this.elements.rulesBtn.addEventListener('click', () => this.showScreen('rules'));
        this.elements.backFromRulesBtn.addEventListener('click', () => this.showScreen('menu'));

        // Betting
        this.elements.chipBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const value = parseInt(btn.dataset.value);
                this.addBet(value);
            });
        });
        this.elements.clearBetBtn.addEventListener('click', () => this.clearBet());
        this.elements.dealBtn.addEventListener('click', () => this.deal());

        // Actions
        this.elements.hitBtn.addEventListener('click', () => this.hit());
        this.elements.standBtn.addEventListener('click', () => this.stand());
        this.elements.doubleBtn.addEventListener('click', () => this.double());

        // New hand
        this.elements.newHandBtn.addEventListener('click', () => this.newHand());

        // Restart
        this.elements.restartBtn.addEventListener('click', () => this.showScreen('menu'));
    }

    /**
     * Show specific screen
     */
    showScreen(screen) {
        this.elements.menuScreen.classList.add('hidden');
        this.elements.rulesScreen.classList.add('hidden');
        this.elements.gameScreen.classList.add('hidden');
        this.elements.gameoverScreen.classList.add('hidden');

        switch (screen) {
            case 'menu':
                this.elements.menuScreen.classList.remove('hidden');
                break;
            case 'rules':
                this.elements.rulesScreen.classList.remove('hidden');
                break;
            case 'game':
                this.elements.gameScreen.classList.remove('hidden');
                break;
            case 'gameover':
                this.elements.gameoverScreen.classList.remove('hidden');
                break;
        }
    }

    /**
     * Start new game
     */
    startGame() {
        const startingChips = parseInt(this.elements.startingChips.value);
        this.game = new window.BlackjackGame();
        this.game.init(startingChips);
        this.showScreen('game');
        this.updateDisplay();
    }

    /**
     * Add bet
     */
    addBet(amount) {
        if (this.game.addBet(amount)) {
            this.updateDisplay();
        }
    }

    /**
     * Clear bet
     */
    clearBet() {
        this.game.clearBet();
        this.updateDisplay();
    }

    /**
     * Deal cards
     */
    deal() {
        if (this.game.deal()) {
            this.updateDisplay();
        }
    }

    /**
     * Hit
     */
    hit() {
        this.game.hit();
        this.updateDisplay();
    }

    /**
     * Stand
     */
    stand() {
        this.game.stand();
        this.updateDisplay();
    }

    /**
     * Double
     */
    double() {
        this.game.double();
        this.updateDisplay();
    }

    /**
     * New hand
     */
    newHand() {
        if (this.game.playerChips <= 0) {
            this.showScreen('gameover');
            return;
        }
        this.game.newHand();
        this.updateDisplay();
    }

    /**
     * Update display
     */
    updateDisplay() {
        const state = this.game.getState();

        // Update chips
        this.elements.playerChips.textContent = `$${state.playerChips}`;
        this.elements.currentBet.textContent = `$${state.currentBet}`;

        // Update deal button
        this.elements.dealBtn.disabled = state.currentBet <= 0;

        // Render cards
        this.renderCards(state);

        // Update scores
        this.updateScores(state);

        // Show/hide areas based on game state
        this.updateGameAreas(state);

        // Show result if game ended
        if (state.gameState === 'ended') {
            this.showResult(state.result);
        }
    }

    /**
     * Render cards
     */
    renderCards(state) {
        // Player cards
        this.elements.playerCards.innerHTML = state.playerHand.map(card => 
            this.renderCard(card, true)
        ).join('');

        // Dealer cards
        if (state.gameState === 'betting') {
            this.elements.dealerCards.innerHTML = '';
        } else if (state.gameState === 'playing') {
            // Show first card face up, second face down
            this.elements.dealerCards.innerHTML = state.dealerHand.map((card, index) => 
                index === 0 ? this.renderCard(card, true) : this.renderCard(card, false)
            ).join('');
        } else {
            // Show all dealer cards
            this.elements.dealerCards.innerHTML = state.dealerHand.map(card => 
                this.renderCard(card, true)
            ).join('');
        }
    }

    /**
     * Render single card
     */
    renderCard(card, faceUp) {
        if (!faceUp) {
            return '<div class="card face-down"></div>';
        }
        return `
            <div class="card ${card.isRed ? 'red' : 'black'}">
                <span class="rank">${card.rank}</span>
                <span class="suit">${card.symbol}</span>
            </div>
        `;
    }

    /**
     * Update scores
     */
    updateScores(state) {
        this.elements.playerScore.textContent = state.playerHand.length > 0 ? state.playerValue : '0';
        
        if (state.gameState === 'betting') {
            this.elements.dealerScore.textContent = '0';
        } else if (state.gameState === 'playing') {
            // Only show value of visible card
            const visibleCard = state.dealerHand[0];
            let visibleValue = 0;
            if (visibleCard) {
                if (visibleCard.rank === 'A') {
                    visibleValue = 11;
                } else if (['K', 'Q', 'J'].includes(visibleCard.rank)) {
                    visibleValue = 10;
                } else {
                    visibleValue = parseInt(visibleCard.rank);
                }
            }
            this.elements.dealerScore.textContent = visibleValue;
        } else {
            this.elements.dealerScore.textContent = state.dealerValue;
        }
    }

    /**
     * Update game areas visibility
     */
    updateGameAreas(state) {
        // Hide all
        this.elements.bettingArea.classList.add('hidden');
        this.elements.actionButtons.classList.add('hidden');
        this.elements.newHandArea.classList.add('hidden');
        this.elements.gameStatus.classList.add('hidden');

        switch (state.gameState) {
            case 'betting':
                this.elements.bettingArea.classList.remove('hidden');
                break;
            case 'playing':
                this.elements.actionButtons.classList.remove('hidden');
                this.elements.doubleBtn.disabled = !state.canDouble;
                break;
            case 'ended':
                this.elements.newHandArea.classList.remove('hidden');
                this.elements.gameStatus.classList.remove('hidden');
                break;
        }
    }

    /**
     * Show game result
     */
    showResult(result) {
        const status = this.elements.gameStatus;
        const text = this.elements.statusText;
        
        status.className = 'game-status';

        switch (result) {
            case 'blackjack':
                text.textContent = '🎰 BLACKJACK!';
                status.classList.add('blackjack');
                break;
            case 'win':
                text.textContent = '🎉 You Win!';
                status.classList.add('win');
                break;
            case 'dealerBust':
                text.textContent = '💥 Dealer Busts! You Win!';
                status.classList.add('win');
                break;
            case 'push':
                text.textContent = '🤝 Push';
                status.classList.add('push');
                break;
            case 'bust':
                text.textContent = '💔 Bust!';
                status.classList.add('lose');
                break;
            case 'lose':
                text.textContent = '😞 Dealer Wins';
                status.classList.add('lose');
                break;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const ui = new BlackjackUI();
    ui.init();
});
