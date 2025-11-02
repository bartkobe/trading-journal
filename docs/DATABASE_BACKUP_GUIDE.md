# Database Backup Guide

This guide covers database backup configuration, verification, and restore procedures for the Trading Journal application using Supabase.

---

## Overview

**Database Provider**: Supabase (PostgreSQL)  
**Backup Type**: Automated backups provided by Supabase  
**Backup Location**: Managed by Supabase infrastructure

---

## Automatic Backup Configuration

### ⚠️ Important: Free Plan Limitations

**The Free Plan does NOT include accessible project backups.**

While Supabase performs daily backups for infrastructure purposes, **Free Plan users cannot access or restore these backups**. To use scheduled backups, you must upgrade to the **Pro Plan** or higher.

### Supabase Backup Tiers

| Tier | Backup Access | Backup Frequency | Retention Period | Point-in-Time Recovery |
|------|--------------|-----------------|------------------|------------------------|
| **Free** | ❌ **Not available** | Daily (infrastructure only) | N/A | ❌ Not available |
| **Pro** | ✅ Available | Daily | 7 days | ❌ Not available |
| **Team** | ✅ Available | Daily | 7 days | ✅ Available |
| **Enterprise** | ✅ Available | Daily | Custom | ✅ Available |

### What Gets Backed Up

Supabase automatically backs up:
- ✅ All database tables and data
- ✅ Database schema (tables, indexes, constraints)
- ✅ Enums and types
- ✅ Functions and triggers (if any)

**Note**: On Free Plan, backups exist for Supabase's internal recovery purposes but are not accessible to users.

### Backup Timing

- Backups run automatically daily around midnight (project's region time)
- On Pro Plan and above, backups can be restored at any time
- No manual intervention required

---

## Verifying Backups Are Enabled

### Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Log in to your account
3. Select your project: **Trading Journal**

### Step 2: Check Backup Settings

**Method 1: Via Database → Backups Page**

1. Navigate to **Database** in sidebar
2. Click **Backups** (under PLATFORM section)
3. Check backup status:
   - **Free Plan**: Will show message: "Free Plan does not include project backups. Upgrade to the Pro Plan for up to 7 days of scheduled backups."
   - **Pro Plan and above**: Will show scheduled backups tab with available backups

**Method 2: Check Project Subscription Tier**

1. Look at the top header bar in Supabase Dashboard
2. Check the plan indicator (e.g., "Free", "Pro", "Team")
3. **Free Plan**: Backups not accessible, upgrade required
4. **Pro Plan or above**: Backups accessible

**Method 3: Via Settings**

1. Go to **Settings** → **General**
2. Check your project's subscription tier
3. Verify tier includes backup access (Pro and above only)

---

## Viewing Available Backups

### ⚠️ Free Tier: No Backup Access

**Free Plan users cannot view or access backups.**

If you're on the Free Plan:
- You will see a message: "Free Plan does not include project backups"
- To access backups, you must upgrade to Pro Plan
- Consider using manual backup methods (see Manual Backup Procedures below)

### For Pro Tier

**Pro Plan provides access to scheduled backups:**

1. Go to Supabase Dashboard → Your Project
2. Navigate to **Database** → **Backups** (under PLATFORM section)
3. Click **Scheduled backups** tab
4. View backup history

**What You'll See (Pro Plan)**:
- List of daily backups (last 7 days)
- Backup date and time
- Ability to restore from any listed backup

**What You'll See (Team/Enterprise)**:
- List of daily backups (7+ days)
- Point-in-time recovery tab (Team and above)
- Point-in-time recovery timeline
- Ability to select any point in time for recovery

---

## Backup Verification Checklist

Use this checklist to verify your backup setup:

- [ ] Confirmed Supabase project subscription tier
- [ ] **If Free Plan**: Upgraded to Pro Plan OR implemented manual backup procedures
- [ ] **If Pro Plan or above**: Verified backup access in Database → Backups
- [ ] Checked backup retention period (7 days for Pro Plan)
- [ ] Viewed recent backup history (Pro Plan and above)
- [ ] Confirmed backups are running successfully (Pro Plan and above)
- [ ] Documented backup restore procedure (see below)
- [ ] Tested restore procedure in non-production environment (if possible)

---

## Restoring from Backup

### Restore Options by Tier

#### ⚠️ Free Tier: No Restore Available

**Free Plan users cannot restore from Supabase backups.**

If you're on the Free Plan:
- Upgrade to Pro Plan to access backup restore functionality
- Use manual backup methods (see Manual Backup Procedures below)
- Consider exporting data regularly via CSV export feature

### Pro Tier: Daily Backup Restore

On Pro Plan, you can restore to a specific daily backup point:

1. **Access Restore Interface**:
   - Go to Supabase Dashboard → Your Project
   - Navigate to **Settings** → **Database**
   - Scroll to **Backups** section
   - Click **Restore** button

2. **Select Backup**:
   - Choose the backup date/time you want to restore
   - Review backup details (date, size, tables included)
   - **⚠️ Warning**: This will overwrite current database

3. **Confirm Restore**:
   - Read the warning carefully
   - Confirm you understand data will be overwritten
   - Click **Confirm Restore**
   - Wait for restore to complete (may take several minutes)

4. **Verify Restore**:
   - Check that data is restored correctly
   - Verify application functionality
   - Test critical workflows

**Important Notes**:
- Restore is **destructive** - current data will be lost
- Restore creates a new database state from the backup point
- Any data created after the backup will be lost
- Restore time depends on database size

#### Pro Tier and Above: Point-in-Time Recovery (PITR)

Team tier and above offer point-in-time recovery, allowing restore to any moment within the retention period:

1. **Access PITR**:
   - Go to Supabase Dashboard → Your Project
   - Navigate to **Database** → **Point-in-time Recovery**
   - Or **Database** → **Backups** → **Point-in-time Recovery**

2. **Select Recovery Point**:
   - Use timeline slider to select exact date/time
   - Or enter specific timestamp
   - Preview what data will be restored

3. **Initiate Recovery**:
   - Review recovery point details
   - **⚠️ Warning**: This will overwrite current database
   - Click **Restore to this point**
   - Confirm the action

4. **Monitor Recovery**:
   - Recovery progress displayed
   - May take 10-30 minutes depending on database size
   - Notification when complete

5. **Verify Recovery**:
   - Check data integrity
   - Verify trades, users, and related data restored
   - Test application functionality

---

## Restore Procedure Testing

### Testing in Development/Staging

If you have a separate development or staging environment, test the restore procedure:

1. **Create Test Backup Point**:
   - Make note of current database state
   - Create test data
   - Wait for backup to run (or trigger manual backup if available)

2. **Make Changes**:
   - Modify or delete some test data
   - Create new test records

3. **Test Restore**:
   - Perform restore to backup point
   - Verify deleted/modified data is restored
   - Verify new data (created after backup) is removed
   - Confirm database consistency

### Testing Considerations

**⚠️ Important**: Do NOT test restore in production unless absolutely necessary. Restore is destructive and will cause data loss for any changes after the backup point.

If you must test in production:
1. Choose a low-traffic time
2. Notify users if possible
3. Have a rollback plan
4. Test on a subset of data first if possible

---

## Manual Backup Procedures

### ⚠️ Essential for Free Plan Users

**If you're on the Free Plan, manual backups are your ONLY option for data recovery.**

Even on Pro Plan, manual backups provide additional safety and flexibility.

### Manual Backup Methods

### Option 1: SQL Dump via Supabase CLI

**Prerequisites**: Install Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Create SQL dump
supabase db dump -f backup-$(date +%Y%m%d-%H%M%S).sql
```

**Restore from SQL Dump**:
```bash
# Restore from SQL dump
supabase db reset --file backup-20240101-120000.sql
```

### Option 2: pg_dump (PostgreSQL Native)

**Prerequisites**: PostgreSQL client tools installed

```bash
# Create dump
pg_dump "your-database-connection-string" > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore from dump
psql "your-database-connection-string" < backup-20240101-120000.sql
```

**Note**: Replace `your-database-connection-string` with your Supabase direct connection string.

### Option 3: Prisma DB Pull (Schema Only)

For schema-only backups:

```bash
# Pull current schema
DATABASE_URL="your-connection-string" npx prisma db pull

# Schema saved to prisma/schema.prisma
# Commit to version control for schema history
```

---

## Backup Best Practices

### 1. Verify Backups Regularly

- ✅ Check backup status weekly
- ✅ Verify backups are completing successfully
- ✅ Monitor backup sizes (should grow with database size)
- ✅ Watch for failed backup notifications

### 2. Test Restore Procedures

- ✅ Test restore in development environment periodically
- ✅ Document restore procedures
- ✅ Have restore plan ready before you need it

### 3. Supplement Automatic Backups

- ✅ Consider manual backups before major migrations
- ✅ Export critical data to CSV periodically (via app export feature)
- ✅ Keep schema in version control (Prisma migrations)

### 4. Monitor Database Growth

- ✅ Large databases may have longer restore times
- ✅ Consider archiving old trade data if database grows too large
- ✅ Monitor Supabase storage limits

### 5. Disaster Recovery Plan

- ✅ Document critical restore procedures
- ✅ Know your RTO (Recovery Time Objective) and RPO (Recovery Point Objective)
- ✅ Have backup contact information for Supabase support
- ✅ Keep database credentials secure but accessible for recovery

---

## Backup Retention Strategy

### Current Configuration

Based on Supabase tier:

- **Free Tier**: ❌ No backup access (backups exist for Supabase internal use only)
- **Pro Tier**: ✅ 7-day retention with scheduled backups
- **Team Tier**: ✅ 7-day retention + Point-in-time recovery
- **Enterprise**: ✅ Custom retention + Point-in-time recovery

### Retention Considerations

**Free Tier (No Access)**:
- ❌ Cannot access or restore backups
- ⚠️ Must use manual backup methods
- ⚠️ No automatic recovery options
- ✅ Cost: $0/month

**7-Day Retention (Pro)**:
- ✅ Covers accidental deletions within a week
- ✅ Allows recovery from recent data corruption
- ✅ Scheduled backups accessible
- ⚠️ Limited to 7 days (may not cover issues discovered later)
- ✅ Cost: ~$25/month (verify current pricing)

**Point-in-Time Recovery (Team/Enterprise)**:
- ✅ Precise recovery to any moment
- ✅ Better for production environments
- ✅ Covers most recovery scenarios
- ✅ Most reliable backup option

### ⚠️ Critical Recommendation: Upgrade to Pro for Production

**If this is a production application with important trade data, you MUST upgrade to Pro Plan.**

**Why Pro Plan is Essential for Production**:
- ✅ Access to scheduled backups (Free Plan has none)
- ✅ 7-day backup retention
- ✅ Ability to restore from backups
- ✅ Better support
- ✅ More reliable infrastructure

**Cost Consideration**: 
- Free tier: $0/month (but no backup access)
- Pro tier: ~$25/month (verify current pricing on Supabase website)

**Without Pro Plan, your data is at risk** if:
- Accidental data deletion occurs
- Database corruption happens
- Migration fails
- User error causes data loss

You would have no way to recover without upgrading or using manual backup procedures.

---

## Disaster Recovery Scenarios

### Scenario 1: Accidental Data Deletion

**Example**: User accidentally deletes important trades

**Recovery Steps**:
1. Identify when deletion occurred (approximate time)
2. Go to Supabase Dashboard → Database → Backups
3. Select backup from before deletion
4. Restore to that backup point
5. Verify data restored correctly

**RPO**: Within 24 hours (daily backup)

### Scenario 2: Data Corruption

**Example**: Database integrity issues, corrupted records

**Recovery Steps**:
1. Identify when corruption likely started
2. Select backup from before corruption
3. Restore database
4. Verify data integrity
5. Investigate cause of corruption

### Scenario 3: Migration Failure

**Example**: Schema migration causes data loss

**Recovery Steps**:
1. Identify migration time
2. Restore to backup before migration
3. Fix migration script
4. Re-run migration carefully
5. Verify data integrity

### Scenario 4: Complete Database Loss

**Example**: Project accidentally deleted, database destroyed

**Recovery Steps**:
1. Contact Supabase support immediately
2. Provide project details
3. Request restore from most recent backup
4. Supabase support will restore from their backup systems
5. Verify all data restored

**Note**: This scenario is rare but possible. Supabase maintains additional backups beyond what's visible in dashboard.

---

## Monitoring and Alerts

### Backup Status Monitoring

**Check Regularly**:
1. Weekly backup verification
2. Monthly restore procedure review
3. Quarterly disaster recovery drill (if possible)

**What to Monitor**:
- ✅ Backup success/failure status
- ✅ Backup sizes (growth trends)
- ✅ Backup completion times
- ✅ Available backup count

### Setting Up Alerts

**Supabase Notifications**:
- Configure email notifications in Supabase Dashboard
- Receive alerts for:
  - Backup failures
  - Database issues
  - Project warnings

**Manual Monitoring**:
- Add backup status check to your monitoring routine
- Document backup verification in deployment checklist
- Review backup logs monthly

---

## Backup Documentation

### Current Backup Configuration

**Database Provider**: Supabase  
**Subscription Tier**: [Verify your tier - Free/Pro/Team/Enterprise]  
**Backup Access**: [Free: Not available | Pro: Available (7 days) | Team+: Available with PITR]  
**Backup Frequency**: Daily (infrastructure level)  
**Retention Period**: [Free: N/A | Pro: 7 days | Team+: 7 days + PITR]  
**Point-in-Time Recovery**: [Available on Team+, not on Free or Pro]  
**Last Verified**: [Date]  
**Last Restore Test**: [Date]  

### Backup Access

**Dashboard**: https://app.supabase.com → Your Project → Settings → Database → Backups  
**Support**: https://supabase.com/support  
**Documentation**: https://supabase.com/docs/guides/platform/backups  

---

## Troubleshooting

### Backup Not Running

**Symptoms**: No backups in backup history

**Solutions**:
1. Verify subscription tier includes backups (all Supabase tiers do)
2. Check project status (not paused)
3. Contact Supabase support if backups still not appearing
4. Check for any project warnings or issues

### Backup Failed

**Symptoms**: Failed backup status in dashboard

**Solutions**:
1. Check database size (may be too large for tier)
2. Verify database connectivity
3. Check for database errors
4. Contact Supabase support with backup failure details

### Restore Taking Too Long

**Symptoms**: Restore process hanging or very slow

**Solutions**:
1. Large databases take longer (10-30 minutes is normal)
2. Be patient, don't cancel restore
3. Check Supabase status page for issues
4. Contact support if restore exceeds 1 hour

### Cannot Access Restore Feature

**Symptoms**: Restore button not available or grayed out

**Solutions**:
1. Verify you have project admin access
2. Check subscription tier (all tiers should have restore)
3. Try different browser or clear cache
4. Contact Supabase support

---

## Additional Resources

- [Supabase Backups Documentation](https://supabase.com/docs/guides/platform/backups)
- [Supabase Point-in-Time Recovery](https://supabase.com/docs/guides/platform/backups#point-in-time-recovery)
- [Supabase Support](https://supabase.com/support)
- [Supabase Status Page](https://status.supabase.com)

---

## Summary Checklist

### Initial Setup
- [x] Database provider: Supabase
- [ ] Verified subscription tier
- [ ] **If Free Plan**: Upgraded to Pro OR implemented manual backups
- [ ] **If Pro Plan or above**: Confirmed backup access available
- [ ] Documented backup retention period
- [ ] Verified backup access in dashboard (Pro Plan and above)

### Ongoing Maintenance
- [ ] **If Pro Plan**: Weekly backup verification scheduled
- [ ] **If Free Plan**: Regular manual backups scheduled
- [ ] Backup status monitoring plan
- [ ] Restore procedure documented
- [ ] Disaster recovery plan documented
- [ ] Backup test procedure documented

### Best Practices
- [ ] **CRITICAL**: Upgrade to Pro tier for production (Free Plan has no backup access)
- [ ] Regular backup verification (Pro Plan)
- [ ] Periodic restore testing (in dev/staging, Pro Plan)
- [ ] Keep schema in version control
- [ ] Export critical data periodically (CSV export feature)
- [ ] **If Free Plan**: Implement manual backup procedures

---

**Last Updated**: Database backup configuration and procedures guide  
**Next Review**: [Schedule quarterly review]

