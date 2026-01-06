/**
 * Balatro Game Engine
 * Roguelike poker game mechanics
 */

// Hand scoring values (base chips, multiplier)
const HAND_SCORES = {
    HIGH_CARD: { chips: 5, mult: 1, name: 'High Card' },
    ONE_PAIR: { chips: 10, mult: 2, name: 'Pair' },
    TWO_PAIR: { chips: 20, mult: 2, name: 'Two Pair' },
    THREE_OF_A_KIND: { chips: 30, mult: 3, name: 'Three of a Kind' },
    STRAIGHT: { chips: 30, mult: 4, name: 'Straight' },
    FLUSH: { chips: 35, mult: 4, name: 'Flush' },
    FULL_HOUSE: { chips: 40, mult: 4, name: 'Full House' },
    FOUR_OF_A_KIND: { chips: 60, mult: 7, name: 'Four of a Kind' },
    STRAIGHT_FLUSH: { chips: 100, mult: 8, name: 'Straight Flush' },
    ROYAL_FLUSH: { chips: 100, mult: 8, name: 'Royal Flush' }
};

// Map hand evaluator rankings to our scoring keys
const RANKING_TO_KEY = {
    1: 'HIGH_CARD',
    2: 'ONE_PAIR',
    3: 'TWO_PAIR',
    4: 'THREE_OF_A_KIND',
    5: 'STRAIGHT',
    6: 'FLUSH',
    7: 'FULL_HOUSE',
    8: 'FOUR_OF_A_KIND',
    9: 'STRAIGHT_FLUSH',
    10: 'ROYAL_FLUSH'
};

// Blind configurations
const BLINDS = {
    SMALL: { name: 'Small Blind', multiplier: 1 },
    BIG: { name: 'Big Blind', multiplier: 1.5 },
    BOSS: { name: 'Boss Blind', multiplier: 2 }
};

// Base scores for each ante
const ANTE_BASE_SCORES = [0, 300, 450, 600, 900, 1200, 1800, 2400, 4000];

class BalatroGame {
    constructor() {
        this.deck = [];
        this.hand = [];
        this.selectedCards = [];
        this.handsLeft = 4;
        this.discardsLeft = 3;
        this.roundScore = 0;
        this.money = 4;
        this.ante = 1;
        this.blindIndex = 0; // 0 = small, 1 = big, 2 = boss
        this.currentBlind = BLINDS.SMALL;
        this.targetScore = 300;
        this.isGameOver = false;
    }

    /**
     * Starts a new game
     */
    newGame() {
        this.money = 4;
        this.ante = 1;
        this.blindIndex = 0;
        this.isGameOver = false;
        this.startNewRound();
    }

    /**
     * Starts a new round with a fresh deck
     */
    startNewRound() {
        // Set up blind
        this.setupBlind();
        
        // Reset round state
        this.handsLeft = 4;
        this.discardsLeft = 3;
        this.roundScore = 0;
        this.selectedCards = [];
        
        // Create and shuffle deck
        this.deck = window.Cards.shuffleDeck(window.Cards.createDeck());
        
        // Deal initial hand of 8 cards
        this.dealHand();
    }

    /**
     * Sets up the current blind target
     */
    setupBlind() {
        const blindTypes = [BLINDS.SMALL, BLINDS.BIG, BLINDS.BOSS];
        this.currentBlind = blindTypes[this.blindIndex];
        
        // Calculate target score based on ante and blind
        const baseScore = ANTE_BASE_SCORES[Math.min(this.ante, ANTE_BASE_SCORES.length - 1)];
        this.targetScore = Math.floor(baseScore * this.currentBlind.multiplier);
    }

    /**
     * Deals cards to fill hand to 8 cards
     */
    dealHand() {
        const cardsNeeded = 8 - this.hand.length;
        
        for (let i = 0; i < cardsNeeded && this.deck.length > 0; i++) {
            this.hand.push(this.deck.pop());
        }
        
        // Sort hand by value for better display
        this.hand.sort((a, b) => a.value - b.value);
    }

    /**
     * Toggles card selection
     * @param {number} cardIndex - Index of card in hand
     * @returns {boolean} Whether the selection was successful
     */
    toggleCardSelection(cardIndex) {
        if (cardIndex < 0 || cardIndex >= this.hand.length) {
            return false;
        }

        const card = this.hand[cardIndex];
        const selectedIndex = this.selectedCards.indexOf(cardIndex);

        if (selectedIndex > -1) {
            // Deselect
            this.selectedCards.splice(selectedIndex, 1);
        } else if (this.selectedCards.length < 5) {
            // Select (max 5)
            this.selectedCards.push(cardIndex);
        } else {
            return false;
        }

        return true;
    }

    /**
     * Gets the currently selected cards
     * @returns {Array} Array of selected card objects
     */
    getSelectedCards() {
        return this.selectedCards.map(idx => this.hand[idx]);
    }

    /**
     * Evaluates the selected hand
     * @returns {Object|null} Hand evaluation or null if invalid
     */
    evaluateSelectedHand() {
        const cards = this.getSelectedCards();
        
        if (cards.length === 0) {
            return null;
        }

        if (cards.length < 5) {
            // For hands with fewer than 5 cards, we need to evaluate what we have
            return this.evaluatePartialHand(cards);
        }

        // Use the hand evaluator for 5 cards
        return window.HandEvaluator.evaluate5CardHand(cards);
    }

    /**
     * Evaluates a partial hand (less than 5 cards)
     * @param {Array} cards - Cards to evaluate
     * @returns {Object} Hand evaluation
     */
    evaluatePartialHand(cards) {
        const sorted = [...cards].sort((a, b) => b.value - a.value);
        const values = sorted.map(c => c.value);
        
        // Group by rank
        const groups = {};
        for (const card of cards) {
            groups[card.value] = (groups[card.value] || 0) + 1;
        }
        const groupSizes = Object.values(groups).sort((a, b) => b - a);
        
        // Check for pairs, trips, etc.
        if (groupSizes[0] === 4) {
            return { rank: 8, name: 'Four of a Kind', kickers: values };
        }
        if (groupSizes[0] === 3 && groupSizes[1] === 2) {
            return { rank: 7, name: 'Full House', kickers: values };
        }
        if (groupSizes[0] === 3) {
            return { rank: 4, name: 'Three of a Kind', kickers: values };
        }
        if (groupSizes[0] === 2 && groupSizes[1] === 2) {
            return { rank: 3, name: 'Two Pair', kickers: values };
        }
        if (groupSizes[0] === 2) {
            return { rank: 2, name: 'One Pair', kickers: values };
        }
        
        return { rank: 1, name: 'High Card', kickers: values };
    }

    /**
     * Plays the selected hand
     * @returns {Object} Result with score information
     */
    playHand() {
        if (this.selectedCards.length === 0 || this.handsLeft <= 0) {
            return { success: false, message: 'Cannot play hand' };
        }

        const cards = this.getSelectedCards();
        const evaluation = this.evaluateSelectedHand();
        
        if (!evaluation) {
            return { success: false, message: 'Invalid hand' };
        }

        // Get scoring for this hand type
        const handKey = RANKING_TO_KEY[evaluation.rank];
        const scoring = HAND_SCORES[handKey];
        
        // Calculate chips from card values
        let cardChips = 0;
        for (const card of cards) {
            cardChips += card.value;
        }
        
        // Total chips = base hand chips + card values
        const totalChips = scoring.chips + cardChips;
        const mult = scoring.mult;
        const handScore = totalChips * mult;
        
        // Update round score
        this.roundScore += handScore;
        this.handsLeft--;
        
        // Remove played cards from hand
        this.removeSelectedCards();
        
        // Deal new cards
        this.dealHand();
        
        return {
            success: true,
            handName: scoring.name,
            chips: totalChips,
            mult: mult,
            score: handScore,
            roundScore: this.roundScore
        };
    }

    /**
     * Discards selected cards and draws new ones
     * @returns {Object} Result of discard action
     */
    discardCards() {
        if (this.selectedCards.length === 0 || this.discardsLeft <= 0) {
            return { success: false, message: 'Cannot discard' };
        }

        this.discardsLeft--;
        
        // Remove discarded cards
        this.removeSelectedCards();
        
        // Deal new cards
        this.dealHand();
        
        return {
            success: true,
            cardsDiscarded: this.selectedCards.length,
            discardsRemaining: this.discardsLeft
        };
    }

    /**
     * Removes selected cards from hand
     */
    removeSelectedCards() {
        // Sort indices in descending order to remove from end first
        const sortedIndices = [...this.selectedCards].sort((a, b) => b - a);
        
        for (const idx of sortedIndices) {
            this.hand.splice(idx, 1);
        }
        
        this.selectedCards = [];
    }

    /**
     * Checks if the round is complete
     * @returns {Object} Round status
     */
    checkRoundStatus() {
        if (this.roundScore >= this.targetScore) {
            return { complete: true, won: true };
        }
        
        if (this.handsLeft <= 0) {
            return { complete: true, won: false };
        }
        
        return { complete: false, won: false };
    }

    /**
     * Ends the round and calculates earnings
     * @returns {Object} Earnings breakdown
     */
    endRound() {
        const status = this.checkRoundStatus();
        
        if (!status.won) {
            this.isGameOver = true;
            return { won: false, earnings: 0 };
        }
        
        // Calculate earnings
        let earnings = 0;
        const breakdown = [];
        
        // Base blind reward
        const blindReward = this.blindIndex + 1;
        earnings += blindReward;
        breakdown.push({ label: 'Blind Beaten', amount: blindReward });
        
        // Bonus for remaining hands
        if (this.handsLeft > 0) {
            const handBonus = this.handsLeft;
            earnings += handBonus;
            breakdown.push({ label: `${this.handsLeft} Hands Left`, amount: handBonus });
        }
        
        // Ante bonus
        if (this.blindIndex === 2) {
            const anteBonus = this.ante;
            earnings += anteBonus;
            breakdown.push({ label: 'Ante Complete Bonus', amount: anteBonus });
        }
        
        this.money += earnings;
        
        return {
            won: true,
            earnings: earnings,
            breakdown: breakdown,
            totalMoney: this.money
        };
    }

    /**
     * Advances to the next blind/ante
     */
    advanceToNext() {
        this.blindIndex++;
        
        if (this.blindIndex > 2) {
            // Next ante
            this.blindIndex = 0;
            this.ante++;
        }
        
        this.startNewRound();
    }

    /**
     * Gets the current game state
     * @returns {Object} Current game state
     */
    getState() {
        return {
            hand: this.hand,
            selectedCards: this.selectedCards,
            handsLeft: this.handsLeft,
            discardsLeft: this.discardsLeft,
            roundScore: this.roundScore,
            targetScore: this.targetScore,
            money: this.money,
            ante: this.ante,
            blindName: this.currentBlind.name,
            deckSize: this.deck.length,
            isGameOver: this.isGameOver
        };
    }

    /**
     * Gets preview of hand score
     * @returns {Object|null} Preview or null
     */
    getScorePreview() {
        if (this.selectedCards.length === 0) {
            return null;
        }

        const cards = this.getSelectedCards();
        const evaluation = this.evaluateSelectedHand();
        
        if (!evaluation) {
            return null;
        }

        const handKey = RANKING_TO_KEY[evaluation.rank];
        const scoring = HAND_SCORES[handKey];
        
        let cardChips = 0;
        for (const card of cards) {
            cardChips += card.value;
        }
        
        const totalChips = scoring.chips + cardChips;
        
        return {
            handName: scoring.name,
            chips: totalChips,
            mult: scoring.mult,
            potentialScore: totalChips * scoring.mult
        };
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.BalatroGame = BalatroGame;
    window.HAND_SCORES = HAND_SCORES;
}
