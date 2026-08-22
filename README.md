# GlobeTrotter

GlobeTrotter is a personalized multi-city travel planning application that helps users manage their itineraries, expenses, and trips across different cities seamlessly.

## 🚀 Tech Stack

### Frontend
- **React 18** with **Vite**
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **FastAPI** for high-performance API endpoints
- **SQLAlchemy** for ORM
- **SQLite / PostgreSQL** for database
- **Pydantic v2** for data validation
- **JWT Authentication** for secure user sessions

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (for frontend)
- [Python 3.10+](https://www.python.org/) (for backend)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   python -m pip install -r requirements.txt
   ```
3. Seed the database with demo data (cities, activities, demo users, trips):
   ```bash
   python seed.py
   ```
   *Demo User:*
   - **Email:** `demo@globetrotter.com`
   - **Password:** `password123`
4. Start the backend server:
   ```bash
   python run.py
   # OR
   uvicorn app.main:app --reload --port 8000
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

---

## 📂 Project Structure

- `/client` - React frontend source code, components, and pages.
- `/server` - FastAPI backend source code, database models, and endpoints.
