/**
 * Card Deck and Dealing Logic for Texas Hold'em
 */

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

const SUIT_SYMBOLS = {
    'hearts': '♥',
    'diamonds': '♦',
    'clubs': '♣',
    'spades': '♠'
};

/**
 * Creates a standard 52-card deck
 * @returns {Array} Array of card objects
 */
function createDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({
                suit: suit,
                rank: rank,
                value: RANK_VALUES[rank],
                symbol: SUIT_SYMBOLS[suit],
                isRed: suit === 'hearts' || suit === 'diamonds'
            });
        }
    }
    return deck;
}

/**
 * Shuffles a deck using Fisher-Yates algorithm
 * @param {Array} deck - The deck to shuffle
 * @returns {Array} Shuffled deck
 */
function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Deals cards from the deck
 * @param {Array} deck - The deck to deal from
 * @param {number} count - Number of cards to deal
 * @returns {Object} Object containing dealt cards and remaining deck
 */
function dealCards(deck, count) {
    return {
        dealt: deck.slice(0, count),
        remaining: deck.slice(count)
    };
}

/**
 * Gets a display string for a card
 * @param {Object} card - The card object
 * @returns {string} Display string like "A♠"
 */
function cardToString(card) {
    return `${card.rank}${card.symbol}`;
}

/**
 * Deck class for card games
 */
class Deck {
    constructor() {
        this.cards = createDeck();
    }

    /**
     * Shuffle the deck
     */
    shuffle() {
        this.cards = shuffleDeck(this.cards);
    }

    /**
     * Deal a single card from the deck
     * @returns {Object} The dealt card
     */
    deal() {
        if (this.cards.length === 0) {
            return null;
        }
        return this.cards.shift();
    }

    /**
     * Deal multiple cards from the deck
     * @param {number} count - Number of cards to deal
     * @returns {Array} Array of dealt cards
     */
    dealMultiple(count) {
        const dealt = [];
        for (let i = 0; i < count && this.cards.length > 0; i++) {
            dealt.push(this.deal());
        }
        return dealt;
    }

    /**
     * Get remaining cards count
     * @returns {number} Number of cards left
     */
    get length() {
        return this.cards.length;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Cards = {
        SUITS,
        RANKS,
        RANK_VALUES,
        SUIT_SYMBOLS,
        createDeck,
        shuffleDeck,
        dealCards,
        cardToString
    };
    window.Deck = Deck;
}
