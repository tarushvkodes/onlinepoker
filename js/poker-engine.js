/**
 * Texas Hold'em Poker Engine
 * Manages game state, betting rounds, and pot management
 */

const GAME_PHASES = {
    PREFLOP: 'preflop',
    FLOP: 'flop',
    TURN: 'turn',
    RIVER: 'river',
    SHOWDOWN: 'showdown'
};

const ACTIONS = {
    FOLD: 'fold',
    CHECK: 'check',
    CALL: 'call',
    BET: 'bet',
    RAISE: 'raise',
    ALL_IN: 'all_in'
};

/**
 * Poker Game Engine
 */
class PokerEngine {
    constructor(players, bigBlind = 20) {
        this.players = players;
        this.bigBlind = bigBlind;
        this.smallBlind = Math.floor(bigBlind / 2);
        this.pot = 0;
        this.sidePots = [];
        this.communityCards = [];
        this.deck = [];
        this.phase = GAME_PHASES.PREFLOP;
        this.currentBet = 0;
        this.minRaise = bigBlind;
        this.dealerIndex = 0;
        this.currentPlayerIndex = 0;
        this.lastRaiserIndex = -1;
        this.gameLog = [];
        this.isHandComplete = false;
        this.winners = [];
    }

    /**
     * Starts a new hand
     */
    startNewHand() {
        this.deck = window.Cards.shuffleDeck(window.Cards.createDeck());
        this.pot = 0;
        this.sidePots = [];
        this.communityCards = [];
        this.phase = GAME_PHASES.PREFLOP;
        this.currentBet = 0;
        this.minRaise = this.bigBlind;
        this.lastRaiserIndex = -1;
        this.isHandComplete = false;
        this.winners = [];
        this.gameLog = [];

        // Reset players
        for (const player of this.players) {
            player.reset();
        }

        // Remove busted players
        this.players = this.players.filter(p => p.chips > 0);

        if (this.players.length < 2) {
            return false;
        }

        // Move dealer button
        this.dealerIndex = (this.dealerIndex + 1) % this.players.length;

        // Post blinds
        this.postBlinds();

        // Deal hole cards
        this.dealHoleCards();

        // Set first player to act (after big blind)
        this.currentPlayerIndex = (this.dealerIndex + 3) % this.players.length;
        
        // In heads-up, small blind acts first preflop
        if (this.players.length === 2) {
            this.currentPlayerIndex = this.dealerIndex;
        }

        this.log(`New hand started. Dealer: ${this.getDealer().name}`);
        
        return true;
    }

    /**
     * Posts small and big blinds
     */
    postBlinds() {
        const sbIndex = (this.dealerIndex + 1) % this.players.length;
        const bbIndex = (this.dealerIndex + 2) % this.players.length;

        // In heads-up, dealer posts small blind
        if (this.players.length === 2) {
            this.postBlind(this.dealerIndex, this.smallBlind);
            this.postBlind((this.dealerIndex + 1) % this.players.length, this.bigBlind);
        } else {
            this.postBlind(sbIndex, this.smallBlind);
            this.postBlind(bbIndex, this.bigBlind);
        }

        this.currentBet = this.bigBlind;
        this.lastRaiserIndex = this.players.length === 2 ? 
            (this.dealerIndex + 1) % this.players.length : bbIndex;
    }

    postBlind(playerIndex, amount) {
        const player = this.players[playerIndex];
        const blindAmount = Math.min(amount, player.chips);
        player.chips -= blindAmount;
        player.totalBetThisRound = blindAmount;
        player.currentBet = blindAmount;
        this.pot += blindAmount;

        if (player.chips === 0) {
            player.isAllIn = true;
        }

        this.log(`${player.name} posts ${blindAmount === this.smallBlind ? 'small' : 'big'} blind: $${blindAmount}`);
    }

    /**
     * Deals hole cards to all players
     */
    dealHoleCards() {
        for (let i = 0; i < 2; i++) {
            for (const player of this.players) {
                const result = window.Cards.dealCards(this.deck, 1);
                player.holeCards.push(result.dealt[0]);
                this.deck = result.remaining;
            }
        }
    }

    /**
     * Deals community cards based on current phase
     */
    dealCommunityCards() {
        let cardsToDeal = 0;

        switch (this.phase) {
            case GAME_PHASES.FLOP:
                cardsToDeal = 3;
                break;
            case GAME_PHASES.TURN:
            case GAME_PHASES.RIVER:
                cardsToDeal = 1;
                break;
        }

        // Burn a card
        this.deck = this.deck.slice(1);

        // Deal community cards
        const result = window.Cards.dealCards(this.deck, cardsToDeal);
        this.communityCards.push(...result.dealt);
        this.deck = result.remaining;

        const phaseNames = {
            [GAME_PHASES.FLOP]: 'Flop',
            [GAME_PHASES.TURN]: 'Turn',
            [GAME_PHASES.RIVER]: 'River'
        };

        this.log(`${phaseNames[this.phase]}: ${result.dealt.map(c => window.Cards.cardToString(c)).join(' ')}`);
    }

    /**
     * Processes a player action
     * @param {string} action - The action type
     * @param {number} amount - The amount (for bet/raise)
     * @returns {boolean} True if action was valid
     */
    processAction(action, amount = 0) {
        const player = this.getCurrentPlayer();
        
        if (!player || player.hasFolded || player.isAllIn) {
            return false;
        }

        const callAmount = this.currentBet - player.totalBetThisRound;

        switch (action) {
            case ACTIONS.FOLD:
                player.hasFolded = true;
                this.log(`${player.name} folds`);
                break;

            case ACTIONS.CHECK:
                if (callAmount > 0) {
                    return false; // Can't check if there's a bet
                }
                this.log(`${player.name} checks`);
                break;

            case ACTIONS.CALL:
                const actualCall = Math.min(callAmount, player.chips);
                player.chips -= actualCall;
                player.totalBetThisRound += actualCall;
                player.currentBet = player.totalBetThisRound;
                this.pot += actualCall;

                if (player.chips === 0) {
                    player.isAllIn = true;
                    this.log(`${player.name} calls $${actualCall} (ALL IN)`);
                } else {
                    this.log(`${player.name} calls $${actualCall}`);
                }
                break;

            case ACTIONS.BET:
            case ACTIONS.RAISE:
                const totalBet = amount;
                const additionalAmount = totalBet - player.totalBetThisRound;

                if (additionalAmount > player.chips) {
                    return false; // Not enough chips
                }

                if (totalBet < this.currentBet + this.minRaise && additionalAmount < player.chips) {
                    return false; // Raise too small (unless all-in)
                }

                const raiseBy = totalBet - this.currentBet;
                if (raiseBy > this.minRaise) {
                    this.minRaise = raiseBy;
                }

                player.chips -= additionalAmount;
                player.totalBetThisRound = totalBet;
                player.currentBet = totalBet;
                this.pot += additionalAmount;
                this.currentBet = totalBet;
                this.lastRaiserIndex = this.currentPlayerIndex;

                if (player.chips === 0) {
                    player.isAllIn = true;
                    this.log(`${player.name} raises to $${totalBet} (ALL IN)`);
                } else {
                    this.log(`${player.name} raises to $${totalBet}`);
                }
                break;

            case ACTIONS.ALL_IN:
                const allInAmount = player.chips;
                const newTotal = player.totalBetThisRound + allInAmount;
                player.chips = 0;
                player.totalBetThisRound = newTotal;
                player.currentBet = newTotal;
                player.isAllIn = true;
                this.pot += allInAmount;

                if (newTotal > this.currentBet) {
                    const raiseAmount = newTotal - this.currentBet;
                    if (raiseAmount >= this.minRaise) {
                        this.lastRaiserIndex = this.currentPlayerIndex;
                        this.minRaise = raiseAmount;
                    }
                    this.currentBet = newTotal;
                }

                this.log(`${player.name} goes ALL IN for $${allInAmount}`);
                break;

            default:
                return false;
        }

        return true;
    }

    /**
     * Moves to the next player or phase
     * @returns {Object} State info { isHandComplete, phaseChanged, currentPlayer }
     */
    advance() {
        // Check for single remaining player
        const activePlayers = this.players.filter(p => !p.hasFolded);
        if (activePlayers.length === 1) {
            this.handleWin([activePlayers[0]]);
            return { isHandComplete: true, winner: activePlayers[0] };
        }

        // Move to next player
        this.currentPlayerIndex = this.getNextActivePlayerIndex();

        // Check if betting round is complete
        if (this.isBettingRoundComplete()) {
            return this.advancePhase();
        }

        return { 
            isHandComplete: false, 
            phaseChanged: false, 
            currentPlayer: this.getCurrentPlayer() 
        };
    }

    /**
     * Gets the next active player index
     */
    getNextActivePlayerIndex() {
        let index = (this.currentPlayerIndex + 1) % this.players.length;
        let count = 0;

        while (count < this.players.length) {
            const player = this.players[index];
            if (!player.hasFolded && !player.isAllIn) {
                return index;
            }
            index = (index + 1) % this.players.length;
            count++;
        }

        return this.currentPlayerIndex;
    }

    /**
     * Checks if the betting round is complete
     */
    isBettingRoundComplete() {
        const activePlayers = this.players.filter(p => !p.hasFolded && !p.isAllIn);
        
        if (activePlayers.length === 0) {
            return true;
        }

        if (activePlayers.length === 1 && this.players.filter(p => !p.hasFolded).length > 1) {
            // Only one player can act but others are all-in
            const player = activePlayers[0];
            if (player.totalBetThisRound >= this.currentBet) {
                return true;
            }
        }

        // Check if everyone has acted and matched the bet
        for (const player of activePlayers) {
            if (player.totalBetThisRound < this.currentBet) {
                return false;
            }
        }

        // Check if we've gone around back to the last raiser
        if (this.lastRaiserIndex >= 0 && this.currentPlayerIndex === this.lastRaiserIndex) {
            return true;
        }

        // If no one has raised this round
        if (this.lastRaiserIndex === -1 || this.phase === GAME_PHASES.PREFLOP) {
            // Preflop: Big blind gets to act last (option to raise)
            if (this.phase === GAME_PHASES.PREFLOP) {
                const bbIndex = this.players.length === 2 ? 
                    (this.dealerIndex + 1) % this.players.length : 
                    (this.dealerIndex + 2) % this.players.length;
                
                const bb = this.players[bbIndex];
                if (!bb.hasFolded && !bb.isAllIn && bb.totalBetThisRound === this.bigBlind && 
                    this.currentBet === this.bigBlind && this.lastRaiserIndex === -1) {
                    // No one has raised - BB still has option to raise
                    // Round is complete only if we're back at BB AND someone has acted
                    return false;
                }
            }
            
            return activePlayers.every(p => p.totalBetThisRound >= this.currentBet);
        }

        return true;
    }

    /**
     * Advances to the next phase
     */
    advancePhase() {
        // Reset betting for new round
        for (const player of this.players) {
            player.totalBetThisRound = 0;
            player.currentBet = 0;
        }
        this.currentBet = 0;
        this.minRaise = this.bigBlind;
        this.lastRaiserIndex = -1;

        const phases = [GAME_PHASES.PREFLOP, GAME_PHASES.FLOP, GAME_PHASES.TURN, GAME_PHASES.RIVER, GAME_PHASES.SHOWDOWN];
        const currentPhaseIndex = phases.indexOf(this.phase);

        if (currentPhaseIndex >= 3) {
            // Go to showdown
            this.phase = GAME_PHASES.SHOWDOWN;
            return this.handleShowdown();
        }

        this.phase = phases[currentPhaseIndex + 1];
        this.dealCommunityCards();

        // Set first player after dealer
        this.currentPlayerIndex = (this.dealerIndex + 1) % this.players.length;
        
        // Find first active player
        while (this.players[this.currentPlayerIndex].hasFolded || 
               this.players[this.currentPlayerIndex].isAllIn) {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        }

        return { 
            isHandComplete: false, 
            phaseChanged: true, 
            phase: this.phase,
            currentPlayer: this.getCurrentPlayer() 
        };
    }

    /**
     * Handles the showdown phase
     */
    handleShowdown() {
        const activePlayers = this.players.filter(p => !p.hasFolded);
        
        // Evaluate all hands
        const handResults = activePlayers.map(player => ({
            player,
            hand: window.HandEvaluator.evaluateBestHand(player.holeCards, this.communityCards)
        }));

        // Sort by hand strength
        handResults.sort((a, b) => window.HandEvaluator.compareHands(b.hand, a.hand));

        // Find winner(s) - could be a tie
        const winners = [handResults[0]];
        for (let i = 1; i < handResults.length; i++) {
            if (window.HandEvaluator.compareHands(handResults[i].hand, handResults[0].hand) === 0) {
                winners.push(handResults[i]);
            } else {
                break;
            }
        }

        this.handleWin(winners.map(w => w.player), handResults);

        return { 
            isHandComplete: true, 
            showdown: true, 
            results: handResults,
            winners: this.winners
        };
    }

    /**
     * Handles winning the pot
     * @param {Array} winners - Array of winning players
     * @param {Array} handResults - Hand evaluation results (for showdown)
     */
    handleWin(winners, handResults = null) {
        this.isHandComplete = true;

        // Split pot among winners
        const winAmount = Math.floor(this.pot / winners.length);
        const remainder = this.pot % winners.length;

        this.winners = winners.map((winner, index) => {
            const amount = winAmount + (index === 0 ? remainder : 0);
            winner.chips += amount;

            let handInfo = '';
            if (handResults) {
                const result = handResults.find(r => r.player === winner);
                if (result) {
                    handInfo = ` with ${result.hand.name}`;
                }
            }

            this.log(`${winner.name} wins $${amount}${handInfo}`);

            return { player: winner, amount, handInfo };
        });

        this.pot = 0;
    }

    /**
     * Gets the current player
     */
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    /**
     * Gets the dealer
     */
    getDealer() {
        return this.players[this.dealerIndex];
    }

    /**
     * Gets the game state for bot AI
     */
    getGameState() {
        return {
            pot: this.pot,
            currentBet: this.currentBet,
            minRaise: this.minRaise,
            phase: this.phase,
            communityCards: this.communityCards,
            players: this.players,
            dealerIndex: this.dealerIndex
        };
    }

    /**
     * Logs a message
     */
    log(message) {
        this.gameLog.push(message);
        console.log(`[Poker] ${message}`);
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PokerEngine = {
        GAME_PHASES,
        ACTIONS,
        PokerEngine
    };
}
