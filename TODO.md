# Performance Fix: Coaching Admin Dashboard Navigation

## Problem
Dashboard navigation (dashboard → module → back to dashboard) is slow after previous optimization work.

## Root Causes
1. Backend `getDashboardStats` has sequential queries instead of parallel
2. No frontend caching - dashboard re-fetches data on every mount
3. Frontend re-computations without memoization

## Steps

- [x] Step 1: Backend - Optimize `getDashboardStats` controller (combine redundant queries, make all queries parallel)

- [x] Step 2: Frontend - Add caching, React.memo, and useMemo to `CoachingAdminDashboard.jsx`

- [x] Step 3: Frontend - Optimize `Navbar.jsx` with React.memo
- [x] Step 4: All optimizations implemented - Backend query consolidated, frontend caching added, components memoized


## Files to Edit
1. `backend/controllers/centerController.js`
2. `frontend/src/pages/CoachingAdmin/CoachingAdminDashboard.jsx`
3. `frontend/src/components/Navbar.jsx`
