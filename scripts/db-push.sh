#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Display connection information (without showing password)
echo "Connecting to database $POSTGRES_DB at supabase-db as user $POSTGRES_USER"

# Run database migration with Supabase CLI
supabase db push --db-url "postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@supabase-db:5432/$POSTGRES_DB" --debug

echo "Migration complete" 