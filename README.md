# 🃏 Texas Hold'em Poker

A fully functional Texas Hold'em poker game that runs entirely in the browser. Play against AI bots with adjustable difficulty levels!

## 🎮 Features

- **Texas Hold'em Rules**: Complete implementation of Texas Hold'em poker rules
- **Bot Opponents**: Play against 1-5 AI opponents
- **Difficulty Levels**:
  - **Easy**: Random play, perfect for beginners
  - **Medium**: Uses basic strategy and pot odds
  - **Hard**: Advanced AI with position awareness and bluffing
- **Customizable Bankroll**: Choose from $500 to $10,000 starting chips
- **Responsive Design**: Works on desktop and mobile devices
- **No Server Required**: Runs entirely in the browser - perfect for GitHub Pages

## 🚀 Play Now

Visit the live game at: [https://tarushvkodes.github.io/onlinepoker/](https://tarushvkodes.github.io/onlinepoker/)

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
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Styling
├── js/
│   ├── cards.js        # Card deck and dealing
│   ├── hand-evaluator.js # Hand ranking logic
│   ├── bot-ai.js       # AI opponent logic
│   ├── poker-engine.js # Game rules engine
│   ├── game.js         # Main game controller
│   └── ui.js           # UI interactions
└── README.md
```

## 📜 License

MIT License - Fork and modify freely!

