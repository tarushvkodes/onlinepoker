/**
 * Texas Hold'em Hand Evaluator
 * Evaluates the best 5-card hand from 7 cards (2 hole + 5 community)
 */

const HAND_RANKINGS = {
    HIGH_CARD: 1,
    ONE_PAIR: 2,
    TWO_PAIR: 3,
    THREE_OF_A_KIND: 4,
    STRAIGHT: 5,
    FLUSH: 6,
    FULL_HOUSE: 7,
    FOUR_OF_A_KIND: 8,
    STRAIGHT_FLUSH: 9,
    ROYAL_FLUSH: 10
};

const HAND_NAMES = {
    1: 'High Card',
    2: 'One Pair',
    3: 'Two Pair',
    4: 'Three of a Kind',
    5: 'Straight',
    6: 'Flush',
    7: 'Full House',
    8: 'Four of a Kind',
    9: 'Straight Flush',
    10: 'Royal Flush'
};

/**
 * Gets all 5-card combinations from 7 cards
 * @param {Array} cards - Array of 7 cards
 * @returns {Array} Array of all possible 5-card combinations
 */
function getCombinations(cards) {
    const combinations = [];
    const n = cards.length;
    
    for (let i = 0; i < n - 4; i++) {
        for (let j = i + 1; j < n - 3; j++) {
            for (let k = j + 1; k < n - 2; k++) {
                for (let l = k + 1; l < n - 1; l++) {
                    for (let m = l + 1; m < n; m++) {
                        combinations.push([cards[i], cards[j], cards[k], cards[l], cards[m]]);
                    }
                }
            }
        }
    }
    
    return combinations;
}

/**
 * Groups cards by rank
 * @param {Array} cards - Array of cards
 * @returns {Object} Object with ranks as keys and arrays of cards as values
 */
function groupByRank(cards) {
    const groups = {};
    for (const card of cards) {
        if (!groups[card.value]) {
            groups[card.value] = [];
        }
        groups[card.value].push(card);
    }
    return groups;
}

/**
 * Groups cards by suit
 * @param {Array} cards - Array of cards
 * @returns {Object} Object with suits as keys and arrays of cards as values
 */
function groupBySuit(cards) {
    const groups = {};
    for (const card of cards) {
        if (!groups[card.suit]) {
            groups[card.suit] = [];
        }
        groups[card.suit].push(card);
    }
    return groups;
}

/**
 * Checks if cards form a flush
 * @param {Array} cards - 5 cards to check
 * @returns {boolean} True if flush
 */
function isFlush(cards) {
    return cards.every(card => card.suit === cards[0].suit);
}

/**
 * Checks if cards form a straight
 * @param {Array} cards - 5 cards to check (should be sorted by value descending)
 * @returns {boolean} True if straight
 */
function isStraight(cards) {
    const sorted = [...cards].sort((a, b) => b.value - a.value);
    
    // Check for wheel (A-2-3-4-5)
    if (sorted[0].value === 14 && sorted[1].value === 5 && 
        sorted[2].value === 4 && sorted[3].value === 3 && sorted[4].value === 2) {
        return true;
    }
    
    // Check for regular straight
    for (let i = 0; i < 4; i++) {
        if (sorted[i].value - sorted[i + 1].value !== 1) {
            return false;
        }
    }
    return true;
}

/**
 * Evaluates a single 5-card hand
 * @param {Array} cards - 5 cards to evaluate
 * @returns {Object} Hand evaluation with rank, name, and kickers
 */
function evaluate5CardHand(cards) {
    const sorted = [...cards].sort((a, b) => b.value - a.value);
    const rankGroups = groupByRank(cards);
    const groupSizes = Object.values(rankGroups).map(g => g.length).sort((a, b) => b - a);
    
    const flush = isFlush(cards);
    const straight = isStraight(cards);
    
    // Get values for kicker comparison
    const values = sorted.map(c => c.value);
    
    // Royal Flush
    if (flush && straight && sorted[0].value === 14 && sorted[4].value === 10) {
        return { rank: HAND_RANKINGS.ROYAL_FLUSH, name: HAND_NAMES[10], kickers: values };
    }
    
    // Straight Flush
    if (flush && straight) {
        return { rank: HAND_RANKINGS.STRAIGHT_FLUSH, name: HAND_NAMES[9], kickers: values };
    }
    
    // Four of a Kind
    if (groupSizes[0] === 4) {
        const quadValue = parseInt(Object.keys(rankGroups).find(k => rankGroups[k].length === 4));
        const kicker = values.find(v => v !== quadValue);
        return { rank: HAND_RANKINGS.FOUR_OF_A_KIND, name: HAND_NAMES[8], kickers: [quadValue, kicker] };
    }
    
    // Full House
    if (groupSizes[0] === 3 && groupSizes[1] === 2) {
        const tripValue = parseInt(Object.keys(rankGroups).find(k => rankGroups[k].length === 3));
        const pairValue = parseInt(Object.keys(rankGroups).find(k => rankGroups[k].length === 2));
        return { rank: HAND_RANKINGS.FULL_HOUSE, name: HAND_NAMES[7], kickers: [tripValue, pairValue] };
    }
    
    // Flush
    if (flush) {
        return { rank: HAND_RANKINGS.FLUSH, name: HAND_NAMES[6], kickers: values };
    }
    
    // Straight
    if (straight) {
        // Handle wheel - Ace is low, only high card matters for comparison
        if (sorted[0].value === 14 && sorted[1].value === 5) {
            return { rank: HAND_RANKINGS.STRAIGHT, name: HAND_NAMES[5], kickers: [5] };
        }
        // For regular straights, only the high card matters
        return { rank: HAND_RANKINGS.STRAIGHT, name: HAND_NAMES[5], kickers: [values[0]] };
    }
    
    // Three of a Kind
    if (groupSizes[0] === 3) {
        const tripValue = parseInt(Object.keys(rankGroups).find(k => rankGroups[k].length === 3));
        const kickers = values.filter(v => v !== tripValue).slice(0, 2);
        return { rank: HAND_RANKINGS.THREE_OF_A_KIND, name: HAND_NAMES[4], kickers: [tripValue, ...kickers] };
    }
    
    // Two Pair
    if (groupSizes[0] === 2 && groupSizes[1] === 2) {
        const pairValues = Object.keys(rankGroups)
            .filter(k => rankGroups[k].length === 2)
            .map(k => parseInt(k))
            .sort((a, b) => b - a);
        const kicker = values.find(v => !pairValues.includes(v));
        return { rank: HAND_RANKINGS.TWO_PAIR, name: HAND_NAMES[3], kickers: [...pairValues, kicker] };
    }
    
    // One Pair
    if (groupSizes[0] === 2) {
        const pairValue = parseInt(Object.keys(rankGroups).find(k => rankGroups[k].length === 2));
        const kickers = values.filter(v => v !== pairValue).slice(0, 3);
        return { rank: HAND_RANKINGS.ONE_PAIR, name: HAND_NAMES[2], kickers: [pairValue, ...kickers] };
    }
    
    // High Card
    return { rank: HAND_RANKINGS.HIGH_CARD, name: HAND_NAMES[1], kickers: values };
}

/**
 * Evaluates the best hand from hole cards and community cards
 * @param {Array} holeCards - Player's 2 hole cards
 * @param {Array} communityCards - Up to 5 community cards
 * @returns {Object} Best hand evaluation
 */
function evaluateBestHand(holeCards, communityCards) {
    const allCards = [...holeCards, ...communityCards];
    
    if (allCards.length < 5) {
        return null;
    }
    
    if (allCards.length === 5) {
        return evaluate5CardHand(allCards);
    }
    
    const combinations = getCombinations(allCards);
    let bestHand = null;
    
    for (const combo of combinations) {
        const evaluation = evaluate5CardHand(combo);
        if (!bestHand || compareHands(evaluation, bestHand) > 0) {
            bestHand = evaluation;
        }
    }
    
    return bestHand;
}

/**
 * Compares two hand evaluations
 * @param {Object} hand1 - First hand evaluation
 * @param {Object} hand2 - Second hand evaluation
 * @returns {number} Positive if hand1 wins, negative if hand2 wins, 0 if tie
 */
function compareHands(hand1, hand2) {
    if (hand1.rank !== hand2.rank) {
        return hand1.rank - hand2.rank;
    }
    
    // Compare kickers
    for (let i = 0; i < Math.min(hand1.kickers.length, hand2.kickers.length); i++) {
        if (hand1.kickers[i] !== hand2.kickers[i]) {
            return hand1.kickers[i] - hand2.kickers[i];
        }
    }
    
    return 0;
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.HandEvaluator = {
        HAND_RANKINGS,
        HAND_NAMES,
        evaluateBestHand,
        compareHands,
        evaluate5CardHand
    };
}
