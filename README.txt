CLASSGUARD - BEGINNER SETUP

WHAT THIS PROJECT DOES
- Students can register their name, email, phone, municipality, and education level.
- Registration is stored in students.json on the server.
- An administrator can send an email and SMS update to students whose municipality exactly matches the target municipality.
- Email uses SMTP settings. SMS uses the Semaphore API.
- This is a prototype, not a fully production-ready student information system.

IMPORTANT LIMITATIONS
- It does NOT automatically connect to PAGASA or determine class suspensions.
- A human project administrator must verify the advisory and applicable suspension rules before sending an alert.
- PAGASA weather warnings are not automatically the same as a class suspension announcement.
- Registration does not verify that an email address or phone number belongs to the student.
- Do not collect real student data until you have permission, privacy safeguards, secure hosting, and a proper privacy notice.
- The JSON file is for a small demo only. It is not suitable for a large public deployment or multiple server instances.

REQUIREMENTS
1. A laptop/desktop is easiest.
2. Install Node.js LTS from https://nodejs.org/
3. Open this CLASSGUARD folder in a terminal.
4. Run: npm install
5. Copy .env.example and rename the copy to .env.
6. Put a private value in ADMIN_KEY.
7. Configure SMTP settings and Semaphore API key in .env.
8. Run: npm start
9. Open http://localhost:3000 in your browser.

EMAIL SETUP
Use an SMTP provider/account that permits application sending. Enter the provider's SMTP host, port, username, password/app password, and sender address in .env. Never put these secrets in public HTML or JavaScript. For Gmail, use an app password only if your account is eligible and 2-Step Verification is enabled; do not use your normal Gmail password.

SMS SETUP
Create an account with Semaphore at https://semaphore.co/ and obtain an API key from its dashboard. Add it to SEMAPHORE_API_KEY in .env. Check current pricing, sender-name rules, account requirements, and test with your own number first. SMS costs money.

TEST SAFELY
- Start the server.
- Register using your own test email and phone number, with consent.
- In the admin section, enter the same municipality spelling, your admin key, status, and a test message.
- Send only to your own test details first.
- Check provider dashboards for actual delivery. An API acceptance response is not proof that the recipient received the message.

DEPLOYMENT
Do not upload .env or students.json to a public static host. A real deployment needs a server host, persistent database, HTTPS, access controls, privacy notice, consent/opt-out handling, rate limits, backups, and secure handling of student data. Netlify Drop alone cannot run this Node.js backend.
