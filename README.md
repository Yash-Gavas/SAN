# DefiHub BlockChain
=======
# DeFi Platform - Decentralized Finance Application

A comprehensive DeFi platform with lending, borrowing, token swapping, and portfolio management features.

## Features
- 🏦 **Lending & Borrowing**: Earn yield on crypto assets or borrow against collateral
- 🔄 **Token Swapping**: Exchange cryptocurrencies with optimal rates
- 📊 **Portfolio Management**: Track your DeFi positions and performance
- 👨‍💼 **Admin Dashboard**: Monitor platform activity and user transactions
- 🔒 **Liquidation Engine**: Automated protection against undercollateralized positions
- 📱 **Social Sharing**: Share investment achievements with privacy controls
- 💰 **Real-time Prices**: Live cryptocurrency price feeds

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Git installed
- VS Code (recommended)

### Installation

1. **Clone or download this project**
   ```bash
   git clone <your-repo-url>
   cd defi-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

4. **Access the platform**
   - Frontend: http://localhost:5000
   - Admin login: username `admin`, password `admin@123`

### Default Admin Account
- **Username**: `admin`
- **Password**: `admin@123`

### User Registration
You can register new user accounts through the application interface.

## Development

### Project Structure
```
defi-platform/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── contracts/       # Smart contract files
└── package.json     # Dependencies and scripts
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables
The `.env` file contains configuration for the application. No changes needed for local development.

## Technology Stack
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (with in-memory fallback)
- **Authentication**: Passport.js
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS with shadcn/ui components

## Troubleshooting

### Port Already in Use
If port 5000 is busy, the app will automatically find another available port.

### Database Connection
The app uses in-memory storage by default. For persistent data, update the `DATABASE_URL` in `.env` with your PostgreSQL connection string.

### API Keys
For real cryptocurrency price data, add your API keys to the `.env` file:
- `COINBASE_API_KEY`
- `PYTH_API_KEY` 
- `BINANCE_API_KEY`


