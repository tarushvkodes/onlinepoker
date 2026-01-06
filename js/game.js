/**
 * Main Game Controller
 * Coordinates UI, poker engine, and bot AI
 */

class PokerGame {
    constructor() {
        this.engine = null;
        this.humanPlayer = null;
        this.bots = [];
        this.difficulty = 'medium';
        this.startingChips = 1000;
        this.bigBlind = 20;
        this.isGameRunning = false;
        this.isWaitingForHuman = false;
        this.autoPlayDelay = 1000;
        this.ui = null;
    }

    /**
     * Initializes the game with settings
     * @param {Object} settings - Game settings
     */
    init(settings) {
        this.difficulty = settings.difficulty || 'medium';
        this.startingChips = settings.bankroll || 1000;
        this.bigBlind = Math.max(20, Math.floor(this.startingChips / 50));

        // Create human player
        this.humanPlayer = {
            name: settings.playerName || 'You',
            chips: this.startingChips,
            holeCards: [],
            isBot: false,
            hasFolded: false,
            isAllIn: false,
            currentBet: 0,
            totalBetThisRound: 0,
            reset() {
                this.holeCards = [];
                this.hasFolded = false;
                this.isAllIn = false;
                this.currentBet = 0;
                this.totalBetThisRound = 0;
            }
        };

        // Create bots
        const botCount = settings.botCount || 3;
        this.bots = window.BotAI.createBots(botCount, this.difficulty, this.startingChips);

        // Create all players array
        const allPlayers = [this.humanPlayer, ...this.bots];

        // Create engine
        this.engine = new window.PokerEngine.PokerEngine(allPlayers, this.bigBlind);

        this.isGameRunning = true;
        this.ui = settings.ui;

        return this;
    }

    /**
     * Starts a new hand
     */
    startHand() {
        if (!this.engine.startNewHand()) {
            this.endGame();
            return false;
        }

        this.updateUI();
        this.processNextAction();

        return true;
    }

    /**
     * Processes the next action (bot or human)
     */
    async processNextAction() {
        if (this.engine.isHandComplete) {
            await this.handleHandComplete();
            return;
        }

        const currentPlayer = this.engine.getCurrentPlayer();

        if (!currentPlayer || currentPlayer.hasFolded || currentPlayer.isAllIn) {
            // Advance to find next valid player or end round
            const result = this.engine.advance();
            this.updateUI();
            
            if (result.isHandComplete) {
                await this.handleHandComplete();
            } else {
                setTimeout(() => this.processNextAction(), 300);
            }
            return;
        }

        if (currentPlayer.isBot) {
            await this.processBotAction(currentPlayer);
        } else {
            this.waitForHumanAction();
        }
    }

    /**
     * Processes a bot's action
     */
    async processBotAction(bot) {
        // Add thinking delay
        await this.delay(this.autoPlayDelay);

        const decision = bot.decide(this.engine.getGameState());
        
        let amount = 0;
        let action = decision.action;

        if (decision.action === 'call') {
            const callAmount = this.engine.currentBet - bot.totalBetThisRound;
            if (callAmount === 0) {
                action = window.PokerEngine.ACTIONS.CHECK;
            } else {
                action = window.PokerEngine.ACTIONS.CALL;
            }
        } else if (decision.action === 'raise') {
            action = window.PokerEngine.ACTIONS.RAISE;
            amount = bot.totalBetThisRound + decision.amount;
            
            // Ensure minimum raise
            if (amount < this.engine.currentBet + this.engine.minRaise) {
                amount = this.engine.currentBet + this.engine.minRaise;
            }
            
            // Cap at bot's chips
            if (amount > bot.totalBetThisRound + bot.chips) {
                amount = bot.totalBetThisRound + bot.chips;
            }
        } else {
            action = window.PokerEngine.ACTIONS.FOLD;
        }

        this.engine.processAction(action, amount);
        this.updateUI();

        const result = this.engine.advance();

        if (result.isHandComplete) {
            await this.handleHandComplete();
        } else {
            if (result.phaseChanged) {
                await this.delay(500);
                this.updateUI();
            }
            this.processNextAction();
        }
    }

    /**
     * Waits for human player action
     */
    waitForHumanAction() {
        this.isWaitingForHuman = true;
        this.updateUI();

        if (this.ui && this.ui.enableControls) {
            this.ui.enableControls(true);
        }
    }

    /**
     * Handles human player action
     * @param {string} action - The action type
     * @param {number} amount - The amount for bet/raise
     */
    async handleHumanAction(action, amount = 0) {
        if (!this.isWaitingForHuman) return;

        this.isWaitingForHuman = false;

        if (this.ui && this.ui.enableControls) {
            this.ui.enableControls(false);
        }

        this.engine.processAction(action, amount);
        this.updateUI();

        const result = this.engine.advance();

        if (result.isHandComplete) {
            await this.handleHandComplete();
        } else {
            if (result.phaseChanged) {
                await this.delay(500);
                this.updateUI();
            }
            this.processNextAction();
        }
    }

    /**
     * Handles hand completion
     */
    async handleHandComplete() {
        // Show all hands in showdown
        if (this.engine.phase === window.PokerEngine.GAME_PHASES.SHOWDOWN) {
            this.updateUI(true); // Show all cards
            await this.delay(3000);
        } else {
            await this.delay(2000);
        }

        // Check if game is over
        if (this.humanPlayer.chips <= 0) {
            this.endGame('lose');
            return;
        }

        const activeBots = this.bots.filter(b => b.chips > 0);
        if (activeBots.length === 0) {
            this.endGame('win');
            return;
        }

        // Update engine players
        this.engine.players = [this.humanPlayer, ...activeBots];

        // Start next hand
        this.startHand();
    }

    /**
     * Ends the game
     * @param {string} result - 'win' or 'lose'
     */
    endGame(result = 'lose') {
        this.isGameRunning = false;
        
        if (this.ui && this.ui.showGameEnd) {
            this.ui.showGameEnd(result, this.humanPlayer.chips);
        }
    }

    /**
     * Updates the UI
     * @param {boolean} showAllCards - Whether to show all cards (showdown)
     */
    updateUI(showAllCards = false) {
        if (this.ui && this.ui.update) {
            this.ui.update({
                engine: this.engine,
                humanPlayer: this.humanPlayer,
                bots: this.bots,
                isWaitingForHuman: this.isWaitingForHuman,
                showAllCards: showAllCards
            });
        }
    }

    /**
     * Gets valid actions for the current player
     */
    getValidActions() {
        if (!this.engine || this.engine.isHandComplete) {
            return [];
        }

        const player = this.engine.getCurrentPlayer();
        if (!player || player.isBot || player.hasFolded || player.isAllIn) {
            return [];
        }

        const actions = [];
        const callAmount = this.engine.currentBet - player.totalBetThisRound;

        // Can always fold if there's a bet
        if (callAmount > 0) {
            actions.push({ action: 'fold', label: 'Fold' });
        }

        // Check or Call
        if (callAmount === 0) {
            actions.push({ action: 'check', label: 'Check' });
        } else {
            const actualCall = Math.min(callAmount, player.chips);
            if (actualCall === player.chips) {
                actions.push({ action: 'call', label: `Call $${actualCall} (All-In)`, amount: actualCall });
            } else {
                actions.push({ action: 'call', label: `Call $${actualCall}`, amount: actualCall });
            }
        }

        // Raise/Bet
        const minRaise = this.engine.currentBet + this.engine.minRaise;
        if (player.chips > callAmount) {
            const maxBet = player.totalBetThisRound + player.chips;
            actions.push({ 
                action: 'raise', 
                label: callAmount === 0 ? 'Bet' : 'Raise',
                minAmount: Math.min(minRaise, maxBet),
                maxAmount: maxBet
            });
        }

        // All-In
        if (player.chips > 0) {
            actions.push({ 
                action: 'all_in', 
                label: `All-In ($${player.chips})`,
                amount: player.chips + player.totalBetThisRound
            });
        }

        return actions;
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PokerGame = PokerGame;
}
