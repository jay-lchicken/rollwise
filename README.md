# 🗓️ Event Attendance Tracker

A simple web application to track attendance using PostgreSQL and Clerk authentication.

---

## 🚀 Getting Started

To start the development server, run one of the following commands:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
Then, open http://localhost:3000 in your browser to view the application.

You can begin editing the project by modifying the file at:
```bash
app/page.js
```
The page will automatically reload as you make changes.


# 🏗️ Self-Hosting

To run this project on your own infrastructure:

1. Set Up a PostgreSQL Database

Run the following SQL to create the required tables:
```sql
CREATE TABLE IF NOT EXISTS public.events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    hashed_userid_email TEXT,
    dateadded TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.mark (
    event_id VARCHAR NOT NULL,
    hashed_userid_email VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    name VARCHAR,
    isattended BOOLEAN DEFAULT FALSE NOT NULL,
    dateadded TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_event_email UNIQUE (event_id, email)
);
```
You can run this SQL using a GUI like DataGrip, pgAdmin, or via psql in the terminal.

2. Set Up Clerk for Authentication
	•	Go to https://clerk.com and create a project.
	•	Obtain your Publishable Key and Secret Key from the Clerk dashboard.
	•	Configure allowed redirect URLs to include your local or deployed domain.

3. Configure Environment Variables

Create a .env file in the root directory of your project and add the following:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLIC_KEY
CLERK_SECRET_KEY=YOUR_CLERK_SECRET_KEY

PG_HOST=YOUR_DATABASE_HOST
PG_PORT=YOUR_DATABASE_PORT
PG_USER=YOUR_DATABASE_USER
PG_PASSWORD=YOUR_DATABASE_PASSWORD
PG_DATABASE=YOUR_DATABASE_NAME
```

