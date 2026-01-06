# 🃏 Online Card Games

A collection of card games that run entirely in the browser! Navigate between games using the arrow buttons on the sides of the screen.

## 🎮 Games Available

### 🎰 Texas Hold'em Poker
A fully functional Texas Hold'em poker game. Play against AI bots with adjustable difficulty levels!

- **Bot Opponents**: Play against 1-5 AI opponents
- **Difficulty Levels**: Easy, Medium, and Hard AI
- **Customizable Bankroll**: Choose from $500 to $10,000 starting chips

### 🃏 Blackjack
Classic casino blackjack! Beat the dealer by getting as close to 21 as possible without going over.

- **Full Blackjack Rules**: Hit, Stand, and Double Down
- **3:2 Blackjack Payout**: Get 21 with two cards for bonus winnings
- **Chip Betting System**: Place bets before each hand

### 🎲 Balatro - Roguelike Poker
A roguelike deck-building poker game inspired by Balatro! Play poker hands to score points and beat the blinds.

- **Score-based Gameplay**: Play poker hands to earn points
- **Blinds System**: Beat Small, Big, and Boss blinds to advance
- **Strategic Choices**: Manage your hands and discards wisely
- **Progressive Difficulty**: Ante increases as you progress

## 🚀 Play Now

- **Texas Hold'em**: [https://tarushvkodes.github.io/onlinepoker/](https://tarushvkodes.github.io/onlinepoker/)
- **Blackjack**: [https://tarushvkodes.github.io/onlinepoker/blackjack.html](https://tarushvkodes.github.io/onlinepoker/blackjack.html)
- **Balatro**: [https://tarushvkodes.github.io/onlinepoker/balatro.html](https://tarushvkodes.github.io/onlinepoker/balatro.html)

## 🧭 Navigation

Use the **left and right arrow buttons** on either side of the screen to switch between games. You can also use the **navigation dots** at the bottom of the screen.

## 🛠️ Local Development

Simply open `index.html` in a web browser, or serve the files with any static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

Then visit `http://localhost:8000`

## 📁 Project Structure

```
├── index.html          # Texas Hold'em poker
├── blackjack.html      # Blackjack game
├── balatro.html        # Balatro roguelike poker
├── css/
│   ├── styles.css      # Texas Hold'em styling
│   ├── blackjack.css   # Blackjack styling
│   ├── balatro.css     # Balatro styling
│   └── navigation.css  # Shared navigation styles
├── js/
│   ├── cards.js        # Card deck and dealing
│   ├── hand-evaluator.js # Hand ranking logic
│   ├── bot-ai.js       # Poker AI opponent logic
│   ├── poker-engine.js # Poker game rules engine
│   ├── game.js         # Poker game controller
│   ├── ui.js           # Poker UI interactions
│   ├── blackjack-game.js # Blackjack game engine
│   ├── blackjack-ui.js   # Blackjack UI controller
│   ├── balatro-game.js   # Balatro game engine
│   └── balatro-ui.js     # Balatro UI controller
└── README.md
```

## 📜 License

MIT License - Fork and modify freely!

