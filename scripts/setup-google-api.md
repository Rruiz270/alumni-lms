# Google Sheets API Setup for Alumni LMS

## 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it "Alumni LMS" or similar

## 2. Enable Google Sheets API

1. Go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click "ENABLE"

## 3. Create Service Account (Recommended for server-side access)

1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "Service account"
3. Name: "alumni-lms-sheets-reader"
4. Role: "Viewer" (read-only access)
5. Create and download the JSON key file

## 4. Share Spreadsheet with Service Account

1. Open the downloaded JSON file
2. Copy the "client_email" value (looks like: alumni-lms-sheets-reader@project-name.iam.gserviceaccount.com)
3. Go to your Google Spreadsheet
4. Click "Share" button
5. Add the service account email with "Viewer" permissions

## 5. Add to Environment Variables

Add to your `.env` file:
```bash
# Google Sheets API
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"..."}' # Full JSON content
GOOGLE_SHEETS_ID="1ezRurCziI_hcHg3Shs5Hg3wAU_Cgdia_3p89LXncyKg"
```

## 6. Alternative: OAuth2 (for development)

If you prefer OAuth2 instead of service account:
1. Create "OAuth 2.0 Client ID" credentials
2. Download client credentials JSON
3. Use Google OAuth flow to get refresh token

## Next Steps

Once you complete this setup:
1. Add the environment variables
2. Run the import script to fetch real curriculum data
3. The system will automatically import all 4 levels (tabs) from your spreadsheet