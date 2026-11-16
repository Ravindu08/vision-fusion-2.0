import sqlite3
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "vision_fusion.db"

if not DB_PATH.exists():
    print(f"Error: Database not found at {DB_PATH}")
    exit(1)

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

print("=" * 95)
print(f"  VISION FUSION 2.0 - SQLITE DATABASE VIEWER")
print(f"  Database File: {DB_PATH}")
print("=" * 95)

# 1. Students / Users
print("\n[1] STUDENTS & USERS (Table: users)")
print("-" * 95)
users = cursor.execute("SELECT id, full_name, email, student_id, university, role, total_xp, character_stage, is_active, created_at FROM users ORDER BY role ASC, total_xp DESC").fetchall()
if not users:
    print("  No users found in database.")
else:
    header = f"{'Role':<8} | {'Full Name':<22} | {'Email':<30} | {'Student ID':<15} | {'XP':<5} | {'Stage':<24} | {'Status':<8}"
    print(header)
    print("-" * len(header))
    for u in users:
        status = "Active" if u["is_active"] else "Suspended"
        print(f"{u['role']:<8} | {u['full_name'][:22]:<22} | {u['email'][:30]:<30} | {str(u['student_id'] or 'N/A')[:15]:<15} | {u['total_xp']:<5} | {u['character_stage'][:24]:<24} | {status:<8}")

# 2. Event Sessions
print("\n[2] EVENT SESSIONS (Table: sessions)")
print("-" * 95)
sessions = cursor.execute("SELECT id, title, session_type, session_date, start_time, xp_reward, is_active FROM sessions ORDER BY session_date ASC").fetchall()
if not sessions:
    print("  No sessions found.")
else:
    header = f"{'Date':<11} | {'Type':<9} | {'XP':<4} | {'Title':<45}"
    print(header)
    print("-" * len(header))
    for s in sessions:
        print(f"{str(s['session_date']):<11} | {s['session_type']:<9} | {s['xp_reward']:<4} | {s['title'][:45]:<45}")

# 3. Quizzes
print("\n[3] OFFICIAL QUIZZES (Table: quizzes)")
print("-" * 95)
quizzes = cursor.execute("SELECT q.id, q.title, q.xp_reward, q.pass_percentage, count(ques.id) as question_count FROM quizzes q LEFT JOIN questions ques ON ques.quiz_id = q.id GROUP BY q.id").fetchall()
if not quizzes:
    print("  No quizzes found.")
else:
    header = f"{'XP':<4} | {'Pass%':<6} | {'MCQs':<5} | {'Quiz Title':<60}"
    print(header)
    print("-" * len(header))
    for q in quizzes:
        print(f"{q['xp_reward']:<4} | {q['pass_percentage']:<6}% | {q['question_count']:<5} | {q['title'][:60]:<60}")

# 4. Summary counts
print("\n[4] OVERALL DATABASE SUMMARY")
print("-" * 95)
total_users = cursor.execute("SELECT count(*) FROM users").fetchone()[0]
total_students = cursor.execute("SELECT count(*) FROM users WHERE role='STUDENT'").fetchone()[0]
total_attendance = cursor.execute("SELECT count(*) FROM attendance").fetchone()[0]
total_attempts = cursor.execute("SELECT count(*) FROM quiz_attempts").fetchone()[0]
total_certs = cursor.execute("SELECT count(*) FROM certificates").fetchone()[0]
print(f"  • Total Users: {total_users} (Students: {total_students})")
print(f"  • Attendance Records: {total_attendance}")
print(f"  • Quiz Attempts: {total_attempts}")
print(f"  • Issued Certificates: {total_certs}")
print("=" * 95)

conn.close()
