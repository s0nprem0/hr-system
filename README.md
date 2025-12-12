## 🛡️ Security Features

This application implements industry-standard security practices to ensure data integrity and access control:

* **Role-Based Access Control (RBAC):** Strict segregation of duties between Admin, HR, Employee, and Manager roles. Routes and API endpoints are protected using middleware that verifies user permissions before granting access.
* **JWT Authentication:** Stateless authentication using JSON Web Tokens (JWT). Tokens are signed securely on the server and verified on every protected request.
* **Password Encryption:** User passwords are never stored in plain text. We use **Bcrypt** to hash and salt passwords before storage, protecting against rainbow table attacks.
* **Data Masking:** Sensitive information (such as salaries and personal identifiers) is visually masked by default on the frontend, requiring explicit user action ("eye toggle") to view, preventing shoulder-surfing leaks.
* **Audit Logging:** Critical actions, specifically changes to sensitive financial data (Salary), are recorded in an immutable audit log. This tracks *who* made the change, *when*, and the *previous vs. new values*.

## 🛠️ Technical Stack

**Frontend:**
* **Framework:** React 19 (via Vite) for a fast, responsive user interface.
* **Language:** TypeScript for type safety and maintainable code.
* **Styling:** Tailwind CSS v4 for utility-first, responsive design.
* **State Management:** React Context API for handling Authentication state globally.
* **Routing:** React Router v7 for managing protected routes and navigation.

**Backend:**
* **Runtime:** Bun (v1.3.4) for high-performance JavaScript execution.
* **Framework:** Express.js for RESTful API routing and middleware management.
* **Database:** MongoDB (via Mongoose) for flexible, schema-based data modeling.
* **Authentication:** `jsonwebtoken` for auth flow and `bcryptjs` for security.
