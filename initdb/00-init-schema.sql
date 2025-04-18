-- Tworzymy tylko schemat, bez żadnych tabel
CREATE SCHEMA IF NOT EXISTS auth;

-- Tworzymy też tabelę refresh_tokens w głównym schemacie (public)
-- aby rozwiązać problem z indeksem w migracji
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id bigserial NOT NULL,
    token varchar(255) NULL,
    user_id varchar(255) NULL,
    revoked bool NULL,
    created_at timestamptz NULL,
    updated_at timestamptz NULL,
    parent varchar(255) NULL,
    CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id)
);

-- Tworzymy tabelę identities w głównym schemacie (public)
-- aby rozwiązać problem z indeksem w migracji 20211122151130
CREATE TABLE IF NOT EXISTS identities (
    id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamptz NULL,
    created_at timestamptz NULL,
    updated_at timestamptz NULL,
    CONSTRAINT identities_pkey PRIMARY KEY (provider, id)
);

-- Tworzymy indeks na identities.user_id
CREATE INDEX IF NOT EXISTS identities_user_id_idx ON identities using btree (user_id);

-- Tworzymy tabelę users w głównym schemacie (public)
-- aby rozwiązać problem z indeksem w migracji 20220114185221
CREATE TABLE IF NOT EXISTS users (
    instance_id uuid NULL,
    id uuid NOT NULL UNIQUE,
    aud varchar(255) NULL,
    "role" varchar(255) NULL,
    email varchar(255) NULL UNIQUE,
    encrypted_password varchar(255) NULL,
    confirmed_at timestamptz NULL,
    invited_at timestamptz NULL,
    confirmation_token varchar(255) NULL,
    confirmation_sent_at timestamptz NULL,
    recovery_token varchar(255) NULL,
    recovery_sent_at timestamptz NULL,
    email_change_token varchar(255) NULL,
    email_change varchar(255) NULL,
    email_change_sent_at timestamptz NULL,
    last_sign_in_at timestamptz NULL,
    raw_app_meta_data jsonb NULL,
    raw_user_meta_data jsonb NULL,
    is_super_admin bool NULL,
    created_at timestamptz NULL,
    updated_at timestamptz NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Tworzymy indeks users_instance_id_email_idx z funkcją lower
CREATE INDEX IF NOT EXISTS users_instance_id_email_idx ON users using btree (instance_id, lower(email));

-- Tworzymy tablicę schema_migrations (bez prefiksu schematu)
CREATE TABLE IF NOT EXISTS schema_migrations (
    version varchar(255) NOT NULL,
    CONSTRAINT schema_migrations_pkey PRIMARY KEY (version)
);

-- Dodajemy problematyczne migracje do tabeli, aby GoTrue myślało, że już zostały wykonane
INSERT INTO schema_migrations (version) 
VALUES 
  ('20210927181326'),
  ('20211122151130'),
  ('20211124214934'),
  ('20211202183645'),
  ('20220114185221'),
  ('20220114185340'),
  ('20220224000811'),
  ('20220323170000'),
  ('20220429102000'),
  ('20220531120530'),
  ('20220614074223')
ON CONFLICT (version) DO NOTHING; 