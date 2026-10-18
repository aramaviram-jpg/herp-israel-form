# Herp Israel Project - Comprehensive Guide

**Complete Documentation for Wildlife Reporting System**
Last Updated: October 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Account Management](#account-management)
4. [Public Page Guide](#public-page-guide)
   - [Zoogeographic Regions](#zoogeographic-regions)
5. [Submission Form Guide](#submission-form-guide)
6. [Admin Dashboard Guide](#admin-dashboard-guide)
7. [Data Management](#data-management)
8. [Species Management](#species-management)
9. [Legacy Data Import](#legacy-data-import)
10. [Maintenance & Monitoring](#maintenance--monitoring)
11. [Technical Reference](#technical-reference)
12. [Troubleshooting](#troubleshooting)
13. [Admin Comparison Tools](#admin-comparison-tools)
14. [Change History](#change-history)

---

## Project Overview

### Purpose

Community-driven citizen science platform for tracking reptile and amphibian sightings across Israel. Members of the public submit sightings via a web form; trained admins validate submissions; all validated data appears on a public-facing statistics and map page.

### Key Features

- Mobile-friendly public submission form
- GPS location capture (automatic, map-based, or manual)
- Photo uploads (stored in Supabase Storage bucket)
- Admin dashboard with validation **and** full editing workflow
- Interactive species distribution map with GeoJSON range overlays (95 species)
- Heatmap of sightings loaded from a pre-aggregated database view
- Regions view: 23 zoogeographic regions (adapted from Fauna Palaestina) with species richness per region, and per species where it was recorded vs. expected
- Reports can be hidden from all public views with a single flag (e.g. animals moved by people)
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
| Photo Storage (active) | Supabase Storage bucket (`eport-photos`) |
| Photo Storage (archive) | Cloudflare R2 (`herp-israel-photos`) |
| Distribution Data | `herp.geojson` (95 species, served from repo root) |
| Regions | `israel-regions.geojson` (23 regions) + PostGIS `regions` table |
| Expected Species | `expected-by-region.json` (generated from the regions analysis) |
| Version Control | GitHub (web interface only — no local Git) |
| Scheduled Jobs | Supabase Cron (pg_cron + pg_net) |

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
                          │  Storage (active photos│
                          │  up to ~10 days old)   │
                          │  Auth (admin users)    │
                          └───────────┬───────────┘
                                      │ Weekly cron job
                                      ↓ (every Monday 2AM UTC)
                          ┌───────────────────────┐
                          │    Cloudflare R2       │
                          │  Permanent photo       │
                          │  archive (originals)   │
                          └───────────────────────┘
                                      ↑
                          ┌───────────────────────────┐
                          │ Static files (repo root)  │
                          │ herp.geojson (95 ranges)  │
                          │ israel-regions.geojson    │
                          │ expected-by-region.json   │
                          └───────────────────────────┘
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
5. Regions mode (on demand): region shapes from `/israel-regions.geojson`, counts per region and species from the `public_region_counts` view, expected species from `/expected-by-region.json`

All three public views include only `Validated` reports and skip reports flagged `exclude_from_public`.

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
- `herp.geojson` — Species distribution polygons (95 species)
- `israel-regions.geojson` — The 23 zoogeographic region shapes, names and label positions
- `expected-by-region.json` — Expected species per region (used by the public page)
- `regions-layer.js` — Shared code drawing region outlines/labels on the admin tools
- `vercel.json` — Deployment configuration (`{"version": 2}`)
- `admin-species-cards.html` — Admin species comparison cards tool
- `admin-map-compare.html` — Admin multi-species distribution map tool
- `public-regions-test.html` — Temporary test copy of the public page (to be deleted)

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
- 🔬 Number of distinct reported species, with "מתוך N מינים בישראל" below it
- 📅 Species reported in the last 7 days (highlighted in green)

**Species count rule** (both numbers): one per scientific name (ecotypes and duplicate entries merged); "לא מזוהה" and genus-only entries are not counted; sea turtles are counted. All validated reports are read page by page (a single request returns at most 1,000 rows).

**Map Section — "מפת פיזור לפי מין"**

The central map section contains two panels side by side:

*Left panel — interactive map:*
- Base tiles from CartoDB light
- **Map controls (top left, over the sea):** a **מפת חום | אזורים** mode switch, and in heatmap mode a **גבולות אזורים** outline toggle. Smaller on phones.
- **Heatmap layer (מפת חום, default)** — loaded from `public_heatmap_grid` view (pre-aggregated grid cells with `grid_x`, `grid_y`, `count` columns); renders as colored rectangles. Cells are 0.09° × 0.09°, about 10 km north–south × 8.5 km east–west (~85 km²). When no species is selected, the full dataset heatmap is shown; when a species is selected, only that species' cells are shown.
- **Distribution layer** — when a species is selected, a GeoJSON polygon for that species is loaded from `/herp.geojson`. Matched by `binomial` property (first two words of scientific name). The GeoJSON is loaded once and cached. Filled green in heatmap mode; a green outline only in regions mode. Sourced from GARD (reptiles) and IUCN (amphibians), edited by the project's experts (credit shown in footer).
- **Regions mode (אזורים)** — see [Zoogeographic Regions](#zoogeographic-regions) below.
- No individual pin markers on this page. The note under the map changes with the mode ("…בריבועים של כ-10 ק״מ" / "…נתונים מצרפיים לפי אזור"); exact locations are never shown.

*Right panel — tabbed:*
- **Species card** — shows detailed info for the selected species (see Species Cards section below)
- **Recent sightings** — list of the most recent validated reports with date and species name

**Charts Section — "נתונים ותובנות"**

Three chart panels:
1. **Seasonal chart** ("עונתיות — תצפיות לפי חודש") — SVG bar chart of report counts by calendar month, loaded from `public_reports_safe`. Bars are color-coded (amber/gold). Month labels in Hebrew. Max value shown on Y axis.
2. **Top species** ("10 המינים הנפוצים ביותר") — Horizontal bar list of top 10 reported species with counts, loaded from `public_reports_safe`.
3. **Family breakdown** ("פילוח לפי קבוצה") — Horizontal bar list of sighting counts by taxonomic family, loaded from `public_reports_safe`.

### Zoogeographic Regions

Israel is divided into **23 zoogeographic regions**, adapted from Fauna Palaestina (ids 1–23, incl. Ramot Menashe and the Eilat Mountains). The regions mode shows only aggregated counts per region — never locations.

**Region assignment:** a validated report counts in the region it falls inside; a report up to 2 km outside every region (beaches, border areas) goes to the nearest region; anything further is not counted. Eilat city and the coastal strip belong to the Arava region.

**No species selected — species richness:**
- Regions coloured in 5 bands by number of species recorded (≤15, 16–22, 23–30, 31–35, 36+)
- Counting follows the Facebook-post rules: one per scientific name; unidentified records and sea turtles excluded; introduced species included; a genus-only record counts only if no species of that genus is recorded in the region
- Dashed outline = few reports: species seen only once make up more than 20% of the region's reports, so the picture is partial
- Popup: region name, "X מינים מתוך Y צפויים", number of validated reports

**Species selected — one colour per region:**

| Region | Meaning | Source |
|--------|---------|--------|
| Brown fill | Species recorded in the region | `public_region_counts` (live) |
| Light green fill | Expected in the region, not yet recorded | `expected-by-region.json` |
| Dashed outline, no fill | Neither expected nor recorded | — |
| Green line (on top) | The species range from `herp.geojson`, for reference | `herp.geojson` |

Popups: "<species>: N תצפיות"; "המין … צפוי באזור זה לפי מפות התפוצה, אך טרם תועד"; "המין … לא תועד באזור זה". A recorded species that is not on the region's expected list gets an extra line: "תועד, אף שאינו צפוי באזור זה לפי מפות התפוצה".

**Expected species** (`expected-by-region.json`): a species is expected in a region if its range reaches at least 1 km into the region and the experts did not mark the pair "not real", or the experts marked a shallower pair "real"; plus manual additions where the maps are known to be incomplete (currently ישימונית מצויה in the Lower Galilee). Introduced species are never expected, but they do count as recorded — so in rare cases a region can show more species recorded than expected. The file is static: regenerate it whenever the range maps, the regions or the experts' decisions change.

Full project record, decisions and analysis: "Herp Israel — Regions Project Status" (Claude Docs, maintained by Aram).

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
- Sighting date (defaults to today, selected from a calendar — see Date Field below)
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

### Date Field

The sighting date uses the browser's native `<input type="date">`, with these rules (added October 2026):

- **Default:** today's date in **local (Israel) time**, set by `localTodayISO()` on page load and after each successful submit.
- **Calendar only:** typing in the field is blocked (every key except Tab is ignored). Clicking anywhere in the field opens the calendar via `showPicker()`; on older browsers the calendar icon still works.
- **Limits:** `min` = `1900-01-01` (constant `MIN_DATE`), `max` = today. Future days are greyed out in the calendar, and the browser's own validation blocks the submit if a value is out of range.
- **Date in words:** the selected date is shown under the field in Hebrew, e.g. "נבחר: 17 באוקטובר 2026", using `Intl.DateTimeFormat('he-IL')`.

**Why the date in words is needed:** the order of day and month *inside* the field is set by the user's browser language, not by the page, and cannot be changed by the page. A browser set to English (US) shows `mm/dd/yyyy`. The stored value is always correct (`yyyy-mm-dd`); the text below the field shows the user the actual date unambiguously.

**Known edge case:** `max` is set when the page loads and after each submit. If the form is left open past midnight, the new day stays greyed out until the page is reloaded.

Phones are unaffected by the display issue — they always use the native picker with month names.

### Location Capture — Three Methods

**1. Auto GPS** — "📍 אתר מיקומי אוטומטית"
Uses the browser Geolocation API. On success, stores coordinates as hidden fields and shows a status message. On failure, shows an error with instructions.

**2. Map Selection** — "🗺️ בחר מיקום על מפה"
Opens a Leaflet map modal centered on Israel. User clicks to place a pin; coordinates are confirmed and stored. The modal can be closed without saving.

**3. Manual Entry** — "✏️ הזן קואורדינטות ידנית"
Toggles a pair of text inputs for latitude and longitude (decimal degrees). A "שמור מיקום" button validates and stores them.

All three methods write to hidden `latitude` and `longitude` fields on the form.

### Photo Upload

- Maximum **3 photos** per report (enforced client-side)
- Uploaded to Supabase Storage bucket `eport-photos`
- Public URLs stored in `photo_urls` (text array) on the report record
- A counter displays how many photos have been selected (e.g. "2/3 תמונות נבחרו")
- If more than 3 files are selected, only the first 3 are kept and a red warning is shown
- No hard client-side file size limit enforced (Supabase platform limit applies)

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
- **אחסון תמונות** — live Supabase storage usage in MB, color coded green / amber / red
- **גיבוי אחרון** — timestamp and status of the last archiving job run

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
| `archived` | boolean | True when photos have been moved to R2 |
| `archived_at` | timestamp | When archiving occurred |
| `archived_photo_keys` | text[] | R2 storage keys for original photos (e.g. `2026/report_123_1.jpg`) |
| `exclude_from_public` | boolean | Default `false`. `true` hides a validated report from all public views (totals, charts, heatmap, regions); admins still see it. Added October 2026 |

**Table: `regions`** (PostGIS, added October 2026)

| Column | Type | Notes |
|--------|------|-------|
| `id` | text (PK) | '1'–'23' |
| `name_he` | text | Hebrew region name |
| `name_en` | text | English region name |
| `geom` | geometry(MultiPolygon, 4326) | Region shape; must match `israel-regions.geojson` |

RLS enabled, no anonymous access — the public reads counts only through `public_region_counts`. PostGIS is installed in the `extensions` schema (free plan).

**Views:**

| View | Purpose | SELECT allowed by |
|------|---------|------------------|
| `public_reports_safe` | Safe public read of reports (no PII) | Anonymous (RLS) |
| `public_heatmap_grid` | Pre-aggregated grid for heatmap | Anonymous (RLS) |
| `public_region_counts` | Validated report count per region and species (`region_id`, `species_id`, `report_count`); computed live | Anonymous (grant) |

All three views include only `status = 'Validated'` and `not exclude_from_public`. They are intentionally SECURITY DEFINER-style (no `security_invoker`) — the access-control layer for anonymous users.

### Row Level Security (RLS) Summary

| Table/View | Anonymous | Authenticated Admin |
|------------|-----------|---------------------|
| `reports` — INSERT | ✅ Allowed | ✅ Allowed |
| `reports` — SELECT | ❌ Denied | ✅ Allowed |
| `reports` — UPDATE | ❌ Denied | ✅ Allowed |
| `public_reports_safe` — SELECT | ✅ Allowed | ✅ Allowed |
| `public_heatmap_grid` — SELECT | ✅ Allowed | ✅ Allowed |
| `public_region_counts` — SELECT | ✅ Allowed | ✅ Allowed |
| `regions` — SELECT | ❌ Denied | ❌ Denied (read via the view) |
| `species` — SELECT | ✅ Allowed | ✅ Allowed |

### Storage Configuration

**Supabase bucket name:** `eport-photos`

**Access:** Public read, anonymous upload allowed

**File formats accepted:** JPG, PNG, GIF, WebP

**Max photos per report:** 3 (enforced client-side)

**Max file size:** Supabase platform limit applies (50MB per file)

**Steady state:** Photos are automatically archived to Cloudflare R2 after validation and deleted from Supabase. Supabase storage does not grow unboundedly.

### Cloudflare R2 Archive Storage

**Purpose:** Permanent archive of original full-resolution photos

**Bucket:** `herp-israel-photos`

**Public URL:** `https://pub-6d56a224016c4263ac2d6ce68334aa77.r2.dev`

**File naming convention:** `{year}/report_{id}_{n}.jpg`
Example: `2026/report_26400_1.jpg`

**Access:** Public read via r2.dev URL. Files are served directly from Cloudflare's network.

**Cost:** Free up to 10 GB; ~$0.015/GB/month beyond that. Projected 10-year cost under $110 total.

**Manual retrieval:** To retrieve an original photo, look up `archived_photo_keys` in the `reports` table for the report ID, then browse to the Cloudflare R2 dashboard → herp-israel-photos bucket.

### GeoJSON Distribution Data

**File:** `herp.geojson` (served from repo root via Vercel)

**Contents:** 95 species range polygons (v5, October 2026), based on GARD (reptiles) and IUCN (amphibians) and edited by the project's experts; clipped to the same borders and coastline as the regions

**Schema:** Each feature has a `properties.binomial` field (scientific name, two-word form) — must match the species table's `scientific_name` exactly

**Format:** MultiPolygon, coordinates rounded to 6 decimals and simplified by up to 20 m (about 2.2 MB). Unsimplified exports can reach 20+ MB — always compact before uploading.

**Usage:** The public page fetches this file once, caches it in memory (`geojsonCache`), and looks up features by matching the first two words of the selected species' `scientific_name` against `properties.binomial`.

**Update process:** see [Regions & Range Maps Maintenance](#regions--range-maps-maintenance). The expected-species file depends on it.

### Regions File

**File:** `israel-regions.geojson` (v3, October 2026, ~205 KB) — 23 MultiPolygon features with `id`, `name_he`, `name_en`, `label` [lng, lat]. Validated: no overlaps, no gaps.

The same shapes are stored in the database `regions` table; the two must always match.

### Hiding Reports from the Public

Set `exclude_from_public = true` on a report to remove it from every public view while keeping it validated for admins:

```sql
update public.reports set exclude_from_public = true where id = 12345;
```

Currently hidden (October 2026): 4 reports — three animals moved by people (24668 לטאה זריזה in the Northern Negev, 24365 צפע מצוי in the Southern Negev, 25104 נחשיל מצוי in the Arava) and one pending verification (24451 שנונית חולות in the Northern Coastal Plain). List them with `select id, date, species_id from reports where exclude_from_public;`. Undo by setting the flag back to `false`.

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

### Import Record

The legacy import was run on **2026-02-23 at 07:57 Israel time** (4,047 rows in a single batch). The public form went live immediately after; all reports created from **2026-02-23 07:58 (Israel time, UTC+2)** are form submissions. Use this cutoff in any query that should cover form submissions only:

```sql
WHERE created_at >= timestamptz '2026-02-23 07:58:00+02'
```

Legacy records are not corrected retroactively (decision, October 2026), even where they contain implausible values (e.g. a date in year 0002).

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

### Photo Archiving Pipeline

An automated weekly job handles photo archiving:

**Schedule:** Every Monday at 2:00 AM UTC (Supabase Cron job: `archive-photos-job`)

**What it does:**
1. Finds validated reports older than 10 days with photos still in Supabase storage
2. Uploads each photo to Cloudflare R2 as `{year}/report_{id}_{n}.jpg`
3. Updates `photo_urls` in the `reports` table to the new R2 public URLs
4. Deletes the originals from Supabase storage
5. Sets `archived = true` and `archived_at` timestamp on each processed report
6. Logs the run to the `system_stats` table

**Configuration** (editable in Supabase → Table Editor → `config` table):
- `archive_after_days` — how many days after validation before archiving (default: 10)
- `archive_batch_size` — max records per run (default: 50)

**Monitoring:** The admin dashboard shows storage usage and last job status in real time.

**Manual trigger:** The job can be triggered manually by calling the `archive-photos` Edge Function directly if needed.

**Records excluded from archiving:**
- Reports with `archived = true` (already processed, Google Drive URLs, or no photos)
- Reports with status other than "Validated"
- Reports newer than `archive_after_days`

### Monthly Tasks (1st of each month)

- [ ] Export all data to CSV and save backup
- [ ] Export species table as CSV
- [ ] Check admin dashboard storage indicator (should be green)
- [ ] Check last archiving job status in admin dashboard
- [ ] Review admin user list — remove inactive accounts
- [ ] Test form submission (submit a test report, then delete it)

### Quarterly Tasks

- Review species list for taxonomy updates
- Check for duplicate reports (see SQL snippets)
- Verify GeoJSON distribution data is current (and `expected-by-region.json` regenerated after any change)
- Performance review: page load time, export speed

### Testing Form Changes (No Staging)

There is no staging environment, so form changes are tested on a temporary copy deployed next to production:

1. Create `index-test.html` in the repo — a copy of `index.html` with the changes, plus:
   - a visible banner ("דף בדיקה") and `<meta name="robots" content="noindex, nofollow">`
   - every submission tagged: `full_name` and `additional_comments` prefixed with `[TEST <name>]`
2. Test at `https://herp-israel-form.vercel.app/index-test.html` (desktop in Hebrew and English (US) browsers, plus a phone). Avoid attaching photos — they go to the real storage bucket.
3. Test rows land in production as "Pending Review". They are not public: `public_reports_safe` and `public_heatmap_grid` only show `Validated` rows. **Never validate test rows.**
4. Check the stored values:
   ```sql
   SELECT id, date, time, created_at AT TIME ZONE 'Asia/Jerusalem' AS created_local, status
   FROM reports WHERE full_name LIKE '[TEST%' ORDER BY created_at;
   ```
5. Delete the test rows by explicit ID **and** tag (double safety), after confirming `photo_urls` is null:
   ```sql
   DELETE FROM reports
   WHERE id IN (...) AND full_name LIKE '[TEST%'
   RETURNING id, full_name;
   ```
6. Release by applying the same changes to `index.html` (without the test markers), then delete `index-test.html`.

### Regions & Range Maps Maintenance

**New regions file (`israel-regions.geojson`):**
1. Send it to Claude to check and clean (overlaps, gaps, near-duplicate points, label positions)
2. Upload the cleaned file to GitHub
3. Run the generated database update script, then tests 1–4 and 6 from `03_tests.sql`: 23 valid regions, 0 overlaps, 0 unassigned, view totals match, permissions true / false / true
4. Regenerate `expected-by-region.json` and upload it

**New range maps (`herp.geojson`):**
1. Send it to Claude to check and compact; names must match the species table
2. Upload `herp.geojson`
3. Claude recomputes range depths and lists new borderline cases; the experts decide them in the review workbook
4. Regenerate `expected-by-region.json` and upload it

**Refresh numbers for a post or analysis:** in the SQL editor (row limit ≥ 1,000) export `select region_id, species_id, report_count from public_region_counts order by region_id::int, species_id;` and the species list as CSV, and send them to Claude.

New validated reports need no action — region counts on the public page are computed live.

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
├── herp.geojson        # Species distribution polygons (95 species)
├── israel-regions.geojson   # 23 zoogeographic regions
├── expected-by-region.json  # Expected species per region
├── regions-layer.js    # Region outlines/labels for the admin tools
├── admin-species-cards.html # Admin species cards tool
├── admin-map-compare.html   # Admin multi-species map tool
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

**Species per region (public view):**
```sql
select region_id, species_id, report_count
from public_region_counts
order by region_id::int, species_id;
```

**Reports hidden from the public:**
```sql
select id, date, species_id, status from reports where exclude_from_public;
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

| Resource | Limit | Notes |
|----------|-------|-------|
| Database storage | 500 MB | Monitor in Supabase → Settings → Usage |
| File storage | 1 GB | Maintained at steady state by archiving pipeline |
| Monthly active users | 50,000 | ~5 admins |
| Edge Function invocations | 500,000/month | Archiving job uses ~52/year |

Monitor at: Supabase → Settings → Usage

### New Database Objects (March 2026)

| Object | Type | Purpose |
|--------|------|---------|
| `config` | Table | Configurable job parameters |
| `system_stats` | Table | Archiving job run history |
| `get_storage_used_mb()` | Function | Returns current Supabase storage usage in MB |
| `get_reports_for_archiving()` | Function | Returns reports eligible for archiving |
| `archive-photos` | Edge Function | Photo archiving job |
| `archive-photos-job` | Cron Job | Weekly schedule (Mondays 2AM UTC) |

### New Database Objects (October 2026)

| Object | Type | Purpose |
|--------|------|---------|
| PostGIS | Extension (`extensions` schema) | Spatial functions for regions |
| `regions` | Table | 23 region shapes (RLS on, no public access) |
| `public_region_counts` | View | Validated reports per region and species |
| `reports.exclude_from_public` | Column | Hides a report from all public views |

SQL scripts (with the maintainer): `01_regions_setup.sql`, `02_region_counts_view.sql`, `03_tests.sql`, `04`/`05_update_regions_*.sql`, `06_exclude_from_public.sql`, `99_rollback.sql`.

---

## Admin Comparison Tools

Two internal HTML tools for visualising and comparing species distribution data. Both are deployed to the Vercel repo root and accessible via URL. **They are not password protected — do not share URLs publicly.**

**Desktop only:** Both tools block access on screens narrower than 1024px.

---

### Species Cards (`admin-species-cards.html`)

**URL:** https://herp-israel-form.vercel.app/admin-species-cards.html

Generates visual cards for any selection of species. Each card displays the Hebrew and Latin name plus a single map showing both the field sightings heatmap and the official IUCN distribution polygon overlaid, and the validated report count.

**Card layout by species count:**

| Selected | Layout |
|----------|--------|
| 1 | Centred, ~500px wide |
| 2 | Side by side, centred |
| 3 | Three equal columns |
| 4 | 2 × 2 grid |
| 5 | Row of 3 + row of 2 |
| 6 | Two rows of 3 |

For 4+ species a note is shown suggesting to screenshot each row separately.

**Features:**
- Searchable species list with checkboxes — selected species float to top
- Colour picker per species (shared with compare map via `localStorage`)
- Heatmap layer toggle and distribution layer toggle
- Collapsible sidebar (◀ תפריט) for clean screenshotting
- Light/dark basemap toggle (🌙 / ☀️) — preference saved to `localStorage`
- "אזורים" switch — zoogeographic region outlines on the cards

**Typical workflow for a Facebook post:**
1. Select species → set colours → click צור כרטיסים
2. Collapse sidebar → screenshot the cards area
3. Post screenshot

---

### Map Compare (`admin-map-compare.html`)

**URL:** https://herp-israel-form.vercel.app/admin-map-compare.html

Displays multiple species simultaneously on one shared map. Each species is rendered in a distinct colour with both heatmap cells and distribution polygon.

**Features:**
- Searchable species list with checkboxes — selected species float to top
- Colour picker per species (shared with cards page)
- Heatmap and distribution toggles (independent)
- Live legend showing species names and report counts
- Light/dark basemap toggle — preference shared with cards page
- Colour changes applied live without re-loading layers
- "אזורים" and "שמות אזורים" switches — region outlines and region names (labels hide automatically where they would overlap)

**Note on overlapping species:** Heatmap opacity is kept lower than on the cards page intentionally — this allows colours to blend gracefully in shared habitat zones rather than producing opaque overlapping blocks.

---

### Shared Technical Details

**localStorage keys used:**

| Key | Purpose |
|-----|---------|
| `herp_species_colors` | Colour assignment per species (scientific name → hex) |
| `herp_map_mode` | Basemap preference: `'light'` or `'dark'` |
| `herp_regions_on` | Region outlines on/off |
| `herp_region_labels_on` | Region names on/off (compare page) |

**Region outlines** are drawn by the shared `regions-layer.js` from `/israel-regions.geojson`; they are display-only and never block clicks on other layers.

Both keys are read on page load and written on change. Switching on one page does not live-update another already-open tab — preference takes effect on the next page load.

**Data sources:** Same Supabase endpoints as the public page (`public_heatmap_grid`, `public_reports_safe`, `species` table) plus the `herp.geojson` served from repo root. Uses the anon key — same security profile as `public.html`.

**Critical JS note:** In `admin-map-compare.html`, any constants or functions called during `L.map()` initialisation (including `getCurrentTile()`) must be declared before that line. `const`/`let` are not hoisted. Placing them after causes a silent `ReferenceError` that crashes the entire script.

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

**Regions mode not loading on the public page:**
1. Open `/israel-regions.geojson` and `/expected-by-region.json` directly in the browser
2. Check the browser console for `[regions mode]` messages (F12)
3. Verify the `public_region_counts` view exists and anon can select from it (`03_tests.sql` test 6)
4. Without `expected-by-region.json` the page still works, but without the "expected" wording and light-green regions

**A report appears in the "wrong" region:**
- The region is decided by the report's exact location, while heatmap cells are ~10 km wide and can overlap two regions (e.g. Eilat city and coast belong to the Arava, not the Eilat Mountains). Check with an admin query joining `reports` to `regions` before assuming an error.

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

**Date field won't accept typing:**
- By design — the date is selected from the calendar only. Click anywhere in the field to open it.

**Date in the field shows in US order (e.g. 10/17/2026):**
- The display order comes from the user's browser language and cannot be changed by the page. The stored date is correct; the Hebrew text under the field ("נבחר: …") shows the actual date.

**Today's date is greyed out / can't be selected:**
- The page was probably left open past midnight. Reload the page.

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
2. Only 95 species have polygons — introduced species and a few others have no range map

### Database Issues

**Storage indicator shows amber or red:**
1. Check admin dashboard — storage indicator will show current MB
2. Check `system_stats` table to confirm archiving job is running
3. If archiving job has not run recently, trigger it manually via Edge Functions
4. If storage is genuinely filling up, consider upgrading to Supabase Pro ($25/month → 100GB)

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

## Change History

### October 2026 — Zoogeographic Regions, Expected Species and Public Page

**Regions**
- 23 zoogeographic regions adapted from Fauna Palaestina (`israel-regions.geojson`, v3), validated topologically and stored in a new PostGIS `regions` table
- New public view `public_region_counts` (validated reports per region and species)
- Region outline layer on the public page and both admin tools (`regions-layer.js`)

**Range maps and expected species**
- `herp.geojson` revised by the project's experts (v5, 95 species), compacted from 21.7 MB to 2.2 MB without changing results
- Expected species per region computed from range penetration (≥ 1 km) plus expert review of every borderline case; published as `expected-by-region.json`

**Hiding reports**
- New column `reports.exclude_from_public`; all three public views filter on it. Four reports hidden (three moved by people, one pending verification)

**Public page**
- Map mode switch "מפת חום | אזורים" and "גבולות אזורים" toggle, placed top left over the sea
- Regions mode: species richness per region; per species, each region coloured recorded / expected but not yet recorded / neither, with the range as a green outline (revised Oct 17 — the earlier brown/olive overlap suggested sightings outside the range when it only described part of a region)
- Species box fixed: reads all reports (was capped at the first 1,000) and counts one per scientific name incl. sea turtles
- Map note corrected from "כ-10 קמ״ר" to "כ-10 ק״מ" (cells are ~85 km²)

**Species table:** duplicate ids for the same scientific name (e.g. ecotypes) are kept on purpose, so reports can later be split by variant; analyses merge them by scientific name.

**Facebook post:** species richness per region (recorded and expected), posted October 10, 2026.

### October 2026 — Submission Form Date Fix

**Problems found in `index.html`**

1. **Typed dates misread on desktop.** The native date field displays and accepts typing in the browser's language order. With a browser set to English (US) the order is `mm/dd/yyyy`, so a user typing `05/10/2026` meaning 5 October would store 10 May. Only dates with day and month both ≤ 12 could be affected. Phones were not affected (picker only).
2. **Default date wrong after midnight.** `setDefaultDate()` used `new Date().toISOString()`, which returns the **UTC** date. Between 00:00 and 03:00 Israel time (02:00 in winter) the form defaulted to yesterday.
3. **No limits.** Future dates and nonsense years (e.g. `32026`) were accepted.

**Fix (released 2026-10-18)** — see [Date Field](#date-field):
- Default date uses local time (`localTodayISO()`)
- `min` 1900-01-01 / `max` today
- Typing blocked, calendar opens on click (`showPicker()`)
- Selected date shown in Hebrew words under the field
- Submit handler unchanged

Alternatives considered and rejected: a confirmation dialog for ambiguous typed dates (too complex — against the keep-it-simple policy); a third-party date-picker library (new dependency and higher risk with no staging).

**Data review of form submissions** (all reports created since the go-live cutoff, 2026-02-23 07:58; legacy data excluded by decision)

| Check | Method | Result |
|-------|--------|--------|
| Day/month swap | Candidates: day and month both ≤ 12 and different (~130 rows). A swap was flagged as certain if the stored date was in the future but the swapped one was not, or the swapped date equalled the submission day or the day before. | **No confirmed cases.** 13 historical rows where both readings were plausible were reviewed manually; photo EXIF dates confirmed 26450 and 26498; the rest were kept as stored. |
| UTC default date | Submitted in the window where the UTC date differs from the Israel date, with `date` = the UTC date. The `time` field decides: a sighting time later in the day than the submission time must be the previous day (correct). | **1 case:** 26705 (seen 00:49, submitted 00:50 on 30 Aug) → corrected to 2026-08-30. |
| Impossible dates | Date after submission, or year < 1900 | **2 cases:** 26620 `32026-02-20` → 2026-02-20; 26593 `2026-06-30` (submitted 2 June) → 2026-06-01, confirmed from the reporter's own post (night of 31 May, 00:50). |

All corrections were made with guarded `UPDATE` statements (`WHERE id = … AND date = <old value>`) and set `updated_by` / `updated_at`.

**Lessons for future data checks**
- Photo EXIF dates are a reliable tiebreaker: photos uploaded directly usually keep `DateTimeOriginal`; photos passed through WhatsApp or similar apps arrive stripped (typically 960×1280, no metadata).
- Seasonal plausibility is a weak signal — several species are active in the mild Israeli winter. Prefer photo dates, the reporter's own text, or the reporter.

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
| Zoogeographic region | One of 23 areas of Israel (adapted from Fauna Palaestina) used for regional statistics |
| `public_region_counts` | Database view with validated report counts per region and species |
| Expected species | Species whose range reaches ≥ 1 km into a region, after expert review (`expected-by-region.json`) |
| `exclude_from_public` | Report flag that hides a validated report from all public views |
| PostGIS | Spatial extension for PostgreSQL, used for the regions |

### Contact

**Project Maintainer:** Aram Aviram
**Email:** aram.aviram@gmail.com

**For technical support:**
- Upload this README + relevant HTML file to Claude AI
- Include browser console output (F12 → Console)
- Describe the issue and what you expected to happen


## One-Time Analyses

One-time exploratory analyses (not permanent site features) are documented in separate files:

- [`analysis-daboia-vs-hemorrhois-2026-07.md`](./analysis-daboia-vs-hemorrhois-2026-07.md) — Spatial distribution comparison between Daboia palaestinae (צפע מצוי) and Hemorrhois nummifer (זעמן מטבעות), including a check for correlation with elevation
- Species richness per region (October 2026) — recorded vs. expected species per zoogeographic region, published on Facebook; methods, decisions and outputs in the "Herp Israel — Regions Project Status" doc (Claude Docs, with Aram)

---

*For quick day-to-day reference, see README_Quick_Reference.md*

**End of Comprehensive Guide**
