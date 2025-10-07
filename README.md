# stepzero-waiting
A holding version of Step Zero

## Setup

### Cloudflare D1 Database

1. Create a D1 database:
```bash
npx wrangler d1 create stepzero-waitlist
```

2. Initialize the database with the schema:
```bash
npx wrangler d1 execute stepzero-waitlist --file=schema.sql
```

3. Bind the database to your Cloudflare Pages project:
   - Go to your Cloudflare Pages project settings
   - Navigate to "Functions" > "D1 database bindings"
   - Add binding: name `DB`, database `stepzero-waitlist`

### Video File

Place your `bison.mp4` video file in the root directory of the project before deploying.

## Development

This is a static site with Cloudflare Pages Functions. Deploy to Cloudflare Pages to test the full functionality.

## Features

- Single-screen landing page with video background
- Waitlist signup form
- D1 database integration for storing signups
