-- Migration: update_users_reference
-- Description: Updates foreign key references to use auth.users instead of public.users
-- Created: 2025-04-17

-- Drop the existing foreign key constraint
ALTER TABLE texts DROP CONSTRAINT IF EXISTS texts_user_id_fkey;

-- Add new foreign key constraint referencing auth.users
ALTER TABLE texts ADD CONSTRAINT texts_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Update RLS policies to use auth.uid() instead of user_id
DROP POLICY IF EXISTS "users can read own texts" ON texts;
CREATE POLICY "users can read own texts" 
    ON texts FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id AND is_deleted = false);

DROP POLICY IF EXISTS "users can insert own texts" ON texts;
CREATE POLICY "users can insert own texts" 
    ON texts FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can update own texts" ON texts;
CREATE POLICY "users can update own texts" 
    ON texts FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id AND is_deleted = false);

DROP POLICY IF EXISTS "users can delete own texts" ON texts;
CREATE POLICY "users can delete own texts" 
    ON texts FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id); 