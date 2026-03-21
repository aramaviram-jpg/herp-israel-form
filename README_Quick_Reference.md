# Herp Israel Project - Quick Reference

**Wildlife Reporting System for Israeli Reptiles & Amphibians**
Last Updated: March 2026

---

## 🔗 Quick Links

| Service | URL | Purpose |
|---------|-----|---------|
| **Public Form** | https://herp-israel-form.vercel.app | Submit sightings |
| **Public Page** | https://herp-israel-form.vercel.app/public.html | Stats, map, species cards |
| **Admin Dashboard** | https://herp-israel-form.vercel.app/admin.html | Validate & edit reports |
| **Supabase Console** | https://supabase.com/dashboard/project/qobayftqligpshmyweio | Database management |
| **Cloudflare R2** | https://dash.cloudflare.com | Photo archive storage |
| **Vercel Dashboard** | https://vercel.com | Website deployment |
| **GitHub Repository** | https://github.com/[username]/herp-israel-form | Source code |

---

## 🔑 System Accounts

### Supabase (Database)
- **Project:** herp-israel
- **Project ID:** qobayftqligpshmyweio
- **Login:** aram.aviram@gmail.com

### Vercel (Website Hosting)
- **Login:** Via GitHub authentication
- **Project:** herp-israel-form

### GitHub (Code Storage)
- **Repository:** herp-israel-form
- **Edit files:** Via GitHub web interface (no local Git)

### Admin Access
- **URL:** /admin.html
- **Users:** Managed in Supabase → Authentication

### Cloudflare (Photo Archive)
- **Service:** R2 Object Storage
- **Bucket:** herp-israel-photos
- **Login:** cloudflare.com (Aram's account)

---

## 📊 Daily Admin Tasks

### View New Reports
1. Login to admin dashboard
2. Check "ממתינים לאימות" count in statistics cards
3. Review pending submissions

### Validate Reports
1. Click "צפה" on a report row
2. Review photo and details
3. Verify species identification
4. Click "אמת" (validate) or "דחה" (reject)
5. Add validation notes if useful

### Edit a Report (full edit)
1. Click "צפה" on a report row
2. Click "✏️ ערוך דיווח" (top right of modal)
3. Edit any fields including GPS on the mini-map
4. Click "שמור שינויים"
5. Check that `TEST_MODE = false` in code if saves aren't working

### Export Data
- **All records:** Click "ייצא הכל ל-CSV"
- **Filtered records:** Apply filters → Click "ייצא מסונן ל-CSV"
- **Save monthly backups!**

---

## 🗺️ Using the Admin Map

### View All Sightings
- Map shows all records with GPS coordinates (not paginated)
- Color coded by status:
  - 🟠 Orange = Pending
  - 🟢 Green = Validated
  - 🔴 Red = Rejected

### Select Area
1. Click "📐 בחר אזור במפה"
2. Click once to anchor start corner
3. Click again to finish the rectangle
4. Table and map filter to selected area
5. Click "✖ נקה בחירת אזור" to clear

### Overlapping Markers
- Click pin → shows all reports at that location
- Scroll through list
- Click "צפה בדיווח" to open detail modal

---

## 🌍 Public Page Features

### Info Boxes (top)
- Total sightings, validated sightings, distinct species, last-7-days species

### Map
- Species dropdown → filters heatmap to that species
- Distribution polygon (from IUCN data via `herp.geojson`) appears below heatmap
- Clear selection to return to full-dataset heatmap

### Species Card
Shows: photo, Hebrew + scientific name, venom/poison badge (with SVG icons), activity time, size, diet, description, IUCN status, sighting count

### Charts
- Monthly seasonality bar chart
- Top 10 reported species
- Family breakdown

---

## 🔍 Filtering Reports (Admin)

### Available Filters
- **Status:** Pending / Validated / Rejected
- **Family:** Taxonomic family
- **Species:** Specific species
- **Date Range:** From → To
- **Map Area:** Draw rectangle on map

### Apply / Clear
- "החל סינון" → applies filters to both table and map
- "נקה" → resets all filters

---

## 📄 Pagination

- 100 records per page
- Navigation: Previous/Next at bottom
- Map always shows ALL records (not just current page)

---

## 🛠️ Common Tasks

### Add New Admin User
1. Supabase → Authentication → Users
2. "Add User" → "Create new user"
3. Enter email and password
4. ✅ Check "Auto Confirm User"
5. Share credentials manually (no email sent)

### Update Species List
1. Supabase → Table Editor → species
2. Add/edit rows directly
3. Changes appear immediately in form and public page

### Add Species Photo
1. Get a publicly accessible image URL
2. Supabase → Table Editor → species → find species row
3. Paste URL into `photo_url` column

### Update Distribution Data (GeoJSON)
1. Replace `herp.geojson` in GitHub repository
2. Vercel auto-deploys; public page picks it up on next load

### Check Database Size
1. Supabase → Settings → Usage
2. Alert when approaching 400MB (free tier limit: 500MB)

---

## 💾 Monthly Backup Checklist

**Do this on the 1st of every month:**

- [ ] Admin dashboard → "ייצא הכל ל-CSV" → save as `reports_backup_YYYY-MM.csv`
- [ ] Supabase SQL Editor → `SELECT * FROM species ORDER BY common_name;` → export CSV
- [ ] Save both files locally + Google Drive
- [ ] Check storage indicator in admin dashboard (should be green)
- [ ] Check last archiving job status in admin dashboard (should show recent success)
- [ ] Verify website is online
- [ ] Test form submission

---

## 📸 Photo Archiving Pipeline

Photos are automatically archived weekly to Cloudflare R2.

**Schedule:** Every Monday at 2:00 AM UTC

**What happens automatically:**
- Validated reports older than 10 days have their photos moved from Supabase to R2
- Photos remain fully visible in the admin dashboard (URLs update automatically)
- Original full-resolution photos are preserved permanently in R2

**Monitor in admin dashboard:** Two cards show current storage usage and last job status.

**If archiving job fails:**
1. Check admin dashboard — storage card will show current MB
2. Supabase → SQL Editor → `SELECT * FROM system_stats ORDER BY recorded_at DESC LIMIT 5;`
3. Contact Aram to manually trigger the job if needed

**Retrieve an original photo from R2:**
1. Find the report in Supabase → Table Editor → reports
2. Note the `archived_photo_keys` value (e.g. `2026/report_26400_1.jpg`)
3. Login to Cloudflare → R2 → herp-israel-photos → browse to the file

---

There is a flag near the top of `admin.html`:

```javascript
const TEST_MODE = false;
```

- **`false` (default/production):** Edits save to the database normally
- **`true`:** Edit saves are blocked — shows a yellow warning and logs to console only

If edits are not saving, check this flag is set to `false`.

---

## 🚨 Troubleshooting

### Can't Login to Admin
- Verify email in Supabase → Authentication
- Clear browser cache (Ctrl+Shift+R) or try incognito

### Public Form Errors After Using Admin
- Click "התנתק" in admin before using the public form in the same browser

### Map Not Loading
- Wait 10–15 seconds (loading many records)
- Check internet connection
- Refresh page (Ctrl+Shift+R)

### Distribution Polygon Not Showing
- Species must have a two-word scientific name matching `herp.geojson`
- Check browser console for `[distribution]` logs (F12)
- Not all species have IUCN polygons

### Export Not Working
- Check browser pop-up blocker
- Try different browser
- Verify logged in

### Form Not Submitting
- Check all required fields (*) are filled
- Open browser console for errors (F12)
- Check Supabase status

---

## 🔐 Security Best Practices

- ✅ Never share the `service_role` key
- ✅ Never commit the `service_role` key to GitHub (use only `anon` key in code)
- ✅ Use different passwords for each service
- ✅ Logout when done on shared computers
- ✅ Regular backups (monthly minimum)
- ✅ Remove inactive admin accounts

---

## 📞 Support

**Technical Issues:**
- Supabase: https://supabase.com/support
- Vercel: https://vercel.com/support
- Claude AI: Upload README + relevant HTML file + describe the issue + include browser console output (F12)

---

**For full procedures and schema details, see README_Comprehensive.md**
