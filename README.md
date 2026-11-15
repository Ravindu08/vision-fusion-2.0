# Vision Fusion 2.0 – Tech Career Week
### Gamified Event Participation & Student Engagement Platform

Organized jointly by:
- **IEEE Industry Applications Society (IAS) Student Branch Chapter of Uva Wellassa University (UWU)**
- **IEEE Women in Engineering (WIE) Student Branch Affinity Group of Uva Wellassa University (UWU)**

---

## 🌟 Platform Highlights
- **Autonomous Event Self-Participation (30% XP Budget):** Students self-declare participation during active sessions with ACID transaction integrity (+60 XP per session). No manual paperwork or QR codes.
- **Adaptive Technical Quizzes (70% XP Budget):** Dynamic anti-cheat quiz player with server-side validation.
- **Dynamic Character Evolution System:** 5 Official Character Stages (The Recruit $\rightarrow$ The Builder $\rightarrow$ The Pathfinder $\rightarrow$ The Intelligence Operative $\rightarrow$ The Vanguard) across 25 official pose assets with level-up celebration modal and live progression roadmap.
- **Automated Digital Certificate Engine:** Cryptographically verified IEEE PDF Certificate generated on-the-fly with ReportLab vector graphics once a student crosses $\ge 35\%$ of total event XP (350+ XP).
- **Live Operative Leaderboard:** Top 3 podium, tier filtering, and privacy-preserving rankings.

---

## 🛠️ Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS (Cyberpunk Theme: `#07090e`, Cyan `#00f0ff`, Purple `#a855f7`), Lucide Icons, Canvas Confetti.
- **Backend:** Python 3.14 / 3.11+, FastAPI, SQLAlchemy 2.0, Pydantic v2, PostgreSQL (psycopg3), ReportLab (Vector PDF generator), bcrypt, Pytest.
- **Security:** Stateless JWT authentication (24h validity), 72-byte bcrypt password hashing, input sanitization.

---

## 🚀 Quickstart for Team Members

### ⚡ 1-Click Launch (Windows — Recommended)
Simply double-click:
```bash
start_servers.bat
```
*(If it's your first time running, it will automatically run `setup.bat` to create the Python virtual environment, install dependencies, create the `.env` file, install frontend npm packages, and launch both backend and frontend servers).*

---

### 1. Prerequisites (If setting up manually)
- **Node.js** (v18+) & **npm**
- **Python** (3.11+)
- **PostgreSQL** (14+) running locally on port 5432 (Database: `vision_fusion`).  
  *(Note: If PostgreSQL is not installed or unreachable, the system automatically falls back to local SQLite with zero errors!)*

---

### 2. Backend Setup (Manual / Linux / Mac)
```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment
# On Windows:
python -m venv venv
venv\Scripts\activate

# On Mac/Linux:
# python3 -m venv venv
# source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt

# Copy environment variables (if .env does not exist)
cp .env.example .env
# Edit .env to set your PostgreSQL credentials if different from default (postgres:123456)
# If you don't have Postgres, it will seamlessly fall back to SQLite!

# Run FastAPI backend server
python -m uvicorn app.main:app --reload --port 8000
```
- **Auto Database Initialization:** The backend automatically creates all database tables, pre-seeds the Admin user (`admin@visionfusion.ieee.lk`), 5 benchmark IT sessions, and 50 MCQs across all 5 quizzes on startup!
- **Interactive Swagger Docs:** `http://localhost:8000/api/v1/docs`
- **Health Check:** `http://localhost:8000/health`

---

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```
- **Web Application:** `http://localhost:5173`

---

### 4. Running Backend Tests
```bash
cd backend
venv\Scripts\python.exe -m pytest -v
```
*(All 17 automated tests run with auto-cleanup fixture to keep database pristine).*

---

## 🔑 Demo Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@visionfusion.ieee.lk` | `Admin@VF2026!` | Pre-seeded with 1000 XP & Vanguard status |
| **Active Student** | `tharushagimhan01@gmail.com` | `Password123!` | Active student on Leaderboard Rank #1 |
| **New Student** | *(Self-register on `/register`)* | *(Any 6+ char pw)* | Starts at The Recruit with 0 XP |

---

## 📅 Official IT Events Schedule (December 10 - 14, 2026)
1. **ITERA - Mock Interview Drive** (Physical | 2026-12-10 | Main Auditorium & Career Labs)
2. **TechCareerX - Software Commercialization and Standards** (Online | 2026-12-11 | Google Meet)
3. **Futurista - Future of IT** (Online | 2026-12-12 | Google Meet)
4. **BugHunt - AI for University Life and Industry** (Physical | 2026-12-13 | Computer Center / Main Lab)
5. **Road to Role - IT Career Pathway Discussions** (Physical | 2026-12-14 | Faculty Complex Hall A)

---

## 📖 Complete Project Setup Log & Changelog
For the complete step-by-step history, errors encountered, and resolutions documented in Sinhala, refer to [`SETUP_GUIDE.md`](./SETUP_GUIDE.md).
