# CS467 Secure Password Manager

## Overview
This project is a secure, web-based password manager designed to help users store and manage credentials safely. The system emphasizes security, usability, and transparency through client-side encryption, multi-factor authentication (MFA), and an open-source design.

## Key Features
- User account creation and authentication
- Multi-factor authentication (MFA) via email OTP
- Encrypted credential vault (client-side encryption)
- Password generation tool
- Search and organization of stored credentials
- Cloud-based deployment

## Tech Stack

### Frontend
- React
- JavaScript / HTML / CSS
- CryptoJS (client-side encryption)

### Backend
- Flask
- Flask-Login
- Flask-WTF
- SQLAlchemy
- PyOTP (for OTP handling)

### Database
- SQLite (local development)
- PostgreSQL / Google Cloud SQL (production)

### Deployment
- Google Cloud (Cloud Run, Cloud SQL)

---

## Project Structure

```text
password-manager/
├── frontend/        # React application
├── backend/         # Flask API
├── docs/            # Documentation and reports
├── diagrams/        # Architecture diagrams
├── .env.example     # Example environment variables
├── .gitignore
└── README.md


---

## Getting Started

### 1. Clone the repository

git clone <repo-url>
cd password-manager


---

### 2. Backend Setup (Flask)


cd backend
python -m venv venv
source venv/bin/activate # Mac/Linux
venv\Scripts\activate # Windows

pip install -r requirements.txt


Create a `.env` file based on `.env.example`, then run:


flask run


---

### 3. Frontend Setup (React)


cd frontend
npm install
npm start


---

## Environment Variables

Create a `.env` file in the backend directory using `.env.example` as a template.

⚠️ **Do NOT commit your `.env` file to GitHub**

---

## Git Workflow

- `main` is the protected branch
- Do NOT push directly to `main`
- Create a feature branch for each task:
  - `feature/...`
  - `fix/...`
- Open a Pull Request (PR) for all changes
- At least one approval is required before merging
- Use **squash merge**

---

## Development Guidelines

- Keep commits small and descriptive
- Write clear PR descriptions
- Test your code before merging
- Coordinate changes that affect multiple components

---

## Security Notes

- Sensitive credential data is encrypted on the client before transmission
- Backend does not store plaintext credentials
- MFA is required for account access

---

## Contributors

- Kat Loeffler
- Spencer Lan
- Brandon Mcconathy
- Roman Depyak

---

## License

This project is intended for educational purposes and will be open-source.
