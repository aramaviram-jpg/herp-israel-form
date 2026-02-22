# Migration Scripts Archive
**Herp Israel Database Migration - February 22, 2026**

This document archives all scripts used during the migration with explanations of their purpose and evolution.

---

## Script Inventory

### Final Working Scripts ✅

1. **import_legacy_CSV.js** - Legacy data import (FINAL VERSION)
2. **import_species_nodejs.js** - Species table import
3. **species_migration.sql** - Database schema migration
4. **data_validation_queries.sql** - Comprehensive validation queries

### Development/Troubleshooting Scripts (Historical)

5. **import_legacy_nodejs.js** - Initial Excel-based import (deprecated)
6. **import_legacy_WORKING.js** - Intermediate version with partial fixes (deprecated)

---

## 1. import_legacy_CSV.js (FINAL - Production Ready)

**Purpose:** Import 4,047 legacy observations from Google Sheets CSV export  
**Status:** ✅ Production - Successfully imported all data  
**Location:** `/mnt/user-data/outputs/import_legacy_CSV.js`

### Key Features:
- Reads CSV directly (not Excel) to avoid date interpretation issues
- Parses DD/MM/YYYY date format correctly
- Handles Excel time format conversion (decimal → HH:MM:SS)
- Comprehensive species name mapping (72 mappings)
- Fixes malformed years (0019 → 2019)
- Batch processing (500 records per batch)
- Detailed error logging and skip tracking

### Configuration Required:
```javascript
const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Line 10
const LEGACY_FILE = 'legacy_data.csv'; // Line 11
```

### Usage:
```bash
# Prerequisites
npm install @supabase/supabase-js

# Place files in working directory
# - import_legacy_CSV.js
# - legacy_data.csv (exported from Google Sheets)

# Configure service key in script (line 10)

# Run import
node import_legacy_CSV.js
```

### Expected Output:
```
=== LEGACY DATA IMPORT FROM CSV ===
Loading species from database...
Loaded 106 species

Reading CSV file...
Found 4116 rows in CSV

Processing records...
=== PROCESSING COMPLETE ===
Total input: 4116
✅ Ready to import: 4047
⏭️  Skipped: 69

Importing to Supabase...
[9 batches processed]

=== IMPORT COMPLETE ===
✅ Successfully imported: 4047 records
⏭️  Skipped: 69
```

### Species Mapping Dictionary:
The script includes 72 legacy → current species name mappings:

**Examples:**
- "אילנית" → "אילנית מצויה"
- "חנק" → "חנק משריץ"
- "טריטון" → "טריטון פסים"
- "עין חתול אדמדם" → "עין-חתול אדמדם" (space → hyphen)
- "צב ביצה" → "צב-ביצות מצוי"
- "נחש חולות" → "נחש-חולות חרטומן"

### Skip Logic:
**Records skipped (69 total):**
- No species name: 51 records
- In skip list (combined entries): 17 records
- Invalid format: 1 record

### Critical Functions:

#### parseCSV()
Handles quoted CSV fields properly to avoid column name mismatches:
```javascript
function parseCSV(text) {
    // Parses CSV with proper quote handling
    // Strips quotes from column names
    // Returns array of row objects
}
```

#### parseDate()
Converts DD/MM/YYYY to YYYY-MM-DD with error correction:
```javascript
function parseDate(dateStr) {
    // Handles: 25/02/2019 → 2019-02-25
    // Fixes: 25/02/0019 → 2019-02-25
    // Validates: year between 1990-2030
}
```

#### cleanNumberOfIndividuals()
Normalizes count values:
```javascript
function cleanNumberOfIndividuals(value) {
    // 1-10 → string number
    // >10 → "Many"
    // null/invalid → "Unknown count"
}
```

---

## 2. import_species_nodejs.js (Production Ready)

**Purpose:** Import 111 species from Excel file to species table  
**Status:** ✅ Production - Successfully imported all species  
**Location:** `/mnt/user-data/outputs/import_species_nodejs.js`

### Key Features:
- Imports from Excel file (Reptile_list.xlsx)
- Maps all 8 fields from Excel columns
- Adds "לא מזוהה" (Unidentified) species automatically
- Validates required fields
- Safe upsert with conflict resolution

### Excel Column Mapping:
```javascript
{
    id_sp: row['ID_sp'],
    common_name: row['Common name (Hebrew)'],
    common_name_en: row['Common name (English)'],
    scientific_name: row['Scientific name'],
    family: row['Family (Hebrew)'],
    population: row['Population'],
    red_list_status: row['Red List']
}
```

### Usage:
```bash
npm install @supabase/supabase-js xlsx

# Configure service key (line 7)
# Place Reptile_list.xlsx in working directory

node import_species_nodejs.js
```

### Expected Output:
```
=== SPECIES IMPORT ===
Reading Excel file...
Found 110 rows in Excel

Processing species...
Importing to Supabase...
✅ Imported: 110 species
✅ Added "לא מזוהה" species

=== IMPORT COMPLETE ===
✅ Total species in database: 111
```

---

## 3. species_migration.sql (Database Schema)

**Purpose:** Create new species table structure with 8 fields  
**Status:** ✅ Production - Schema successfully migrated  
**Location:** `/mnt/user-data/outputs/species_migration.sql`

### Migration Strategy:
1. Backup existing species table
2. Drop old table (with CASCADE to remove constraints)
3. Create new table with enhanced schema
4. Restore foreign key on reports table

### Schema Definition:
```sql
CREATE TABLE species (
    id BIGSERIAL PRIMARY KEY,
    id_sp INTEGER,
    common_name TEXT NOT NULL,
    common_name_en TEXT,
    scientific_name TEXT NOT NULL,
    family TEXT NOT NULL,
    population TEXT,
    red_list_status TEXT
);
```

### Field Descriptions:
- **id** - Auto-incrementing primary key
- **id_sp** - Sequential species identifier (from source data)
- **common_name** - Hebrew common name (preserved from old schema)
- **common_name_en** - English common name (NEW)
- **scientific_name** - Latin binomial (preserved from old schema)
- **family** - Taxonomic family in Hebrew (preserved from old schema)
- **population** - Subspecies/population designation (NEW)
- **red_list_status** - IUCN Red List category (NEW)

### Foreign Key Restoration:
```sql
ALTER TABLE reports
ADD CONSTRAINT reports_species_id_fkey 
FOREIGN KEY (species_id) 
REFERENCES species(id);
```

**Critical:** The foreign key was lost during `DROP TABLE species CASCADE` and must be restored for Supabase API to recognize the relationship.

---

## 4. data_validation_queries.sql (Validation Suite)

**Purpose:** Comprehensive data quality validation queries  
**Status:** ✅ Production - Ready for ongoing monitoring  
**Location:** `/mnt/user-data/outputs/data_validation_queries.sql`

### Query Categories:

#### 1. Basic Counts
- Total reports, species
- GPS coverage
- Photo coverage
- Date range

#### 2. Temporal Distribution
- Reports by year
- Reports by month
- Date range analysis
- Temporal trends

#### 3. Species Distribution
- Top 20 most reported species
- Species with no reports
- Reports by family
- Subspecies/populations

#### 4. Data Quality Checks
- Missing dates
- Invalid dates (future/past)
- Suspicious GPS coordinates
- Duplicate detection
- Time field coverage

#### 5. Status and Validation
- Reports by status
- Pending review items
- Validation notes

#### 6. Photo Data
- Photo coverage metrics
- Storage type distribution

#### 7. Red List Status
- Reports by conservation status
- Most reported threatened species

#### 8. Contributor Statistics
- Top contributors
- Known vs unknown reporters

#### 9. Geographic Distribution
- GPS coverage over time
- Location patterns

#### 10. Migration Verification
- Orphaned records check
- Missing required fields
- Species ID continuity

#### 11. Sample Data Review
- Recent reports with full details
- Random sampling

### Usage:
Run individual queries in Supabase SQL Editor for targeted analysis or monitoring.

### Summary Report Query:
```sql
SELECT 
    'Total Reports' as metric,
    COUNT(*)::text as value
FROM reports
UNION ALL
-- [8 more metrics]
```

Provides quick overview of system health.

---

## Deprecated Scripts (Historical Reference)

### import_legacy_nodejs.js (Deprecated)

**Why deprecated:** Used Excel file which caused date interpretation issues

**Issues encountered:**
- Excel serial dates caused timezone offset (dates off by 1 day)
- Complex date conversion logic failed
- Replaced by CSV-based approach

### import_legacy_WORKING.js (Deprecated)

**Why deprecated:** Partial fix for Excel issues, but still problematic

**Issues encountered:**
- Fixed time field conversion
- Fixed some date issues
- But Excel date interpretation still unreliable
- Replaced by CSV-based approach for clean solution

---

## Evolution Timeline

### Version 1: import_legacy_nodejs.js
- **Status:** Failed ❌
- **Issue:** Excel date interpretation (year 45000+)
- **Lesson:** JavaScript Date() treats Excel numbers as milliseconds

### Version 2: import_legacy_WORKING.js
- **Status:** Partially working ⚠️
- **Improvements:** 
  - Fixed time field (Excel decimal → HH:MM:SS)
  - Improved date parsing
- **Remaining issues:**
  - Still had timezone offset (dates off by 1 day)
  - GPS coordinates all NULL (column name mismatch)
- **Lesson:** Excel format inherently problematic

### Version 3: import_legacy_CSV.js ✅
- **Status:** Success! ✅
- **Key changes:**
  - Switched to CSV input (text-based, no interpretation)
  - Simple DD/MM/YYYY string parsing
  - Fixed CSV column name handling (quotes)
  - Added malformed year correction (00YY → 20YY)
- **Result:** 100% successful import with correct dates

---

## Key Lessons Learned

### 1. File Format Matters
**Problem:** Excel stores dates as numbers, JavaScript interprets them wrong  
**Solution:** Use CSV export from Google Sheets for text-based date values

### 2. Column Name Precision
**Problem:** CSV export changed `"Latitude (מוזן ידנית ע"י אדמין)"` to `"Latitude (מוזן ידנית עי אדמין)"`  
**Solution:** Parse CSV headers with proper quote handling, use exact names

### 3. Date Format Validation
**Problem:** Source data had malformed years (0019, 0020, etc.)  
**Solution:** Add pattern matching to fix common errors during import

### 4. Species Name Consistency
**Problem:** Legacy data uses spaces, new schema uses hyphens  
**Solution:** Comprehensive mapping dictionary with 72 transformations

### 5. Batch Processing
**Problem:** Importing 4,000+ records at once could hit rate limits  
**Solution:** Batch processing (500 per batch) with delays

### 6. Error Tracking
**Problem:** Need visibility into what's being skipped and why  
**Solution:** Detailed skip reason logging with counts

---

## Maintenance Guidelines

### Running Import Scripts

**Before running:**
1. Backup database
2. Test with small dataset first
3. Verify CSV/Excel file format
4. Check service key is valid
5. Ensure network access to Supabase

**After running:**
1. Verify import counts match expected
2. Run validation queries
3. Check admin dashboard functionality
4. Review skip/error logs
5. Test search and filtering

### Updating Species Data

To add new species:
1. Add row to Reptile_list.xlsx
2. Run `import_species_nodejs.js`
3. Verify in species table
4. Test in form dropdown

### Re-importing Data

If needed to re-import:
1. `DELETE FROM reports;` (clears all reports)
2. Run `import_legacy_CSV.js`
3. Run validation queries
4. Restore foreign key if needed

---

## Script Locations

### Production Scripts:
```
/mnt/user-data/outputs/
├── import_legacy_CSV.js          (Final production import)
├── import_species_nodejs.js       (Species import)
├── species_migration.sql          (Schema migration)
└── data_validation_queries.sql    (Validation suite)
```

### Historical Scripts:
```
/home/claude/
├── import_legacy_nodejs.js        (Deprecated - Excel version)
├── import_legacy_WORKING.js       (Deprecated - Partial fix)
└── import_legacy_FINAL.js         (Historical iteration)
```

### Data Files:
```
C:\herp-migration\
├── legacy_data.csv                (Source data - 4,067 rows)
├── Reptile_list.xlsx              (Species list - 110 species)
└── [Script files copied here for execution]
```

---

## Dependencies

### Node.js Packages:
```json
{
  "@supabase/supabase-js": "^2.x",
  "xlsx": "^0.18.x"
}
```

### System Requirements:
- Node.js v14+ 
- npm or yarn
- Network access to Supabase API
- Service role key with database write access

---

## Troubleshooting Guide

### Issue: Import returns 0 records
**Cause:** Species mapping not matching database  
**Solution:** Check species names in database vs mapping dictionary

### Issue: Dates off by one day
**Cause:** Using Excel file instead of CSV  
**Solution:** Export as CSV from Google Sheets, use import_legacy_CSV.js

### Issue: GPS coordinates all NULL
**Cause:** Column name mismatch between script and CSV  
**Solution:** Verify exact column names in CSV header, update script

### Issue: Time format errors
**Cause:** Excel time values not being converted  
**Solution:** Ensure cleanTime() function is being called

### Issue: Duplicate species entries
**Cause:** Multiple subspecies with same common name  
**Solution:** This is intentional - use population field to distinguish

---

## Support & Contact

For questions about these scripts:
- Review this documentation
- Check MIGRATION_SUMMARY.md for context
- Run validation queries to diagnose issues
- Consult Git commit history for evolution context

---

*Document prepared: February 22, 2026*  
*Scripts validated: February 22, 2026*  
*Production ready: ✅ Yes*
