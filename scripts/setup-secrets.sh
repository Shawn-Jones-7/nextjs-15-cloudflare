#!/bin/bash
# Setup Cloudflare Worker Secrets
# Run this script after authenticating with: pnpm wrangler login
#
# IMPORTANT: Replace placeholder values with your actual API keys before running

set -e

echo "Setting up Cloudflare Worker secrets..."

# Turnstile - Get from https://dash.cloudflare.com/turnstile
echo "YOUR_TURNSTILE_SECRET_KEY" | pnpm wrangler secret put TURNSTILE_SECRET_KEY

# Resend - Get from https://resend.com/api-keys
echo "YOUR_RESEND_API_KEY" | pnpm wrangler secret put RESEND_API_KEY

# Resend email addresses - UPDATE THESE with your actual email addresses
echo "noreply@yourdomain.com" | pnpm wrangler secret put RESEND_FROM_EMAIL
echo "sales@yourdomain.com" | pnpm wrangler secret put RESEND_TO_EMAIL

# Airtable (Optional) - Get from https://airtable.com/create/tokens
echo "YOUR_AIRTABLE_API_KEY" | pnpm wrangler secret put AIRTABLE_API_KEY
echo "YOUR_AIRTABLE_BASE_ID" | pnpm wrangler secret put AIRTABLE_BASE_ID
echo "Leads" | pnpm wrangler secret put AIRTABLE_TABLE_NAME

# Notification email
echo "sales@yourdomain.com" | pnpm wrangler secret put NOTIFICATION_EMAIL

echo "All secrets configured successfully!"
