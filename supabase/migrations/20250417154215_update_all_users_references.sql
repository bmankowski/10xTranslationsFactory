-- Migration: update_all_users_references
-- Description: Updates all foreign key references from public.users to auth.users
-- Created: 2025-04-17

-- Drop existing foreign key constraints
ALTER TABLE texts DROP CONSTRAINT IF EXISTS texts_user_id_fkey;
ALTER TABLE user_responses DROP CONSTRAINT IF EXISTS user_responses_user_id_fkey;
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;
ALTER TABLE user_learning_languages DROP CONSTRAINT IF EXISTS user_learning_languages_user_id_fkey;
ALTER TABLE user_statistics DROP CONSTRAINT IF EXISTS user_statistics_user_id_fkey;

-- Add new foreign key constraints referencing auth.users
ALTER TABLE texts ADD CONSTRAINT texts_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

ALTER TABLE user_responses ADD CONSTRAINT user_responses_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

ALTER TABLE user_learning_languages ADD CONSTRAINT user_learning_languages_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

ALTER TABLE user_statistics ADD CONSTRAINT user_statistics_user_id_fkey 
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

-- User responses policies
DROP POLICY IF EXISTS "users can read own responses" ON user_responses;
CREATE POLICY "users can read own responses" 
    ON user_responses FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can insert own responses" ON user_responses;
CREATE POLICY "users can insert own responses" 
    ON user_responses FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can update own responses" ON user_responses;
CREATE POLICY "users can update own responses" 
    ON user_responses FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can delete own responses" ON user_responses;
CREATE POLICY "users can delete own responses" 
    ON user_responses FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id);

-- User preferences policies
DROP POLICY IF EXISTS "users can read own preferences" ON user_preferences;
CREATE POLICY "users can read own preferences" 
    ON user_preferences FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can insert own preferences" ON user_preferences;
CREATE POLICY "users can insert own preferences" 
    ON user_preferences FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can update own preferences" ON user_preferences;
CREATE POLICY "users can update own preferences" 
    ON user_preferences FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can delete own preferences" ON user_preferences;
CREATE POLICY "users can delete own preferences" 
    ON user_preferences FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id);

-- User learning languages policies
DROP POLICY IF EXISTS "users can read own learning languages" ON user_learning_languages;
CREATE POLICY "users can read own learning languages" 
    ON user_learning_languages FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can insert own learning languages" ON user_learning_languages;
CREATE POLICY "users can insert own learning languages" 
    ON user_learning_languages FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can update own learning languages" ON user_learning_languages;
CREATE POLICY "users can update own learning languages" 
    ON user_learning_languages FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can delete own learning languages" ON user_learning_languages;
CREATE POLICY "users can delete own learning languages" 
    ON user_learning_languages FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id);

-- User statistics policies
DROP POLICY IF EXISTS "users can read own statistics" ON user_statistics;
CREATE POLICY "users can read own statistics" 
    ON user_statistics FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can insert own statistics" ON user_statistics;
CREATE POLICY "users can insert own statistics" 
    ON user_statistics FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can update own statistics" ON user_statistics;
CREATE POLICY "users can update own statistics" 
    ON user_statistics FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can delete own statistics" ON user_statistics;
CREATE POLICY "users can delete own statistics" 
    ON user_statistics FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id); 