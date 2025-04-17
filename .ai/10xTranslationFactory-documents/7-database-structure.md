# PostgreSQL Database Schema for AI-Powered Language Learning Platform

## 1. Tables with Columns, Data Types, and Constraints

### `users` Table 
This table is managed by Supabase Auth.
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    is_admin BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

### `languages` Table
```sql
CREATE TABLE languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,  -- ISO 639-1 code (e.g., 'en', 'es')
    name TEXT UNIQUE NOT NULL,  -- Full name (e.g., 'English', 'Spanish')
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Initial languages
INSERT INTO languages (code, name) VALUES 
    ('en', 'English'),
    ('es', 'Spanish');
```

### `proficiency_levels` Table
```sql
CREATE TABLE proficiency_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,  -- e.g., 'beginner', 'intermediate', 'advanced'
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Initial proficiency levels
INSERT INTO proficiency_levels (name, display_order) VALUES 
    ('beginner', 1),
    ('intermediate', 2),
    ('advanced', 3);
```

### `visibility_enum` Table
```sql
CREATE TYPE visibility_enum AS ENUM ('public', 'private');
```

### `texts` Table
```sql
CREATE TABLE texts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    language_id UUID NOT NULL REFERENCES languages(id) ON DELETE RESTRICT,
    proficiency_level_id UUID NOT NULL REFERENCES proficiency_levels(id) ON DELETE RESTRICT,
    topic TEXT NOT NULL,
    visibility visibility_enum NOT NULL DEFAULT 'private',
    word_count INTEGER NOT NULL,
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CHECK (word_count > 0)
);
```

### `questions` Table
```sql
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text_id UUID NOT NULL REFERENCES texts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

### `user_responses` Table
```sql
CREATE TABLE user_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    response_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    feedback TEXT,
    response_time INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (user_id, question_id, created_at)
);
```

### `user_preferences` Table
```sql
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    primary_language_id UUID NOT NULL REFERENCES languages(id) ON DELETE RESTRICT,
    ui_language_id UUID NOT NULL REFERENCES languages(id) ON DELETE RESTRICT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

### `user_learning_languages` Table
```sql
CREATE TABLE user_learning_languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language_id UUID NOT NULL REFERENCES languages(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (user_id, language_id)
);
```

### `user_statistics` Table
```sql
CREATE TABLE user_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language_id UUID NOT NULL REFERENCES languages(id) ON DELETE RESTRICT,
    total_attempts INTEGER DEFAULT 0 NOT NULL,
    correct_answers INTEGER DEFAULT 0 NOT NULL,
    last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (user_id, language_id)
);
```

## 2. Relationships Between Tables

- **users ← texts**: One-to-many (One user can create many texts)
- **languages ← texts**: One-to-many (One language has many texts)
- **proficiency_levels ← texts**: One-to-many (One proficiency level has many texts)
- **texts ← questions**: One-to-many (One text has many questions)
- **users ← user_preferences**: One-to-one (Each user has one set of preferences)
- **languages ← user_preferences**: Many-to-many (Users have primary and UI languages)
- **users ↔ languages**: Many-to-many through user_learning_languages (Users learn multiple languages)
- **users ← user_statistics**: One-to-many (Each user has statistics for each language)
- **languages ← user_statistics**: One-to-many (Each language has statistics for different users)
- **users ← user_responses**: One-to-many (One user can provide many responses)
- **questions ← user_responses**: One-to-many (One question can have many responses from different users)

## 3. Indexes

```sql
-- Indexes for languages table
CREATE INDEX idx_languages_code ON languages(code);
CREATE INDEX idx_languages_is_active ON languages(is_active);

-- Indexes for proficiency_levels table
CREATE INDEX idx_proficiency_levels_display_order ON proficiency_levels(display_order);

-- Indexes for texts table
CREATE INDEX idx_texts_user_id ON texts(user_id);
CREATE INDEX idx_texts_language_id ON texts(language_id);
CREATE INDEX idx_texts_proficiency_level_id ON texts(proficiency_level_id);
CREATE INDEX idx_texts_visibility ON texts(visibility);
CREATE INDEX idx_texts_language_visibility ON texts(language_id, visibility);
CREATE INDEX idx_texts_is_deleted ON texts(is_deleted);

-- Indexes for questions table
CREATE INDEX idx_questions_text_id ON questions(text_id);

-- Indexes for user_responses table
CREATE INDEX idx_user_responses_user_id ON user_responses(user_id);
CREATE INDEX idx_user_responses_question_id ON user_responses(question_id);
CREATE INDEX idx_user_responses_is_correct ON user_responses(is_correct);
CREATE INDEX idx_user_responses_created_at ON user_responses(created_at);

-- Indexes for user_preferences table
CREATE INDEX idx_user_preferences_primary_language_id ON user_preferences(primary_language_id);
CREATE INDEX idx_user_preferences_ui_language_id ON user_preferences(ui_language_id);

-- Indexes for user_learning_languages table
CREATE INDEX idx_user_learning_languages_user_id ON user_learning_languages(user_id);
CREATE INDEX idx_user_learning_languages_language_id ON user_learning_languages(language_id);

-- Indexes for user_statistics table
CREATE INDEX idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX idx_user_statistics_language_id ON user_statistics(language_id);
```

## 4. PostgreSQL Row-Level Security (RLS) Policies

```sql
-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE proficiency_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- Reference data policies - allow reading by anyone, modification by service role
CREATE POLICY reference_data_read_all ON languages FOR SELECT USING (true);
CREATE POLICY reference_data_read_all ON proficiency_levels FOR SELECT USING (true);

-- Users can read/write their own data (universal policy)
CREATE POLICY users_own_data ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY users_own_data ON texts FOR ALL USING (auth.uid() = user_id AND is_deleted = false);
CREATE POLICY users_own_data ON user_responses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY users_own_data ON user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY users_own_data ON user_learning_languages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY users_own_data ON user_statistics FOR ALL USING (auth.uid() = user_id);

-- Public content policy
CREATE POLICY public_content_readable ON texts 
    FOR SELECT USING (visibility = 'public' AND is_deleted = false);

-- Questions policies - simplified for MVP
CREATE POLICY questions_access ON questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM texts 
            WHERE texts.id = questions.text_id 
            AND (
                texts.visibility = 'public' 
                OR texts.user_id = auth.uid()
            )
            AND texts.is_deleted = false
        )
    );
CREATE POLICY questions_modify ON questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM texts 
            WHERE texts.id = questions.text_id 
            AND texts.user_id = auth.uid()
            AND texts.is_deleted = false
        )
    );

-- Note: Admin policies omitted for MVP to simplify initial implementation
-- Admin access can be handled through service roles or added in a post-MVP phase
```

## 5. Additional Notes and Design Decisions

1. **Scalable Language Support**: Replaced language enums with a dedicated `languages` table for dynamic language management, allowing easy addition of new languages without schema alterations.

2. **Flexible Proficiency Levels**: Created a dedicated `proficiency_levels` table to allow for future customization of learning progression paths.

3. **Many-to-Many User-Language Relationship**: Implemented `user_learning_languages` table to properly manage multiple languages per user.

4. **Soft Delete Implementation**: Used `is_deleted` boolean field in the texts table to allow recovery of accidentally deleted content while maintaining referential integrity.

5. **Visibility Control**: Maintained the visibility enum for simple access control of content.

6. **Performance Considerations**:
   - Added composite indexes for commonly queried field combinations
   - Designed schema to minimize joins for common operations

7. **Scalability Features**:
   - Used UUIDs for primary keys to facilitate potential distributed systems
   - Separated user preferences and statistics from core user data

8. **Data Integrity**:
   - Implemented appropriate foreign key constraints with CASCADE deletion where appropriate
   - Added CHECK constraints to ensure valid data (e.g., word_count > 0)
   - Used RESTRICT for reference tables to prevent accidental deletion

9. **Performance Tracking**:
   - Added response_time field to measure and analyze user performance
   - Created dedicated user_statistics table for aggregated metrics

10. **Security Implementation**:
    - Leveraged Supabase Auth for authentication
    - Implemented simplified RLS policies focused on essential data protection:
      - Public reference data readable by all
      - Users can only access their own personal data
      - Public content is visible to everyone
      - Content creators can manage their own content
      - Admin policies deferred to post-MVP phase for simplicity

11. **Future Expansion**:
    - Schema now supports adding additional languages dynamically
    - Design allows for future features like tagging, categories, or collaborative learning
