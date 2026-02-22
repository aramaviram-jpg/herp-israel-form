# Herp Israel Project - Comprehensive Guide

**Complete Documentation for Wildlife Reporting System**  
Last Updated: February 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Account Management](#account-management)
4. [Admin Dashboard Guide](#admin-dashboard-guide)
5. [Data Management](#data-management)
6. [Species Management](#species-management)
7. [Legacy Data Import](#legacy-data-import)
8. [Maintenance & Monitoring](#maintenance--monitoring)
9. [Technical Reference](#technical-reference)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

### Purpose
Community-driven citizen science platform for tracking reptile and amphibian sightings across Israel.

### Key Features
- Mobile-friendly public submission form
- GPS location capture (auto, manual, or map selection)
- Photo uploads (stored as Google Drive links)
- Admin dashboard with validation workflow
- Interactive map visualization
- Data export (CSV)
- Multi-admin support

### Technology Stack
- **Frontend:** HTML, JavaScript, Leaflet (maps)
- **Backend:** Supabase (PostgreSQL database)
- **Hosting:** Vercel (GitHub auto-deploy)
- **Storage:** Supabase Storage (photos)
- **Version Control:** GitHub

---

## System Architecture

### Component Diagram

```
┌─────────────────┐
│   Public Form   │ → herp-israel-form.vercel.app
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│    Supabase     │ → Database + Storage + Auth
│   (PostgreSQL)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Admin Dashboard │ → /admin.html
└─────────────────┘
```

### Data Flow

**Public Submission:**
1. User fills form → herp-israel-form.vercel.app
2. Photos uploaded to Supabase Storage
3. Data inserted into `reports` table
4. Status = "Pending Review"

**Admin Validation:**
1. Admin logs in → /admin.html
2. Views pending reports
3. Validates/rejects with notes
4. Status updated in database

---

## Account Management

### Supabase Account

**Purpose:** Database, storage, authentication

**Access:**
- URL: https://supabase.com
- Project: herp-israel
- Dashboard: https://supabase.com/dashboard/project/qobayftqligpshmyweio

**Key Sections:**
- **Table Editor:** View/edit data directly
- **Authentication:** Manage admin users
- **Storage:** View uploaded photos
- **Database:** Monitor size and performance
- **SQL Editor:** Run custom queries

### Vercel Account

**Purpose:** Website hosting and deployment

**Access:**
- URL: https://vercel.com
- Login: Via GitHub (no separate password)
- Project: herp-israel-form

**Key Features:**
- Auto-deploys from GitHub commits
- Shows deployment history
- Provides analytics
- Custom domain support (future)

### GitHub Account

**Purpose:** Source code storage and version control

**Repository:** herp-israel-form

**Files:**
- `index.html` - Public submission form
- `admin.html` - Admin dashboard
- `vercel.json` - Deployment configuration

**Workflow:**
1. Edit files on GitHub
2. Commit changes
3. Vercel auto-deploys (30 seconds)
4. Live site updates

### Admin Users

**Managed in:** Supabase → Authentication → Users

**Current Admins:**
- aram.aviram@gmail.com (you)
- [Other admin emails]

**Adding New Admin:**
1. Supabase → Authentication → Users
2. "Add user" → "Create new user"
3. Enter email and password
4. ✅ **Important:** Check "Auto Confirm User"
5. Click "Create user"
6. Manually share credentials (no email sent)

---

## Admin Dashboard Guide

### Login

**URL:** https://herp-israel-form.vercel.app/admin.html

**Process:**
1. Enter admin email (from Supabase users)
2. Enter password
3. Click "התחבר"

**Important:** After using admin dashboard, click "התנתק" (logout) before testing public form - otherwise you'll get permission errors.

### Dashboard Overview

**Statistics Cards (Top):**
- Total Reports
- Pending Review (needs attention)
- Validated
- Rejected

**Filters Section:**
- Status dropdown
- Family dropdown
- Species dropdown
- Date range (from → to)
- Apply / Clear buttons
- Export buttons (All / Filtered)

**Map Section:**
- Shows ALL sightings with GPS
- Color-coded by status:
  - 🟠 Orange = Pending Review
  - 🟢 Green = Validated
  - 🔴 Red = Rejected
- Click markers to view details
- Draw area tool for filtering

**Reports Table:**
- Shows 100 records per page
- Columns: Date, Reporter, Species, Quantity, Location, Status, Actions
- Pagination at bottom
- "צפה" button opens detail modal

### Viewing Report Details

**Click "צפה" to open modal:**

**Report Information:**
- Reporter name and contact
- Date and time
- Species (editable - click to change)
- Number of individuals
- GPS coordinates (if available)
- Location description
- Sighting details
- Additional comments
- Photo gallery (click to enlarge)

**Validation Actions:**
- **אמת (Validate):** Marks as validated, adds your email & timestamp
- **דחה (Reject):** Marks as rejected
- **חזור לממתין (Return to Pending):** Resets status
- **Validation Notes:** Optional notes field

**Editing Species:**
- Click on species name
- Dropdown appears with all 102 species
- Select correct species
- Auto-saves

### Using Filters

**Status Filter:**
- ממתין לאימות (Pending Review)
- מאומת (Validated)  
- נדחה (Rejected)

**Family Filter:**
- Shows all taxonomic families
- E.g., "Viperidae צפעיים"

**Species Filter:**
- All 102 species in Hebrew

**Date Range:**
- מתאריך (From)
- עד תאריך (To)

**Applying Filters:**
1. Select filter values
2. Click "החל סינון"
3. Both map and table update
4. Pagination resets to page 1

**Clearing Filters:**
- Click "נקה" to reset all

### Map Features

**View All Sightings:**
- Automatically centers on Israel
- Zooms to show all pins
- Loads all records (may take a few seconds for 6000+ pins)

**Area Selection:**
1. Click "📐 בחר אזור במפה"
2. Cursor changes to crosshair
3. Click once to start rectangle
4. Move mouse to desired corner
5. Click again to finish
6. Green rectangle appears
7. Map and table filter to that area
8. Shows count: "סה״כ תצפיות נכפות: 22"

**Clear Area:**
- Click "✖ נקה בחירת אזור" button
- Removes rectangle and filter

**Overlapping Markers:**
- When multiple reports at same location
- Popup shows: "X דיווחים במיקום זה"
- Lists all reports
- Each has "צפה בדיווח" button

### Pagination

**Table Shows:**
- 100 records per page
- Bottom displays: "מציג 1-100 מתוך 6110 דיווחים"
- Current page / total pages: "עמוד 1 מתוך 62"

**Navigation:**
- "← הקודם" (Previous)
- "הבא →" (Next)
- Buttons disabled when at first/last page

**Important:** Map ALWAYS shows ALL records, not just current page

### Export Data

**Export All (ייצא הכל ל-CSV):**
- Fetches ALL records from database
- Ignores current filters
- Downloads complete dataset
- Filename: `reports_all.csv`
- Shows progress: "מייצא את כל הנתונים..."

**Export Filtered (ייצא מסונן ל-CSV):**
- Exports all records matching current filters
- If 500 records match filter → exports all 500
- Filename: `reports_filtered.csv`

**CSV Columns:**
- תאריך (Date)
- שעה (Time)
- שם מדווח (Reporter Name)
- מין (Species - Hebrew)
- שם מדעי (Scientific Name)
- משפחה (Family)
- כמות (Quantity)
- קו רוחב (Latitude)
- קו אורך (Longitude)
- תיאור מיקום (Location Description)
- פרטי תצפית (Sighting Details)
- הערות (Comments)
- פרטי קשר (Contact Details)
- סטטוס (Status)
- אומת ע"י (Validated By)
- הערות אימות (Validation Notes)

---

## Data Management

### Database Schema

**Tables:**

**1. species**
- `id` (integer, primary key)
- `common_name` (text) - Hebrew name
- `scientific_name` (text)
- `family` (text) - Taxonomic family
- **Records:** 102 species

**2. reports**
- `id` (integer, primary key)
- `created_at` (timestamp)
- `full_name` (text) - Reporter name
- `date` (date) - Sighting date
- `time` (time) - Sighting time
- `species_id` (foreign key → species)
- `number_of_individuals` (text) - "1", "2", ..., "10", "Many", "Unknown count"
- `latitude` (numeric) - GPS coordinate
- `longitude` (numeric) - GPS coordinate
- `location_description` (text)
- `sighting_details` (text)
- `photo_urls` (json array) - Google Drive links
- `additional_comments` (text)
- `contact_details` (text)
- `status` (text) - "Pending Review", "Validated", "Rejected"
- `validated_by` (text) - Admin email
- `validated_at` (timestamp)
- `validation_notes` (text)

### Backup Procedures

**Monthly Backup (Required):**

1. **CSV Export:**
   - Login to admin dashboard
   - Click "ייצא הכל ל-CSV"
   - Save file: `reports_backup_YYYY-MM.csv`
   - Store on computer + external drive/cloud

2. **Database Dump:**
   - Supabase → SQL Editor
   - Run: `SELECT * FROM reports;`
   - Export results as CSV
   - Save: `reports_db_YYYY-MM.csv`

3. **Species List:**
   - Supabase → SQL Editor
   - Run: `SELECT * FROM species;`
   - Export as CSV
   - Save: `species_YYYY-MM.csv`

**Storage Locations:**
- Computer: Documents/HerpIsrael/Backups/
- Cloud: Google Drive/Backups/
- External: USB drive/SD card

**Retention:**
- Keep last 12 months locally
- Keep all-time in cloud
- Archive old backups annually

### Data Recovery

**If Supabase fails or data lost:**

1. **Restore from CSV:**
   - Create new Supabase project
   - Create tables (use SQL from Technical Reference)
   - Import CSV data

2. **Update Connection:**
   - Get new Supabase URL and keys
   - Update in index.html and admin.html
   - Push to GitHub
   - Vercel auto-deploys

**Total recovery time:** 2-3 hours

---

## Species Management

### Current Species List

**Total:** 102 species
**Categories:** Reptiles and Amphibians native to Israel

**Families Include:**
- Viperidae (Vipers)
- Colubridae (Colubrids)
- Gekkonidae (Geckos)
- Lacertidae (Lizards)
- Scincidae (Skinks)
- Salamandridae (Salamanders)
- Ranidae (Frogs)
- Bufonidae (Toads)
- Testudinidae (Tortoises)
- And more...

### Adding New Species

**Method 1: Supabase UI**
1. Supabase → Table Editor → species
2. Click "Insert row"
3. Fill fields:
   - `common_name`: Hebrew name
   - `scientific_name`: Latin name
   - `family`: Taxonomic family (Hebrew + Latin)
4. Click "Save"

**Method 2: SQL**
```sql
INSERT INTO species (common_name, scientific_name, family)
VALUES ('אילנית הגולן', 'Hyla felixarabica', 'Hylidae אילניתיים');
```

**Changes appear immediately** in public form and admin dashboard.

### Editing Species

1. Supabase → Table Editor → species
2. Find species row
3. Click on cell to edit
4. Enter new value
5. Press Enter to save

**Note:** Changing species names automatically updates all linked reports (via `species_id` foreign key).

### Species Name Changes Over Time

**Challenge:** Taxonomy changes; old reports have outdated names

**Current Solution:**
- Legacy imports store original name in `validation_notes`
- All records linked to current species via `species_id`
- Name updates propagate automatically

**Future Enhancement:**
- Create `species_synonyms` table
- Track historical names
- Enable searches by old names

---

## Legacy Data Import

### Overview

**Purpose:** Import historical sighting data from Google Sheets/Excel into database

**Process:**
1. Export Google Sheet to Excel (.xlsx)
2. Map old species names to current names
3. Run Python processing script
4. Run Node.js import script
5. Validate imported data

### Prerequisites

**Required Software:**
- Node.js (https://nodejs.org)
- Python 3
- npm packages: `@supabase/supabase-js`

**Required Files:**
- Legacy Excel file
- Species mapping (if names changed)
- Import scripts (provided)

### Step 1: Prepare Data

**Export from Google Sheets:**
1. Open your legacy Google Sheet
2. File → Download → Microsoft Excel (.xlsx)
3. Save as: `legacy_data.xlsx`

**Check Required Columns:**
- Reporter name
- Date (any format)
- Species name (Hebrew)
- Location description
- GPS coordinates (optional)
- Photo links (Google Drive URLs)

### Step 2: Species Mapping

**If legacy data has different species names:**

Create mapping file: `species_mapping.txt`

```
Old Name → Current Name
---
גדילה מצויה → סלמנדרה כתומה
צפע → צפע מצוי
נחש המים → נחש מים
```

**Work with Claude to:**
1. Compare legacy names vs. current species table
2. Identify unmatched names
3. Map each old name to current name
4. Handle uncertain/combined records

### Step 3: Process Data

**Run Python script:**
```bash
python3 import_legacy_data.py
```

**Output:**
- `legacy_import_final.json` - Processed records ready for import
- Shows summary: X records to import, Y skipped

**Review Output:**
- Check species mapping worked
- Verify dates parsed correctly
- Confirm GPS coordinates valid

### Step 4: Import to Supabase

**Get Service Role Key:**
1. Supabase → Settings → API
2. Copy "service_role" key (NOT anon key)
3. Edit `import_to_supabase.js`
4. Paste key in line 13

**Run Import:**
```bash
npm install @supabase/supabase-js
node import_to_supabase.js
```

**Monitor Progress:**
- Shows batch numbers (1/9, 2/9, etc.)
- Reports success/errors per batch
- Takes 2-3 minutes for 4000 records

**Expected Output:**
```
Loading legacy data...
Total records to import: 4047
Fetching species IDs...
Loaded 102 species mappings
Prepared 4047 records for insert
Importing batch 1/9 (500 records)...
✅ Batch 1 imported successfully
...
=== IMPORT COMPLETE ===
✅ Successfully imported: 4047 records
❌ Errors: 0
```

### Step 5: Validate Import

**Check Record Count:**
```sql
SELECT COUNT(*) FROM reports;
```
Should match expected number.

**Check Date Range:**
```sql
SELECT MIN(date), MAX(date) FROM reports;
```
Verify dates are reasonable.

**Check Species Distribution:**
```sql
SELECT species.common_name, COUNT(*) 
FROM reports 
JOIN species ON reports.species_id = species.id 
GROUP BY species.common_name 
ORDER BY COUNT(*) DESC 
LIMIT 20;
```

**Spot Check:**
- View 10-20 random records in admin dashboard
- Verify species names correct
- Check GPS coordinates on map
- Confirm photos link to Google Drive

### Common Issues

**Issue: "species not found"**
- Solution: Add missing species to species table
- Or update mapping to use existing species

**Issue: "date/time field out of range"**
- Solution: Date format malformed in Excel
- Python script should handle most formats
- Manually fix problematic dates

**Issue: "numeric field overflow"**
- Solution: GPS coordinates outside valid range
- Script sets to NULL for invalid coordinates

---

## Maintenance & Monitoring

### Daily Tasks

**Check Pending Reports:**
- Login to admin dashboard
- Review "ממתינים לאימות" count
- Validate new submissions

**Expected Volume:**
- 0-5 reports per day (depends on season/activity)

### Weekly Tasks

**Review Rejected Reports:**
- Check if any need reconsideration
- Add feedback notes for reporters

**Monitor Trends:**
- Which species being reported most?
- Any unusual sightings?
- Geographic patterns?

### Monthly Tasks

**Backup Data:** (Critical!)
- Export CSV
- Save locally + cloud
- Verify backup file opens correctly

**Check Database Size:**
- Supabase → Database → Usage
- Current: ~100MB
- Free tier limit: 500MB
- Alert at: 400MB

**Review Admin Users:**
- Remove inactive admins
- Update passwords if needed

**Test Form:**
- Submit test sighting
- Verify photos upload
- Check notification emails (if implemented)

### Quarterly Tasks

**Species List Review:**
- Any new species to add?
- Taxonomy changes?
- Update scientific names if needed

**Data Quality Check:**
- Run validation queries
- Check for duplicate reports
- Verify GPS accuracy

**Performance Review:**
- Website load time
- Dashboard responsiveness
- Export speed

### Monitoring Checklist

```
[ ] Website is online (herp-israel-form.vercel.app)
[ ] Admin dashboard loads
[ ] Can login successfully
[ ] Form accepts submissions
[ ] Photos upload correctly
[ ] Map displays sightings
[ ] Export functions work
[ ] Database size under 400MB
[ ] Recent backup exists
[ ] All admins have access
```

---

## Technical Reference

### Database Connection

**Supabase URL:**
```
https://qobayftqligpshmyweio.supabase.co
```

**Anon Key (Public):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvYmF5ZnRxbGlncHNobXl3ZWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTEzMDcsImV4cCI6MjA4NzA4NzMwN30.u69AQLyyrXJvgBLTUO9ZpMvpd6dbqTDNj9Z_0RSctps
```
(Safe to include in public code)

**Service Role Key:**
[Stored securely - never commit to GitHub]

### SQL Queries

**Get All Reports:**
```sql
SELECT 
    r.*,
    s.common_name,
    s.scientific_name,
    s.family
FROM reports r
LEFT JOIN species s ON r.species_id = s.id
ORDER BY r.created_at DESC;
```

**Count by Status:**
```sql
SELECT status, COUNT(*) 
FROM reports 
GROUP BY status;
```

**Count by Species:**
```sql
SELECT 
    s.common_name,
    COUNT(r.id) as sightings
FROM species s
LEFT JOIN reports r ON s.id = r.species_id
GROUP BY s.common_name
ORDER BY sightings DESC;
```

**Reports Without GPS:**
```sql
SELECT * FROM reports 
WHERE latitude IS NULL OR longitude IS NULL;
```

**Recent Sightings (Last 30 days):**
```sql
SELECT * FROM reports 
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

**Delete Test Data:**
```sql
-- BE CAREFUL! This deletes data permanently
DELETE FROM reports 
WHERE id < 100;  -- Adjust ID threshold
```

### File Structure

```
herp-israel-form/
├── index.html          # Public submission form
├── admin.html          # Admin dashboard
├── vercel.json         # Deployment config
├── README.md           # This documentation
└── scripts/
    ├── import_legacy_data.py      # Legacy data processor
    └── import_to_supabase.js      # Database import script
```

### Storage Configuration

**Bucket Name:** `eport-photos`

**Access:** Public read, authenticated upload

**Policies:**
- Anyone can upload
- Anyone can view
- Files stored permanently (no auto-delete)

**Max File Size:** 50MB (Supabase limit)

**Accepted Formats:** JPG, PNG, GIF, WebP

### API Rate Limits

**Supabase Free Tier:**
- 500MB database storage
- 1GB file storage
- 50,000 monthly active users
- 500,000 read requests/month

**Current Usage:**
- Database: ~100MB
- Storage: ~50MB
- Users: ~5 admins
- Requests: ~10,000/month

**Monitor:** Supabase → Settings → Usage

### Security

**Row Level Security (RLS):**
- Enabled on `reports` table
- Public can INSERT
- Only authenticated admins can UPDATE/DELETE
- Everyone can SELECT (read)

**Authentication:**
- Email/password (Supabase Auth)
- No self-registration (admins only)
- Password reset via Supabase

**Best Practices:**
- Never commit service_role key to GitHub
- Use environment variables for keys (future)
- Regular password changes
- Remove inactive admins
- Monitor access logs

---

## Troubleshooting

### Website Issues

**Problem: Website not loading**

Solutions:
1. Check Vercel status: https://vercel.com/status
2. Verify deployment succeeded: Vercel dashboard
3. Check domain DNS settings
4. Try incognito mode (clear cache)

**Problem: Changes not appearing after GitHub commit**

Solutions:
1. Wait 30-60 seconds for Vercel deployment
2. Check Vercel dashboard → Deployments
3. Look for deployment errors
4. Hard refresh browser (Ctrl+Shift+R)

**Problem: Form submission fails**

Solutions:
1. Check browser console (F12 → Console)
2. Verify Supabase is online
3. Check RLS policies in Supabase
4. Ensure species_id is valid
5. Verify photo size < 50MB

### Admin Dashboard Issues

**Problem: Can't login**

Solutions:
1. Verify email exists in Supabase → Authentication
2. Check password is correct
3. Try password reset
4. Clear browser cookies
5. Try incognito mode

**Problem: Reports not showing**

Solutions:
1. Check if logged in properly
2. Verify RLS policies allow SELECT
3. Check filters aren't too restrictive
4. Try clearing filters ("נקה" button)
5. Refresh page

**Problem: Export button doesn't work**

Solutions:
1. Check browser pop-up blocker
2. Look for errors in console (F12)
3. Try different browser
4. Verify still logged in
5. Check database connectivity

### Map Issues

**Problem: Map shows only some pins**

Solutions:
1. Wait 10 seconds (loading all data)
2. Check area filter isn't active
3. Clear filters
4. Check browser console for errors
5. Verify records have GPS coordinates

**Problem: Area selection not working**

Solutions:
1. Click "📐 בחר אזור במפה" first
2. Make sure you click twice (start and end)
3. Check if rectangle appears (green)
4. Try clearing previous selection first
5. Refresh page if stuck

**Problem: Overlapping markers show wrong data**

Solutions:
1. Refresh page
2. Clear browser cache
3. Check database for duplicate coordinates
4. Report bug if persists

### Data Issues

**Problem: Missing species in dropdown**

Solutions:
1. Check species table in Supabase
2. Verify species has common_name
3. Refresh form page
4. Check for JavaScript errors

**Problem: GPS coordinates wrong**

Solutions:
1. Check latitude/longitude format (decimal degrees)
2. Verify coordinates in Israel bounds (lat 29-33.5, lng 34-36)
3. Edit in admin dashboard or Supabase directly
4. Consider setting to NULL if invalid

**Problem: Photos not displaying**

Solutions:
1. Verify Google Drive link is public
2. Check link format in database
3. Test link in browser directly
4. Ensure storage bucket policy allows read
5. Check if file was deleted from Drive

### Database Issues

**Problem: Approaching 500MB limit**

Solutions:
1. Check what's using space: Supabase → Database → Usage
2. Delete old test data
3. Compress/optimize if possible
4. Upgrade to Pro plan ($25/month for 8GB)

**Problem: Queries timing out**

Solutions:
1. Add indexes to frequently queried columns
2. Reduce data fetched (use pagination)
3. Check for long-running queries
4. Optimize SQL queries
5. Consider upgrading plan

**Problem: Data disappeared**

Solutions:
1. Check if RLS policies changed
2. Verify logged in with correct user
3. Check filters aren't hiding data
4. Restore from backup CSV
5. Contact Supabase support

### Import Issues

**Problem: Species not found during import**

Solutions:
1. Check species name spelling
2. Verify species exists in database
3. Update species mapping
4. Add missing species first
5. Use "לא מזוהה" as fallback

**Problem: Date parsing errors**

Solutions:
1. Check date format in Excel (YYYY-MM-DD preferred)
2. Fix malformed dates manually
3. Update Python script date parsing
4. Skip records with invalid dates

**Problem: Import script fails**

Solutions:
1. Verify Node.js installed
2. Check npm packages installed
3. Verify service_role key is correct
4. Check network connection
5. Look at error message details

### Getting Help

**If you can't solve an issue:**

1. **Check documentation** (this guide)
2. **Search error message** on Google
3. **Ask Claude AI** (upload this README + describe issue)
4. **Supabase Support:** https://supabase.com/support
5. **Vercel Support:** https://vercel.com/support

**Before asking for help, collect:**
- Error messages (exact text)
- Screenshots
- Browser console logs (F12 → Console)
- What you were trying to do
- What happened instead

---

## Appendix

### Glossary

**Terms:**
- **Supabase:** Backend-as-a-Service (database + auth + storage)
- **Vercel:** Static site hosting with auto-deployment
- **RLS:** Row Level Security (database access control)
- **PostgreSQL:** Open-source relational database
- **CSV:** Comma-Separated Values (spreadsheet format)
- **API:** Application Programming Interface
- **JSON:** JavaScript Object Notation (data format)

### Useful SQL Snippets

**Backup species table:**
```sql
SELECT * FROM species ORDER BY common_name;
```

**Find duplicates:**
```sql
SELECT full_name, date, species_id, COUNT(*)
FROM reports
GROUP BY full_name, date, species_id
HAVING COUNT(*) > 1;
```

**Monthly report counts:**
```sql
SELECT 
    DATE_TRUNC('month', date) as month,
    COUNT(*) as reports
FROM reports
GROUP BY month
ORDER BY month DESC;
```

### Contact Information

**Project Maintainer:** Aram Aviram  
**Email:** aram.aviram@gmail.com

**For Technical Support:**
- Upload this README to Claude AI
- Describe your issue
- Include error messages

---

**End of Comprehensive Guide**

*For quick reference, see README_Quick_Reference.md*
