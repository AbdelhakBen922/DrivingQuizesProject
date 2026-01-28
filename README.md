# Driving School Quizes Platform
## Driving School Quizes Website (Name Later):
This is a Webapp that helps driving students learn and practice their knowledge in driving school quizes (code).


## Overview:
This a web application aims to provide users (students preparing for driving tests) with a seamless and realistic experience in *Driving Test*  while ensuring their ability to learn and practice effectively. The platform provides all of the following features:
- User Quiz Taking (no need to register)
- User Training Mode (with explanations for each question)
- User Learning environment (with categorized questions)
- Driving School Quiz Management (CRUD operations on quizzes)
- Driving School Quiz User tracking (view user statistics and progress)
  
## Features

### 👤 User Management
- Separate authentication flows:
- **Staff** (Email + Password)
- **Students** (Student Code + Password)
- Role-Based Access Control:
- OWNER
- ADMIN
- INSTRUCTOR
- SECRETARY

### 🏫 School & Classroom Management
- Multi-tenant system (each driving school has isolated data)
- Staff can:
- Create and manage students
- Organize students into virtual rooms (classes)
- Manage different license categories (A, B, C, D)

### 📝 Quiz System
- Question bank with:
- Arabic (RTL) and French (LTR) support
- Categories (Signs, Rules, Priorities, etc.)
- Image-based questions
- Quiz Templates for reuse
- Quiz Modes:
- **Training Mode** (instant feedback)
- **Exam Mode** (feedback after submission)
- Automatic grading for objective questions

### 📊 Tracking & Progress
- Track quiz attempts and status:
- IN_PROGRESS
- SUBMITTED
- GRADED
- Student progress monitoring (planned extensions)

## System Architecture:
- **Frontend:** ReactJS, Shadcn/UI, TailwindCSS
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)

## Created by

- **Abdelhak Benbouziane (Team Leader) :** `AbdelhakBen922`
- **Zakaria Chetouane :** `2EDX7`
- **DhiaaEddine Guerfi :** `Dhia0Eddine`
- **Ala Slimani :** `AlaSlimani99`
