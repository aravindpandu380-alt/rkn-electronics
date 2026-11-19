RKN ELECTRICS & ELECTRONICS WEBSITE

This is a complete starter project with a customer booking page and admin dashboard.
It must be hosted on a Node.js server. Opening index.html directly from Downloads will NOT run the API.

DEFAULT ADMIN LOGIN (change before public deployment):
User ID: rknadmin
Password: ChangeMe123!

Run on a computer/server:
1. Install Node.js (18 or newer).
2. Open this project folder in a terminal.
3. Run: npm install
4. Set environment variables ADMIN_USER, ADMIN_PASSWORD, JWT_SECRET.
5. Run: npm start
6. Customer page: http://localhost:3000/
7. Admin page: http://localhost:3000/admin.html

IMPORTANT:
- Change the default admin password and JWT_SECRET before publishing.
- This simple JSON-file storage is suitable only for a small starter deployment; use persistent storage/backups.
- WhatsApp link opens a chat for the admin to message the customer. It does not send automatic notifications.
- A hosting provider with Node.js support and persistent storage is required.
