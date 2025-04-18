#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "Applying migration with user $POSTGRES_USER to database $POSTGRES_DB"
echo "You will be prompted for the password ($POSTGRES_PASSWORD)"

# Execute the SQL migration
PGPASSWORD="$POSTGRES_PASSWORD" psql -h supabase-db -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f ./supabase/migrations/20250417154213_create_language_learning_schema.sql 