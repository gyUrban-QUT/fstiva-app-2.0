**Fstiva App**

Fstiva App serves the main purpose of selling music festival tickets to the general public.

System administrators can log on safely and view, create, update and delete tickets available for sale. Administrators can see and modify entries set up by other administrators.

Users can safely sign in, view tickets available for sale, purchase them, or cancel existing purchases. Users cannot create new records, cannot edit existing records and cannot see purchases of other users.

Both users and administrators can update their profile and securely change their password.

**Features**

* Registration (users only)
* User login
* Admin login
* Logout
* Update profile
* Change password
* Create event (admin)
* View event (admin)
* Update event (admin)
* Delete event (admin)
* Book event (user)
* Select payment method and complete mock payment (user)
* Cancel event booking (user)

---

**Prerequisites**

Install the following software before starting:

* [Node.js](https://nodejs.org/en) (LTS recommended)
* [Git](https://git-scm.com/)
* [VS Code](https://code.visualstudio.com/)
* A MongoDB Atlas account with access to the project cluster ([sign up here](https://account.mongodb.com/account/login))

---

**Local Setup**

**1. Clone the repository**

```bash
git clone https://github.com/gyUrban-QUT/fstiva-app-2.0.git
cd fstiva-app-2.0
```

**2. Backend setup**

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder (copy `.env.example` and fill in real values):

```bash
copy .env.example .env
```

Required variables:

MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<shared project JWT secret - ask a team member>
PORT=5001
REACT_APP_API_URL=http://localhost:5001

> **Note:** Your IP address must be whitelisted on the MongoDB Atlas cluster, or the backend will fail to connect. Ask a team member with cluster access to add you under Atlas → Network Access.

Start the backend:

```bash
npm start
```

The server runs on `http://localhost:5001` by default.

**3. Frontend setup**

In a separate terminal:

```bash
cd frontend
npm install
npm start
```

The app opens automatically at `http://localhost:3000`.

---

**Running Tests**

Backend unit tests use Mocha, Chai, and Sinon:

```bash
cd backend
npm test
```

---

**API Testing (Postman)**

A Postman collection covering the backend endpoints is available in the `/postman` folder. Import it into Postman and set the `baseUrl` variable to `http://localhost:5001` (or your deployed API URL) to test endpoints directly.

---

**Contribute to the app via Git**

This project uses a feature-branch workflow off `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/<ticket-id>-<short-description>

# make your changes, then:
git add .
git commit -m "<JIRA-ID>: short description"
git push origin feature/<ticket-id>-<short-description>
```

Open a Pull Request into `develop` on GitHub. Pull requests must be reviewed and approved by another team member before merging.