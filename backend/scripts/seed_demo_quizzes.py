from app.db.session import SessionLocal
from app.models.quiz import Quiz
from app.models.question import Question

def seed_demo_quizzes():
    db = SessionLocal()

    new_quizzes_data = [
        {
            'title': 'Cloud Native & DevOps Architectures',
            'description': 'Test your grasp on microservices, containerization, Kubernetes, CI/CD pipelines, and cloud reliability.',
            'xp_reward': 120,
            'pass_percentage': 60,
            'questions': [
                {
                    'text': 'Which container technology provides operating-system-level virtualization to package code and all its dependencies?',
                    'options': ['Docker', 'Nginx', 'Apache Kafka', 'Jenkins'],
                    'correct': 0
                },
                {
                    'text': 'What is the primary function of Kubernetes in modern software engineering?',
                    'options': ['Code editor', 'Container orchestration & automated scaling', 'Relational database', 'DNS registrar'],
                    'correct': 1
                },
                {
                    'text': 'In CI/CD, what does CD typically stand for?',
                    'options': ['Compact Disk', 'Continuous Delivery or Continuous Deployment', 'Centralized Database', 'Control Daemon'],
                    'correct': 1
                }
            ]
        },
        {
            'title': 'Cybersecurity & Defensive Engineering',
            'description': 'Demonstrate your knowledge in securing web apps, zero-trust architectures, cryptography, and threat mitigation.',
            'xp_reward': 130,
            'pass_percentage': 60,
            'questions': [
                {
                    'text': 'Which attack involves injecting malicious SQL commands into database input fields?',
                    'options': ['Cross-Site Scripting (XSS)', 'SQL Injection (SQLi)', 'Denial of Service (DoS)', 'Man-in-the-Middle (MitM)'],
                    'correct': 1
                },
                {
                    'text': 'What does HTTPS use to encrypt communications between client and server?',
                    'options': ['Bcrypt', 'TLS / SSL', 'Base64', 'MD5'],
                    'correct': 1
                },
                {
                    'text': 'What is the core principle of a Zero Trust security architecture?',
                    'options': ['Trust everything inside the network', 'Never trust, always verify', 'Disable all firewalls', 'Use single-character passwords'],
                    'correct': 1
                }
            ]
        },
        {
            'title': 'IEEE & Tech Career Readiness Trivia',
            'description': 'Explore IEEE traditions, university tech community leadership, industry trends, and professional career pathways.',
            'xp_reward': 150,
            'pass_percentage': 60,
            'questions': [
                {
                    'text': 'What does IEEE stand for?',
                    'options': [
                        'Institute of Electrical and Electronics Engineers',
                        'International Electronic Engineering Enterprise',
                        'Industrial Engineering and Electronics Executives',
                        'Integrated Energy and Electrical Engineers'
                    ],
                    'correct': 0
                },
                {
                    'text': 'Which IEEE society at Uva Wellassa University co-organizes Vision Fusion 2.0 with IEEE WIE?',
                    'options': ['IEEE IAS (Industry Applications Society)', 'IEEE PES', 'IEEE RAS', 'IEEE CS'],
                    'correct': 0
                },
                {
                    'text': 'What is the minimum XP threshold required to unlock the Vision Fusion 2.0 Digital Certificate?',
                    'options': ['10%', '25%', '35% (350 XP)', '90%'],
                    'correct': 2
                }
            ]
        }
    ]

    for q_info in new_quizzes_data:
        existing = db.query(Quiz).filter(Quiz.title == q_info['title']).first()
        if not existing:
            q_obj = Quiz(
                title=q_info['title'],
                description=q_info['description'],
                xp_reward=q_info['xp_reward'],
                pass_percentage=q_info['pass_percentage'],
                allow_retakes=False,
                is_active=True
            )
            db.add(q_obj)
            db.flush()

            for idx, q_item in enumerate(q_info['questions']):
                question = Question(
                    quiz_id=q_obj.id,
                    question_text=q_item['text'],
                    correct_option_index=q_item['correct'],
                    order_index=idx + 1
                )
                question.options = q_item['options']
                db.add(question)
            print(f"Added Quiz: {q_obj.title}")
        else:
            print(f"Quiz already exists: {existing.title}")

    db.commit()
    db.close()
    print("All demo quizzes seeded successfully!")

if __name__ == "__main__":
    seed_demo_quizzes()

