# Verisona AI

> "Your story is your strength."

Verisona is a portmanteau of Veritas (Truth in Latin) and persona. Through this AI platform, we wish to effectively capture and help develop one’s true persona in their life and college admissions. Our core value is to help students find a true school that fits them—in terms of atmosphere, environment, programs, and more—by shifting the focus from traditional, often exclusionary metrics to the student's unique character, resilience, and personal narrative.

This repository contains parts of the Verisona AI project. Please note that this is a **partially open-source project**, with the web frontend being the primary open component.

## ✨ Core Concept

Verisona AI is an AI-Powered College Application Platform designed to provide personality-driven college admissions guidance, with a special focus on helping underrepresented and low-income students. It uses a novel multi-agent AI system to help students discover their true selves and find educational institutions that genuinely align with their personal and academic aspirations.

### Brand Persona
Empowering, innovative, equitable, and supportive. We aim to be a "game-changer" for students who feel overlooked, acting as a wise, modern guidance counselor powered by cutting-edge technology.

### Target Audience
- High school students, especially those from underrepresented or low-income backgrounds.
- Students who are unsure of their future vision and dreams.
- Parents and school counselors looking for scalable guidance tools.

## 🎨 Visual Aesthetic & Design

Our design philosophy is clean, modern, optimistic, and tech-forward, while remaining warm and human to inspire trust and reduce anxiety.

### Color Palette
The visual identity is built around a sophisticated, earthy, and warm color scheme.

- **Primary Colors**:
  ```css
  :root {
    --color-earth: #d4a373; /* Warm tan for primary CTAs */
    --color-cream: #faedcd; /* Soft cream for secondary backgrounds */
    --color-light: #fefae0; /* Primary light background */
    --color-text: #3a2e20;  /* Deep brown for body text */
  }
  ```
- **Accent Colors**: Deep blues, purples, and a bright, warm orange for calls-to-action, charts, and visualizations.

### Typography
A highly readable and modern sans-serif font like Inter or Manrope.

### Imagery
Authentic, diverse students in natural settings, mixed with sleek, abstract graphics representing the AI process.

## 🛠️ Technical Implementation (技术实现)

The Verisona AI platform is built with a modern, scalable tech stack.

-   **Web Platform**:
    -   **Framework**: Next.js
    -   **UI Library**: shadcn/ui
    -   **Database**: Postgres
    -   **ORM**: Drizzle
-   **CamelAI Backend**:
    -   **Framework**: Python + FastAPI
    -   **Core**: CamelAI
    -   **Deployment**: Zeabur
-   **AI Workflow**:
    -   **Orchestration**: Dify
-   **Execution Flow**:
    `Web → AI Workflow (Dify, calling CamelAI backend) → Web`

## 📝 Questionnaire Implementation (问卷实现)

The Verisona Student Trait Assessment Model is a multi-dimensional evaluation that assesses a student's dialectical thinking about the past, present, and future, as well as their detailed insights into life and work.

### Step 1: The Questionnaire (信息收集)

This stage collects raw material for the multi-agent AI analysis.

**Part 1: Personal Information**
-   Name
-   School
-   Age
-   Gender
-   One-sentence Bio

**Part 2: Foundational Statements**
-   **Academic Profile Statement**: Upload academic transcripts.
-   **Life Experience Statement**:
    -   **Weekly Schedule**: "Show us what a typical week looks like for you - school, sleep, homework, activities, family time, work, chores, and free time." (Visual calendar/pie chart).
    -   **Hobbies**: "Describe a hobby that brings you joy. What does it feel like when you're engaged in it?"
-   **Character Statement**: "Describe a time you faced a significant challenge, failure, or setback... What did you learn about yourself or the world as a result?"
-   **Future Outlook Statement**: "How do you imagine you will contribute to the lives of your future classmates and your community?"

### Step 2: The Dialectical Q&A (辩证问答)

This step involves a deeper, AI-driven analysis based on the initial questionnaire, focusing on:

-   **Foundational Altitude** (基底高度)
-   **Systemic Strength** (系统强度)
-   **Core Competency Depth** (素养深度)
-   **Forward-looking Breadth** (前瞻广度)

---

We believe in the power of authentic stories and are excited to build a more equitable future for college admissions.
