# Herp Israel Project - Quick Reference

**Wildlife Reporting System for Israeli Reptiles & Amphibians**  
Last Updated: February 2026

---

## 🔗 Quick Links

| Service | URL | Purpose |
|---------|-----|---------|
| **Public Form** | https://herp-israel-form.vercel.app | Submit sightings |
| **Admin Dashboard** | https://herp-israel-form.vercel.app/admin.html | Manage reports |
| **Supabase Console** | https://supabase.com | Database management |
| **Vercel Dashboard** | https://vercel.com | Website deployment |
| **GitHub Repository** | https://github.com/[username]/herp-israel-form | Source code |

---

## 🔑 System Accounts

### Supabase (Database)
- **Project:** herp-israel
- **Project ID:** qobayftqligpshmyweio
- **Login:** [Your email]

### Vercel (Website Hosting)
- **Login:** Via GitHub authentication
- **Project:** herp-israel-form

### GitHub (Code Storage)
- **Repository:** herp-israel-form
- **Login:** [Your GitHub credentials]

### Admin Access
- **URL:** /admin.html
- **Users:** Managed in Supabase → Authentication

---

## 📊 Daily Admin Tasks

### View New Reports
1. Login to admin dashboard
2. Check "ממתינים לאימות" count
3. Review pending submissions

### Validate Reports
1. Click "צפה" on report
2. Review photo and details
3. Verify species identification
4. Click "אמת" (validate) or "דחה" (reject)
5. Add notes if needed

### Export Data
- **All records:** Click "ייצא הכל ל-CSV"
- **Filtered records:** Apply filters → Click "ייצא מסונן ל-CSV"
- **Save monthly backups!**

---

## 🗺️ Using the Map

### View All Sightings
- Map shows all records with GPS coordinates
- Color coded by status:
  - 🟠 Orange = Pending
  - 🟢 Green = Validated
  - 🔴 Red = Rejected

### Select Area
1. Click "📐 בחר אזור במפה"
2. Click once to start
3. Move mouse and click again to finish
4. Table and map filter to selected area
5. Click "✖ נקה בחירת אזור" to clear

### Overlapping Markers
- Click pin → Shows all reports at that location
- Scroll through list
- Click "צפה בדיווח" to view details

---

## 🔍 Filtering Reports

### Available Filters
- **Status:** Pending / Validated / Rejected
- **Family:** Taxonomic family
- **Species:** Specific species
- **Date Range:** From → To
- **Map Area:** Draw on map

### Apply Filters
1. Select filter values
2. Click "החל סינון"
3. Both table and map update

### Clear Filters
- Click "נקה" button
- Resets all filters and map selection

---

## 📄 Pagination

- **Records per page:** 100
- **Navigation:** Previous/Next buttons at bottom
- **Total shown:** "מציג 1-100 מתוך 6110 דיווחים"
- **Map:** Always shows ALL records (not paginated)

---

## 🛠️ Common Tasks

### Add New Admin User
1. Supabase → Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter email and password
4. ✅ Check "Auto Confirm User"
5. Click "Create user"
6. Share credentials with new admin

### Update Species List
1. Supabase → Table Editor → species
2. Add/edit rows directly
3. Changes appear immediately in form

### Check Database Size
1. Supabase → Database → Usage
2. Monitor: Should stay under 500MB (free tier)
3. Upgrade to Pro when reaching 400MB

---

## 💾 Monthly Backup Checklist

**Do this on the 1st of every month:**

- [ ] Export all data to CSV
- [ ] Save CSV to computer + external backup
- [ ] Check database size in Supabase
- [ ] Verify website is online
- [ ] Test form submission

---

## 🚨 Troubleshooting

### Can't Login to Admin
- Check email/password in Supabase → Authentication
- Clear browser cache (Ctrl+Shift+R)
- Try incognito mode
- Logout and login again

### Map Not Loading
- Wait 10 seconds (loading 6000+ pins)
- Check internet connection
- Refresh page (Ctrl+Shift+R)

### Export Not Working
- Check browser pop-up blocker
- Try different browser
- Verify you're logged in

### Form Not Submitting
- Check all required fields (*) are filled
- Verify photo size < 10MB
- Try without photo first
- Check browser console for errors (F12)

---

## 📞 Emergency Contacts

**Technical Issues:**
- Supabase Support: https://supabase.com/support
- Vercel Support: https://vercel.com/support

**Database Issues:**
- Can always export CSV and rebuild if needed
- Photos stored in Google Drive (safe)

---

## 🔐 Security Best Practices

- ✅ Never share service_role key
- ✅ Use different passwords for each service
- ✅ Don't share admin credentials publicly
- ✅ Logout when done on shared computers
- ✅ Regular backups (monthly minimum)

---

**For detailed procedures, see Comprehensive Guide**
