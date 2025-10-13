#!/bin/bash
set -e

echo "🚀 Setting up E2E test environment..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  cat > .env << EOF
TURSO_DATABASE_URL=file:local.db
TURSO_AUTH_TOKEN=
JWT_SECRET=dev-secret-key-for-testing-only-not-secure
CLOUDFLARE_KV_NAMESPACE_ID=
CLOUDFLARE_KV_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
EOF
fi

# Remove old database
echo "🗑️  Removing old database..."
rm -f local.db

# Initialize database with schema
echo "💾 Initializing database..."
pnpm drizzle-kit push --config=drizzle.config.local.ts

echo "✅ E2E test environment ready!"
