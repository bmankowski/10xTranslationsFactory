-- Migration: add_proficiency_level_descriptions
-- Description: Adds description field to proficiency_levels table and updates existing levels with descriptions
-- Created: 2025-04-18

-- Add description field to proficiency_levels table
ALTER TABLE proficiency_levels 
ADD COLUMN description text;

-- Update existing proficiency levels with descriptions
UPDATE proficiency_levels
SET description = 'Basic vocabulary and grammar for everyday communication. Able to understand and use familiar everyday expressions and very basic phrases.'
WHERE name = 'beginner';

UPDATE proficiency_levels
SET description = 'More complex grammar and expanded vocabulary. Able to communicate in routine contexts and describe aspects of background, immediate environment, and matters of immediate need.'
WHERE name = 'intermediate';

UPDATE proficiency_levels
SET description = 'Sophisticated language use and nuanced understanding. Able to express ideas fluently and spontaneously without much searching for expressions, and can use language flexibly and effectively for social, academic, and professional purposes.'
WHERE name = 'advanced';

-- Make the description field required for future entries
ALTER TABLE proficiency_levels
ALTER COLUMN description SET NOT NULL; 