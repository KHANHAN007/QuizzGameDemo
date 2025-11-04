# Migration Instructions for Cloudflare D1

## Run this migration to add retake feature

```bash
# Navigate to cloudflare-backend folder
cd cloudflare-backend

# Run migration on remote D1 database
npx wrangler d1 execute quiz-game-db --remote --file=migration-add-retake.sql

# Verify changes
npx wrangler d1 execute quiz-game-db --remote --command="SELECT sql FROM sqlite_master WHERE name='assignments'"
npx wrangler d1 execute quiz-game-db --remote --command="SELECT sql FROM sqlite_master WHERE name='submissions'"
```

## What the migration does:

1. Adds `allowRetake` column to assignments (default 0 = one-time)
2. Adds `attemptNumber` column to submissions
3. Removes UNIQUE constraint on submissions to allow multiple attempts
4. Creates new index for faster queries

## After migration:

- Existing assignments will have allowRetake=0 (one-time only)
- New assignments can enable allowRetake via checkbox in UI
- Students can retake assignments if allowRetake=1
