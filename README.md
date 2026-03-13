# JobClaw - Global Talent Explorer

**A project by Gaurav Ghai** — [LinkedIn](https://www.linkedin.com/in/gauravvghai/) | [Instagram](https://www.instagram.com/thegauravghai/)

An interactive 3D globe that visualizes job listings worldwide. Explore opportunities across countries, filter by role/type, and apply directly — all from a single interface.

Built with **Next.js 16**, **react-globe.gl**, **MongoDB**, and **Tailwind CSS**.

![JobClaw](https://img.shields.io/badge/JobClaw-Global%20Talent%20Explorer-00E5A0?style=for-the-badge)

## Features

- Interactive 3D globe with job pins placed at real lat/lng coordinates
- Country-level color coding by region with job counts
- Click a country to see all jobs, click a pin to see job details
- Filter jobs by role, country, remote, and internship
- Email verification (OTP via AWS SES) before applying
- Job import from JSearch API (RapidAPI)
- Auto-rotating globe that pauses on hover
- Fully responsive dark theme UI

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React, TypeScript |
| 3D Globe | react-globe.gl, Three.js |
| Styling | Tailwind CSS |
| Database | MongoDB |
| Job Data | JSearch API (RapidAPI) |
| Email | AWS SES |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (local or cloud — [MongoDB Atlas](https://www.mongodb.com/atlas) free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/jobclaw.git
cd jobclaw
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# MongoDB (required)
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/jobglobe?retryWrites=true&w=majority

# RapidAPI - JSearch (required for job import)
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=jsearch.p.rapidapi.com

# AWS SES - Email verification (optional for local dev)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_SES_FROM_EMAIL=no-reply@yourdomain.com
```

### 4. Load sample data

To get started quickly without API keys, import the sample data into your MongoDB:

```bash
mongoimport --uri "your_mongodb_uri" --collection jobs --file sample-data.json --jsonArray
```

Or manually insert the documents from `sample-data.json` using MongoDB Compass or the Mongo shell.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the globe.

---

## API Keys Setup

### MongoDB (Required)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database called `jobglobe`
3. Create a collection called `jobs`
4. Get your connection string and add it to `MONGODB_URI`

### JSearch API (Required for importing jobs)

1. Go to [RapidAPI - JSearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
2. Subscribe to the free plan (500 requests/month)
3. Copy your API key from the RapidAPI dashboard
4. Add it to `RAPIDAPI_KEY` in `.env.local`

### AWS SES (Optional - for email verification)

The email verification gate requires AWS SES. If you don't set this up, you can bypass it for local development by setting `jobclaw_verified` to `true` in your browser's localStorage:

```js
// Run this in browser console to bypass email verification locally
localStorage.setItem("jobclaw_verified", "true");
```

To set up AWS SES properly:

1. Create an AWS account
2. Go to SES in the AWS Console
3. Verify your sender email/domain
4. Create IAM credentials with SES send permissions
5. Add the keys to `.env.local`

---

## Sample Data

The `sample-data.json` file contains 3 sample job listings (US, India, UK) that you can load into your database to test the app without needing the JSearch API.

Each job document has this structure:

```json
{
  "job_id": "unique-id",
  "job_title": "Software Developer",
  "employer_name": "Company Name",
  "employer_logo": "https://...",
  "job_employment_type": "Full-time",
  "job_apply_link": "https://...",
  "job_description": "...",
  "job_is_remote": false,
  "job_city": "City",
  "job_state": "State",
  "job_country": "US",
  "job_latitude": 38.88,
  "job_longitude": -77.09,
  "skills": ["JavaScript", "React"],
  "experience_level": "Mid Level",
  "source": "LinkedIn"
}
```

---

## Project Structure

```
jobclaw/
├── app/
│   ├── api/
│   │   ├── auth/          # OTP send & verify endpoints
│   │   ├── import/        # Job import from JSearch API
│   │   └── jobs/          # Job listing endpoints
│   ├── job-import/        # Import page UI
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (globe)
│   └── globals.css        # Global styles
├── components/
│   ├── Auth/              # Email verification modal
│   ├── Filter/            # Filter dialog
│   ├── Globe/             # 3D globe component
│   ├── Header/            # Header with stats & filter
│   └── Sidebar/           # Job list & detail sidebar
├── hooks/
│   └── useGlobeState.ts   # Globe state management
├── lib/
│   ├── constants.ts       # Country names, flags, colors
│   ├── mongodb.ts         # MongoDB connection singleton
│   └── types.ts           # TypeScript interfaces
├── sample-data.json       # Sample job data for testing
├── .env.example           # Environment variables template
└── next.config.ts         # Next.js configuration
```

---

## Importing Jobs

1. Navigate to `/job-import` or use the Import page
2. Select a job category, country, date range, and number of jobs
3. Click **Import Jobs** to fetch from JSearch API and store in MongoDB
4. Jobs appear on the globe automatically

---

## Security

- All API keys stored in `.env.local` (gitignored)
- OTP codes are SHA-256 hashed before storing in database
- Cryptographically secure OTP generation (`crypto.randomInt`)
- Rate limiting on OTP endpoints (5 requests/hour per email)
- Brute force protection (locks after 5 failed OTP attempts)
- XSS protection with HTML escaping on all user-generated content
- Input validation on all API endpoints
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Restricted image source whitelist

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT
