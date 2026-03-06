# Herp Israel Project - Comprehensive Guide

**Complete Documentation for Wildlife Reporting System**
Last Updated: March 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Account Management](#account-management)
4. [Public Page Guide](#public-page-guide)
5. [Submission Form Guide](#submission-form-guide)
6. [Admin Dashboard Guide](#admin-dashboard-guide)
7. [Data Management](#data-management)
8. [Species Management](#species-management)
9. [Legacy Data Import](#legacy-data-import)
10. [Maintenance & Monitoring](#maintenance--monitoring)
11. [Technical Reference](#technical-reference)
12. [Troubleshooting](#troubleshooting)

---

## Project Overview

### Purpose

Community-driven citizen science platform for tracking reptile and amphibian sightings across Israel. Members of the public submit sightings via a web form; trained admins validate submissions; all validated data appears on a public-facing statistics and map page.

### Key Features

- Mobile-friendly public submission form
- GPS location capture (automatic, map-based, or manual)
- Photo uploads (stored in Supabase Storage bucket)
- Admin dashboard with validation **and** full editing workflow
- Interactive species distribution map with GeoJSON range overlays (94 species)
- Heatmap of sightings loaded from a pre-aggregated database view
- Species information cards with venom/poison/activity/size/diet/conservation data
- Custom SVG venom & poison iconography
- Live statistics: total sightings, validated count, reported species, last-week activity
- Seasonal bar chart and top-species / family breakdown charts
- Data export to CSV (all records or filtered)
- Multi-admin support with per-admin audit trail

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, vanilla JavaScript, Leaflet 1.9.4 (maps) |
| Backend | Supabase (PostgreSQL + Row Level Security) |
| Hosting | Vercel (auto-deploys from GitHub) |
| Photo Storage | Supabase Storage bucket (`eport-photos`) |
| Distribution Data | `herp.geojson` (94 species, served from repo root) |
| Version Control | GitHub (web interface only — no local Git) |

---

## System Architecture

### Component Diagram

```
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│   Public Form        │   │   Public Page         │   │   Admin Dashboard    │
│   index.html         │   │   public.html         │   │   admin.html         │
│ (submit sightings)   │   │ (stats, map, species) │   │ (validate / edit)    │
└──────────┬───────────┘   └──────────┬────────────┘   └──────────┬───────────┘
           │                          │                            │
           └──────────────────────────┼────────────────────────────┘
                                      ↓
                          ┌───────────────────────┐
                          │        Supabase        │
                          │  PostgreSQL + RLS      │
                          │  Storage (photos)      │
                          │  Auth (admin users)    │
                          └───────────────────────┘
                                      ↑
                          ┌───────────────────────┐
                          │     herp.geojson       │
                          │  (served from repo)    │
                          │  94 species ranges     │
                          └───────────────────────┘
```

### Data Flow

**Public Submission:**
1. User fills form on `index.html`
2. Photos uploaded directly to Supabase Storage (`eport-photos` bucket)
3. Report data (including storage URLs) inserted into `reports` table
4. RLS policy allows anonymous INSERT

**Public Page:**
1. Loads stats from `public_reports_safe` view (RLS-safe, SELECT permitted)
2. Heatmap loaded from `public_heatmap_grid` view (pre-aggregated grid cells)
3. Species distribution overlay fetched from `/herp.geojson` (repo root)
4. Species card data fetched from `species` table (full column set)

**Admin Validation:**
1. Admin logs in → Supabase Auth
2. Views full `reports` table (RLS grants SELECT to authenticated users)
3. Validates / rejects / edits records
4. `validated_by` + `validated_at` written on validation actions
5. `updated_by` + `updated_at` written on any edit save

---

## Account Management

### Supabase Account

**Purpose:** Database, Storage, Authentication

**Access:**
- URL: https://supabase.com
- Project: herp-israel
- Project ID: qobayftqligpshmyweio
- Dashboard: https://supabase.com/dashboard/project/qobayftqligpshmyweio

**Key Sections:**
- **Table Editor** — View/edit `reports` and `species` tables directly
- **Authentication** — Manage admin users
- **Storage** — View photos in `eport-photos` bucket
- **Database → Usage** — Monitor storage size
- **SQL Editor** — Run custom queries

### Vercel Account

**Purpose:** Website hosting and automatic deployment

**Access:**
- URL: https://vercel.com
- Login: Via GitHub (no separate password needed)
- Project: herp-israel-form

**Deployment:**
- Any commit to GitHub triggers an automatic Vercel deployment (~30 seconds)
- Deployment history and logs visible in the Vercel dashboard

### GitHub Account

**Purpose:** Source code storage, version control

**Repository:** herp-israel-form

**Files:**
- `index.html` — Public submission form
- `public.html` (currently named `public (5).html` locally) — Public stats/map page
- `admin.html` — Admin dashboard
- `herp.geojson` — Species distribution polygons (94 species)
- `vercel.json` — Deployment configuration (`{"version": 2}`)

**Workflow:**
1. Edit files on GitHub (web editor)
2. Commit changes
3. Vercel auto-deploys (30 seconds)
4. Live site updates

**Important:** There is no local Git environment. All edits are made through the GitHub web interface. There is no staging environment — commits go directly to production.

### Admin Users

**Managed in:** Supabase → Authentication → Users

**Current Admins:**
- aram.aviram@gmail.com (project owner)

**Adding a New Admin:**
1. Supabase → Authentication → Users
2. "Add user" → "Create new user"
3. Enter email and password
4. ✅ **Important:** Check "Auto Confirm User"
5. Click "Create user"
6. Share credentials manually — no email is sent automatically

---

## Public Page Guide

The public page (`public.html`) is the citizen-facing read-only display of all validated data. It has no authentication requirement.

### Page Sections

**Hero / Info Boxes (top)**

Four live statistics fetched from `public_reports_safe`:
- 📍 Total sightings in the database
- ✅ Validated sightings
- 🔬 Number of distinct reported species
- 📅 Species reported in the last 7 days (highlighted in green)

**Map Section — "מפת פיזור לפי מין"**

The central map section contains two panels side by side:

*Left panel — interactive map:*
- Base tiles from CartoDB light
- **Heatmap layer** — loaded from `public_heatmap_grid` view (pre-aggregated grid cells with `grid_x`, `grid_y`, `count` columns); renders as colored rectangles. When no species is selected, the full dataset heatmap is shown; when a species is selected, only that species' cells are shown.
- **Distribution layer** — when a species is selected, a GeoJSON polygon for that species is loaded from `/herp.geojson` and rendered beneath the heatmap. Matched by `binomial` property (first two words of scientific name). The GeoJSON is loaded once and cached. The layer is sourced from IUCN data (credit shown in footer).
- No individual pin markers on this page (heatmap only)

*Right panel — tabbed:*
- **Species card** — shows detailed info for the selected species (see Species Cards section below)
- **Recent sightings** — list of the most recent validated reports with date and species name

**Charts Section — "נתונים ותובנות"**

Three chart panels:
1. **Seasonal chart** ("עונתיות — תצפיות לפי חודש") — SVG bar chart of report counts by calendar month, loaded from `public_reports_safe`. Bars are color-coded (amber/gold). Month labels in Hebrew. Max value shown on Y axis.
2. **Top species** ("10 המינים הנפוצים ביותר") — Horizontal bar list of top 10 reported species with counts, loaded from `public_reports_safe`.
3. **Family breakdown** ("פילוח לפי קבוצה") — Horizontal bar list of sighting counts by taxonomic family, loaded from `public_reports_safe`.

### Species Dropdown

- Populated from the `species` table (full set)
- **Filtering:** Entries are excluded from the dropdown if they match any of:
  - `common_name === 'לא מזוהה'` (unidentified)
  - `common_name` includes `'(סוג)'` (genus-level entry)
  - `scientific_name` is a single word (genus-only binomial)
- Selecting a species triggers: heatmap filtered to that species + distribution polygon loaded + species card rendered
- Clearing selection restores the full-dataset heatmap and clears the species card

### Species Cards

Species cards display rich data for the selected species, all sourced from the `species` table:

| Field | Column | Display |
|-------|--------|---------|
| Hebrew name | `common_name` | Card title |
| Scientific name | `scientific_name` | Subtitle |
| Venom/Poison status | `venom_level` | Colored badge with custom SVG icon |
| Activity time | `activity_time` | Colored badge (day/night/both) |
| Max size | `max_size_mm` | Badge (converted from mm to cm display) |
| Diet | `diet` | "🍽️ תזונה:" row |
| Description | `description` | Styled text block |
| Photo | `photo_url` | Species image at top of card |
| Conservation status | `red_list_status` | IUCN status label |
| Sighting count | derived | "N תצפיות במאגר" shown below card |

**Venom/Poison badges (with custom SVG icons):**
- `ארסי` (venomous) — full skull SVG, red badge
- `תת-ארסי` (sub-venomous) — half skull SVG (left side faded), amber badge
- `לא ארסי` (non-venomous) — ✓ checkmark, green badge
- `רעיל` (poisonous — contact/ingestion toxin) — warning triangle SVG, purple badge

**Activity badges:**
- `יום` (diurnal) — amber badge
- `לילה` (nocturnal) — blue/grey badge
- `יום ולילה` (both) — mixed badge

---

## Submission Form Guide

The public form (`index.html`) is the entry point for citizen scientists to submit sightings.

### Required Fields (marked *)

- Full name
- Sighting date (defaults to today)
- Species (dropdown, all 102+ species from `species` table)
- Number of individuals (1–10, "הרבה" / "לא ידוע")
- Location description *

### Optional Fields

- Time of sighting
- GPS coordinates (via one of three methods — see below)
- Sighting details (context, behavior, microhabitat)
- Photos (multiple allowed)
- Additional comments
- Contact details

### Location Capture — Three Methods

**1. Auto GPS** — "📍 אתר מיקומי אוטומטית"
Uses the browser Geolocation API. On success, stores coordinates as hidden fields and shows a status message. On failure, shows an error with instructions.

**2. Map Selection** — "🗺️ בחר מיקום על מפה"
Opens a Leaflet map modal centered on Israel. User clicks to place a pin; coordinates are confirmed and stored. The modal can be closed without saving.

**3. Manual Entry** — "✏️ הזן קואורדינטות ידנית"
Toggles a pair of text inputs for latitude and longitude (decimal degrees). A "שמור מיקום" button validates and stores them.

All three methods write to hidden `latitude` and `longitude` fields on the form.

### Photo Upload

- Multiple files accepted
- Uploaded to Supabase Storage bucket `eport-photos`
- Public URLs stored in `photo_urls` (JSON array) on the report record
- No hard client-side file size limit enforced (Supabase limit applies)

### Form Submission

On submit, the form:
1. Uploads any selected photos to `eport-photos` and collects their public URLs
2. Inserts a row into `reports` with all fields
3. Initial `status` = `"Pending Review"`
4. Shows success or error message

RLS policy: anonymous users can INSERT but not SELECT/UPDATE/DELETE.

---

## Admin Dashboard Guide

**URL:** https://herp-israel-form.vercel.app/admin.html

### Login

1. Enter admin email
2. Enter password
3. Click "התחבר"

**Important:** After using the admin dashboard, click "התנתק" before testing the public form in the same browser session — authenticated state can cause RLS errors on the public form.

### Dashboard Layout

**Statistics Cards (top):**
- Total reports
- ממתינים לאימות (Pending)
- מאומתות (Validated)
- נדחות (Rejected)

**Filters:**
- Status (Pending / Validated / Rejected)
- Family (taxonomic family)
- Species
- Date range (from / to)

**Action buttons:**
- "החל סינון" — apply filters
- "נקה" — clear all filters
- "ייצא הכל ל-CSV" — export all records ignoring filters
- "ייצא מסונן ל-CSV" — export records matching current filters

**Map:** Shows ALL sightings with GPS coordinates (not paginated), color-coded by status:
- 🟠 Orange = Pending Review
- 🟢 Green = Validated
- 🔴 Red = Rejected

**Reports Table:** 100 records per page. Columns: Date, Reporter, Species, Quantity, Location, Status, Actions. Pagination at bottom.

### Viewing Report Details

Click "צפה" on any row to open the detail modal.

**Information shown:**
- Reporter name and contact
- Date and time
- Species (with inline quick-change dropdown)
- Number of individuals
- GPS coordinates
- Location description
- Sighting details
- Additional comments
- Photos (click to enlarge)
- Validated by / validated at (if applicable)
- Validation notes (if any)

### Validation Workflow

In the detail modal:

- **אמת (Validate):** Sets `status = 'Validated'`, writes `validated_by` (admin email) and `validated_at` (timestamp)
- **דחה (Reject):** Sets `status = 'Rejected'`
- **חזור לממתין (Return to Pending):** Resets status to `'Pending Review'`
- **Validation notes field:** Optional free text; saved with the validation action

**Quick species change** (separate from full edit):
- Click on the species name inside the detail modal
- Dropdown with all species appears
- Select a species and it saves immediately (no TEST_MODE guard on this action)

### Edit Workflow

The admin dashboard includes a full record editor, separate from the validation workflow.

**Opening the editor:**
1. Open a report's detail modal (click "צפה")
2. Click the "✏️ ערוך דיווח" button (top right of modal)
3. The modal switches to an edit form

**Editable fields:**
- Date
- Time
- Full name (reporter)
- Species (dropdown)
- Number of individuals
- Latitude / Longitude (with embedded mini-map for drag-to-set)
- Location description
- Sighting details
- Additional comments
- Contact details

**GPS edit map:**
The edit form includes a small embedded Leaflet map. The pin position reflects the current stored coordinates. Dragging the pin updates the lat/lng input fields in real time. Saving captures the input field values.

**TEST_MODE flag:**

There is a constant `TEST_MODE` at the top of the admin script:

```javascript
const TEST_MODE = false;
```

When set to `true`:
- A yellow warning banner is shown inside the edit modal: "⚠️ מצב בדיקה: שינויים לא יישמרו בפועל"
- Clicking "שמור שינויים" logs the payload to the browser console but does NOT write to the database
- An alert confirms: "מצב בדיקה: השינויים לא נשמרו בפועל. כדי לשמור בפועל, שנה TEST_MODE ל-false בקוד."

When set to `false` (production default):
- "שמור שינויים" writes the updated fields to the `reports` table
- `updated_by` is set to the current admin's email
- `updated_at` is set to the current ISO timestamp

**Audit columns written on edit save:**
- `updated_by` (text) — admin email
- `updated_at` (timestamp) — ISO timestamp

### Map Features

**Area Selection:**
1. Click "📐 בחר אזור במפה"
2. Click once to anchor the first corner of a rectangle
3. Move mouse and click again to complete
4. A green rectangle appears; table and map filter to records within the area
5. Shows count: "סה״כ תצפיות נבחרות: N"
6. Click "✖ נקה בחירת אזור" to clear

**Overlapping Markers:**
When multiple reports share the same GPS coordinates, a popup lists all of them with a "צפה בדיווח" button for each.

### Pagination

- 100 records per page
- Status bar: "מציג 1–100 מתוך N דיווחים" / "עמוד 1 מתוך N"
- ← הקודם / הבא → navigation buttons
- Map always shows ALL records, not just the current page

### Export Data

**Export All (ייצא הכל ל-CSV):**
- Fetches all records regardless of current filters
- Filename: `reports_all.csv`
- Shows progress message while fetching

**Export Filtered (ייצא מסונן ל-CSV):**
- Exports all records matching current active filters (ignores pagination)
- Filename: `reports_filtered.csv`

**CSV columns:**
תאריך, שעה, שם מדווח, מין, שם מדעי, משפחה, כמות, קו רוחב, קו אורך, תיאור מיקום, פרטי תצפית, הערות, פרטי קשר, סטטוס, אומת ע"י, הערות אימות

---

## Data Management

### Database Schema

**Table: `species`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | integer (PK) | Auto-increment |
| `common_name` | text | Hebrew name |
| `scientific_name` | text | Latin binomial |
| `family` | text | Hebrew + Latin (e.g., "צפעיים Viperidae") |
| `venom_level` | text | ארסי / תת-ארסי / לא ארסי / רעיל |
| `activity_time` | text | יום / לילה / יום ולילה |
| `max_size_mm` | integer | Maximum length in mm |
| `diet` | text | Diet description (Hebrew) |
| `description` | text | Species description (Hebrew) |
| `photo_url` | text | URL to species representative photo |
| `red_list_status` | text | IUCN Red List category |

**Table: `reports`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | integer (PK) | Auto-increment |
| `created_at` | timestamp | Row creation time (auto) |
| `full_name` | text | Reporter name |
| `date` | date | Sighting date |
| `time` | time | Sighting time (optional) |
| `species_id` | integer (FK → species) | |
| `number_of_individuals` | text | "1"–"10", "הרבה", "לא ידוע" |
| `latitude` | numeric | GPS decimal degrees (optional) |
| `longitude` | numeric | GPS decimal degrees (optional) |
| `location_description` | text | Free text location |
| `sighting_details` | text | Behavioral / habitat notes |
| `photo_urls` | json | Array of Supabase Storage URLs |
| `additional_comments` | text | Extra notes |
| `contact_details` | text | Reporter contact info |
| `status` | text | "Pending Review" / "Validated" / "Rejected" |
| `validated_by` | text | Admin email who validated |
| `validated_at` | timestamp | Validation time |
| `validation_notes` | text | Admin notes on validation |
| `updated_by` | text | Admin email of last editor (edit workflow) |
| `updated_at` | timestamp | Timestamp of last edit |

**Views:**

| View | Purpose | SELECT allowed by |
|------|---------|------------------|
| `public_reports_safe` | Safe public read of reports (no PII) | Anonymous (RLS) |
| `public_heatmap_grid` | Pre-aggregated grid for heatmap | Anonymous (RLS) |

### Row Level Security (RLS) Summary

| Table/View | Anonymous | Authenticated Admin |
|------------|-----------|---------------------|
| `reports` — INSERT | ✅ Allowed | ✅ Allowed |
| `reports` — SELECT | ❌ Denied | ✅ Allowed |
| `reports` — UPDATE | ❌ Denied | ✅ Allowed |
| `public_reports_safe` — SELECT | ✅ Allowed | ✅ Allowed |
| `public_heatmap_grid` — SELECT | ✅ Allowed | ✅ Allowed |
| `species` — SELECT | ✅ Allowed | ✅ Allowed |

### Storage Configuration

**Bucket name:** `eport-photos`

**Access:** Public read, anonymous upload allowed

**File formats accepted:** JPG, PNG, GIF, WebP

**Max file size:** Supabase platform limit applies (50MB per file)

### GeoJSON Distribution Data

**File:** `herp.geojson` (served from repo root via Vercel)

**Contents:** 94 species range polygons, sourced from IUCN Red List data

**Schema:** Each feature has a `properties.binomial` field (scientific name, two-word form)

**Usage:** The public page fetches this file once, caches it in memory (`geojsonCache`), and looks up features by matching the first two words of the selected species' `scientific_name` against `properties.binomial`.

**Update process:** Replace the file in the GitHub repository. The public page will pick it up on next load.

### Backup Procedures

**Monthly Backup (Required):**

1. Login to admin dashboard
2. Click "ייצא הכל ל-CSV"
3. Save as: `reports_backup_YYYY-MM.csv`
4. Also export species: Supabase → SQL Editor → `SELECT * FROM species ORDER BY common_name;`
5. Store locally + Google Drive

**Recommended file naming:**
- `reports_backup_2026-03.csv`
- `species_backup_2026-03.csv`

**Retention:** Keep last 12 months locally; keep all-time in cloud.

### Data Recovery

If Supabase fails or data is lost:

1. Create new Supabase project
2. Recreate tables using SQL from Technical Reference
3. Re-import from CSV backup
4. Update `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `index.html`, `admin.html`, and `public.html`
5. Push to GitHub → Vercel auto-deploys

**Estimated recovery time:** 2–4 hours

---

## Species Management

### Current Species List

**Total:** 102+ species (reptiles and amphibians native to Israel)

**Families include:** Viperidae, Colubridae, Gekkonidae, Lacertidae, Scincidae, Salamandridae, Ranidae, Bufonidae, Testudinidae, and others.

### Adding New Species

**Method 1: Supabase UI**
1. Supabase → Table Editor → species
2. Click "Insert row"
3. Fill: `common_name`, `scientific_name`, `family`
4. Optionally fill extended fields: `venom_level`, `activity_time`, `max_size_mm`, `diet`, `description`, `photo_url`, `red_list_status`
5. Click "Save"

**Method 2: SQL**
```sql
INSERT INTO species (common_name, scientific_name, family, venom_level, activity_time, max_size_mm, diet, description, red_list_status)
VALUES ('שם עברי', 'Genus species', 'משפחה Family', 'לא ארסי', 'יום', 350, 'תיאור תזונה', 'תיאור המין', 'LC');
```

Changes appear immediately in the public form and admin dashboard.

### Editing Species

1. Supabase → Table Editor → species
2. Click the cell to edit
3. Press Enter to save

Changing `common_name` or `scientific_name` automatically updates all linked reports (via `species_id` foreign key).

### Species Dropdown Filtering (Public Page)

The public page species dropdown excludes:
- `common_name === 'לא מזוהה'`
- Names containing `'(סוג)'` (genus-level placeholder entries)
- Species where `scientific_name` is a single word (no binomial)

This filtering is purely in the frontend; the full species table is still used for admin and form dropdowns.

### Adding Species Photos

1. Upload an image to Supabase Storage (any bucket, or the web)
2. Copy the public URL
3. Paste into the `photo_url` column of the relevant species row
4. The photo will appear at the top of the species card on the public page

---

## Legacy Data Import

### Overview

Historical sighting data from Google Sheets / Excel can be imported into the database.

**Process:**
1. Export Google Sheet to Excel (.xlsx)
2. Map old species names to current names
3. Run Python processing script → produces JSON
4. Run Node.js import script → inserts to Supabase
5. Validate imported data in admin dashboard

### Prerequisites

- Node.js
- Python 3
- npm package: `@supabase/supabase-js`
- Legacy Excel file
- Import scripts (provided separately)

### Step 1: Prepare Data

Export from Google Sheets: File → Download → Microsoft Excel (.xlsx)

**Expected columns:**
- Reporter name
- Date (any common format)
- Species name (Hebrew)
- Location description
- GPS coordinates (optional)
- Photo links (Google Drive URLs, if any)

### Step 2: Species Mapping

If legacy data uses different or older species names, create `species_mapping.txt`:

```
גדילה מצויה → סלמנדרה כתומה
צפע → צפע מצוי
נחש המים → נחש מים
```

Compare legacy names against the current `species` table. Work with Claude to resolve unmatched names.

### Step 3: Process Data

```bash
python3 import_legacy_data.py
```

Output: `legacy_import_final.json` — processed records ready for insert.

Review: check species mapping, date parsing, GPS coordinate validity.

### Step 4: Import to Supabase

1. Supabase → Settings → API → copy **service_role** key (NOT the anon key)
2. Edit `import_to_supabase.js`, paste the key on line 13
3. Run:

```bash
npm install @supabase/supabase-js
node import_to_supabase.js
```

Imports in batches of 500. Typical time: 2–3 minutes for 4,000 records.

### Step 5: Validate Import

```sql
-- Check total count
SELECT COUNT(*) FROM reports;

-- Check date range
SELECT MIN(date), MAX(date) FROM reports;

-- Check species distribution
SELECT s.common_name, COUNT(*) AS n
FROM reports r JOIN species s ON r.species_id = s.id
GROUP BY s.common_name ORDER BY n DESC LIMIT 20;
```

Spot-check 10–20 records in the admin dashboard (map, species, photos).

---

## Maintenance & Monitoring

### Daily Tasks

- Check admin dashboard for new pending reports ("ממתינים לאימות" count)
- Validate or reject new submissions
- Expected volume: 0–10 reports/day (higher in spring/autumn)

### Weekly Tasks

- Review rejected reports for reconsideration
- Note unusual species or locations for scientific follow-up

### Monthly Tasks (1st of each month)

- [ ] Export all data to CSV and save backup
- [ ] Export species table as CSV
- [ ] Check database size: Supabase → Database → Usage (alert at 400MB; free tier limit 500MB)
- [ ] Review admin user list — remove inactive accounts
- [ ] Test form submission (submit a test report, then delete it)

### Quarterly Tasks

- Review species list for taxonomy updates
- Check for duplicate reports (see SQL snippets)
- Verify GeoJSON distribution data is current
- Performance review: page load time, export speed

### Monitoring Checklist

```
[ ] Website is online (herp-israel-form.vercel.app)
[ ] Public page loads and shows correct stats
[ ] Admin dashboard loads and map renders
[ ] Can login to admin successfully
[ ] Form accepts new submissions
[ ] Photos upload correctly
[ ] CSV export functions work
[ ] Database size under 400MB
[ ] Recent backup exists (< 31 days old)
[ ] All known admins can log in
```

---

## Technical Reference

### URLs

| Resource | URL |
|----------|-----|
| Public form | https://herp-israel-form.vercel.app |
| Public page | https://herp-israel-form.vercel.app/public.html |
| Admin dashboard | https://herp-israel-form.vercel.app/admin.html |
| Supabase project | https://supabase.com/dashboard/project/qobayftqligpshmyweio |

### Database Connection Constants

**Supabase URL:**
```
https://qobayftqligpshmyweio.supabase.co
```

**Anon Key (safe to include in public code):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvYmF5ZnRxbGlncHNobXl3ZWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTEzMDcsImV4cCI6MjA4NzA4NzMwN30.u69AQLyyrXJvgBLTUO9ZpMvpd6dbqTDNj9Z_0RSctps
```

**Service Role Key:** Stored securely — never commit to GitHub.

### File Structure

```
herp-israel-form/
├── index.html          # Public submission form
├── public.html         # Public statistics and map page
├── admin.html          # Admin dashboard
├── herp.geojson        # Species distribution polygons (94 species)
├── vercel.json         # Deployment config { "version": 2 }
└── scripts/
    ├── import_legacy_data.py      # Legacy data processor
    └── import_to_supabase.js      # Database import script
```

### SQL Queries

**All reports with species names:**
```sql
SELECT r.*, s.common_name, s.scientific_name, s.family
FROM reports r
LEFT JOIN species s ON r.species_id = s.id
ORDER BY r.created_at DESC;
```

**Count by status:**
```sql
SELECT status, COUNT(*) FROM reports GROUP BY status;
```

**Count by species:**
```sql
SELECT s.common_name, COUNT(r.id) AS sightings
FROM species s LEFT JOIN reports r ON s.id = r.species_id
GROUP BY s.common_name ORDER BY sightings DESC;
```

**Reports without GPS:**
```sql
SELECT * FROM reports WHERE latitude IS NULL OR longitude IS NULL;
```

**Recent sightings (last 30 days):**
```sql
SELECT * FROM reports
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

**Monthly report counts:**
```sql
SELECT DATE_TRUNC('month', date) AS month, COUNT(*) AS n
FROM reports GROUP BY month ORDER BY month DESC;
```

**Find duplicate reports:**
```sql
SELECT full_name, date, species_id, COUNT(*)
FROM reports
GROUP BY full_name, date, species_id
HAVING COUNT(*) > 1;
```

**Backup species table:**
```sql
SELECT * FROM species ORDER BY common_name;
```

**Delete test data (careful!):**
```sql
-- Adjust the ID threshold before running
DELETE FROM reports WHERE id < 100;
```

### API Rate Limits (Supabase Free Tier)

| Resource | Limit | Current Usage |
|----------|-------|--------------|
| Database storage | 500 MB | ~100 MB |
| File storage | 1 GB | ~50 MB |
| Monthly active users | 50,000 | ~5 admins |
| Read requests/month | 500,000 | ~10,000 |

Monitor at: Supabase → Settings → Usage

---

## Troubleshooting

### Login Issues

**Can't login to admin:**
1. Verify email exists in Supabase → Authentication → Users
2. Check password
3. Clear browser cookies / try incognito
4. Try Ctrl+Shift+R to hard-refresh

**After using admin, public form gives errors:**
- Always click "התנתק" before testing the public form in the same browser session

### Map Issues

**Admin map not showing all pins:**
1. Wait 10–15 seconds (loading all records)
2. Check that no area filter is active
3. Clear all filters
4. Verify records have GPS coordinates

**Public page heatmap not loading:**
1. Check browser console for errors (F12)
2. Verify `public_heatmap_grid` view exists in Supabase
3. Check RLS policy allows anonymous SELECT on that view

**Distribution polygon not showing:**
1. Check that `/herp.geojson` is accessible (open it directly in browser)
2. Verify the selected species has a two-word scientific name
3. Check browser console for `[distribution]` log messages
4. The species' scientific name must match a `binomial` property in the GeoJSON

**Area selection not working:**
1. Click "📐 בחר אזור במפה" first
2. Click once to start, then click again to finish (two clicks, not click-drag)
3. A green rectangle should appear
4. If stuck, refresh the page

### Form Issues

**Form not submitting:**
1. Check all required fields (*) are filled
2. Open browser console (F12) for error details
3. Check Supabase is online: https://supabase.com/status
4. Verify photo file size is reasonable

**Species not in dropdown:**
1. Check species table in Supabase
2. Verify `common_name` is not null
3. Refresh the form page

### Admin Issues

**Edit not saving:**
1. Check `TEST_MODE` is set to `false` in admin.html
2. Check browser console for errors
3. Verify you are still logged in (session may have expired)

**Export not working:**
1. Check browser pop-up blocker (CSV download uses a blob URL)
2. Try a different browser
3. Verify still logged in

**Reports not showing:**
1. Check that no filters are overly restrictive
2. Click "נקה" to clear all filters
3. Refresh page

### Species Card Issues

**Photo not showing:**
1. Verify `photo_url` in the species table is a valid, publicly accessible URL
2. Test the URL directly in a browser

**Distribution polygon not appearing:**
1. See "Distribution polygon not showing" under Map Issues above
2. Only 94 species have polygons — some species may genuinely not have IUCN distribution data

### Database Issues

**Approaching 500MB limit:**
1. Supabase → Database → Usage to identify what uses space
2. Delete old test records
3. Upgrade to Supabase Pro ($25/month → 8GB)

**Data seems missing:**
1. Check active filters in admin dashboard
2. Verify RLS policies are intact
3. Restore from most recent CSV backup if needed

### Getting Help

1. Check this documentation
2. Search the error message on Google / Supabase docs
3. Upload this README + relevant HTML file to Claude and describe the issue with browser console output (F12 → Console)
4. Supabase support: https://supabase.com/support
5. Vercel support: https://vercel.com/support

**Before asking for help, collect:**
- Exact error text
- Browser console log (F12 → Console tab)
- Screenshot of the issue
- What you were trying to do

---

## Appendix

### Glossary

| Term | Meaning |
|------|---------|
| Supabase | Backend-as-a-Service: database + auth + storage |
| Vercel | Static site hosting with GitHub auto-deploy |
| RLS | Row Level Security — Supabase's per-row access control |
| PostgreSQL | The relational database underlying Supabase |
| GeoJSON | Geographic data format used for distribution polygons |
| IUCN | International Union for Conservation of Nature — source of Red List and distribution data |
| Heatmap | Grid-based density visualization of sighting locations |
| `public_reports_safe` | Database view exposing safe (non-PII) report data to anonymous users |
| `public_heatmap_grid` | Database view with pre-aggregated grid cell counts for the heatmap |
| TEST_MODE | Admin dashboard flag that disables real database writes during testing |
| `updated_by` / `updated_at` | Audit columns written when an admin edits a report |

### Contact

**Project Maintainer:** Aram Aviram
**Email:** aram.aviram@gmail.com

**For technical support:**
- Upload this README + relevant HTML file to Claude AI
- Include browser console output (F12 → Console)
- Describe the issue and what you expected to happen

---

*For quick day-to-day reference, see README_Quick_Reference.md*

**End of Comprehensive Guide**
