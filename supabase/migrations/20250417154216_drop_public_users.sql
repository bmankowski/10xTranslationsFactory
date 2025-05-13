-- Migration: drop_public_users
-- Description: Drops the public.users table after migrating all references to auth.users
-- Created: 2025-04-17

-- Drop the public.users table
DROP TABLE IF EXISTS public.users; 