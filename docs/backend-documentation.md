# Backend API Documentation

# Overview

This backend API provides:

- User authentication with JWT
- Two-factor authentication (2FA) using OTP email verification
- Secure encrypted vault storage
- CRUD operations for vault items

Built with:

- Flask
- Flask-JWT-Extended
- SQLAlchemy
- PyOTP

---

# Base URL

```http
http://localhost:5000
```

---

# Authentication Flow

1. Register a user
2. Login with email/password
3. Receive OTP via email
4. Verify OTP
5. Receive JWT token
6. Use JWT token for protected vault endpoints

---

# Authentication Endpoints

## Register User

Creates a new user account and generates an OTP secret.

### Endpoint

```http
POST /register
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

### Success Response

**Status:** `201 Created`

```json
{
  "message": "User registered",
  "otp_secret": "BASE32SECRETKEY"
}
```

### Error Responses

#### Missing Email or Password

**Status:** `400 Bad Request`

```json
{
  "error": "Email and password required"
}
```

#### User Already Exists

**Status:** `400 Bad Request`

```json
{
  "error": "User already exists"
}
```

---

## Login User

Validates credentials and sends an OTP code to the user's email.

### Endpoint

```http
POST /login
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

### Success Response

**Status:** `200 OK`

```json
{
  "message": "OTP sent"
}
```

### Error Response

#### Invalid Credentials

**Status:** `401 Unauthorized`

```json
{
  "error": "Invalid credentials"
}
```

### Notes

- OTP expires in 10 minutes
- OTP is emailed to the user
- Uses Gmail SMTP server

---

## Verify OTP

Verifies the OTP and returns a JWT token.

### Endpoint

```http
POST /verify-otp
```

### Request Body

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Success Response

**Status:** `200 OK`

```json
{
  "token": "JWT_TOKEN"
}
```

### Error Responses

#### User Not Found

**Status:** `404 Not Found`

```json
{
  "error": "User not found"
}
```

#### Invalid OTP

**Status:** `401 Unauthorized`

```json
{
  "error": "Invalid OTP"
}
```

---

## Health Check

Simple endpoint to verify backend connectivity.

### Endpoint

```http
GET /
```

### Success Response

**Status:** `200 OK`

```json
{
  "status": "online",
  "message": "Backend is communicating with Frontend!"
}
```

---

# Vault Endpoints

All vault endpoints require JWT authentication.

---

# Authentication Header

Include the JWT token in all protected requests:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Save Vault Item

Stores encrypted vault data.

### Endpoint

```http
POST /save
```

### Request Body

```json
{
  "title": "Google Account",
  "data": "ENCRYPTED_PAYLOAD",
  "iv": "INITIALIZATION_VECTOR",
  "salt": "OPTIONAL_SALT"
}
```

### Success Response

**Status:** `201 Created`

```json
{
  "message": "Saved successfully",
  "id": 1
}
```

### Validation Rules

#### Title

- Must be a string
- Cannot be empty
- Maximum 100 characters

#### Data

- Must be a string
- Cannot be empty
- Maximum 65535 characters

#### IV

- Must be a string
- Cannot be empty
- Maximum 256 characters

#### Salt

- Optional
- Must be a string if provided
- Maximum 256 characters

### Error Responses

#### Missing Fields

**Status:** `400 Bad Request`

```json
{
  "error": "Missing required fields: title, data, or iv"
}
```

#### Invalid JSON

```json
{
  "error": "Invalid or missing JSON body"
}
```

#### Internal Server Error

```json
{
  "error": "Internal server error saving to vault"
}
```

---

## Get Vault Items

Returns all vault items belonging to the authenticated user.

### Endpoint

```http
GET /vault
```

### Success Response

**Status:** `200 OK`

```json
[
  {
    "id": 1,
    "title": "Google Account",
    "data": "ENCRYPTED_PAYLOAD",
    "iv": "INITIALIZATION_VECTOR",
    "salt": "OPTIONAL_SALT",
    "updated_at": "2026-05-28T12:00:00"
  }
]
```

---

## Update Vault Item

Updates an existing vault item.

### Endpoint

```http
PUT /update/{item_id}
```

### Request Body

All fields are optional.

```json
{
  "title": "Updated Account",
  "data": "UPDATED_ENCRYPTED_PAYLOAD",
  "iv": "UPDATED_IV",
  "salt": "UPDATED_SALT"
}
```

### Success Response

**Status:** `200 OK`

```json
{
  "message": "Updated successfully"
}
```

### Error Responses

#### Vault Item Not Found

**Status:** `404 Not Found`

```json
{
  "error": "Vault item not found"
}
```

#### Validation Error

**Status:** `400 Bad Request`

```json
{
  "error": "Title must be under 100 characters"
}
```

#### Update Failure

**Status:** `500 Internal Server Error`

```json
{
  "error": "Failed to update vault item"
}
```

---

## Delete Vault Item

Deletes a vault item.

### Endpoint

```http
DELETE /delete/{item_id}
```

### Success Response

**Status:** `200 OK`

```json
{
  "message": "Deleted successfully"
}
```

### Error Responses

#### Vault Item Not Found

**Status:** `404 Not Found`

```json
{
  "error": "Vault item not found"
}
```

#### Delete Failure

**Status:** `500 Internal Server Error`

```json
{
  "error": "Failed to delete vault item"
}
```

---

# Security Features

## JWT Authentication

Protected routes require a valid JWT token.

---

## Two-Factor Authentication (2FA)

- OTP generated using TOTP
- OTP delivered through email
- OTP expires after 10 minutes

---

## IDOR Protection

Vault routes verify ownership using:

```python
Vault.query.filter_by(id=item_id, user_id=user_id)
```

This prevents users from accessing or modifying other users’ data.

---

## Input Validation

All vault fields are validated for:

- Type safety
- Empty values
- Maximum lengths

---

# Environment Variables

The application requires:

```env
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
JWT_SECRET_KEY=your_secret_key
SECRET_KEY=your_secret_key
```

# Testing Process

The backend API is tested using the `pytest` framework to ensure:

- Authentication works correctly
- JWT protection is enforced
- Vault CRUD operations behave properly
- Validation errors are handled correctly
- Security protections work as expected

The tests are designed to validate both successful requests and failure scenarios.

---

# Running Tests

Run all tests:

```bash
pytest
```
