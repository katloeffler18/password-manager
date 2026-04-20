## Authentication Methods

### Overview
This doc covers the authentication methods used which includes user authentication, MFA concepts, and session handling.

---

### flask-login
Link: https://flask-login.readthedocs.io/en/latest/

**Description:**  
flask-login will be used to authenticate users and manage sessions to keep users logged in.

- Easily integrates with Flask routes which we are already using.
- Simply restrict certain views by adding the login_required decorator.
- Stored the user's ID in the Flask session to keep the user logged in between separate pages.
- Help protect users' sessions from being stolen.

---

### pyotp and smtplib
pyotp link: https://pypi.org/project/pyotp/
smtplib link: https://docs.python.org/3/library/smtplib.html

**Description:**  
pyotp will be used to generate and verify the OTP. smtplib will be used to send the OTP to the user's email.

- pyotp is more secure than some simpler OTP methods because of time based OTPs.
- With smtplib we can easily connect to gmail's SMTP server to send the OTP to the user's email.
- Working together pyotp will generate the OTP, smtplib will send the code to the user's email, then pyotp will verify that the user entered the correct OTP whithin a specified timeframe.

---

### Flask Sessions
Link: https://flask.palletsprojects.com/en/stable/quickstart/#sessions

**Description:**  
Flask sessions will be used to store the user's ID, which will allow user to stay logged in while navigating to different pages on the site.

- Integrates well with flask-login, which manages the session.
- The session is saved when user logs into the site and is saved until the user logs out of the site.
- The session can also be saved if the user closes the tab to the site and comes back later.

---