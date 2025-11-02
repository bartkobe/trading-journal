# Production Cloud Storage Setup Guide

This guide walks you through setting up cloud storage for **production** on Vercel. Cloud storage is required for screenshot uploads in trades.

## Quick Start: Choose Your Provider

The application supports two providers. **Choose ONE** based on your needs:

| Provider | Best For | Setup Difficulty | Free Tier |
|----------|----------|------------------|-----------|
| **Cloudinary** ⭐ | Personal use, ease of setup | Easy (3 variables) | 25 GB storage, 25 GB bandwidth/month |
| **AWS S3** | Production scale, cost control | Moderate (5 variables + IAM setup) | 5 GB storage, 12 months |

**Recommendation**: Start with **Cloudinary** for simplicity. You can migrate to S3 later if needed.

---

## Option 1: Cloudinary Setup (Recommended)

### Step 1: Create Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up with your email
3. Verify your email address
4. Complete the signup process

### Step 2: Get Your Credentials

1. Log in to your [Cloudinary Dashboard](https://console.cloudinary.com)
2. On the dashboard, you'll see your account details:
   - **Cloud Name** (e.g., `dxyzt7abc`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

**⚠️ Important**: Copy these values now - you'll need them in the next step.

### Step 3: Add Credentials to Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project: **Trading Journal**
3. Navigate to **Settings** → **Environment Variables**
4. Add the following three variables:

   **Variable 1:**
   - **Key**: `CLOUDINARY_CLOUD_NAME`
   - **Value**: Your Cloud Name from Step 2
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

   **Variable 2:**
   - **Key**: `CLOUDINARY_API_KEY`
   - **Value**: Your API Key from Step 2
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

   **Variable 3:**
   - **Key**: `CLOUDINARY_API_SECRET`
   - **Value**: Your API Secret from Step 2
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on your latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Step 5: Verify Setup

1. Visit your production site: https://trading-journal-eight-tau.vercel.app
2. Log in to your account
3. Create a new trade or edit an existing trade
4. Try uploading a screenshot
5. If upload succeeds, setup is complete! ✅

**Free Tier Limits:**
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

This is more than enough for personal trading journal use.

---

## Option 2: AWS S3 Setup

### Step 1: Create AWS Account

1. Go to [https://aws.amazon.com/](https://aws.amazon.com/)
2. Sign up or log in to your AWS account
3. Navigate to AWS Management Console

### Step 2: Create S3 Bucket

1. Go to **S3** service in AWS Console
2. Click **Create bucket**
3. Configure bucket:
   - **Bucket name**: Choose a unique name (e.g., `trading-journal-screenshots`)
   - **AWS Region**: Choose closest to your users (e.g., `us-east-1`)
   - **Block Public Access**: 
     - Uncheck "Block all public access" if you want direct public URLs
     - Or keep it checked and use signed URLs (more secure)
   - Click **Create bucket**

### Step 3: Create IAM User for S3 Access

1. Go to **IAM** service in AWS Console
2. Navigate to **Users** → **Add users**
3. Configure user:
   - **User name**: `trading-journal-s3-user`
   - **Access type**: Select **Access key - Programmatic access**
   - Click **Next**
4. Set permissions:
   - Select **Attach existing policies directly**
   - Search and select **AmazonS3FullAccess**
   - **OR** create a custom policy with limited access to your specific bucket (more secure)
   - Click **Next** → **Next** → **Create user**
5. **⚠️ IMPORTANT**: Copy and save:
   - **Access Key ID**
   - **Secret Access Key** (shown only once!)

### Step 4: Configure Bucket Policy (If Using Public URLs)

1. Go to your S3 bucket → **Permissions** tab
2. Click **Bucket policy**
3. Add this policy (replace `YOUR-BUCKET-NAME` with your bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

4. Click **Save**

### Step 5: Add Credentials to Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project: **Trading Journal**
3. Navigate to **Settings** → **Environment Variables**
4. Add the following variables:

   **Variable 1:**
   - **Key**: `AWS_REGION`
   - **Value**: Your bucket region (e.g., `us-east-1`)
   - **Environment**: Select all

   **Variable 2:**
   - **Key**: `AWS_ACCESS_KEY_ID`
   - **Value**: Access Key ID from Step 3
   - **Environment**: Select all

   **Variable 3:**
   - **Key**: `AWS_SECRET_ACCESS_KEY`
   - **Value**: Secret Access Key from Step 3
   - **Environment**: Select all

   **Variable 4:**
   - **Key**: `AWS_S3_BUCKET`
   - **Value**: Your bucket name (e.g., `trading-journal-screenshots`)
   - **Environment**: Select all

### Step 6: Redeploy

1. Go to **Deployments** tab
2. Click the **⋯** on your latest deployment
3. Click **Redeploy**

### Step 7: Verify Setup

1. Visit your production site
2. Log in
3. Create/edit a trade and upload a screenshot
4. Verify upload succeeds

**Free Tier Limits:**
- 5 GB storage (first 12 months)
- 20,000 GET requests/month
- 2,000 PUT requests/month

---

## Verification Checklist

After setting up cloud storage, verify the following:

### ✅ Configuration Check

- [ ] Cloud storage credentials are set in Vercel environment variables
- [ ] Variables are set for Production, Preview, and Development environments
- [ ] Deployment has been redeployed after adding variables

### ✅ Functionality Check

- [ ] Can create a new trade
- [ ] Can upload a screenshot via drag-and-drop
- [ ] Can upload a screenshot via file picker
- [ ] Screenshot appears in the trade detail view
- [ ] Can delete a screenshot
- [ ] Screenshot URL is accessible (opens in new tab)

### ✅ Error Handling Check

- [ ] Invalid file types are rejected with error message
- [ ] Files larger than 10MB are rejected
- [ ] Upload errors show user-friendly messages

---

## Troubleshooting

### "Cloud storage not configured" Error

**Cause**: Environment variables are not set or not accessible.

**Solution**:
1. Verify variables are set in Vercel → Settings → Environment Variables
2. Check variable names are exact (case-sensitive):
   - `CLOUDINARY_CLOUD_NAME` (not `cloudinary_cloud_name`)
   - `CLOUDINARY_API_KEY` (not `cloudinary_api_key`)
   - `CLOUDINARY_API_SECRET` (not `cloudinary_api_secret`)
3. Ensure variables are set for Production environment
4. Redeploy the application

### Cloudinary: "Invalid credentials"

**Cause**: Wrong credentials or credentials not accessible.

**Solution**:
1. Double-check credentials in Cloudinary Dashboard
2. Verify no extra spaces in environment variable values
3. Ensure all three variables are set (Cloud Name, API Key, API Secret)
4. Redeploy after fixing

### AWS S3: "Access Denied"

**Cause**: IAM user doesn't have proper permissions or bucket policy is incorrect.

**Solution**:
1. Verify IAM user has S3 permissions (AmazonS3FullAccess or custom policy)
2. Check bucket policy allows GetObject and PutObject
3. Verify bucket name in `AWS_S3_BUCKET` matches actual bucket name
4. Ensure region in `AWS_REGION` matches bucket region

### AWS S3: "Bucket not found"

**Cause**: Bucket name or region is incorrect.

**Solution**:
1. Verify `AWS_S3_BUCKET` matches your bucket name exactly
2. Verify `AWS_REGION` matches your bucket's region
3. Check bucket exists in AWS Console

### Upload Succeeds But Image Doesn't Display

**Cause**: Image URL is incorrect or bucket is not publicly accessible.

**Solution**:
1. Check screenshot URL in database (via trade detail page)
2. Try opening URL directly in browser
3. If using S3 with public access blocked, you may need signed URLs (not currently implemented)
4. Verify bucket policy allows public read access (if using public URLs)

---

## Storage Usage

### Current Implementation

- **Upload Location**: `trades/screenshots/` folder
- **File Naming**: `{timestamp}-{original-filename}`
- **Supported Formats**: JPEG, PNG, GIF, WebP
- **Max File Size**: 10MB
- **Max Files per Trade**: 10 (configurable)

### Monitoring Usage

**Cloudinary:**
- Go to Cloudinary Dashboard → Usage
- View storage, bandwidth, and transformation usage

**AWS S3:**
- Go to AWS Console → S3 → Your bucket
- View storage metrics and request counts
- Set up CloudWatch alarms for monitoring

---

## Security Best Practices

1. **Never commit credentials to git** ✅ (already in .gitignore)
2. **Use environment variables** ✅ (already implemented)
3. **Rotate credentials periodically**
4. **Use least-privilege IAM policies** (for S3)
5. **Monitor usage** for unexpected spikes
6. **Enable bucket versioning** (S3) for recovery

---

## Migration Between Providers

If you need to migrate from one provider to another:

1. Export all screenshot URLs from database
2. Download images from old provider
3. Upload images to new provider
4. Update database URLs with new provider URLs
5. Update environment variables
6. Redeploy

**Note**: Automated migration script can be created if needed.

---

## References

- [STORAGE_SETUP.md](./STORAGE_SETUP.md) - General storage setup guide
- [VERCEL_ENV_CONFIGURATION.md](./VERCEL_ENV_CONFIGURATION.md) - Environment variables overview
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)

---

## Need Help?

If you encounter issues:
1. Check [Troubleshooting](#troubleshooting) section above
2. Review Vercel deployment logs for errors
3. Check provider dashboard for usage/error logs
4. Verify all environment variables are set correctly

