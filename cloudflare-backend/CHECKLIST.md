# ✅ DEPLOYMENT CHECKLIST

## 📋 Pre-deployment

- [ ] Node.js v18+ đã cài đặt
- [ ] Tài khoản Cloudflare đã tạo (free)
- [ ] Git đã commit code mới
- [ ] Backend cũ (Render) vẫn hoạt động (để backup)

## 🔧 Setup

- [ ] `cd cloudflare-backend`
- [ ] `npm install` hoàn thành
- [ ] `npx wrangler login` thành công
- [ ] D1 database đã tạo: `npx wrangler d1 create quiz-game-db`
- [ ] `database_id` đã paste vào `wrangler.toml`

## 💾 Database

- [ ] Schema created: `npx wrangler d1 execute quiz-game-db --remote --file=./schema.sql`
- [ ] Data seeded: `npx wrangler d1 execute quiz-game-db --remote --file=./seed.sql`
- [ ] Verify data: `npx wrangler d1 execute quiz-game-db --remote --command="SELECT COUNT(*) FROM questions"`

## 🚀 Deploy

- [ ] `npm run deploy` thành công
- [ ] Worker URL received: `https://quiz-game-api.*.workers.dev`
- [ ] Test health: `curl https://quiz-game-api.*.workers.dev/api/health`
- [ ] Test sets: `curl https://quiz-game-api.*.workers.dev/api/sets`
- [ ] Test quiz: `curl "https://quiz-game-api.*.workers.dev/api/quiz?setId=1&count=5"`

## 🔗 Frontend Update

- [ ] Vercel dashboard opened
- [ ] Environment Variable added:
  - Name: `VITE_API_URL`
  - Value: `https://quiz-game-api.*.workers.dev/api`
- [ ] Vercel redeployed
- [ ] Frontend test: Play quiz works
- [ ] Frontend test: Admin CRUD works

## ✅ Verification

- [ ] Quiz loads questions
- [ ] Submit quiz shows results
- [ ] Admin can create questions
- [ ] Admin can edit questions
- [ ] Admin can delete questions
- [ ] CSV import works (optional)
- [ ] CSV export works (optional)

## 📊 Monitoring

- [ ] Cloudflare dashboard checked
- [ ] Metrics showing requests
- [ ] No errors in logs: `npm run tail`

## 🗑️ Cleanup (Optional)

- [ ] Backend cũ (Render) đã tắt/xóa
- [ ] Folder `backend/` backup (nếu cần)
- [ ] Update `README.md` với URL mới

## 🎉 Done!

- [ ] Backend free forever
- [ ] Performance < 50ms
- [ ] No credit card needed
- [ ] Auto-scaling
- [ ] Global edge network

---

**Deployment URL:** `_______________________________`

**Deployed by:** `_______________________________`

**Date:** `_______________________________`

**Status:** ✅ SUCCESS / ❌ FAILED / ⏳ IN PROGRESS
