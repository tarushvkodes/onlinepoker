/**
 * UI Module for Blackjack
 * Handles all DOM manipulation and user interactions
 */

class BlackjackUI {
    constructor() {
        this.game = null;
        this.elements = {};
    }

    /**
     * Initialize UI elements
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
        this.elements.setupScreen = document.getElementById('setup-screen');
        this.elements.gameScreen = document.getElementById('game-screen');
        this.elements.endScreen = document.getElementById('end-screen');

        // Setup form
        this.elements.playerName = document.getElementById('player-name');
        this.elements.bankroll = document.getElementById('bankroll');
        this.elements.minBet = document.getElementById('min-bet');
        this.elements.startBtn = document.getElementById('start-btn');

        // Game elements
        this.elements.playerNameDisplay = document.getElementById('player-name-display');
        this.elements.playerChips = document.getElementById('player-chips');
        this.elements.currentBet = document.getElementById('current-bet');
        this.elements.playerCards = document.getElementById('player-cards');
        this.elements.dealerCards = document.getElementById('dealer-cards');
        this.elements.playerValue = document.getElementById('player-value');
        this.elements.dealerValue = document.getElementById('dealer-value');
        this.elements.gameLog = document.getElementById('game-log');

        // Controls
        this.elements.bettingControls = document.getElementById('betting-controls');
        this.elements.actionButtons = document.getElementById('action-buttons');
        this.elements.newRoundControls = document.getElementById('new-round-controls');
        
        this.elements.betButtons = document.querySelectorAll('.bet-btn');
        this.elements.customBetInput = document.getElementById('custom-bet-input');
        this.elements.placeBetBtn = document.getElementById('place-bet-btn');
        
        this.elements.hitBtn = document.getElementById('hit-btn');
        this.elements.standBtn = document.getElementById('stand-btn');
        this.elements.doubleBtn = document.getElementById('double-btn');
        this.elements.newRoundBtn = document.getElementById('new-round-btn');

        // End screen
        this.elements.endTitle = document.getElementById('end-title');
        this.elements.endMessage = document.getElementById('end-message');
        this.elements.playAgainBtn = document.getElementById('play-again-btn');
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Setup screen
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.playerName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startGame();
        });

        // Betting controls
        this.elements.betButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseInt(e.target.dataset.amount, 10);
                this.placeBet(amount);
            });
        });

        this.elements.placeBetBtn.addEventListener('click', () => {
            const amount = parseInt(this.elements.customBetInput.value, 10);
            if (amount && amount > 0) {
                this.placeBet(amount);
                this.elements.customBetInput.value = '';
            }
        });

        this.elements.customBetInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const amount = parseInt(this.elements.customBetInput.value, 10);
                if (amount && amount > 0) {
                    this.placeBet(amount);
                    this.elements.customBetInput.value = '';
                }
            }
        });

        // Action buttons
        this.elements.hitBtn.addEventListener('click', () => {
            if (this.game) this.game.hit();
        });

        this.elements.standBtn.addEventListener('click', () => {
            if (this.game) this.game.stand();
        });

        this.elements.doubleBtn.addEventListener('click', () => {
            if (this.game) this.game.doubleDown();
        });

        this.elements.newRoundBtn.addEventListener('click', () => {
            this.startNewRound();
        });

        // End screen
        this.elements.playAgainBtn.addEventListener('click', () => {
            this.showScreen('setup');
        });
    }

    /**
     * Start the game
     */
    startGame() {
        const settings = {
            playerName: this.elements.playerName.value.trim() || 'Player',
            bankroll: parseInt(this.elements.bankroll.value, 10),
            minBet: parseInt(this.elements.minBet.value, 10)
        };

        this.game = new window.BlackjackGame();
        this.game.ui = this;
        this.game.init(settings);

        this.elements.playerNameDisplay.textContent = this.game.playerName;
        this.showScreen('game');
        this.showBettingControls();
        this.updateChipsDisplay();
        this.log('Game started! Place your bet.');
    }

    /**
     * Place a bet
     */
    placeBet(amount) {
        if (this.game && this.game.placeBet(amount)) {
            this.hideBettingControls();
            this.showActionButtons();
        }
    }

    /**
     * Start a new round
     */
    startNewRound() {
        this.hideNewRoundButton();
        this.showBettingControls();
        this.updateChipsDisplay();
        this.log('Place your bet for the next round.');
    }

    /**
     * Update game state display
     */
    updateGameState() {
        this.renderHand(this.game.playerHand, this.elements.playerCards, false);
        this.renderHand(this.game.dealerHand, this.elements.dealerCards, !this.game.roundInProgress);
        
        const playerValue = this.game.getHandValue(this.game.playerHand);
        this.elements.playerValue.textContent = playerValue;

        if (this.game.roundInProgress && this.game.dealerHand.length > 0) {
            // Only show first card value when dealer card is hidden
            const visibleCard = this.game.dealerHand[0];
            const visibleValue = this.game.getHandValue([visibleCard]);
            this.elements.dealerValue.textContent = visibleValue;
        } else {
            const dealerValue = this.game.getHandValue(this.game.dealerHand);
            this.elements.dealerValue.textContent = dealerValue;
        }

        this.updateChipsDisplay();
        
        // Update double down button availability
        if (this.game.playerHand.length === 2 && this.game.currentBet <= this.game.playerChips) {
            this.elements.doubleBtn.disabled = false;
        } else {
            this.elements.doubleBtn.disabled = true;
        }
    }

    /**
     * Render a hand of cards
     */
    renderHand(hand, container, revealAll) {
        container.innerHTML = '';
        
        hand.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            
            // Hide dealer's second card if round is in progress
            if (!revealAll && index === 1 && container === this.elements.dealerCards) {
                cardElement.classList.add('card-back');
                cardElement.textContent = '🂠';
            } else {
                this.renderCard(card, cardElement);
            }
            
            container.appendChild(cardElement);
        });
    }

    /**
     * Render a single card
     */
    renderCard(card, element) {
        const suitSymbols = {
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣',
            'spades': '♠'
        };

        const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
        element.classList.add(isRed ? 'red' : 'black');
        
        element.innerHTML = `
            <div class="card-corner top-left">
                <div class="rank">${card.rank}</div>
                <div class="suit">${suitSymbols[card.suit]}</div>
            </div>
            <div class="card-center">${suitSymbols[card.suit]}</div>
            <div class="card-corner bottom-right">
                <div class="rank">${card.rank}</div>
                <div class="suit">${suitSymbols[card.suit]}</div>
            </div>
        `;
    }

    /**
     * Reveal dealer's hidden card
     */
    revealDealerCard() {
        this.renderHand(this.game.dealerHand, this.elements.dealerCards, true);
    }

    /**
     * Update chips display
     */
    updateChipsDisplay() {
        this.elements.playerChips.textContent = `$${this.game.playerChips}`;
        this.elements.currentBet.textContent = this.game.currentBet;
    }

    /**
     * Show betting controls
     */
    showBettingControls() {
        this.elements.bettingControls.classList.remove('hidden');
        this.elements.playerCards.innerHTML = '';
        this.elements.dealerCards.innerHTML = '';
        this.elements.playerValue.textContent = '-';
        this.elements.dealerValue.textContent = '-';
        this.elements.currentBet.textContent = '0';
    }

    /**
     * Hide betting controls
     */
    hideBettingControls() {
        this.elements.bettingControls.classList.add('hidden');
    }

    /**
     * Show action buttons
     */
    showActionButtons() {
        this.elements.actionButtons.classList.remove('hidden');
        this.elements.hitBtn.disabled = false;
        this.elements.standBtn.disabled = false;
    }

    /**
     * Hide action buttons
     */
    hideActionButtons() {
        this.elements.actionButtons.classList.add('hidden');
    }

    /**
     * Show new round button
     */
    showNewRoundButton() {
        this.hideActionButtons();
        this.elements.newRoundControls.classList.remove('hidden');
    }

    /**
     * Hide new round button
     */
    hideNewRoundButton() {
        this.elements.newRoundControls.classList.add('hidden');
    }

    /**
     * Log a message
     */
    log(message) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = message;
        this.elements.gameLog.appendChild(entry);
        this.elements.gameLog.scrollTop = this.elements.gameLog.scrollHeight;
    }

    /**
     * Show a screen
     */
    showScreen(screen) {
        this.elements.setupScreen.classList.add('hidden');
        this.elements.gameScreen.classList.add('hidden');
        this.elements.endScreen.classList.add('hidden');

        if (screen === 'setup') {
            this.elements.setupScreen.classList.remove('hidden');
            if (this.elements.gameLog) {
                this.elements.gameLog.innerHTML = '';
            }
        } else if (screen === 'game') {
            this.elements.gameScreen.classList.remove('hidden');
        } else if (screen === 'end') {
            this.elements.endScreen.classList.remove('hidden');
        }
    }

    /**
     * Show end screen
     */
    showEndScreen(message) {
        this.elements.endTitle.textContent = 'Game Over';
        this.elements.endMessage.textContent = message;
        this.showScreen('end');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const ui = new BlackjackUI();
    ui.init();
});
