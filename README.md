# CS467 Secure Password Manager

## Overview

This project is a secure, web-based password manager designed to help users store and manage credentials safely. The system emphasizes security, usability, and transparency through client-side encryption, multi-factor authentication (MFA), and an open-source design.

Vault credential data is encrypted locally within the browser before transmission to the backend API. The backend stores encrypted vault records and does not store plaintext credential data.

---

## Key Features

* User account creation and authentication
* Multi-factor authentication (MFA) using an authenticator application
* Client-side encrypted credential vault
* Password generation tool
* Secure vault CRUD operations
* Search and organization of stored credentials
* Cloud-based deployment

---

## Tech Stack

### Frontend

* React
* JavaScript / HTML / CSS
* Web Crypto API (AES-GCM encryption)
* React Context API
* Bootstrap

### Backend

* Flask
* Flask-JWT-Extended
* Flask-WTF
* SQLAlchemy

### Database

* SQLite (local development)
* PostgreSQL (production)

### Deployment

* Render

---

## Project Structure

```text
password-manager/
├── frontend/
├── backend/
├── docs/
├── diagrams/
├── .env.example
├── .gitignore
└── README.md
```

---

## Prerequisites

Before running the project locally, install:

* Node.js and npm
* Python 3.x
* Git

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repo-url>
cd password-manager
```

---

### 2. Backend Setup (Flask)

```bash
cd backend

python -m venv .venv

# Mac/Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory based on `.env.example`, then start the backend server:

```bash
flask run
```

By default, the backend runs on:

```text
http://localhost:5000
```

---

### 3. Frontend Setup (React)

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

Then install dependencies and start the frontend:

```bash
cd frontend

npm install
npm start
```

By default, the frontend runs on:

```text
http://localhost:3000
```

---

## Running Tests

### Frontend Tests

```bash
cd frontend
npm test
```

### Backend Tests

```bash
cd backend
python -m pytest routes/tests
```

---

## Environment Variables

Create `.env` files in the frontend and backend directories using the provided examples and required configuration values.

⚠️ Do NOT commit `.env` files or sensitive credentials to GitHub.

---

## Documentation

Additional technical documentation can be found in the `/docs` directory:

* `docs/frontend-encryption-architecture.md` — Frontend encryption design, authentication flow, and encrypted vault payload architecture

---

## Security Notes

* Sensitive vault data is encrypted on the client before transmission
* The backend stores encrypted vault payloads only
* Vault decryption occurs only within the frontend browser session
* The user's login password functions as the vault master password
* Vault passwords are stored only in frontend memory during the active session
* MFA is required for account access
* JWT authentication is used for protected API routes

---

## Git Workflow

* `main` is the protected branch
* Do not push directly to `main`
* Create a feature branch for each task:

  * `feature/...`
  * `fix/...`
  * `docs/...`
* Open a Pull Request (PR) for all changes
* At least one approval is required before merging
* Use squash merge

---

## Development Guidelines

* Keep commits small and descriptive
* Write clear PR descriptions
* Test code before merging
* Coordinate changes that affect multiple components

---

## Contributors

* Kat Loeffler
* Spencer Lan
* Brandon Mcconathy
* Roman Depyak

---

## License

This project was developed for educational purposes and is intended to be open source.
