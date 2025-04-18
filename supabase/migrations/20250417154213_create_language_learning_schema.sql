-- Migration: create_language_learning_schema
-- Description: Initial database schema for AI-powered language learning platform
-- Created: 2025-04-17
-- 
-- This migration creates the complete database schema including:
-- - User profiles (linked to Supabase auth)
-- - Languages and proficiency levels
-- - Text content and questions
-- - User responses and statistics
-- - All necessary relationships, indexes, and security policies

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ===============================
-- Reference Data Tables
-- ===============================

-- Languages table
create table languages (
    id uuid primary key default uuid_generate_v4(),
    code text unique not null,  -- ISO 639-1 code (e.g., 'en', 'es')
    name text unique not null,  -- Full name (e.g., 'English', 'Spanish')
    is_active boolean default true not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS on languages table
alter table languages enable row level security;

-- Initial languages data
insert into languages (code, name) values 
    ('en', 'English'),
    ('es', 'Spanish');

-- Proficiency levels table
create table proficiency_levels (
    id uuid primary key default uuid_generate_v4(),
    name text unique not null,  -- e.g., 'beginner', 'intermediate', 'advanced'
    display_order integer not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS on proficiency_levels table
alter table proficiency_levels enable row level security;

-- Initial proficiency levels data
insert into proficiency_levels (name, display_order) values 
    ('beginner', 1),
    ('intermediate', 2),
    ('advanced', 3);

-- Create visibility enum type
create type visibility_enum as enum ('public', 'private');

-- ===============================
-- Users and Profiles
-- ===============================

-- Users table (extends Supabase auth)
create table users (
    id uuid primary key references auth.users(id),
    email text unique not null,
    full_name text,
    is_admin boolean default false not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS on users table
alter table users enable row level security;

-- ===============================
-- Content Tables
-- ===============================

-- Texts table
create table texts (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references users(id) on delete cascade,
    title text,
    content text not null,
    language_id uuid not null references languages(id) on delete restrict,
    proficiency_level_id uuid not null references proficiency_levels(id) on delete restrict,
    topic text not null,
    visibility visibility_enum not null default 'private',
    word_count integer not null,
    is_deleted boolean default false not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    check (word_count > 0)
);

-- Enable RLS on texts table
alter table texts enable row level security;

-- Questions table
create table questions (
    id uuid primary key default uuid_generate_v4(),
    text_id uuid not null references texts(id) on delete cascade,
    content text not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS on questions table
alter table questions enable row level security;

-- ===============================
-- User Data Tables
-- ===============================

-- User responses table
create table user_responses (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references users(id) on delete cascade,
    question_id uuid not null references questions(id) on delete cascade,
    response_text text not null,
    is_correct boolean not null,
    feedback text,
    response_time integer, -- in seconds
    created_at timestamp with time zone default now() not null,
    unique (user_id, question_id, created_at)
);

-- Enable RLS on user_responses table
alter table user_responses enable row level security;

-- User preferences table
create table user_preferences (
    user_id uuid primary key references users(id) on delete cascade,
    primary_language_id uuid not null references languages(id) on delete restrict,
    ui_language_id uuid not null references languages(id) on delete restrict,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS on user_preferences table
alter table user_preferences enable row level security;

-- User learning languages table
create table user_learning_languages (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references users(id) on delete cascade,
    language_id uuid not null references languages(id) on delete restrict,
    created_at timestamp with time zone default now() not null,
    unique (user_id, language_id)
);

-- Enable RLS on user_learning_languages table
alter table user_learning_languages enable row level security;

-- User statistics table
create table user_statistics (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references users(id) on delete cascade,
    language_id uuid not null references languages(id) on delete restrict,
    total_attempts integer default 0 not null,
    correct_answers integer default 0 not null,
    last_activity_date timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    unique (user_id, language_id)
);

-- Enable RLS on user_statistics table
alter table user_statistics enable row level security;

-- ===============================
-- Indexes
-- ===============================

-- Indexes for languages table
create index idx_languages_code on languages(code);
create index idx_languages_is_active on languages(is_active);

-- Indexes for proficiency_levels table
create index idx_proficiency_levels_display_order on proficiency_levels(display_order);

-- Indexes for texts table
create index idx_texts_user_id on texts(user_id);
create index idx_texts_language_id on texts(language_id);
create index idx_texts_proficiency_level_id on texts(proficiency_level_id);
create index idx_texts_visibility on texts(visibility);
create index idx_texts_language_visibility on texts(language_id, visibility);
create index idx_texts_is_deleted on texts(is_deleted);

-- Indexes for questions table
create index idx_questions_text_id on questions(text_id);

-- Indexes for user_responses table
create index idx_user_responses_user_id on user_responses(user_id);
create index idx_user_responses_question_id on user_responses(question_id);
create index idx_user_responses_is_correct on user_responses(is_correct);
create index idx_user_responses_created_at on user_responses(created_at);

-- Indexes for user_preferences table
create index idx_user_preferences_primary_language_id on user_preferences(primary_language_id);
create index idx_user_preferences_ui_language_id on user_preferences(ui_language_id);

-- Indexes for user_learning_languages table
create index idx_user_learning_languages_user_id on user_learning_languages(user_id);
create index idx_user_learning_languages_language_id on user_learning_languages(language_id);

-- Indexes for user_statistics table
create index idx_user_statistics_user_id on user_statistics(user_id);
create index idx_user_statistics_language_id on user_statistics(language_id);

-- ===============================
-- Row Level Security Policies
-- ===============================

-- Reference data policies
-- Allow read-only access to reference data tables for all users
create policy "anon can read languages" 
    on languages for select 
    to anon
    using (true);

create policy "authenticated can read languages" 
    on languages for select 
    to authenticated
    using (true);

create policy "anon can read proficiency levels" 
    on proficiency_levels for select 
    to anon
    using (true);

create policy "authenticated can read proficiency levels" 
    on proficiency_levels for select 
    to authenticated
    using (true);

-- User profile policies
-- Users can only access their own profile data
create policy "users can read own profile" 
    on users for select 
    to authenticated
    using (auth.uid() = id);

create policy "users can update own profile" 
    on users for update 
    to authenticated
    using (auth.uid() = id);

-- Text content policies
-- Users can manage their own texts
create policy "users can read own texts" 
    on texts for select 
    to authenticated
    using (auth.uid() = user_id and is_deleted = false);

create policy "users can insert own texts" 
    on texts for insert 
    to authenticated
    with check (auth.uid() = user_id);

create policy "users can update own texts" 
    on texts for update 
    to authenticated
    using (auth.uid() = user_id and is_deleted = false);

create policy "users can delete own texts" 
    on texts for delete 
    to authenticated
    using (auth.uid() = user_id);

-- Public content is readable by everyone
create policy "anon can read public texts" 
    on texts for select 
    to anon
    using (visibility = 'public' and is_deleted = false);

create policy "authenticated can read public texts" 
    on texts for select 
    to authenticated
    using (visibility = 'public' and is_deleted = false);

-- Questions policies
-- Users can access questions for public texts or their own texts
create policy "anon can read public questions" 
    on questions for select 
    to anon
    using (
        exists (
            select 1 from texts 
            where texts.id = questions.text_id 
            and texts.visibility = 'public'
            and texts.is_deleted = false
        )
    );

create policy "authenticated can read questions" 
    on questions for select 
    to authenticated
    using (
        exists (
            select 1 from texts 
            where texts.id = questions.text_id 
            and (
                texts.visibility = 'public' 
                or texts.user_id = auth.uid()
            )
            and texts.is_deleted = false
        )
    );

create policy "authenticated can insert questions" 
    on questions for insert 
    to authenticated
    with check (
        exists (
            select 1 from texts 
            where texts.id = text_id 
            and texts.user_id = auth.uid()
            and texts.is_deleted = false
        )
    );

create policy "authenticated can update questions" 
    on questions for update 
    to authenticated
    using (
        exists (
            select 1 from texts 
            where texts.id = text_id 
            and texts.user_id = auth.uid()
            and texts.is_deleted = false
        )
    );

create policy "authenticated can delete questions" 
    on questions for delete 
    to authenticated
    using (
        exists (
            select 1 from texts 
            where texts.id = text_id 
            and texts.user_id = auth.uid()
            and texts.is_deleted = false
        )
    );

-- User responses policies
-- Users can only manage their own responses
create policy "users can read own responses" 
    on user_responses for select 
    to authenticated
    using (auth.uid() = user_id);

create policy "users can insert own responses" 
    on user_responses for insert 
    to authenticated
    with check (auth.uid() = user_id);

create policy "users can update own responses" 
    on user_responses for update 
    to authenticated
    using (auth.uid() = user_id);

create policy "users can delete own responses" 
    on user_responses for delete 
    to authenticated
    using (auth.uid() = user_id);

-- User preferences policies
-- Users can only manage their own preferences
create policy "users can read own preferences" 
    on user_preferences for select 
    to authenticated
    using (auth.uid() = user_id);

create policy "users can insert own preferences" 
    on user_preferences for insert 
    to authenticated
    with check (auth.uid() = user_id);

create policy "users can update own preferences" 
    on user_preferences for update 
    to authenticated
    using (auth.uid() = user_id);

create policy "users can delete own preferences" 
    on user_preferences for delete 
    to authenticated
    using (auth.uid() = user_id);

-- User learning languages policies
-- Users can only manage their own learning languages
create policy "users can read own learning languages" 
    on user_learning_languages for select 
    to authenticated
    using (auth.uid() = user_id);

create policy "users can insert own learning languages" 
    on user_learning_languages for insert 
    to authenticated
    with check (auth.uid() = user_id);

create policy "users can update own learning languages" 
    on user_learning_languages for update 
    to authenticated
    using (auth.uid() = user_id);

create policy "users can delete own learning languages" 
    on user_learning_languages for delete 
    to authenticated
    using (auth.uid() = user_id);

-- User statistics policies
-- Users can only view their own statistics
create policy "users can read own statistics" 
    on user_statistics for select 
    to authenticated
    using (auth.uid() = user_id);

create policy "users can insert own statistics" 
    on user_statistics for insert 
    to authenticated
    with check (auth.uid() = user_id);

create policy "users can update own statistics" 
    on user_statistics for update 
    to authenticated
    using (auth.uid() = user_id);

create policy "users can delete own statistics" 
    on user_statistics for delete 
    to authenticated
    using (auth.uid() = user_id);

-- ===============================
-- Triggers and Functions
-- ===============================

-- Update timestamp trigger function
create or replace function update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create update timestamp triggers for relevant tables
create trigger update_languages_timestamp
before update on languages
for each row execute procedure update_timestamp();

create trigger update_proficiency_levels_timestamp
before update on proficiency_levels
for each row execute procedure update_timestamp();

create trigger update_users_timestamp
before update on users
for each row execute procedure update_timestamp();

create trigger update_texts_timestamp
before update on texts
for each row execute procedure update_timestamp();

create trigger update_questions_timestamp
before update on questions
for each row execute procedure update_timestamp();

create trigger update_user_preferences_timestamp
before update on user_preferences
for each row execute procedure update_timestamp();

create trigger update_user_statistics_timestamp
before update on user_statistics
for each row execute procedure update_timestamp(); 