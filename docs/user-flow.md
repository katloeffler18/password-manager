# User Flow Specification (Subject to Change)

## 1. High-Level User Flow
This flow describes the path a user takes from initial discovery to active vault management.

1.  Landing Page (Entry)
    - Action: User arrives at the root URL.
    - UI Elements: "Sign In" and "Get Started (Sign Up)" buttons are visible.

2.  Account Registration
    - Action: User clicks "Get Started"
    - Process: User enters Email and creates a Master Password.
        - Client-Side: React generates a unique salt and derives the Master Key.
        - MFA Setup: User registers an MFA method as per project requirements.
        - Result: Encrypted initial vault blob and salt are sent to registration API endpoint.

3.  Authentication (Login)
    - Action: User enters Email.
    - Process: - Frontend fetches the user's Salt from API endpoint.
        - User enters Master Password.
        - React derives the key locally and requests the token and Encrypted Vault from login API endpoint.
    - State Management: encrypted vault is loaded into React state.

4.  Dashboard
    - Action: User is redirected to dashboard API endpoint.
    - UI Elements:
        - Search Bar: Real time credential filtering.
        - Credential List: Displays masked entries (hides important data from prying eyes).
        - "Add New" Button

5.  Credential Retrieval & Addition
    - Retrieve: User clicks "Reveal" or "Copy" -> React uses the Master Key in memory to decrypt the specific entry.
    - Add: User enters site details -> React encrypts data locally -> POST to password addition API endpoint.

---

## 2. UI/UX Requirements Mapping
1. Consistent component library and clear typography
2. Simplify MFA setup and password creation
3. Avoid unnecessary backend calls when implementing search logic (client-side focused)
4. Ensure sensitive data (plaintext passwords) never persists in local storage
