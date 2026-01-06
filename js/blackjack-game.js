/**
 * Blackjack Game Controller
 * Manages game state and logic for Blackjack
 */

class BlackjackGame {
    constructor() {
        this.deck = null;
        this.playerName = 'Player';
        this.playerChips = 1000;
        this.minBet = 25;
        this.currentBet = 0;
        this.playerHand = [];
        this.dealerHand = [];
        this.isGameActive = false;
        this.roundInProgress = false;
        this.ui = null;
        this.dealerHiddenCard = null;
    }

    /**
     * Initialize the game with settings
     */
    init(settings) {
        this.playerName = settings.playerName || 'Player';
        this.playerChips = settings.bankroll || 1000;
        this.minBet = settings.minBet || 25;
        this.isGameActive = true;
        this.currentBet = 0;
        this.roundInProgress = false;
        
        // Create a new deck
        this.deck = new window.Deck();
        this.deck.shuffle();
    }

    /**
     * Place a bet and start a new round
     */
    placeBet(amount) {
        if (!this.isGameActive) return false;
        if (amount < this.minBet) {
            this.ui.log(`Minimum bet is $${this.minBet}`);
            return false;
        }
        if (amount > this.playerChips) {
            this.ui.log('Insufficient chips!');
            return false;
        }

        this.currentBet = amount;
        this.playerChips -= amount;
        this.roundInProgress = true;
        
        // Start new round
        this.startRound();
        return true;
    }

    /**
     * Start a new round
     */
    startRound() {
        // Reset hands
        this.playerHand = [];
        this.dealerHand = [];
        this.dealerHiddenCard = null;

        // Check if deck needs reshuffling
        if (this.deck.cards.length < 20) {
            this.deck = new window.Deck();
            this.deck.shuffle();
            this.ui.log('Deck reshuffled');
        }

        // Deal initial cards
        this.playerHand.push(this.deck.deal());
        this.dealerHand.push(this.deck.deal());
        this.playerHand.push(this.deck.deal());
        
        // Dealer's second card is face down
        this.dealerHiddenCard = this.deck.deal();
        this.dealerHand.push(this.dealerHiddenCard);

        this.ui.log(`Bet placed: $${this.currentBet}`);
        this.ui.updateGameState();

        // Check for blackjack
        if (this.getHandValue(this.playerHand) === 21) {
            this.handleBlackjack();
        }
    }

    /**
     * Player hits (takes another card)
     */
    hit() {
        if (!this.roundInProgress) return;

        const card = this.deck.deal();
        this.playerHand.push(card);
        this.ui.log(`You drew ${this.formatCard(card)}`);
        this.ui.updateGameState();

        const playerValue = this.getHandValue(this.playerHand);
        if (playerValue > 21) {
            this.handleBust();
        }
    }

    /**
     * Player stands (ends their turn)
     */
    stand() {
        if (!this.roundInProgress) return;

        this.ui.log('You stand');
        this.dealerPlay();
    }

    /**
     * Player doubles down
     */
    doubleDown() {
        if (!this.roundInProgress) return;
        if (this.playerHand.length !== 2) return; // Can only double on first two cards
        if (this.currentBet > this.playerChips) {
            this.ui.log('Insufficient chips to double down!');
            return;
        }

        this.playerChips -= this.currentBet;
        this.currentBet *= 2;
        this.ui.log(`Doubled down! New bet: $${this.currentBet}`);
        
        // Hit once then stand
        const card = this.deck.deal();
        this.playerHand.push(card);
        this.ui.log(`You drew ${this.formatCard(card)}`);
        this.ui.updateGameState();

        const playerValue = this.getHandValue(this.playerHand);
        if (playerValue > 21) {
            this.handleBust();
        } else {
            this.dealerPlay();
        }
    }

    /**
     * Dealer plays according to standard rules (hit on 16 or less, stand on 17+)
     */
    dealerPlay() {
        this.ui.revealDealerCard();
        this.ui.updateGameState();
        
        const self = this;
        function dealerTurn() {
            const dealerValue = self.getHandValue(self.dealerHand);
            
            if (dealerValue < 17) {
                setTimeout(() => {
                    const card = self.deck.deal();
                    self.dealerHand.push(card);
                    self.ui.log(`Dealer drew ${self.formatCard(card)}`);
                    self.ui.updateGameState();
                    dealerTurn();
                }, 800);
            } else {
                setTimeout(() => {
                    self.resolveRound();
                }, 800);
            }
        }

        setTimeout(() => {
            dealerTurn();
        }, 500);
    }

    /**
     * Resolve the round and determine winner
     */
    resolveRound() {
        const playerValue = this.getHandValue(this.playerHand);
        const dealerValue = this.getHandValue(this.dealerHand);

        let result = '';
        let winAmount = 0;

        if (dealerValue > 21) {
            result = 'Dealer busts! You win!';
            winAmount = this.currentBet * 2;
        } else if (playerValue > dealerValue) {
            result = 'You win!';
            winAmount = this.currentBet * 2;
        } else if (playerValue < dealerValue) {
            result = 'Dealer wins!';
            winAmount = 0;
        } else {
            result = 'Push (tie)!';
            winAmount = this.currentBet; // Return the bet
        }

        this.playerChips += winAmount;
        this.ui.log(`${result} Player: ${playerValue}, Dealer: ${dealerValue}`);
        
        if (winAmount > 0) {
            this.ui.log(`You won $${winAmount}!`);
        }

        this.roundInProgress = false;
        this.currentBet = 0;

        // Check if player is out of chips
        if (this.playerChips < this.minBet) {
            this.endGame('You ran out of chips!');
        } else {
            this.ui.showNewRoundButton();
        }
    }

    /**
     * Handle blackjack (21 on first two cards)
     */
    handleBlackjack() {
        this.ui.revealDealerCard();
        this.ui.updateGameState();
        
        const dealerValue = this.getHandValue(this.dealerHand);
        
        if (dealerValue === 21) {
            this.ui.log('Both have Blackjack! Push!');
            this.playerChips += this.currentBet;
        } else {
            this.ui.log('Blackjack! You win!');
            const winAmount = Math.floor(this.currentBet * 2.5); // 3:2 payout
            this.playerChips += winAmount;
            this.ui.log(`You won $${winAmount}!`);
        }

        this.roundInProgress = false;
        this.currentBet = 0;

        if (this.playerChips < this.minBet) {
            this.endGame('You ran out of chips!');
        } else {
            this.ui.showNewRoundButton();
        }
    }

    /**
     * Handle player bust
     */
    handleBust() {
        this.ui.log('Bust! You lose!');
        this.ui.revealDealerCard();
        this.ui.updateGameState();
        this.roundInProgress = false;
        this.currentBet = 0;

        if (this.playerChips < this.minBet) {
            this.endGame('You ran out of chips!');
        } else {
            this.ui.showNewRoundButton();
        }
    }

    /**
     * Calculate the value of a hand
     */
    getHandValue(hand) {
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
     * Format a card for display
     */
    formatCard(card) {
        const suitSymbols = {
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣',
            'spades': '♠'
        };
        return `${card.rank}${suitSymbols[card.suit]}`;
    }

    /**
     * End the game
     */
    endGame(message) {
        this.isGameActive = false;
        this.ui.showEndScreen(message);
    }
}

// Make it globally available
window.BlackjackGame = BlackjackGame;
