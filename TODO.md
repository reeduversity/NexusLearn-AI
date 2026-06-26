# TODO - Phase 8 (Exams: PYQ Analyzer, Viva Mode, Mock Tests)

## Step 1 - Verify current Phase 8 wiring
- [x] Checked Phase 8 pages: app/exams/page.tsx, app/mock-tests/page.tsx, app/pyq/page.tsx, app/viva/page.tsx, app/practice/page.tsx
- [x] Confirmed UI buttons/inputs have no handlers
- [x] Confirmed app/api has no route handlers
- [x] Confirmed actions/ only has auth.ts and wellbeing.ts

## Step 2 - Select and implement backend approach
- [ ] Implement using API routes (user approved option 2)
- [ ] Add: app/api/exams/mock-tests/route.ts (generate mock test)
- [ ] Add: app/api/exams/viva/route.ts (create viva session / start)
- [ ] Add: app/api/exams/practice/route.ts (create practice session)
- [ ] Add: app/api/exams/pyq/upload/route.ts (accept upload + start processing or store metadata)

## Step 3 - Update services/exam.service.ts if needed
- [ ] Ensure generateMockTest returns consistent content structure for UI

## Step 4 - Update Phase 8 pages to call the API routes
- [ ] app/mock-tests/page.tsx: wire Generate/Resume/Start actions
- [ ] app/viva/page.tsx: wire Start Viva + topic selection
- [ ] app/practice/page.tsx: wire New Session + topic Play
- [ ] app/pyq/page.tsx: wire Upload input

## Step 5 - Add loading/error UI + validation
- [ ] Add minimal UI feedback (disabled button, status messages)

## Step 6 - Manual verification
- [ ] Confirm Supabase RLS compliance (user_id is enforced)
- [ ] Confirm DB writes: mock_tests, viva_sessions, practice_sessions, pyq_papers

