# Under Pressure: The People Management Simulation

A premium business simulation game for leadership development and manager training.

## Quick Start

### Option 1: Run Locally (Development)
```bash
npm install
npm run dev
```
Then open http://localhost:5173 in your browser.

### Option 2: Build for Production
```bash
npm install
npm run build
```
The built files will be in the `dist` folder - deploy these to any static hosting.

### Option 3: Deploy to Vercel/Netlify
Simply connect this folder to Vercel or Netlify and it will auto-detect Vite and deploy.

## Features

### Core Gameplay
- **7 Competing Metrics**: Trust, Engagement, Performance, Retention, Fairness, Credibility, Emotional Load
- **5 Team Members**: Each with unique personalities, drivers, and sensitivities
- **50+ Random Events**: Different experience every playthrough
- **4 Quarters**: Escalating complexity
- **Trend Charts**: Track your leadership journey
- **Leadership Profile**: Discover what kind of manager you are

### Audio & Visual Feedback
- **Sound Effects**: Web Audio API synthesized sounds for interactions
  - Select option: soft click
  - Confirm decision: rising tone
  - Slider adjustment: subtle tick
  - Positive outcome: ascending chime
  - Negative outcome: descending tone
- **Metric Change Notifications**: Animated tiles show which metrics changed after each decision
- **Staggered Observation Animations**: Observations slide in one-by-one with sound

### Responsive Design
- **Mobile Touch Scrolling**: Full touch support on iOS and Android
- **Mobile Tutorial**: Full-screen card-based tutorial on mobile (< 768px)
- **Desktop Tutorial**: Positioned tooltips with spotlight effect on desktop

## Tech Stack

- React 18
- Vite
- Recharts (for charts)
- Web Audio API (for sound effects)
- Poppins font (Google Fonts)

## Design System

Premium dark theme with vibrant accents:
- Primary: #BB29BB (Purple)
- Secondary: #2CD5C4 (Teal)
- Accent: #05C3DE (Blue), #F7EA48 (Yellow)
- Dark: #000000, #0f0f1a, #1a1a2e
