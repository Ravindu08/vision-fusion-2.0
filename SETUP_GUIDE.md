# Vision Fusion 2.0 – Tech Career Week
## සම්පූර්ණ Project Setup Guide සහ ක්‍රියාකාරී සටහන (Development Log)

මෙම ලේඛනය තුළ ව්‍යාපෘතිය ආරම්භයේ සිට මේ දක්වා සිදුකරන ලද සෑම පියවරක්ම, මුහුණ දුන් දෝෂ (Errors) සහ ඒවා විසඳූ ආකාරය (Fixes) සිංහලෙන් පැහැදිලිව සටහන් කර ඇත.

---

## 📅 දිනය: 2026-11-08

---

### 1. Phase 00: අවශ්‍යතා විශ්ලේෂණය සහ Architecture සැලසුම් කිරීම (Requirements & Architecture)
* **සිදුකළ දේ (What was done):**
  - **Vision Fusion 2.0 – Tech Career Week** (IEEE IAS UWU සහ IEEE WIE UWU) ව්‍යාපෘති විස්තරය සහ අවශ්‍යතා පූර්ණ ලෙස විශ්ලේෂණය කිරීම.
  - තාක්ෂණික පදනම (Tech Stack) තෝරා ගැනීම:
    - **Frontend:** React + TypeScript + Vite + Tailwind CSS + Lucide Icons
    - **Backend:** Python + FastAPI + SQLAlchemy 2.0 + Pydantic v2
    - **Database:** PostgreSQL (ACID ආරක්ෂිත Relational Database)
  - Gamification නීති සැලසුම් කිරීම:
    - Participation XP = 30% (Event Attendance)
    - Quiz & Activity XP = 70%
    - සම්පූර්ණ XP ඉලක්කය = 1,000 XP
    - Certificate ලැබීමේ අවමය = 35% (350+ XP)
    - චරිත අවස්ථා 5 (The Recruit, The Builder, The Pathfinder, The Intelligence Operative, The Vanguard) සහ එක් අවස්ථාවකට poses 5 බැගින් official asset slots 25ක්.
  - සම්පූර්ණ Architecture සැලැස්ම සහ Database ER Diagram එක පිළියෙල කිරීම.

---

### 2. Phase 01: Project Setup සහ පරිසරය සැකසීම (Project Setup & Database Initialization)
* **සිදුකළ දේ (What was done):**
  - Backend සඳහා Python virtual environment (`backend/venv`) සාදා dependencies install කිරීම.
  - Frontend සඳහා Vite React + TypeScript scaffold කිරීම සහ Tailwind CSS install කර dark cyber-gaming theme එක config කිරීම.
  - පරිගණකයේ ක්‍රියාත්මක වන Local PostgreSQL instance එකට සම්බන්ධ වී `vision_fusion` නමින් අලුත් Database එකක් නිර්මාණය කිරීම.
  - Database Models 8 සාදා tables සකස් කිරීම:
    1. `users` (පරිශීලක ගිණුම්)
    2. `sessions` (Event sessions)
    3. `attendance` (ස්වයං සහභාගීත්වය සටහන් කිරීම - Unique Constraint සහිතව)
    4. `quizzes` (ප්‍රශ්නාවලි)
    5. `questions` (ප්‍රශ්න සහ options)
    6. `quiz_attempts` (ලකුණු සහ ප්‍රතිඵල)
    7. `xp_transactions` (XP ලැබුණු ඉතිහාසය)
    8. `certificates` (ඩිජිටල් සහතිකපත්)
  - Seed Data ඇතුළත් කිරීම:
    - Default Admin ගිණුම: `admin@visionfusion.ieee.lk`
    - Benchmark Event Sessions 5ක්
    - Benchmark Quiz එකක් සහ ප්‍රශ්න 3ක්
  - චරිත 5 සහ poses 5 සඳහා SVG placeholder vector avatars 25ක් `frontend/public/assets/characters/` තුළ ජනනය කිරීම.
  - `CharacterDisplay.tsx` component එක නිර්මාණය කිරීම.

* **මුහුණ දුන් Errors සහ විසඳූ ආකාරය (Errors & Fixes):**
  1. **PostgreSQL Authentication Error:**
     - *Error:* `fe_sendauth: no password supplied`
     - *හේතුව:* Local PostgreSQL සේවාව සඳහා password අවශ්‍ය වීම.
     - *විසඳුම:* Password එක `123456` ලෙස හඳුනාගෙන, `DATABASE_URL="postgresql+psycopg://postgres:123456@localhost:5432/vision_fusion"` ලෙස `.env` ගොනුව configure කිරීම.
  2. **Bcrypt & Passlib Incompatibility Error:**
     - *Error:* `ValueError: password cannot be longer than 72 bytes` (Passlib wrap bug test එකක් නිසා crash වීම).
     - *විසඳුම:* නොගැලපෙන passlib වෙනුවට නවීන standard `bcrypt` library එක සෘජුවම භාවිතා කර `security.py` යාවත්කාලීන කිරීම.

---

### 3. Phase 02: Authentication පද්ධතිය (User Registration, Login & Role Protection)
* **සිදුකළ දේ (What was done):**
  - Backend Authentication Endpoints සකස් කිරීම:
    - `POST /api/v1/auth/register`: අලුත් ශිෂ්‍ය ගිණුම් ලියාපදිංචිය (Duplicate Email පරීක්ෂාව, Password hash කිරීම, Initial Role: STUDENT, Initial Stage: The Recruit).
    - `POST /api/v1/auth/login`: Email සහ Password මගින් JWT Token නිකුත් කිරීම.
    - `GET /api/v1/auth/me`: Login වී සිටින පරිශීලකයාගේ තොරතුරු සමඟ real-time XP සහ Character Stage ගණනය කර ලබා දීම.
  - Frontend Auth Architecture:
    - `AuthContext.tsx`: Token එක `localStorage` හි තබාගෙන User State කළමනාකරණය.
    - `api.ts`: සෑම API request එකකටම Bearer Token එක ස්වයංක්‍රීයව එක් කරන Axios interceptor.
    - `ProtectedRoute.tsx`: Login නොවී dashboard එකට ඇතුළුවීම වැළැක්වීම.
    - `LoginPage.tsx` සහ `RegisterPage.tsx` නිර්මාණය (1-Click Demo Fill පහසුකම සහිතව).
  - Pytest මගින් test 10ක් සාර්ථකව run කර තහවුරු කර ගැනීම.

* **මුහුණ දුන් Errors සහ විසඳූ ආකාරය (Errors & Fixes):**
  1. **Pydantic Email-Validator Missing:**
     - *Error:* `ImportError: email-validator is not installed`
     - *විසඳුම:* `email-validator` package එක pip මගින් install කර `requirements.txt` වෙත එක් කිරීම.
  2. **TypeScript verbatimModuleSyntax Error:**
     - *Error:* `error TS1484: 'CharacterStage' is a type and must be imported using a type-only import`
     - *විසඳුම:* Type imports සඳහා `import type { CharacterStage, ... }` ලෙස නිවැරදි කිරීම.
  3. **JSX Flag Missing in tsconfig:**
     - *Error:* `error TS17004: Cannot use JSX unless the '--jsx' flag is provided`
     - *විසඳුම:* `frontend/tsconfig.json` ගොනුව තුළ `"jsx": "react-jsx"` සක්‍රීය කිරීම.
  4. **React & Vite Plugin React Missing in Scaffold:**
     - *Error:* Vite මගින් මුලින් vanilla template එකක් scaffold වී තිබීම.
     - *විසඳුම:* `@vitejs/plugin-react`, `react`, `react-dom` නිසි ලෙස install කර `vite.config.ts` සහ `index.html` update කිරීම.

---

### 4. Phase 03: Core UI සහ Navigation (සාර්ථකව අවසන් කරන ලදී ✅)
* **සිදුකළ දේ (What was done):**
  - `Navbar.tsx`: Responsive navigation bar (Desktop links, Mobile drawer, XP pill badge, Logout).
  - `Footer.tsx`: IEEE IAS & WIE UWU විස්තර සහ නීති රීති සහිත footer එක.
  - `LandingPage.tsx`: Cyberpunk Hero banner, Character Sandbox, Gamification explainer, Spotlight sessions.
  - `EventsPage.tsx`: Session schedule (Physical සහ Online filter, Venue, Meeting link, +60 XP badge).
  - `DashboardPage.tsx`: ශිෂ්‍යයාගේ Dashboard එක (Total XP, Certificate progress, Character Avatar, Next Stage progress bar).
  - Backend Sessions API (`/api/v1/sessions`) සකස් කිරීම.
  - Frontend production build (`tsc && vite build`) සාර්ථකව compile කර zero-error තත්ත්වය තහවුරු කිරීම.
  - Backend Server (Port 8000) සහ Frontend Dev Server (Port 5173) සක්‍රීයව run කිරීම.

* **මුහුණ දුන් Errors සහ විසඳූ ආකාරය (Errors & Fixes):**
  1. **Unused Imports / TypeScript Build Warnings:**
     - *Error:* `TS6133: 'CheckCircle2', 'Users', 'Compass' is declared but never read`
     - *විසඳුම:* භාවිත නොකළ import statements අදාළ පිටු වලින් ඉවත් කර පිරිසිදු කිරීම. Build එක සාර්ථක විය.

---

### 5. Phase 04: Event Participation System - "I Participated" පද්ධතිය (සාර්ථකව අවසන් කරන ලදී ✅)
* **සිදුකළ දේ (What was done):**
  - **ශිෂ්‍ය ස්වයං සහභාගීත්වය (Self-Declaration):** කිසිදු QR code හෝ Admin manual marking එකක් නොමැතිව, සිසුන්ට Session Card එකේ ඇති **"I Participated"** button එක click කර තමන්ගේ සහභාගීත්වය සටහන් කරගැනීමේ හැකියාව ලබා දීම.
  - **Backend Endpoints:**
    - `POST /api/v1/attendance/{session_id}/declare`: සහභාගීත්වය සටහන් කිරීම, +60 XP ලබා දීම, සහ Character Evolution ගණනය කිරීම.
    - `GET /api/v1/attendance/my-records`: අදාළ ශිෂ්‍යයා සහභාගී වූ sessions ලැයිස්තුව ලබා ගැනීම.
  - **ACID Transaction සහ Duplicate Prevention:**
    - Database එකේ `attendance` table එකේ `UniqueConstraint("user_id", "session_id")` මගින් එකම session එකට දෙවරක් සහභාගීත්වය claim කිරීම වැළැක්වීම (Attempt කළහොත් `409 Conflict` error එකක් ලැබේ).
    - `xp_transactions` table එකේ සවිස්තරාත්මක XP වාර්තාවක් ලියැවීම.
    - `users.total_xp` අගය ස්වයංක්‍රීයව වැඩි වීම.
  - **Frontend UI & Interactive Features:**
    - `EventsPage.tsx` තුළ interactive button එකක් එක් කිරීම:
      - Login වී නොමැති නම්: "Log in to Claim XP" ලෙස පෙන්වීම.
      - Login වී තවම claim කර නැතිනම්: **"I Participated (+60 XP)"** button එකක් පෙන්වීම.
      - Claim කළ පසු: **"Participation Claimed (+60 XP) ✅"** ලෙස හැඩගැසීම.
      - Claim කළ සැණින් **Confetti Animation (කඩදාසි වෙඩි)** පත්තුවීම සහ Navbar XP එක auto-refresh වීම.
  - **Automated Tests:**
    - `backend/tests/test_attendance.py` හරහා Claim lifecycle එක, Duplicate rejection (409 Conflict), සහ Unauthenticated block (401) පරීක්ෂා කිරීම.
    - **Pytest 12 passed 100%**. Frontend production build 100% සාර්ථකයි.

* **මුහුණ දුන් Errors සහ විසඳූ ආකාරය (Errors & Fixes):**
  1. **TypeScript Type Syntax Error in Service:**
     - *Error:* `xp_awarded: int` ලෙස TypeScript interface එකක් තුළ වැරදීමකින් Python type එකක් යෙදීම.
     - *විසඳුම:* එය TypeScript standard `number` type එක (`xp_awarded: number`) ලෙස නිවැරදි කිරීම. Build එක සාර්ථක විය.

---

### 6. Phase 05: Quiz & Activity System - ප්‍රශ්නාවලි පද්ධතිය (සාර්ථකව අවසන් කරන ලදී ✅)
* **සිදුකළ දේ (What was done):**
  - **Dummy Questions පදනම:** දැනට AI සහ Computer Science ආශ්‍රිත Dummy Multiple-Choice ප්‍රශ්න යොදා පද්ධතියේ ක්‍රියාකාරීත්වය තහවුරු කරන ලදී. (ඉදිරියේදී Admin Panel එක හරහා හෝ Database එක හරහා ඔබට පහසුවෙන්ම සැබෑ ප්‍රශ්න ඇතුළත් කළ හැක).
  - **Anti-Cheat ආරක්ෂාව (Cheating වැළැක්වීම):**
    - ප්‍රශ්නාවලිය ලබා ගන්නා විට (`GET /api/v1/quizzes/{id}`) කිසිදු නිවැරදි පිළිතුරක් (`correct_option_index`) frontend එකට යවන්නේ නැත.
    - ලකුණු ගණනය කිරීම 100% ක් සිදුවන්නේ Backend server එක තුළ පමණි.
  - **Backend Endpoints:**
    - `GET /api/v1/quizzes`: සියලුම Quizzes ලැයිස්තුව (ශිෂ්‍යයාගේ attempt status, score සහ ලැබුණු XP සමඟ).
    - `GET /api/v1/quizzes/{id}`: ප්‍රශ්නාවලියේ ප්‍රශ්න සහ options 4 (නිවැරදි පිළිතුරු රහිතව).
    - `POST /api/v1/quizzes/{id}/submit`: ශිෂ්‍යයා තෝරාගත් පිළිතුරු Backend එකෙන් verify කර ලකුණු ලබා දීම. Pass වුවහොත් +100 XP ප්‍රදානය කර total XP සහ Character Stage එක update කිරීම.
  - **Frontend Quiz Player (`QuizzesPage.tsx`):**
    - ප්‍රශ්න එකින් එක select කිරීමේ cyber UI එක.
    - Submit කළ පසු instant ලකුණු සහ ප්‍රතිශතය පෙන්වීම.
    - Pass වූ විට Confetti animation එක සහ XP auto-update වීම.
  - **Automated Tests:**
    - `backend/tests/test_quizzes.py` මගින් Anti-cheat security එක, Perfect score XP claim එක, සහ Failing score zero-XP අවස්ථා 3ම පරික්ෂා කරන ලදී.
    - **Pytest 15 tests passed 100%**. Frontend build 100% සාර්ථකයි.

* **මුහුණ දුන් Errors සහ විසඳූ ආකාරය (Errors & Fixes):**
  1. **TypeScript Unused Import Errors:**
     - *Error:* `TS6133: 'HelpCircle', 'ShieldCheck', 'AlertCircle' is declared but never read`
     - *විසඳුම:* අදාළ unused imports ඉවත් කර පිරිසිදු කරන ලදී. Frontend build එක 0-errors සහිතව සාර්ථක විය.

---

## 📅 දිනය: 2026-11-09

### 7. Official Character Assets Integration (නිල චරිත රූප 25 සක්‍රීය කිරීම ✅)
* **සිදුකළ දේ (What was done):**
  - ඔබ විසින් ලබා දුන් **නිල Character Images 25** (Stages 5 $\times$ Poses 5) සාර්ථකව පද්ධතියට සම්බන්ධ කරන ලදී:
    1. **Stage 1: The Recruit** (`pose_1.jpg` සිට `pose_5.jpg`)
    2. **Stage 2: The Builder** (`pose_1.jpg` සිට `pose_5.jpg`)
    3. **Stage 3: The Pathfinder** (`pose_1.jpg` සිට `pose_5.jpg`)
    4. **Stage 4: The Intelligence Operative** (`pose_1.jpg` සිට `pose_5.jpg`)
    5. **Stage 5: The Vanguard** (`pose_1.jpg` සිට `pose_5.jpg`)
  - `frontend/src/config/characterAssets.ts` ගොනුව නව `.jpg` paths වලට map කර update කිරීම.
  - Landing Page සහ Dashboard Page හි `CharacterDisplay` component එක හරහා රූප සජීවීව render වන බව තහවුරු කර ගැනීම.
  - Frontend production build (`tsc && vite build`) සාර්ථකව compile විය.

* **මුහුණ දුන් Errors සහ විසඳූ ආකාරය (Errors & Fixes):**
  1. **Public vs Dist Asset Directory Mismatch:**
     - *තත්ත්වය:* රූප ගොනු `frontend/dist/assets/characters/` තුළ තැන්පත් වී තිබූ අතර, Vite dev server සහ build එකට files ලැබෙන්නේ `frontend/public/assets/characters/` ෆෝල්ඩරයෙනි (නැතහොත් build වන සෑම විටම `dist` එක overwrite වේ).
     - *විසඳුම:* සියලුම 25 `.jpg` ගොනු `frontend/public/assets/characters/` වෙත copy කර ස්ථිරව සුරක්ෂිත කරන ලදී.
  2. **File Extension Mapping (.png vs .jpg):**
     - *තත්ත්වය:* කලින් code එක `.png` බලාපොරොත්තු වූ නමුත් සැබෑ official artwork එක පැමිණියේ `.jpg` ලෙසයි.
     - *විසඳුම:* `characterAssets.ts` ගොනුවේ paths `.jpg` ලෙස යාවත්කාලීන කර HTTP 200 ලැබෙන බව verify කරන ලදී.

---

## 📅 දිනය: 2026-11-10

### 8. Phase 06: Character Level-Up Celebration Animation (චරිත පරිණාම ඇනිමේෂන් පද්ධතිය ✅)
* **සිදුකළ දේ (What was done):**
  - **Level-Up Modal (`LevelUpModal.tsx`):** ශිෂ්‍යයා නව Character Stage එකකට පරිණාමය වන විට (Level Up) මුළු Screen එකම ආවරණය කරමින් දිස්වන Futuristic Cyberpunk Celebration Modal එකක් නිර්මාණය කිරීම.
  - **Dual-Side Confetti Animation:** Screen එකේ දෙපසින් අලංකාර වර්ණවත් Confetti (කඩදාසි වෙඩි) පත්තුවන අත්දැකීමක් එක් කිරීම.
  - **Evolution Transition Display:**
    - පැරණි Stage එකේ සිට නව Stage එකට පරිණාමය වීම පෙන්වන ඊතල සටහන (උදා: *The Recruit* $\rightarrow$ *The Builder*).
    - අලුත් Stage එකට අදාළ නිල චරිත රූපය Celebrating Pose එක සහ Glow Aura එක සමඟ පෙන්වීම.
    - 35% සීමාව පසු කළ විට *"Official Digital Certificate Eligibility Unlocked"* ලාංඡනය පෙන්වීම.
  - **Global Auto-Trigger:** Events Page එකේදී හෝ Quiz Page එකේදී ශිෂ්‍යයා ලබාගන්නා XP නිසා චරිතය Level Up වූ සැණින් මෙම Animation එක ස්වයංක්‍රීයව දිස්වේ.
  - **Instant Preview Button:** Dashboard එකේ ශිෂ්‍යයාගේ Character Card එක යටතේ ඕනෑම මොහොතක මෙම Animation එක පරීක්ෂා කර බැලීමට **"Preview Level-Up Animation"** බොත්තමක් එක් කරන ලදී.

* **මුහුණ දුන් Errors සහ විසඳූ ආකාරය (Errors & Fixes):**
  1. **TypeScript Interface Property Mismatch:**
     - *Error:* `TS2339: Property 'description' does not exist on type 'StageMeta'`
     - *විසඳුම:* `StageMeta` interface එකේ ඇති `tagline` property එකට නිවැරදිව map කර TypeScript compile error එක විසඳන ලදී. Build එක සාර්ථක විය.

---

### 9. Demo Flow for Chairperson & Digital Certificate System (ප්‍රදර්ශන ඩිමෝව සහ ඩිජිටල් සහතික පද්ධතිය ✅)
* **සිදුකළ දේ (What was done):**
  - **Chairperson Demo එක සඳහා පරිපූර්ණ ගලායාම (Interactive Chairperson Demo Flow):**
    1. **පියවර 1:** ශිෂ්‍යයා Register වී හෝ Login වී `Events Page` එකට ගොස් Session එකකට **"I Participated"** click කරයි $\rightarrow$ ස්වයංක්‍රීයව **+60 XP** ලැබේ (Confetti animation සහිතව).
    2. **පියවර 2:** ශිෂ්‍යයා `Quizzes Page` එකට ගොස් විවිධ මාතෘකා යටතේ ඇති Quizzes සම්පූර්ණ කරයි $\rightarrow$ XP එකතුවී **200 XP පසු වන විට ක්ෂණිකව Level-Up Modal එක මතු වී The Builder බවට පත්වේ**.
    3. **පියවර 3:** තව Quiz එකක් කර **350 XP (35%) සීමාව පසු කරයි $\rightarrow$ The Pathfinder බවට පත්වෙමින් Official Digital Certificate එක Unlock වේ**.
    4. **පියවර 4:** `Certificate Page` (`/certificate`) එකට ගොස් **"Download Official PDF Certificate"** click කළ විට උසස් තත්ත්වයේ IEEE නිල PDF සහතිකය Download කරගත හැක.
  - **Quizzes 4ක් සහ Demo ප්‍රශ්න 12ක් ඇතුළත් කිරීම:**
    - AI & Modern Tech Foundations (+100 XP)
    - Cloud Native & DevOps Architectures (+120 XP)
    - Cybersecurity & Defensive Engineering (+130 XP)
    - IEEE & Tech Career Readiness Trivia (+150 XP)
    - *මුළු Quiz XP එකතුව: 500 XP (පහසුවෙන්ම 350+ XP සීමාව පසුකළ හැක).*
  - **Backend Certificate Engine:**
    - `POST /api/v1/certificates/claim`: Certificate ID (`VF2-2026-XXXX`) සහ SHA-256 Verification Hash ජනනය කිරීම.
    - `GET /api/v1/certificates/download`: ReportLab මගින් IEEE IAS UWU සහ IEEE WIE UWU ලාංඡන, ශිෂ්‍යයාගේ නම සහ ID සහිත නිල Landscape Vector PDF සහතිකයක් ක්ෂණිකව Render කිරීම.
  - **Frontend Certificate Portal (`CertificatePage.tsx`):**
    - 35% සීමාව පසු කළ විට Certificate Mockup එක Preview වීම.
    - 1-Click PDF Download බටන් එක.
  - **Automated Tests:**
    - `test_certificates.py` ඇතුළුව backend tests 16ම 100% Pass විය (`16 passed in 5.10s`).
    - Frontend build එක 0 errors සහිතව compile විය.

* **මුහුණ දුන් Errors සහ විසඳූ ආකාරය (Errors & Fixes):**
  1. **Unused ArrowRight Import:**
     - *Error:* `TS6133: 'ArrowRight' is declared but its value is never read in CertificatePage.tsx`
     - *විසඳුම:* අනවශ්‍ය import එක ඉවත් කරන ලදී. Build එක 100% සාර්ථක විය.
  2. **Registration Network & Validation Error Message Fix:**
     - *Error:* `Registration failed. Please check your data and retry.`
     - *හේතුව:* Server Restart එකක් නිසා Backend Server (Port 8000) එක තාවකාලිකව stop වී තිබීම සහ Pydantic validation errors (array format) නිසි ලෙස frontend එකේ parse නොවීම.
     - *විසඳුම:* Backend Server එක reload කර නැවත පණගන්වන ලදී. `RegisterPage.tsx` සහ `LoginPage.tsx` තුළ Network Error හෝ Validation Error එකේ සැබෑ හේතුව පැහැදිලිව පෙන්වන පරිදි error parser එක වැඩිදියුණු කරන ලදී. සජීවී Registration පරීක්ෂාව (HTTP 201) සාර්ථක විය.

---

### 10. Character Evolution Track & Dynamic Stance Progression (2026-11-10) (චරිත වර්ධන මාවත සහ Dynamic Stances ✅)
* **සිදුකළ දේ (What was done):**
  - **ගැටලුව:** මුල් අවධියේදී XP වැඩි වුවද ශිෂ්‍යයා තවමත් Recruit (0-199 XP) තුළම සිටින බැවින් චරිතයේ දෘශ්‍ය වෙනසක් එකවරම නොපෙනෙන බව පරිශීලකයා පෙන්වා දෙන ලදී.
  - **විසඳුම 1 - CharacterEvolutionTrack (`CharacterEvolutionTrack.tsx`):**
    - Stages 5ම (Recruit, Builder, Pathfinder, Intelligence Operative, Vanguard) පෙන්වන අන්තර්ක්‍රියාකාරී visual progression track එකක් Dashboard එකට එක් කරන ලදී.
    - සෑම Stage එකකම XP සීමාවන් (0, 200, 350, 500, 750, 1000 XP), අගුළු ඇරුණු (Unlocked) සහ අගුළු වැටුණු (Locked) තත්ත්වයන් සහ $\ge 350$ XP හිදී IEEE Official Certificate Unlock වන සන්ධිස්ථානය පැහැදිලිව දර්ශනය වේ.
  - **විසඳුම 2 - Dynamic Stances & Energy Tiers:**
    - එක් Stage එකක් තුළ XP වැඩි වන විට චරිතය එකම තැන නොසිට Energy Tiers 5ක් ඔස්සේ වෙනස් වන ලෙස සකස් කරන ලදී:
      1. Standby (0% - 20%) $\rightarrow$ `idle`
      2. Combat Ready (20% - 40%) $\rightarrow$ `active`
      3. Power Surge (40% - 60%) $\rightarrow$ `focusing`
      4. Tactical Overdrive (60% - 80%) $\rightarrow$ `triumph`
      5. Apex Victory (80% - 100%) $\rightarrow$ `ultimate`
  - **විසඳුම 3 - Interactive Stance Selector:**
    - Dashboard එකේ Character Panel එක තුළ ශිෂ්‍යයාට තමා unlock කරගත් ඕනෑම stance එකක් ක්ලික් කර පරීක්ෂා කිරීමේ සහ preview කිරීමේ හැකියාව ලබා දෙන ලදී.
  - **Frontend Production Build එක තහවුරු කිරීම:**
    - `npm run build` සාර්ථකව 0 errors සහිතව compile විය.

* **මුහුණ දුන් Errors සහ විසඳූ ආකාරය (Errors & Fixes):**
  1. **Unused Icons Import in DashboardPage:**
     - *Error:* `TS6133: 'Shield' is declared but its value is never read`, `TS6133: 'Zap' is declared but its value is never read` in `DashboardPage.tsx`
     - *විසඳුම:* DashboardPage එකෙන් භාවිත නොවන icons ඉවත් කරන ලදී. Production bundle එක (427 kB JS, 31 kB CSS) සාර්ථකව build විය.

---

### 11. Phase 07 – Live Operative Leaderboard (2026-11-12) (සජීවී ශ්‍රේණිගත කිරීම් ලැයිස්තුව ✅)
* **සිදුකළ දේ (What was done):**
  - **Backend Leaderboard Engine (`backend/app/api/v1/endpoints/leaderboard.py` & `schemas/leaderboard.py`):**
    - `GET /api/v1/leaderboard`: සක්‍රීය ශිෂ්‍යයින් (`role == "STUDENT"`, `is_active == True`) පමණක් `total_xp` අවරෝහණ පිළිවෙලට ශ්‍රේණිගත කර ලබාදීම. (Admin ගිණුම් rankings වලින් ඉවත් කර ඇත).
    - **රහස්‍යභාවය (Privacy Protection):** ශිෂ්‍යයින්ගේ පෞද්ගලික `email`, `student_id` හෝ `password_hash` කිසිවක් ප්‍රසිද්ධ API ප්‍රතිචාරයේ නොපෙන්වන ලෙස ආරක්ෂා කරන ලදී.
    - **Optional Auth (`get_optional_current_user` in `deps.py`):** Login නොවී වුවද Leaderboard එක බැලිය හැකි අතර, Login වී සිටින ශිෂ්‍යයෙකුට Search/Filter කළ විට පවා තමාගේ සැබෑ Global Rank එක `current_user_entry` හරහා පෙන්වයි.
    - **Single-Query Aggregation:** N+1 queries වළක්වා සෑම ශිෂ්‍යයෙකුම සහභාගී වූ Sessions ගණන සහ Quizzes ගණන කාර්යක්ෂමව ගණනය කරයි.
  - **Frontend Leaderboard Portal (`frontend/src/pages/LeaderboardPage.tsx` & `services/leaderboardService.ts`):**
    - **Top 3 Podium:** පළමු, දෙවන සහ තෙවන ස්ථාන සඳහා ඔවුන්ගේ Character Evolution රූප (Podium Order: 2nd - 1st - 3rd) සහ රන්/නිල්/දම් Neon Glow සහිත විශේෂ කාඩ්පත්.
    - **Pinned Current User Card:** දැනට Login වී සිටින ශිෂ්‍යයාගේ Rank එක, XP ප්‍රමාණය, Stage Badge එක සහ Certificate එකට තව කොපමණ XP අවශ්‍යද යන්න ඉහළින්ම පෙන්වීම.
    - **Search & Stage Filter:** නම හෝ විශ්වවිද්‍යාලය අනුව search කිරීමේ පහසුකම සහ Stage Tiers (Vanguard, Intel Operative, Pathfinder, Builder, Recruit) අනුව filter කිරීමේ බටන්.
    - `App.tsx` හි `/leaderboard` route එක සජීවී `LeaderboardPage` වෙත සම්බන්ධ කරන ලදී.
  - **Automated Tests (`backend/tests/test_leaderboard.py`):**
    - Public access, XP අවරෝහණ පිළිවෙල, Email/Student ID leak නොවීම, Admin exclusion සහ Authenticated global rank පරීක්ෂා කෙරුණි. Backend tests 17ම 100% Pass විය (`17 passed in 6.38s`).
    - Frontend build එක 0 errors සහිතව compile විය (`dist/assets/index-HqkeX1Ft.js`).

* **මුහුණ දුන් Errors සහ විසඳූ ආකාරය (Errors & Fixes):**
  1. **Pytest ModuleNotFoundError (`No module named 'app'`):**
     - *Error:* `venv\Scripts\pytest.exe` සෘජුවම run කළ විට Python `sys.path` තුළ `backend` root folder එක නොතිබීම නිසා `ModuleNotFoundError: No module named 'app'` ඇති විය.
     - *විසඳුම:* `venv\Scripts\python.exe -m pytest -v` ලෙස run කිරීමෙන් වත්මන් directory එක `sys.path` එකට එක් වී සියලුම tests 17ම සාර්ථකව ක්‍රියාත්මක විය.

---

### 12. Official IT Events Seeding & Database Synchronization (2026-11-14) (නිල IT Sessions 5 ඇතුළත් කිරීම ✅)
* **සිදුකළ දේ (What was done):**
  - පරිශීලකයා විසින් ලබාදුන් නිල **IT Events Summary** ලේඛනයට අනුව පෙර තිබූ sample sessions 5 වෙනුවට Vision Fusion 2.0 හි සැබෑ IT Sessions 5ම පද්ධතියට සහ Database එකට ඇතුළත් කරන ලදී:
    1. **ITERA - Mock Interview Drive** (Physical | 2026-12-10 | Main Auditorium & Career Labs, UWU)
       - *විස්තරය:* Physical mock interview program where students practise technical and HR interviews with industry professionals and receive personalized feedback to improve interview skills and confidence.
    2. **TechCareerX - Software Commercialization and Standards** (Online | 2026-12-11 | Google Meet)
       - *විස්තරය:* Online workshop guiding students on software engineering standards, clean architecture, licensing, intellectual property, deployment, and turning student projects into commercially viable products.
    3. **Futurista - Future of IT** (Online | 2026-12-12 | Google Meet)
       - *විස්තරය:* Online industry-awareness session exploring emerging technologies, future IT trends, career opportunities, and the technical and professional skills needed for future careers.
    4. **BugHunt - AI for University Life and Industry** (Physical | 2026-12-13 | Computer Center / Main Lab, UWU)
       - *විස්තරය:* Interactive workshop demonstrating how AI tools can support academic learning, research, assignments, presentations, and workplace productivity while promoting responsible AI usage.
    5. **Road to Role - IT Career Pathway Discussions** (Physical | 2026-12-14 | Faculty Complex Hall A, UWU)
       - *විස්තරය:* Physical career guidance event where IT professionals explain different job roles, required skills, career progression, and industry expectations to help students plan future careers.
  - **දින යාවත්කාලීන කිරීම (Date Schedule):** සියලුම sessions 12 වැනි මස (දෙසැම්බර් 10 සිට 14 දක්වා) ලෙස `2026-12-10` සිට `2026-12-14` දක්වා යාවත්කාලීන කරන ලදී.
  - **Database Safe Migration (`backend/scripts/update_real_sessions.py`):**
    - දැනටමත් ශිෂ්‍යයින් විසින් "I Participated" mark කර ඇති attendance records හෝ foreign keys වලට කිසිදු හානියක් සිදුනොවන පරිදි database එකේ පවතින records 5ම සාර්ථකව update කරන ලදී.
  - **Default Seed Code Update (`backend/app/db/init_db.py`):**
    - ඉදිරියේදී Database reset එකක් කළද මෙම නිල Sessions 5ම seed වන පරිදි `init_db.py` යාවත්කාලීන කරන ලදී.
  - **Automated Tests & Production Build:**
    - Backend Pytest tests 17ම 100% Pass විය (`17 passed in 5.71s`).
    - Frontend build එක 0 errors සහිතව compile විය.

* **මුහුණ දුන් Errors සහ විසඳූ ආකාරය (Errors & Fixes):**
  1. **En-dash Unicode Windows ANSI Character Encoding Mismatch:**
     - *Error:* En-dash (`–`) අක්ෂරය Windows console හා database එක තුළින් `â€“` ලෙස mojibake වී දිස්වීම.
     - *විසඳුම:* සම්මත clean ASCII hyphen (` - `) භාවිත කර script එක සහ database එක update කරන ලදී. API ප්‍රතිචාරය (JSON) පිරිසිදුව දිස්වේ.

---

### 13. Landing Page Hero Background Image Integration (2026-11-14) (Landing Page Hero Background Image එක එක් කිරීම ✅)
* **සිදුකළ දේ (What was done):**
  - **ෆෝල්ඩරය නිර්මාණය කිරීම:** Landing page backgrounds සහ banners ගබඩා කිරීම සඳහා `frontend/public/assets/backgrounds/` නමින් නව directory එකක් සාදන ලදී.
  - **LandingPage.tsx වැඩිදියුණු කිරීම:**
    - Hero Card එක තුළ Background Image එකක් දර්ශනය වන ලෙස Layer එකක් එක් කරන ලදී (`/assets/backgrounds/hero_bg.jpg` හෝ `hero_bg.png`).
    - **පැහැදිලිව දර්ශනය වීම සහ Color Combination වැඩිදියුණු කිරීම:** පින්තූරය මනාව පෙනෙන පරිදි opacity එක 85%-95% දක්වා වැඩි කර, අධික කළු ආවරණ ඉවත් කරන ලදී.
    - **පෙළ පැහැදිලිව පෙනීම සඳහා (Contrast & Readability):** Backdrop-blur badge, drop-shadows සහ dynamic cyan-purple neon glows එක් කර, background image එක මත අකුරු ඉතා පැහැදිලිව හා ආකර්ෂණීයව දිස්වන සේ සකස් කරන ලදී.
  - **Build Verification:** Frontend production build එක (`npm run build`) 0 errors සහිතව compile විය.

---

### 14. Test User Duplication Root Cause & Automated Cleanup (2026-11-14) (Test Users ඉවත් කිරීම සහ ස්වයංක්‍රීය පිරිසිදු කිරීම ✅)
* **සිදුකළ දේ (What was done):**
  - **ගැටලුව හඳුනාගැනීම (Root Cause):** Database එකේ එකම නම් වලින් (`Kasun Perera`, `Anuki Silva`, `Nipuna Sandaruwan`, `Quiz Master Student`) Users කිහිපදෙනෙකු duplicate වී තිබුණේ ඇයිදැයි පරීක්ෂා කරන ලදී.
    - *හේතුව:* Backend Automated Tests (`test_auth.py`, `test_certificates.py`, `test_quizzes.py`, `test_attendance.py`) run වන සෑම අවස්ථාවකදීම, විවිධ random UUID emails සහිතව (`student_xxx@uwu.ac.lk`, `cert_student_xxx@uwu.ac.lk`) තාවකාලික test users නිර්මාණය කර තිබුණි. Tests අවසානයේ එම දත්ත delete නොකිරීම නිසා පද්ධතිය තුළ 60කට අධික test users එකතු වී තිබුණි.
  - **දත්ත පිරිසිදු කිරීම (`backend/scripts/clean_test_users.py`):**
    - Database එකේ තිබූ තාවකාලික test users 61 දෙනාම සහ ඔවුන්ගේ cascade records ආරක්ෂිතව සම්පූර්ණයෙන්ම ඉවත් කරන ලදී.
    - සැබෑ ශිෂ්‍ය ගිණුම වන `Ravindu Tharusha` (`tharushagimhan01@gmail.com`) සහ නිල `Vision Fusion Admin` ගිණුම ඒ ආකාරයෙන්ම සුරක්ෂිතව තබා ගන්නා ලදී.
  - **අනාගතයේදී මෙය නැවත ඇතිවීම ස්ථිරව වැළැක්වීම (`backend/tests/conftest.py`):**
    - Pytest session fixture එකක් (`auto_cleanup_test_database`) සාදන ලදී. දැන් ඕනෑම අවස්ථාවක tests run වුවද, tests අවසන් වන සැණින් සියලුම තාවකාලික test users ස්වයංක්‍රීයව delete වී database එක 100% පිරිසිදුව පවතී.
  - **ප්‍රතිඵලය:**
    - Live Leaderboard එකේ දැන් සැබෑ ශිෂ්‍යයා (Rank #1) පමණක් පිරිසිදුව දිස්වේ.
    - Pytest 17ම 100% Pass වන අතර test users database එකේ ඉතිරි නොවේ.

---

## 🛠️ පද්ධතිය Run කර පරීක්ෂා කරන ආකාරය (How to Run Locally)

### Backend එක Run කිරීම:
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```
- Swagger API Docs: `http://localhost:8000/api/v1/docs`
- Health Endpoint: `http://localhost:8000/health`

### Frontend එක Run කිරීම:
```bash
cd frontend
npm run dev
```
- වෙබ් අඩවිය: `http://localhost:5173`

### Backend Tests Run කිරීම:
```bash
cd backend
venv\Scripts\python.exe -m pytest -v
```

---
*සටහන: ඉදිරියට සිදුකරන සෑම Phase එකක්ම සහ විසඳන සෑම error එකක්ම මෙම ගොනුවට දිනය සමඟ අඛණ්ඩව එකතු කරනු ලැබේ.*

