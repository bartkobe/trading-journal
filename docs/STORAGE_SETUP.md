# Cloud Storage Setup Guide

This application supports two cloud storage providers for storing trade screenshot images:

1. **Cloudinary** (Recommended - easier setup, generous free tier)
2. **AWS S3** (More control, better for scale)

You only need to set up **ONE** provider. The application will automatically detect which provider is configured based on environment variables.

---

## Option 1: Cloudinary Setup (Recommended)

### Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. Verify your email address

### Step 2: Get Your Credentials

1. Log in to your Cloudinary dashboard
2. You'll see your credentials on the main dashboard:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 3: Add to Environment Variables

Add the following to your `.env` file:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name-here"
CLOUDINARY_API_KEY="your-api-key-here"
CLOUDINARY_API_SECRET="your-api-secret-here"
```

### Step 4: Test the Setup

That's it! The application will automatically use Cloudinary when these variables are set.

### Free Tier Limits

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month

This is more than enough for personal trading journal use.

---

## Option 2: AWS S3 Setup

### Step 1: Create an AWS Account

1. Go to [https://aws.amazon.com/](https://aws.amazon.com/)
2. Sign up or log in
3. Go to the AWS Management Console

### Step 2: Create an S3 Bucket

1. Navigate to **S3** service
2. Click **Create bucket**
3. Choose a unique bucket name (e.g., `my-trading-journal-images`)
4. Select your preferred region (e.g., `us-east-1`)
5. **Block Public Access settings**:
   - Uncheck "Block all public access" if you want direct public URLs
   - Or keep it blocked and use signed URLs (more secure)
6. Click **Create bucket**

### Step 3: Create IAM User with S3 Access

1. Navigate to **IAM** service
2. Go to **Users** → **Add users**
3. Create a user (e.g., `trading-journal-s3-user`)
4. Select **Access key - Programmatic access**
5. Attach policy: **AmazonS3FullAccess** (or create a custom policy for your specific bucket)
6. Complete the wizard and **save the Access Key ID and Secret Access Key**

### Step 4: Configure Bucket Policy (if using public URLs)

In your S3 bucket:

1. Go to **Permissions** → **Bucket Policy**
2. Add this policy (replace `YOUR-BUCKET-NAME`):

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

### Step 5: Add to Environment Variables

Add the following to your `.env` file:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
```

### Free Tier Limits

- **Storage**: 5 GB for 12 months
- **Requests**: 20,000 GET requests, 2,000 PUT requests per month

---

## Development Without Cloud Storage

If you're in early development and want to skip cloud storage setup temporarily:

1. Don't set any cloud storage environment variables
2. The screenshot upload feature will throw an error with a helpful message
3. You can still develop and test all other features
4. Add cloud storage configuration later when you're ready to test uploads

---

## Verifying Your Setup

To check which storage provider is configured, the application logs on startup:

```
Storage Provider: cloudinary
```

or

```
Storage Provider: s3
```

or

```
Storage Provider: none (Cloud storage not configured)
```

---

## Storage Usage in the Application

The storage utility (`lib/storage.ts`) provides three main functions:

### Upload Image

```typescript
import { uploadImage } from '@/lib/storage';

const result = await uploadImage(fileBuffer, 'screenshot.png', 'trades/screenshots');
// Returns: { url, publicId, filename, fileSize, mimeType }
```

### Delete Image

```typescript
import { deleteImage } from '@/lib/storage';

const success = await deleteImage(publicId);
```

### Validate Image

```typescript
import { isValidImageType, isValidImageSize } from '@/lib/storage';

if (!isValidImageType(file.type)) {
  throw new Error('Invalid image type');
}

if (!isValidImageSize(file.size)) {
  throw new Error('File too large (max 10MB)');
}
```

---

## Troubleshooting

### Cloudinary Issues

**Problem**: "Invalid credentials"

- Double-check your Cloud Name, API Key, and API Secret
- Make sure there are no extra spaces in the `.env` file

**Problem**: "Upload failed"

- Check your Cloudinary dashboard for usage limits
- Verify the image format is supported (JPEG, PNG, GIF, WebP)

### AWS S3 Issues

**Problem**: "Access Denied"

- Verify IAM user has S3 permissions
- Check bucket policy allows uploads
- Ensure AWS credentials are correct in `.env`

**Problem**: "Bucket not found"

- Verify bucket name is correct
- Ensure region matches your bucket's region

### General Issues

**Problem**: "No cloud storage provider configured"

- You haven't set up environment variables for either provider
- Follow one of the setup guides above

---

## Recommendation

**For personal use**: Use **Cloudinary**

- Easier setup (3 environment variables)
- No need to configure buckets, IAM, or policies
- Automatic image optimization
- Generous free tier

**For production/scale**: Use **AWS S3**

- Better pricing at scale
- More control over infrastructure
- Integration with other AWS services
- Can use CloudFront for CDN

---

## Next Steps

After setting up cloud storage:

1. Add your credentials to `.env`
2. Restart your development server
3. Test image uploads through the trade creation form
4. Images will be stored in the cloud and URLs saved to the database
