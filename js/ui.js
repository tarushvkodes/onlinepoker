/**
 * UI Module for Texas Hold'em Poker
 * Handles all DOM manipulation and user interactions
 */

class PokerUI {
    constructor() {
        this.game = null;
        this.elements = {};
        this.sliderValue = 0;
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
        this.elements.setupScreen = document.getElementById('setup-screen');
        this.elements.gameScreen = document.getElementById('game-screen');
        this.elements.endScreen = document.getElementById('end-screen');

        // Setup form
        this.elements.playerName = document.getElementById('player-name');
        this.elements.difficulty = document.getElementById('difficulty');
        this.elements.bankroll = document.getElementById('bankroll');
        this.elements.botCount = document.getElementById('bot-count');
        this.elements.startBtn = document.getElementById('start-btn');

        // Game elements
        this.elements.potDisplay = document.getElementById('pot-display');
        this.elements.communityCards = document.getElementById('community-cards');
        this.elements.playerArea = document.getElementById('player-area');
        this.elements.botsContainer = document.getElementById('bots-container');
        this.elements.gameLog = document.getElementById('game-log');

        // Controls
        this.elements.controlsContainer = document.getElementById('controls-container');
        this.elements.foldBtn = document.getElementById('fold-btn');
        this.elements.checkCallBtn = document.getElementById('check-call-btn');
        this.elements.raiseBtn = document.getElementById('raise-btn');
        this.elements.allInBtn = document.getElementById('all-in-btn');
        this.elements.raiseSlider = document.getElementById('raise-slider');
        this.elements.raiseAmount = document.getElementById('raise-amount');
        this.elements.raiseControls = document.getElementById('raise-controls');

        // End screen
        this.elements.endTitle = document.getElementById('end-title');
        this.elements.endMessage = document.getElementById('end-message');
        this.elements.playAgainBtn = document.getElementById('play-again-btn');
    }

    /**
     * Attaches event listeners
     */
    attachEventListeners() {
        // Start game
        this.elements.startBtn.addEventListener('click', () => this.startGame());

        // Game controls
        this.elements.foldBtn.addEventListener('click', () => this.handleFold());
        this.elements.checkCallBtn.addEventListener('click', () => this.handleCheckCall());
        this.elements.raiseBtn.addEventListener('click', () => this.handleRaise());
        this.elements.allInBtn.addEventListener('click', () => this.handleAllIn());

        // Raise slider
        this.elements.raiseSlider.addEventListener('input', (e) => {
            this.sliderValue = parseInt(e.target.value);
            this.elements.raiseAmount.textContent = `$${this.sliderValue}`;
        });

        // Play again
        this.elements.playAgainBtn.addEventListener('click', () => this.resetToSetup());
    }

    /**
     * Starts the game with current settings
     */
    startGame() {
        const settings = {
            playerName: this.elements.playerName.value || 'You',
            difficulty: this.elements.difficulty.value,
            bankroll: parseInt(this.elements.bankroll.value),
            botCount: parseInt(this.elements.botCount.value),
            ui: this
        };

        this.game = new window.PokerGame();
        this.game.init(settings);

        this.showScreen('game');
        this.game.startHand();
    }

    /**
     * Shows a specific screen
     */
    showScreen(screen) {
        this.elements.setupScreen.classList.add('hidden');
        this.elements.gameScreen.classList.add('hidden');
        this.elements.endScreen.classList.add('hidden');

        switch (screen) {
            case 'setup':
                this.elements.setupScreen.classList.remove('hidden');
                break;
            case 'game':
                this.elements.gameScreen.classList.remove('hidden');
                break;
            case 'end':
                this.elements.endScreen.classList.remove('hidden');
                break;
        }
    }

    /**
     * Updates the game UI
     * @param {Object} state - Current game state
     */
    update(state) {
        const { engine, humanPlayer, bots, isWaitingForHuman, showAllCards } = state;

        // Update pot
        this.elements.potDisplay.textContent = `Pot: $${engine.pot}`;

        // Update community cards
        this.renderCommunityCards(engine.communityCards);

        // Update player area
        this.renderPlayerArea(humanPlayer, engine, isWaitingForHuman);

        // Update bots
        this.renderBots(bots, engine, showAllCards);

        // Update game log
        this.updateGameLog(engine.gameLog);

        // Update controls
        if (isWaitingForHuman) {
            this.updateControls();
        }
    }

    /**
     * Renders community cards
     */
    renderCommunityCards(cards) {
        this.elements.communityCards.innerHTML = '';

        for (let i = 0; i < 5; i++) {
            const card = cards[i];
            const cardEl = document.createElement('div');
            
            if (card) {
                cardEl.className = `card ${card.isRed ? 'red' : 'black'}`;
                cardEl.innerHTML = `
                    <span class="rank">${card.rank}</span>
                    <span class="suit">${card.symbol}</span>
                `;
            } else {
                cardEl.className = 'card placeholder';
            }

            this.elements.communityCards.appendChild(cardEl);
        }
    }

    /**
     * Renders player area
     */
    renderPlayerArea(player, engine, isActive) {
        const isDealer = engine.players[engine.dealerIndex] === player;
        const isCurrent = engine.getCurrentPlayer() === player;
        
        this.elements.playerArea.className = `player-area ${isCurrent && isActive ? 'active' : ''} ${player.hasFolded ? 'folded' : ''}`;
        
        this.elements.playerArea.innerHTML = `
            <div class="player-info">
                <span class="player-name">${player.name} ${isDealer ? '🔴' : ''}</span>
                <span class="player-chips">$${player.chips}</span>
                ${player.totalBetThisRound > 0 ? `<span class="current-bet">Bet: $${player.totalBetThisRound}</span>` : ''}
            </div>
            <div class="player-cards">
                ${this.renderCards(player.holeCards, true)}
            </div>
            ${player.hasFolded ? '<div class="fold-overlay">FOLDED</div>' : ''}
            ${player.isAllIn ? '<div class="all-in-badge">ALL IN</div>' : ''}
        `;
    }

    /**
     * Renders bot players
     */
    renderBots(bots, engine, showAllCards) {
        this.elements.botsContainer.innerHTML = '';

        const activeBots = engine.players.filter(p => p.isBot);

        activeBots.forEach((bot, index) => {
            const isDealer = engine.players[engine.dealerIndex] === bot;
            const isCurrent = engine.getCurrentPlayer() === bot;
            
            const botEl = document.createElement('div');
            botEl.className = `bot-player ${isCurrent ? 'active' : ''} ${bot.hasFolded ? 'folded' : ''}`;
            
            botEl.innerHTML = `
                <div class="bot-info">
                    <span class="bot-name">${bot.name} ${isDealer ? '🔴' : ''}</span>
                    <span class="bot-chips">$${bot.chips}</span>
                    ${bot.totalBetThisRound > 0 ? `<span class="current-bet">Bet: $${bot.totalBetThisRound}</span>` : ''}
                </div>
                <div class="bot-cards">
                    ${this.renderCards(bot.holeCards, showAllCards || bot.hasFolded)}
                </div>
                ${bot.hasFolded ? '<div class="fold-overlay">FOLDED</div>' : ''}
                ${bot.isAllIn ? '<div class="all-in-badge">ALL IN</div>' : ''}
            `;

            this.elements.botsContainer.appendChild(botEl);
        });
    }

    /**
     * Renders cards
     * @param {Array} cards - Cards to render
     * @param {boolean} faceUp - Whether to show face up
     */
    renderCards(cards, faceUp = false) {
        if (!cards || cards.length === 0) {
            return '';
        }

        return cards.map(card => {
            if (faceUp) {
                return `
                    <div class="card ${card.isRed ? 'red' : 'black'}">
                        <span class="rank">${card.rank}</span>
                        <span class="suit">${card.symbol}</span>
                    </div>
                `;
            } else {
                return `<div class="card face-down"></div>`;
            }
        }).join('');
    }

    /**
     * Updates the game log
     */
    updateGameLog(log) {
        this.elements.gameLog.innerHTML = log.slice(-10).map(msg => 
            `<div class="log-entry">${msg}</div>`
        ).join('');
        this.elements.gameLog.scrollTop = this.elements.gameLog.scrollHeight;
    }

    /**
     * Updates control buttons
     */
    updateControls() {
        if (!this.game) return;

        const actions = this.game.getValidActions();
        
        // Reset buttons
        this.elements.foldBtn.disabled = true;
        this.elements.checkCallBtn.disabled = true;
        this.elements.raiseBtn.disabled = true;
        this.elements.allInBtn.disabled = true;
        this.elements.raiseControls.classList.add('hidden');

        for (const action of actions) {
            switch (action.action) {
                case 'fold':
                    this.elements.foldBtn.disabled = false;
                    break;
                case 'check':
                    this.elements.checkCallBtn.disabled = false;
                    this.elements.checkCallBtn.textContent = 'Check';
                    break;
                case 'call':
                    this.elements.checkCallBtn.disabled = false;
                    this.elements.checkCallBtn.textContent = action.label;
                    break;
                case 'raise':
                    this.elements.raiseBtn.disabled = false;
                    this.elements.raiseBtn.textContent = action.label;
                    this.elements.raiseControls.classList.remove('hidden');
                    this.elements.raiseSlider.min = action.minAmount;
                    this.elements.raiseSlider.max = action.maxAmount;
                    this.elements.raiseSlider.value = action.minAmount;
                    this.sliderValue = action.minAmount;
                    this.elements.raiseAmount.textContent = `$${action.minAmount}`;
                    break;
                case 'all_in':
                    this.elements.allInBtn.disabled = false;
                    this.elements.allInBtn.textContent = action.label;
                    break;
            }
        }
    }

    /**
     * Enables or disables controls
     */
    enableControls(enabled) {
        this.elements.controlsContainer.style.opacity = enabled ? '1' : '0.5';
        this.elements.controlsContainer.style.pointerEvents = enabled ? 'auto' : 'none';
    }

    /**
     * Handles fold action
     */
    handleFold() {
        if (this.game) {
            this.game.handleHumanAction(window.PokerEngine.ACTIONS.FOLD);
        }
    }

    /**
     * Handles check/call action
     */
    handleCheckCall() {
        if (!this.game) return;

        const actions = this.game.getValidActions();
        const checkAction = actions.find(a => a.action === 'check');
        const callAction = actions.find(a => a.action === 'call');

        if (checkAction) {
            this.game.handleHumanAction(window.PokerEngine.ACTIONS.CHECK);
        } else if (callAction) {
            this.game.handleHumanAction(window.PokerEngine.ACTIONS.CALL);
        }
    }

    /**
     * Handles raise action
     */
    handleRaise() {
        if (this.game) {
            this.game.handleHumanAction(window.PokerEngine.ACTIONS.RAISE, this.sliderValue);
        }
    }

    /**
     * Handles all-in action
     */
    handleAllIn() {
        if (this.game) {
            this.game.handleHumanAction(window.PokerEngine.ACTIONS.ALL_IN);
        }
    }

    /**
     * Shows game end screen
     */
    showGameEnd(result, finalChips) {
        this.showScreen('end');

        if (result === 'win') {
            this.elements.endTitle.textContent = '🏆 You Win! 🏆';
            this.elements.endMessage.textContent = `Congratulations! You eliminated all opponents and finished with $${finalChips}!`;
        } else {
            this.elements.endTitle.textContent = '💔 Game Over 💔';
            this.elements.endMessage.textContent = 'You ran out of chips. Better luck next time!';
        }
    }

    /**
     * Resets to setup screen
     */
    resetToSetup() {
        this.game = null;
        this.showScreen('setup');
    }
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const ui = new PokerUI();
    ui.init();
});
