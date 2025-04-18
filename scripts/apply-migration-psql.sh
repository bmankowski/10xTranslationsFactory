#!/bin/bash

# Load environment variables
set -a
source .env
set +a

# Print connection information for debugging
echo "Connecting to database $POSTGRES_DB at supabase-db as user $POSTGRES_USER"

# Apply migration using psql
export PGPASSWORD="$POSTGRES_PASSWORD"
psql -h supabase-db -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f ./supabase/migrations/20250417154213_create_language_learning_schema.sql

echo "Migration applied successfully" 