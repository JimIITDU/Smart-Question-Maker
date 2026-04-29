# Fix "Failed to load question" Error

## Root Cause
Database schema mismatch: `question_bank` table missing `coaching_center_id` column

## Tasks

- [x] 1. Create migration script to add `coaching_center_id` column to `question_bank`
- [x] 2. Fix `seed.js` to include `coaching_center_id` in question inserts
- [x] 3. Add `getQuestionById` to `frontend/src/services/api.js`
- [x] 4. Fix `EditQuestion.jsx` - use getQuestionById, fix hardcoded URL, improve error handling
- [x] 5. Fix `QuestionBank.jsx` - show actual error messages
- [ ] 6. Run migration script to fix local database
- [ ] 7. Test the fix


## Commands to Run After Fixes
```bash
# Add missing column to existing database
node backend/scripts/migrateAddCenterId.js

# Or re-initialize completely (loses all data)
node backend/scripts/initDb.js
node backend/scripts/seed.js
