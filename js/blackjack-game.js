/**
 * Blackjack Game Engine
 */

class BlackjackGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.playerChips = 500;
        this.currentBet = 0;
        this.gameState = 'betting'; // betting, playing, dealerTurn, ended
        this.result = null;
    }

    /**
     * Initialize game with starting chips
     */
    init(startingChips) {
        this.playerChips = startingChips;
        this.currentBet = 0;
        this.gameState = 'betting';
        this.result = null;
        this.playerHand = [];
        this.dealerHand = [];
    }

    /**
     * Add to current bet
     */
    addBet(amount) {
        if (this.currentBet + amount <= this.playerChips && this.gameState === 'betting') {
            this.currentBet += amount;
            return true;
        }
        return false;
    }

    /**
     * Clear current bet
     */
    clearBet() {
        this.currentBet = 0;
    }

    /**
     * Deal initial cards
     */
    deal() {
        if (this.currentBet <= 0 || this.currentBet > this.playerChips) {
            return false;
        }

        // Deduct bet from chips
        this.playerChips -= this.currentBet;

        // Create and shuffle deck
        this.deck = window.Cards.shuffleDeck(window.Cards.createDeck());
        
        // Deal initial cards
        this.playerHand = [];
        this.dealerHand = [];
        
        this.playerHand.push(this.drawCard());
        this.dealerHand.push(this.drawCard());
        this.playerHand.push(this.drawCard());
        this.dealerHand.push(this.drawCard());

        this.gameState = 'playing';

        // Check for natural blackjack (21 with first 2 cards)
        if (this.calculateHandValue(this.playerHand) === 21) {
            this.gameState = 'dealerTurn';
            // Reveal dealer hand and check if dealer also has blackjack
            const dealerValue = this.calculateHandValue(this.dealerHand);
            if (dealerValue === 21) {
                // Both have blackjack - push
                this.endGame('push');
            } else {
                // Player has blackjack, dealer doesn't
                this.endGame('blackjack');
            }
        }

        return true;
    }

    /**
     * Draw a card from the deck
     */
    drawCard() {
        return this.deck.pop();
    }

    /**
     * Calculate hand value
     */
    calculateHandValue(hand) {
        let value = 0;
        let aces = 0;

        for (const card of hand) {
            if (card.rank === 'A') {
                aces++;
                value += 11;
            } else if (['K', 'Q', 'J'].includes(card.rank)) {
                value += 10;
            } else {
                value += parseInt(card.rank);
            }
        }

        // Adjust for aces
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }

        return value;
    }

    /**
     * Player hits
     */
    hit() {
        if (this.gameState !== 'playing') return null;

        const card = this.drawCard();
        this.playerHand.push(card);

        const value = this.calculateHandValue(this.playerHand);
        
        if (value > 21) {
            this.endGame('bust');
        }

        return card;
    }

    /**
     * Player stands
     */
    stand() {
        if (this.gameState !== 'playing') return;
        
        this.gameState = 'dealerTurn';
        this.dealerPlay();
    }

    /**
     * Player doubles down
     */
    double() {
        if (this.gameState !== 'playing') return false;
        if (this.playerHand.length !== 2) return false;
        if (this.currentBet > this.playerChips) return false;

        // Double the bet
        this.playerChips -= this.currentBet;
        this.currentBet *= 2;

        // Take one more card
        this.hit();

        // If not busted, stand
        if (this.gameState === 'playing') {
            this.stand();
        }

        return true;
    }

    /**
     * Dealer plays their hand
     */
    dealerPlay() {
        // Dealer hits on 16 or less, stands on 17 or more
        while (this.calculateHandValue(this.dealerHand) < 17) {
            this.dealerHand.push(this.drawCard());
        }

        this.determineWinner();
    }

    /**
     * Determine the winner
     */
    determineWinner() {
        const playerValue = this.calculateHandValue(this.playerHand);
        const dealerValue = this.calculateHandValue(this.dealerHand);

        if (dealerValue > 21) {
            this.endGame('dealerBust');
        } else if (playerValue > dealerValue) {
            this.endGame('win');
        } else if (dealerValue > playerValue) {
            this.endGame('lose');
        } else {
            this.endGame('push');
        }
    }

    /**
     * End the game and calculate winnings
     */
    endGame(result) {
        this.gameState = 'ended';
        this.result = result;

        switch (result) {
            case 'blackjack':
                // Blackjack pays 3:2
                this.playerChips += this.currentBet * 2.5;
                break;
            case 'win':
            case 'dealerBust':
                // Regular win pays 1:1
                this.playerChips += this.currentBet * 2;
                break;
            case 'push':
                // Push returns bet
                this.playerChips += this.currentBet;
                break;
            case 'bust':
            case 'lose':
                // Lose - bet already deducted
                break;
        }
    }

    /**
     * Start a new hand
     */
    newHand() {
        this.playerHand = [];
        this.dealerHand = [];
        this.currentBet = 0;
        this.gameState = 'betting';
        this.result = null;
    }

    /**
     * Check if player can double
     */
    canDouble() {
        return this.gameState === 'playing' && 
               this.playerHand.length === 2 && 
               this.currentBet <= this.playerChips;
    }

    /**
     * Get game state
     */
    getState() {
        return {
            playerHand: this.playerHand,
            dealerHand: this.dealerHand,
            playerValue: this.calculateHandValue(this.playerHand),
            dealerValue: this.calculateHandValue(this.dealerHand),
            playerChips: this.playerChips,
            currentBet: this.currentBet,
            gameState: this.gameState,
            result: this.result,
            canDouble: this.canDouble()
        };
    }
}

// Export
if (typeof window !== 'undefined') {
    window.BlackjackGame = BlackjackGame;
}
