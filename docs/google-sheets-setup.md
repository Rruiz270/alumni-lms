# Google Sheets Integration Setup Guide

This guide explains how to set up Google Sheets integration for importing Spanish content into the Alumni LMS.

## Overview

The Spanish content import script can read curriculum data from a Google Sheets document and automatically import it into the database with proper exercise generation. The script supports fallback to hardcoded data if the Google Sheets API is not configured.

## Google Sheets Structure

Your Google Sheets should have the following columns in order (starting from column A):

| Column | Field Name | Description | Example |
|--------|------------|-------------|---------|
| A | Name | Topic name in Spanish | "Presentación Personal" |
| B | Level | CEFR level | "A1", "A2", "B1", "B2" |
| C | Recurso Gramatical | Grammar focus | "Presente Indicativo - Verbos Ser/Estar" |
| D | Vocabulario | Vocabulary theme | "Información personal" |
| E | Tema | Main topic theme | "Introducción y presentación" |
| F | Objetivo Implícito | Learning objective | "Presentarse y dar información básica personal" |
| G | Classroom Link | Google Classroom presentation URL | "https://docs.google.com/presentation/d/..." |

**Important:** 
- Row 1 should contain headers
- Data should start from row 2
- All rows must have data in all 7 columns

## Setup Methods

### Method 1: Service Account Authentication (Recommended)

This method is best for production environments and automated scripts.

#### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

#### Step 2: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `alumni-lms-sheets-reader`
   - Description: `Service account for reading Spanish curriculum from Google Sheets`
4. Click "Create and Continue"
5. Skip role assignment (not needed for public sheets)
6. Click "Done"

#### Step 3: Generate Service Account Key

1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" format
5. Download the JSON file

#### Step 4: Configure Environment Variables

1. Copy the entire content of the downloaded JSON file
2. Add to your `.env` file:

```env
# Google Sheets Configuration
GOOGLE_SHEETS_ID="your-google-sheets-id-from-url"
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...@...iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'
```

#### Step 5: Share Google Sheets

1. Open your Google Sheets document
2. Click "Share"
3. Add the service account email (found in the JSON file as `client_email`)
4. Give "Viewer" permission
5. Click "Send"

### Method 2: OAuth2 Authentication

This method uses your existing Google OAuth credentials.

#### Step 1: Update OAuth Scopes

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "OAuth consent screen"
3. Add the scope: `https://www.googleapis.com/auth/spreadsheets.readonly`

#### Step 2: Generate Refresh Token

You'll need to generate a refresh token. This is a bit complex and typically requires a separate script or using the Google OAuth Playground.

#### Step 3: Configure Environment Variables

```env
# Google Sheets Configuration
GOOGLE_SHEETS_ID="your-google-sheets-id-from-url"
GOOGLE_REFRESH_TOKEN="your-refresh-token"
```

## Getting the Google Sheets ID

The Google Sheets ID is found in the URL of your Google Sheets document:

```
https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
```

For example, if your URL is:
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
```

Your Sheets ID is: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

## Running the Import

Once configured, run the import script:

```bash
npm run spanish:import
```

The script will:
1. Try to connect to Google Sheets API
2. If successful, import data from your Google Sheets
3. If failed, fall back to hardcoded Spanish curriculum data
4. Create topics with proper database relationships
5. Generate 4 exercises per topic (Grammar, Vocabulary, Writing, Speaking)

## Verifying the Import

Check what was imported:

```bash
npx tsx scripts/verify-import.ts
```

This will show:
- Number of topics imported per level
- Total exercises created
- Sample topics with their details

## Troubleshooting

### Common Issues

1. **"No Google authentication credentials found"**
   - Ensure `GOOGLE_SERVICE_ACCOUNT_KEY` or `GOOGLE_REFRESH_TOKEN` is set
   - Check that the JSON in `GOOGLE_SERVICE_ACCOUNT_KEY` is valid

2. **"No data found in Google Sheets"**
   - Check the `GOOGLE_SHEETS_ID` is correct
   - Ensure the sheet name is "Sheet1" or update the `RANGE` in the script
   - Verify the service account has access to the sheet

3. **"Invalid level for topic"**
   - Ensure level column contains only: A1, A2, B1, B2, C1, or C2
   - Check for extra spaces or different formatting

4. **"Row has incomplete data"**
   - Ensure all 7 columns have data in each row
   - Check for empty cells

### Testing Without Google Sheets

The script will automatically fall back to hardcoded data if Google Sheets is not configured. This allows you to test the import functionality without setting up the API.

## Security Notes

- Never commit your `.env` file with real credentials
- Use service accounts instead of personal OAuth tokens in production
- Regularly rotate service account keys
- Only grant minimum necessary permissions (Viewer for sheets)

## Script Features

- **Automatic fallback**: Uses hardcoded data if Google Sheets fails
- **Data validation**: Validates levels and required fields
- **Duplicate prevention**: Clears existing Spanish topics before import
- **Exercise generation**: Creates 4 exercises per topic automatically
- **Progress tracking**: Shows detailed import progress
- **Error handling**: Continues import even if individual topics fail