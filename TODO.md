# Road Complaint Dashboard Fix Plan

## Information Gathered
- SequelizeEagerLoadingError in complaintRoutes.js: User include missing `as: "user"`
- Fix available in complaintRoutes-fixed.js 
- server.js loads `./routes/complaintRoutes` (not -fixed)
- Association in models/index.js: Complaint.belongsTo(User, { as: "user" })

## Plan
1. Replace content of backend/routes/complaintRoutes.js with complaintRoutes-fixed.js content (adds `as: "user"` to all includes)
2. Stop backend server (Ctrl+C in terminal)
3. Restart with `node "Road-Complaint-and-Monitoring-System-main\\backend\\server.js"`

## Dependent Files
- backend/routes/complaintRoutes.js (edit)
- No other changes needed

## Followup steps
1. Test dashboard after restart - complaints should load
2. Verify /api/complaints returns data without errors
3. Check admin dashboard if needed
