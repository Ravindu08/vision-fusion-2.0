import logging
from app.db.session import SessionLocal
from app.models.session import EventSession
from app.models.quiz import Quiz
from app.models.question import Question

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

QUIZZES_DATA = [
    {
        "session_title": "ITERA - Mock Interview Drive",
        "title": "ITERA – Technical & HR Mock Interview Challenge",
        "description": "Assess your readiness for technical interviews, coding rounds, system design discussions, and behavioral STAR techniques.",
        "xp_reward": 70,
        "pass_percentage": 40,
        "allow_retakes": True,
        "max_attempts": 10,
        "questions": [
            {
                "text": "In behavioral interviews, what does the 'STAR' method framework represent?",
                "options": [
                    "Situation, Task, Action, Result",
                    "Strategy, Testing, Analysis, Review",
                    "Syntax, Type, Array, Record",
                    "Software, Technology, Architecture, Reliability"
                ],
                "correct": 0,
            },
            {
                "text": "When solving an algorithmic whiteboard coding problem, what is the recommended first step before writing code?",
                "options": [
                    "Clarify requirements, constraints, edge cases, and discuss approach with the interviewer",
                    "Immediately start writing optimized code",
                    "Ask the interviewer to provide the solution syntax",
                    "Skip time complexity analysis"
                ],
                "correct": 0,
            },
            {
                "text": "What does Big-O notation primarily evaluate in technical interview code assessments?",
                "options": [
                    "How algorithm execution time or space requirements scale relative to input size (n)",
                    "The number of lines of source code written",
                    "The font size in the developer terminal",
                    "The network download speed of the application"
                ],
                "correct": 0,
            },
            {
                "text": "During an HR interview, how should you answer the common prompt: 'Tell me about yourself'?",
                "options": [
                    "Provide a focused professional elevator pitch: background, key achievements, passions, and why this company excites you",
                    "Recite your full birth story and personal hobbies chronologically",
                    "State only your university GPA and degree title",
                    "Complain about previous professors or project teammates"
                ],
                "correct": 0,
            },
            {
                "text": "What is the primary purpose of writing unit tests for your interview take-home coding assignment?",
                "options": [
                    "To demonstrate code correctness, edge-case resilience, and defensive engineering practices",
                    "To artificially inflate the size of the Git commit",
                    "To replace documentation completely",
                    "To slow down the CI/CD pipeline"
                ],
                "correct": 0,
            },
            {
                "text": "When an interviewer asks you a question to which you genuinely do not know the answer, what is the best approach?",
                "options": [
                    "Admit honestly that you don't know, explain how you would deduce or research it, and ask thoughtful questions",
                    "Remain completely silent until they ask something else",
                    "Pretend you know and invent false technical facts",
                    "Argue that the question is irrelevant in real industry work"
                ],
                "correct": 0,
            },
            {
                "text": "In technical system design interviews, what does the CAP theorem state regarding distributed data stores?",
                "options": [
                    "A distributed system can guarantee at most two of Consistency, Availability, and Partition Tolerance simultaneously",
                    "Code, Architecture, and Programming are equally weighted",
                    "Computers Always Process data sequentially",
                    "Concurrency, Asynchrony, and Parallelism cannot coexist"
                ],
                "correct": 0,
            },
            {
                "text": "What is the standard etiquette regarding post-interview communication with recruiters?",
                "options": [
                    "Send a polite, professional thank-you email within 24 hours expressing gratitude and reiterating enthusiasm",
                    "Call the hiring manager personal phone repeatedly every hour",
                    "Post confidential interview questions immediately on social media",
                    "Never send any follow-up message under any circumstance"
                ],
                "correct": 0,
            },
            {
                "text": "In salary and compensation discussions, what is generally the best timing to negotiate offer terms?",
                "options": [
                    "After receiving a formal written job offer when your value has been established",
                    "During the very first minute of the initial phone screen",
                    "On your first day of work after signing the contract",
                    "Never negotiate under any circumstance"
                ],
                "correct": 0,
            },
            {
                "text": "Which formatting principle is considered an industry best practice for tech CVs/Resumes?",
                "options": [
                    "Action-oriented bullet points quantifying impact (e.g., 'Optimized query latency by 45% using indexing')",
                    "Multi-color decorative fonts with 5-page biography",
                    "Listing Microsoft Word and Google Search as core technical skills",
                    "Omitting GitHub links and live project URLs"
                ],
                "correct": 0,
            },
        ],
    },
    {
        "session_title": "TechCareerX - Software Commercialization and Standards",
        "title": "TechCareerX – Software Standards, Architecture & Commercialization Challenge",
        "description": "Demonstrate your understanding of clean architecture, SOLID design principles, software licensing, CI/CD, and turning student projects into commercially viable products.",
        "xp_reward": 70,
        "pass_percentage": 40,
        "allow_retakes": True,
        "max_attempts": 10,
        "questions": [
            {
                "text": "In Clean Architecture and Domain-Driven Design, what does the Dependency Inversion Principle dictate regarding the domain core?",
                "options": [
                    "The business logic/domain core must depend directly on the database SQL schema",
                    "High-level domain policies must not depend on low-level infrastructure details; both should depend on abstractions/interfaces",
                    "User interfaces must execute raw SQL queries directly",
                    "Modules must be tightly coupled to a single vendor framework"
                ],
                "correct": 1,
            },
            {
                "text": "In the SOLID principles of Object-Oriented Software Design, what does the 'Single Responsibility Principle' (SRP) mean?",
                "options": [
                    "A class or module should have only one reason to change, encapsulating a single responsibility",
                    "A project should only have a single developer responsible for everything",
                    "All methods must accept only a single parameter",
                    "An application must run as a single monolithic process"
                ],
                "correct": 0,
            },
            {
                "text": "What is the legal difference between a permissive license (e.g. MIT, Apache 2.0) and a copyleft license (e.g. GNU GPLv3)?",
                "options": [
                    "MIT code cannot be used commercially",
                    "Permissive licenses allow proprietary closed-source redistribution, while copyleft requires derivative works to remain open under the same license",
                    "GPL prohibits viewing source code",
                    "There is no legal difference between open source software licenses"
                ],
                "correct": 1,
            },
            {
                "text": "According to Semantic Versioning (SemVer: MAJOR.MINOR.PATCH), when should you increment the MAJOR version number?",
                "options": [
                    "When making backwards-compatible bug fixes only",
                    "When adding new backwards-compatible functionality",
                    "When introducing breaking, incompatible API changes that require consumers to modify their integration",
                    "Whenever code is compiled on a Friday"
                ],
                "correct": 2,
            },
            {
                "text": "In the 12-Factor App methodology for modern SaaS products, how should application configuration (e.g. DB URLs, secrets) be stored?",
                "options": [
                    "Hardcoded directly into GitHub public commits",
                    "Strictly in environment variables separated from application source code",
                    "In local plain-text desktop files",
                    "In unencrypted browser cookie jars"
                ],
                "correct": 1,
            },
            {
                "text": "What is the key advantage of containerization (Docker) over traditional bare-metal or virtual machine deployments?",
                "options": [
                    "Guarantees that software runs identically across local dev, staging, and cloud production environments with lightweight isolation",
                    "Completely eliminates the need for unit testing",
                    "Forces all software to be written in C language",
                    "Increases cold start boot times to several hours"
                ],
                "correct": 0,
            },
            {
                "text": "In automated CI/CD pipelines, what is a 'Deployment Gate' or 'Quality Gate'?",
                "options": [
                    "A physical turnstile in front of the server room",
                    "Automated automated verification checkpoints (e.g. linters, unit tests, security scans) that must pass before deploying to production",
                    "A manual spreadsheet updated monthly",
                    "A DNS domain transfer restriction"
                ],
                "correct": 1,
            },
            {
                "text": "When turning a student project into a commercial SaaS product, what is 'Multi-Tenancy'?",
                "options": [
                    "Running software only when multiple developers are logged in simultaneously",
                    "A software architecture where a single instance serves multiple distinct customer organizations with strict data isolation",
                    "Installing multiple operating systems on one laptop",
                    "Splitting code into multiple GitHub branches"
                ],
                "correct": 1,
            },
            {
                "text": "What is the purpose of an API Gateway in modern commercial microservice architectures?",
                "options": [
                    "Acts as a single entry point providing rate-limiting, authentication, SSL termination, and request routing to backend services",
                    "Serves only static HTML documentation pages",
                    "Replaces relational databases with CSV storage",
                    "Compiles TypeScript into Machine Language"
                ],
                "correct": 0,
            },
            {
                "text": "What is an MVP (Minimum Viable Product) in software product development and commercialization?",
                "options": [
                    "A complete 10-year enterprise suite with every conceivable feature",
                    "The simplest functional version of a product that solves the core problem and delivers value to early customers for rapid validation",
                    "A PowerPoint presentation without any working code",
                    "The Most Valuable Programmer on the team"
                ],
                "correct": 1,
            },
        ],
    },
    {
        "session_title": "Futurista - Future of IT",
        "title": "Futurista – Emerging Technologies & Future IT Horizons Challenge",
        "description": "Explore cloud-native scalability, microservices vs monoliths, Edge Computing, quantum computing paradigms, DevOps, and next-gen tech careers.",
        "xp_reward": 70,
        "pass_percentage": 40,
        "allow_retakes": True,
        "max_attempts": 10,
        "questions": [
            {
                "text": "In modern cloud infrastructure, what is the primary architectural benefit of Serverless Computing (e.g., AWS Lambda, Google Cloud Functions)?",
                "options": [
                    "Servers no longer physically exist anywhere on Earth",
                    "Automatic scaling from zero, event-driven execution, and paying only for the exact compute milliseconds consumed",
                    "Permanent memory retention without any cold starts",
                    "Unrestricted execution time with zero timeout limits"
                ],
                "correct": 1,
            },
            {
                "text": "What is the primary motivation for implementing 'Edge Computing' in IoT, autonomous systems, and modern mobile apps?",
                "options": [
                    "To process data physically closer to the data source, drastically reducing latency and network bandwidth consumption",
                    "To store all global data in a single centralized datacenter",
                    "To avoid using microprocessors",
                    "To eliminate the need for wireless communication"
                ],
                "correct": 0,
            },
            {
                "text": "In quantum computing, what fundamental property enables qubits to exist in multiple states simultaneously, unlike classical binary bits?",
                "options": [
                    "Superposition",
                    "Semiconductor doping",
                    "Cache invalidation",
                    "Polymorphic serialization"
                ],
                "correct": 0,
            },
            {
                "text": "In Site Reliability Engineering (SRE), what is the difference between an SLA and an SLO?",
                "options": [
                    "An SLA is an external contractual agreement with penalties; an SLO is an internal target reliability threshold used by engineering teams",
                    "SLA is for frontend code; SLO is for backend code",
                    "SLAs are only used in Agile Scrum daily standups",
                    "There is no difference; they are exact synonyms"
                ],
                "correct": 0,
            },
            {
                "text": "What are the 'Three Pillars of Observability' in modern distributed cloud systems?",
                "options": [
                    "HTML, CSS, JavaScript",
                    "Metrics, Logs, and Traces",
                    "CPU, RAM, Hard Disk",
                    "Frontend, Backend, Database"
                ],
                "correct": 1,
            },
            {
                "text": "What is the primary role of an event broker like Apache Kafka or RabbitMQ in event-driven microservices?",
                "options": [
                    "To serve static image assets to browsers",
                    "To decouple producers and consumers through high-throughput, persistent asynchronous message streaming",
                    "To replace relational databases with flat files",
                    "To encrypt passwords with bcrypt"
                ],
                "correct": 1,
            },
            {
                "text": "What capability does WebAssembly (Wasm) introduce to modern web browsers and edge runtimes?",
                "options": [
                    "Executing high-performance compiled binary code (from C++, Rust, Go) at near-native speed directly in web sandboxes",
                    "A styling language to replace CSS",
                    "A replacement for HTTP/HTTPS protocols",
                    "A tool for creating animated GIFs"
                ],
                "correct": 0,
            },
            {
                "text": "In cloud cost engineering (FinOps), what is the concept of 'Cloud Cost Visibility'?",
                "options": [
                    "Making cloud bills publicly accessible on social media",
                    "Tracking, attributing, and optimizing infrastructure spend across engineering teams and microservices in real time",
                    "Refusing to use cloud providers altogether",
                    "Paying for cloud servers using physical cash"
                ],
                "correct": 1,
            },
            {
                "text": "What does 'Infrastructure as Code' (IaC) with tools like Terraform or Pulumi enable engineering organizations to achieve?",
                "options": [
                    "Writing entire applications in JSON without any logic",
                    "Defining, version-controlling, provisioning, and auditing cloud infrastructure programmatically and repeatably",
                    "Manually clicking buttons in cloud web consoles",
                    "Bypassing cloud security firewalls"
                ],
                "correct": 1,
            },
            {
                "text": "Which career trend represents the convergence of software engineering, infrastructure automation, and AI operations?",
                "options": [
                    "Platform Engineering / MLOps",
                    "Manual Data Entry Clerk",
                    "Cobol Mainframe Maintenance",
                    "Static Webpage Clipping"
                ],
                "correct": 0,
            },
        ],
    },
    {
        "session_title": "BugHunt - AI for University Life and Industry",
        "title": "BugHunt – AI in Academia, Industry Productivity & Ethical AI Challenge",
        "description": "Assess your skills in generative AI tools, prompt engineering, Retrieval-Augmented Generation (RAG), academic research integrity, and workplace productivity.",
        "xp_reward": 70,
        "pass_percentage": 40,
        "allow_retakes": True,
        "max_attempts": 10,
        "questions": [
            {
                "text": "In Large Language Models (LLMs), what is a 'Hallucination'?",
                "options": [
                    "A hardware overheating failure in server GPUs",
                    "When an AI model generates factually incorrect or fabricated information with high linguistic confidence",
                    "When an AI refuses to generate code due to rate limits",
                    "A feature that renders 3D graphics in virtual reality"
                ],
                "correct": 1,
            },
            {
                "text": "In modern AI architecture, what does RAG (Retrieval-Augmented Generation) do to improve response accuracy?",
                "options": [
                    "Retrieves relevant external factual documents from a knowledge base and injects them into the prompt context before generation",
                    "Randomly alters generated grammar to simulate human speech",
                    "Retrains the entire neural network from scratch for each prompt",
                    "Compresses text files into ZIP archives"
                ],
                "correct": 0,
            },
            {
                "text": "In Prompt Engineering, what is the difference between 'Zero-Shot' and 'Few-Shot' prompting?",
                "options": [
                    "Zero-shot provides zero guidelines; Few-shot requires paying money",
                    "Zero-shot asks the model to perform a task with no examples; Few-shot provides demonstration input/output pairs in the prompt",
                    "Zero-shot only works in Python; Few-shot works in Java",
                    "There is no difference in prompt performance"
                ],
                "correct": 1,
            },
            {
                "text": "When using AI coding assistants (e.g. GitHub Copilot, Gemini Code Assist), what is the developer's fundamental ethical and technical responsibility?",
                "options": [
                    "Blindly accepting all suggested code without inspection",
                    "Carefully reviewing, understanding, testing, and verifying suggested code for security vulnerabilities, licensing, and correctness",
                    "Deleting all unit tests because AI code is always infallible",
                    "Claiming to have written every line manually without disclosure"
                ],
                "correct": 1,
            },
            {
                "text": "In university research and academic assignments, what is considered responsible, ethical AI usage?",
                "options": [
                    "Submitting an entire AI-generated essay as your own original work without citation",
                    "Using AI as an intellectual brainstorming and proofreading aid while properly citing AI usage and contributing original critical thinking",
                    "Using AI to fabricate fake laboratory research data",
                    "Copying AI answers directly into closed-book examinations"
                ],
                "correct": 1,
            },
            {
                "text": "What mathematical representation enables AI models and Vector Databases to perform semantic similarity searches?",
                "options": [
                    "Vector Embeddings (high-dimensional numerical coordinate vectors capturing semantic meaning)",
                    "Simple ASCII alphabetical string sorting",
                    "MD5 cryptographic hashes",
                    "Roman numerals"
                ],
                "correct": 0,
            },
            {
                "text": "What is 'AI Bias', and how does it typically originate in modern machine learning systems?",
                "options": [
                    "An intentional program error written by malicious coders",
                    "Systematic unfairness or skewed predictions stemming from unrepresentative, historically prejudiced training data or design choices",
                    "A temporary glitch caused by slow Wi-Fi",
                    "When an AI prefers Python over C++"
                ],
                "correct": 1,
            },
            {
                "text": "In generative image and media synthesis, what is a 'Deepfake'?",
                "options": [
                    "A very high-resolution photograph taken in deep ocean trenches",
                    "Synthetic media where a person's likeness, face, or voice is realistically replaced or generated using deep neural networks",
                    "An encrypted backup stored on deep tape drives",
                    "A vector graphic created in Adobe Illustrator"
                ],
                "correct": 1,
            },
            {
                "text": "What is the role of a 'System Prompt' in governing the behavior of conversational AI agents?",
                "options": [
                    "It defines persistent persona, behavioral rules, tool accessibility, safety constraints, and output formats for the model",
                    "It reboots the computer operating system",
                    "It displays a Windows notification popup",
                    "It compiles the source code of the agent"
                ],
                "correct": 0,
            },
            {
                "text": "How can AI tools best accelerate daily student and workplace productivity without sacrificing critical learning?",
                "options": [
                    "Summarizing dense academic papers, generating study flashcards, synthesizing presentation outlines, and debugging syntax errors",
                    "Letting AI take online university exams on your behalf",
                    "Automating spam email generation to professors",
                    "Using AI to bypass university plagiarism detection algorithms"
                ],
                "correct": 0,
            },
        ],
    },
    {
        "session_title": "Road to Role - IT Career Pathway Discussions",
        "title": "Road to Role – Tech Career Pathways & Industry Readiness Challenge",
        "description": "Understand core specialization pathways in modern tech: Software Engineering, DevOps, Data Science, QA, Product Management, and career growth trajectories.",
        "xp_reward": 70,
        "pass_percentage": 40,
        "allow_retakes": True,
        "max_attempts": 10,
        "questions": [
            {
                "text": "What is the primary difference in engineering focus between a Frontend Engineer and a Backend Engineer?",
                "options": [
                    "Frontend focuses on user interfaces, client-side state, responsiveness, and web UX; Backend focuses on server logic, databases, APIs, and security",
                    "Frontend engineers write binary code; Backend engineers only design logos",
                    "Frontend engineers do not use programming languages",
                    "There is no distinction in modern engineering roles"
                ],
                "correct": 0,
            },
            {
                "text": "In modern software organizations, what is the core responsibility of a Product Manager (PM)?",
                "options": [
                    "Writing all unit tests and deploying code to production",
                    "Defining product vision, roadmap, customer value, and prioritizing features at the intersection of business, tech, and UX",
                    "Managing server physical hardware racks",
                    "Designing the company corporate letterhead"
                ],
                "correct": 1,
            },
            {
                "text": "What is the primary distinction between a Data Engineer and a Data Scientist?",
                "options": [
                    "Data Engineers build resilient data pipelines, ETL infrastructure, and data warehouses; Data Scientists analyze data, build predictive models, and extract business insights",
                    "Data Engineers only work with Microsoft Excel; Data Scientists do not use computers",
                    "Data Scientists build physical hardware; Data Engineers write documentation",
                    "Both roles perform identical tasks with no specialization"
                ],
                "correct": 0,
            },
            {
                "text": "What is 'Technical Debt' in software development, and why must engineering teams manage it proactively?",
                "options": [
                    "The monetary loan taken from a bank to buy office laptops",
                    "The future implied cost of rework caused by choosing an expedited, suboptimal solution now instead of a well-architected approach",
                    "The monthly invoice paid for cloud hosting servers",
                    "Unpaid salary owed to software developers"
                ],
                "correct": 1,
            },
            {
                "text": "In Agile Scrum methodology, what is the primary purpose of the 'Sprint Retrospective' ceremony?",
                "options": [
                    "To assign blame to struggling developers in front of executives",
                    "For the scrum team to reflect on the past sprint, evaluate what went well and what didn't, and plan concrete process improvements",
                    "To demo software features to paying clients",
                    "To calculate developer annual bonuses"
                ],
                "correct": 1,
            },
            {
                "text": "In Quality Assurance (QA) engineering, why is automated testing preferred over purely manual testing in fast-paced software environments?",
                "options": [
                    "Automated tests can be executed repeatedly, continuously, and instantly in CI/CD pipelines, preventing regression defects efficiently",
                    "Automated testing completely removes the need for human QA engineers",
                    "Manual testing is illegal in modern tech companies",
                    "Automated tests never need to be maintained or updated"
                ],
                "correct": 0,
            },
            {
                "text": "What is the typical career progression trajectory for a Software Engineer in tech companies?",
                "options": [
                    "Associate / Junior Engineer → Software Engineer → Senior Engineer → Tech Lead / Staff Engineer / Engineering Manager",
                    "Intern → CEO directly with no intermediate steps",
                    "Technical Writer → Database Administrator → Graphic Designer",
                    "Scrum Master → HR Specialist → Network Technician"
                ],
                "correct": 0,
            },
            {
                "text": "Why is contributing to Open Source Software (OSS) highly valued by tech recruiters and engineering hiring managers?",
                "options": [
                    "It shows real-world collaboration, public code quality, git proficiency, communication skills, and passion beyond academic syllabi",
                    "It guarantees that you do not have to do technical interviews",
                    "Open source contributions are rewarded with direct cash grants from GitHub",
                    "Only open source contributors are legally allowed to work in IT"
                ],
                "correct": 0,
            },
            {
                "text": "What is the primary role of a Cloud / DevOps Engineer in modern development lifecycles?",
                "options": [
                    "Designing user onboarding UI screens",
                    "Automating continuous deployment pipelines, managing cloud infrastructure, monitoring reliability, and accelerating developer delivery velocity",
                    "Selling software licenses to external clients",
                    "Conducting behavioral HR interviews"
                ],
                "correct": 1,
            },
            {
                "text": "What is the most effective approach for an undergraduate student to build an impactful professional network in the IT industry?",
                "options": [
                    "Sending hundreds of generic 'Send me a job' messages to random executives on LinkedIn",
                    "Actively participating in IEEE student branch activities, attending industry hackathons/tech talks, building authentic peer relationships, and sharing technical learnings publicly",
                    "Waiting until after graduation before speaking to anyone in tech",
                    "Paying marketing agencies to create automated social media bots"
                ],
                "correct": 1,
            },
        ],
    },
]

def seed_quizzes():
    db = SessionLocal()
    try:
        # Clear existing quizzes and questions to ensure fresh, pristine state
        logger.info("Cleaning old demo quizzes...")
        db.query(Question).delete()
        db.query(Quiz).delete()
        db.commit()

        # Query all 5 official sessions
        sessions = db.query(EventSession).order_by(EventSession.session_date.asc()).all()
        session_map = {s.title: s.id for s in sessions}

        logger.info(f"Seeding {len(QUIZZES_DATA)} official event quizzes (10 MCQs each)...")

        for q_data in QUIZZES_DATA:
            session_id = session_map.get(q_data["session_title"])
            if not session_id and sessions:
                session_id = sessions[0].id

            quiz = Quiz(
                session_id=session_id,
                title=q_data["title"],
                description=q_data["description"],
                xp_reward=q_data["xp_reward"],  # 70 XP
                pass_percentage=q_data["pass_percentage"],  # 40%
                allow_retakes=q_data["allow_retakes"],  # True
                max_attempts=q_data["max_attempts"],
                is_active=True,
            )
            db.add(quiz)
            db.flush()

            for idx, q_info in enumerate(q_data["questions"], start=1):
                options = list(q_info["options"])
                c_idx = q_info.get("correct", 0)
                if c_idx != 0 and c_idx < len(options):
                    # Guarantee that Option 1 (index 0) is ALWAYS the correct answer for all 50 questions!
                    correct_opt = options.pop(c_idx)
                    options.insert(0, correct_opt)

                question = Question(
                    quiz_id=quiz.id,
                    question_text=q_info["text"],
                    options=options,
                    correct_option_index=0,
                    order_index=idx,
                )
                db.add(question)

        db.commit()
        logger.info("Successfully seeded all 5 official event quizzes and 50 questions!")

        # Verify
        all_quizzes = db.query(Quiz).all()
        print("\n--- Verified Quizzes in Database ---")
        for q in all_quizzes:
            q_cnt = db.query(Question).filter(Question.quiz_id == q.id).count()
            sess = db.query(EventSession).filter(EventSession.id == q.session_id).first()
            s_name = sess.title if sess else "Unlinked"
            print(f"- {q.title} | Event: {s_name} | Questions: {q_cnt} | XP: {q.xp_reward} | Pass: {q.pass_percentage}% | Retakes: {q.allow_retakes}")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding quizzes: {e}", exc_info=True)
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_quizzes()

