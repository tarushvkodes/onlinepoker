# 🃏 Online Poker Games

A collection of poker games that run entirely in the browser!

## 🎮 Games Available

### Texas Hold'em Poker
A fully functional Texas Hold'em poker game. Play against AI bots with adjustable difficulty levels!

- **Bot Opponents**: Play against 1-5 AI opponents
- **Difficulty Levels**: Easy, Medium, and Hard AI
- **Customizable Bankroll**: Choose from $500 to $10,000 starting chips

### Balatro - Roguelike Poker
A roguelike deck-building poker game inspired by Balatro! Play poker hands to score points and beat the blinds.

- **Score-based Gameplay**: Play poker hands to earn points
- **Blinds System**: Beat Small, Big, and Boss blinds to advance
- **Strategic Choices**: Manage your hands and discards wisely
- **Progressive Difficulty**: Ante increases as you progress

## 🚀 Play Now

- **Texas Hold'em**: [https://tarushvkodes.github.io/onlinepoker/](https://tarushvkodes.github.io/onlinepoker/)
- **Balatro**: [https://tarushvkodes.github.io/onlinepoker/balatro.html](https://tarushvkodes.github.io/onlinepoker/balatro.html)

## 🎲 How to Play

1. Enter your name (optional)
2. Select bot difficulty
3. Choose your starting bankroll
4. Select number of opponents (1-5)
5. Click "Start Game"

### Controls

- **Fold**: Discard your hand and forfeit the current pot
- **Check/Call**: Match the current bet or check if no bet is required
- **Raise**: Increase the bet amount using the slider
- **All-In**: Bet all your remaining chips

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
├── index.html          # Texas Hold'em game
├── balatro.html        # Balatro roguelike poker
├── css/
│   ├── styles.css      # Texas Hold'em styling
│   └── balatro.css     # Balatro styling
├── js/
│   ├── cards.js        # Card deck and dealing
│   ├── hand-evaluator.js # Hand ranking logic
│   ├── bot-ai.js       # AI opponent logic
│   ├── poker-engine.js # Game rules engine
│   ├── game.js         # Main game controller
│   ├── ui.js           # UI interactions
│   ├── balatro-game.js # Balatro game engine
│   └── balatro-ui.js   # Balatro UI controller
└── README.md
```

## 📜 License

MIT License - Fork and modify freely!

