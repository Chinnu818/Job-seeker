# JobNet - Professional Networking & Job Portal

A comprehensive full-stack job networking platform with AI-powered matching, Web3 integration, and blockchain payments.

## 🚀 Features

### Core Features
- **User Profiles & Networking**: Complete professional profiles with social networking
- **Job Listings**: Advanced job posting and application system
- **AI-Powered Matching**: NLP-based skill parsing and intelligent job recommendations
- **Social Feed**: Professional networking feed with posts and interactions
- **Real-time Updates**: Live notifications and updates

### Web3 & Blockchain
- **Polygon Integration**: Ethereum-compatible payments and smart contracts
- **Solana Integration**: High-performance blockchain with Phantom wallet support
- **Smart Contracts**: Automated job payments and escrow services
- **Wallet Connection**: Secure wallet integration for payments

### AI/ML Features
- **Skill Extraction**: NLP-based skill parsing from resumes and profiles
- **Job Matching**: Intelligent matching algorithms
- **Similarity Analysis**: Advanced similarity matching for jobs and candidates
- **Recommendations**: Personalized job and connection recommendations

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **React Query** for data fetching

### Backend
- **Node.js** with Express.js
- **MongoDB** for database
- **JWT** for authentication
- **Socket.io** for real-time features
- **Multer** for file uploads

### Blockchain
- **Polygon** for Ethereum-compatible payments
- **Solana** for high-performance transactions
- **Phantom Wallet** integration
- **Smart Contracts** in Rust (Solana) and Solidity (Polygon)

### AI/ML
- **OpenAI GPT** for advanced NLP
- **Natural** for text processing
- **Compromise** for skill extraction
- **String Similarity** for matching algorithms

## 📁 Project Structure

```
job-networking-portal/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js + Express backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── middleware/         # Express middleware
│   └── server.js
├── blockchain/             # Blockchain contracts
│   └── solana-job-program/ # Solana program in Rust
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB
- Rust (for Solana development)
- Phantom Wallet extension

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd job-networking-portal
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install

# Install Solana program dependencies
cd ../blockchain/solana-job-program && cargo build
```

3. **Environment Setup**

Create `.env` files in the backend directory:
```bash
# Backend .env
MONGODB_URI=mongodb://localhost:27017/job-portal
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-api-key
POLYGON_RPC_URL=https://polygon-rpc.com
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
FRONTEND_URL=http://localhost:3000
```

Create `.env` files in the frontend directory:
```bash
# Frontend .env
VITE_API_URL=http://localhost:5000/api
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

4. **Start the development servers**
```bash
# Start both frontend and backend
npm run dev

# Or start them separately
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:5000
```

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm start           # Start production server
npm test            # Run tests
```

### Solana Program Development
```bash
cd blockchain/solana-job-program
cargo build         # Build the program
cargo test          # Run tests
anchor build        # Build with Anchor (if using Anchor)
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Job Endpoints
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `POST /api/jobs/:id/apply` - Apply for job

### User Endpoints
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/connect` - Send connection request
- `PUT /api/users/:id/connect` - Accept/reject connection

### AI Endpoints
- `POST /api/ai/extract-skills` - Extract skills from text
- `POST /api/ai/match-job` - Match job with candidate
- `POST /api/ai/recommendations` - Get job recommendations

### Blockchain Endpoints
- `POST /api/blockchain/connect-wallet` - Connect wallet
- `POST /api/blockchain/verify-wallet` - Verify wallet ownership
- `POST /api/blockchain/process-payment` - Process blockchain payment

## 🔐 Environment Variables

### Backend (.env)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/job-portal

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# AI Services
OPENAI_API_KEY=your-openai-api-key

# Blockchain
POLYGON_RPC_URL=https://polygon-rpc.com
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
POLYGON_JOB_CONTRACT_ADDRESS=your-contract-address
SOLANA_JOB_PROGRAM_ID=your-program-id

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_POLYGON_RPC_URL=https://polygon-rpc.com
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
```

### Backend Tests
```bash
cd backend
npm test
```

### Solana Program Tests
```bash
cd blockchain/solana-job-program
cargo test
```

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the dist folder to your hosting service
```

### Backend Deployment
```bash
cd backend
npm start
# Use PM2 or similar for production
```

### Database Setup
```bash
# Install MongoDB
# Create database and collections
# Set up indexes for performance
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@jobnet.com or join our Discord server.

## 🙏 Acknowledgments

- OpenAI for AI/ML capabilities
- Solana Foundation for blockchain infrastructure
- Polygon for Ethereum scaling
- Phantom for wallet integration
- MongoDB for database
- Vite for fast development experience

---

**Built with ❤️ using modern web technologies** 