/**
 * Bot AI for Texas Hold'em
 * Implements three difficulty levels: Easy, Medium, Hard
 */

const BOT_DIFFICULTY = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
};

const BOT_NAMES = [
    'Alex', 'Jordan', 'Casey', 'Morgan', 'Riley',
    'Taylor', 'Quinn', 'Avery', 'Sage', 'Drew'
];

/**
 * Bot player class
 */
class BotPlayer {
    constructor(name, difficulty, startingChips) {
        this.name = name;
        this.difficulty = difficulty;
        this.chips = startingChips;
        this.holeCards = [];
        this.isBot = true;
        this.hasFolded = false;
        this.isAllIn = false;
        this.currentBet = 0;
        this.totalBetThisRound = 0;
    }

    /**
     * Decides what action to take based on difficulty and hand strength
     * @param {Object} gameState - Current game state
     * @returns {Object} Action to take { action: 'fold'|'call'|'raise', amount?: number }
     */
    decide(gameState) {
        switch (this.difficulty) {
            case BOT_DIFFICULTY.EASY:
                return this.decideEasy(gameState);
            case BOT_DIFFICULTY.MEDIUM:
                return this.decideMedium(gameState);
            case BOT_DIFFICULTY.HARD:
                return this.decideHard(gameState);
            default:
                return this.decideEasy(gameState);
        }
    }

    /**
     * Easy AI - Random play with slight preference for calling
     */
    decideEasy(gameState) {
        const callAmount = gameState.currentBet - this.totalBetThisRound;
        const random = Math.random();

        // 30% fold, 50% call, 20% raise
        if (random < 0.3 && callAmount > 0) {
            return { action: 'fold' };
        } else if (random < 0.8 || callAmount === 0) {
            if (callAmount === 0 && Math.random() < 0.3) {
                const raiseAmount = Math.min(gameState.minRaise * 2, this.chips);
                return { action: 'raise', amount: raiseAmount };
            }
            return { action: 'call' };
        } else {
            const raiseAmount = Math.min(gameState.minRaise * 2, this.chips);
            return { action: 'raise', amount: raiseAmount };
        }
    }

    /**
     * Medium AI - Considers hand strength and pot odds
     */
    decideMedium(gameState) {
        const handStrength = this.evaluateHandStrength(gameState);
        const callAmount = gameState.currentBet - this.totalBetThisRound;
        const potOdds = callAmount / (gameState.pot + callAmount);

        // Strong hand
        if (handStrength > 0.7) {
            const raiseAmount = Math.min(gameState.pot * 0.75, this.chips);
            if (raiseAmount > gameState.minRaise) {
                return { action: 'raise', amount: Math.floor(raiseAmount) };
            }
            return { action: 'call' };
        }

        // Medium hand
        if (handStrength > 0.4) {
            if (potOdds < 0.3 || callAmount === 0) {
                if (Math.random() < 0.2 && callAmount === 0) {
                    const raiseAmount = Math.min(gameState.minRaise * 2, this.chips);
                    return { action: 'raise', amount: raiseAmount };
                }
                return { action: 'call' };
            }
            // Sometimes bluff
            if (Math.random() < 0.15) {
                return { action: 'call' };
            }
            return { action: 'fold' };
        }

        // Weak hand
        if (callAmount === 0) {
            // Check
            return { action: 'call' };
        }
        
        // Occasionally bluff
        if (Math.random() < 0.1) {
            return { action: 'call' };
        }
        
        return { action: 'fold' };
    }

    /**
     * Hard AI - Uses pot odds, position, and hand strength analysis
     */
    decideHard(gameState) {
        const handStrength = this.evaluateHandStrength(gameState);
        const callAmount = gameState.currentBet - this.totalBetThisRound;
        const potOdds = callAmount > 0 ? callAmount / (gameState.pot + callAmount) : 0;
        const position = this.getPositionValue(gameState);

        // Adjust hand strength based on position
        const adjustedStrength = handStrength + (position * 0.05);

        // Very strong hand - aggressive betting
        if (adjustedStrength > 0.8) {
            const raiseAmount = Math.min(gameState.pot * (0.75 + Math.random() * 0.5), this.chips);
            if (raiseAmount > gameState.minRaise) {
                return { action: 'raise', amount: Math.floor(raiseAmount) };
            }
            return { action: 'call' };
        }

        // Strong hand
        if (adjustedStrength > 0.6) {
            if (callAmount === 0) {
                const raiseAmount = Math.min(gameState.pot * 0.6, this.chips);
                if (raiseAmount > gameState.minRaise && Math.random() < 0.6) {
                    return { action: 'raise', amount: Math.floor(raiseAmount) };
                }
                return { action: 'call' };
            }
            
            if (potOdds < adjustedStrength * 0.5) {
                if (Math.random() < 0.4) {
                    const raiseAmount = Math.min(gameState.pot * 0.5, this.chips);
                    return { action: 'raise', amount: Math.floor(raiseAmount) };
                }
                return { action: 'call' };
            }
            return { action: 'call' };
        }

        // Medium hand
        if (adjustedStrength > 0.35) {
            if (callAmount === 0) {
                if (Math.random() < 0.3) {
                    const raiseAmount = Math.min(gameState.minRaise * 2, this.chips);
                    return { action: 'raise', amount: raiseAmount };
                }
                return { action: 'call' };
            }
            
            // Call if pot odds are good
            if (potOdds < adjustedStrength * 0.4) {
                return { action: 'call' };
            }
            
            // Occasional bluff raise
            if (Math.random() < 0.08 && position > 0.5) {
                const raiseAmount = Math.min(gameState.pot * 0.4, this.chips);
                return { action: 'raise', amount: Math.floor(raiseAmount) };
            }
            
            return { action: 'fold' };
        }

        // Weak hand
        if (callAmount === 0) {
            // Sometimes bluff in position
            if (Math.random() < 0.12 && position > 0.6) {
                const raiseAmount = Math.min(gameState.pot * 0.5, this.chips);
                return { action: 'raise', amount: Math.floor(raiseAmount) };
            }
            return { action: 'call' };
        }

        // Rare bluff
        if (Math.random() < 0.05) {
            return { action: 'call' };
        }

        return { action: 'fold' };
    }

    /**
     * Evaluates hand strength from 0 to 1
     */
    evaluateHandStrength(gameState) {
        if (this.holeCards.length < 2) return 0.3;

        const card1 = this.holeCards[0];
        const card2 = this.holeCards[1];

        // Preflop strength
        let preflopStrength = this.calculatePreflopStrength(card1, card2);

        // If there are community cards, evaluate actual hand
        if (gameState.communityCards && gameState.communityCards.length > 0) {
            const handEval = window.HandEvaluator.evaluateBestHand(
                this.holeCards, 
                gameState.communityCards
            );
            
            if (handEval) {
                // Convert hand rank to strength (1-10 scale to 0-1)
                const handStrength = (handEval.rank / 10) * 0.6 + preflopStrength * 0.4;
                return Math.min(1, handStrength);
            }
        }

        return preflopStrength;
    }

    /**
     * Calculates preflop hand strength
     */
    calculatePreflopStrength(card1, card2) {
        const high = Math.max(card1.value, card2.value);
        const low = Math.min(card1.value, card2.value);
        const suited = card1.suit === card2.suit;
        const paired = card1.value === card2.value;

        let strength = 0;

        // Base strength from high card
        strength += (high - 2) / 12 * 0.4;

        // Pair bonus
        if (paired) {
            strength += 0.3 + (high / 14) * 0.2;
        }

        // Suited bonus
        if (suited) {
            strength += 0.08;
        }

        // Connectivity bonus
        const gap = high - low;
        if (gap <= 4 && !paired) {
            strength += (5 - gap) * 0.02;
        }

        // Premium hand bonuses
        if (paired && high >= 10) strength += 0.15; // High pairs
        if (high === 14 && low >= 10 && suited) strength += 0.1; // Suited broadway
        if (high === 14 && low === 13) strength += 0.12; // AK

        return Math.min(1, strength);
    }

    /**
     * Gets position value (0 = early, 1 = button)
     */
    getPositionValue(gameState) {
        if (!gameState.players || !gameState.dealerIndex) return 0.5;
        
        const playerIndex = gameState.players.indexOf(this);
        const totalPlayers = gameState.players.filter(p => !p.hasFolded).length;
        
        if (totalPlayers <= 1) return 1;
        
        // Calculate distance from dealer
        const distance = (playerIndex - gameState.dealerIndex + gameState.players.length) % gameState.players.length;
        return distance / (totalPlayers - 1);
    }

    reset() {
        this.holeCards = [];
        this.hasFolded = false;
        this.isAllIn = false;
        this.currentBet = 0;
        this.totalBetThisRound = 0;
    }
}

/**
 * Creates bot players
 * @param {number} count - Number of bots to create
 * @param {string} difficulty - Difficulty level
 * @param {number} startingChips - Starting chips for each bot
 * @returns {Array} Array of BotPlayer objects
 */
function createBots(count, difficulty, startingChips) {
    const bots = [];
    const usedNames = new Set();

    for (let i = 0; i < count; i++) {
        let name;
        do {
            name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
        } while (usedNames.has(name) && usedNames.size < BOT_NAMES.length);
        usedNames.add(name);

        bots.push(new BotPlayer(name, difficulty, startingChips));
    }

    return bots;
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.BotAI = {
        BOT_DIFFICULTY,
        BotPlayer,
        createBots
    };
}
