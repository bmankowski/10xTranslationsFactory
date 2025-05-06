import React from 'react';
import type { LanguageDTO } from '@/types';
import LanguageFilter from './LanguageFilter';

interface ExerciseLanguageFilterProps {
  languages: LanguageDTO[];
  selectedLanguageId: string | null;
}

const ExerciseLanguageFilter: React.FC<ExerciseLanguageFilterProps> = ({
  languages,
  selectedLanguageId,
}) => {
  const handleFilterChange = (languageId: string | null) => {
    // Navigate to the same page with updated query parameter
    const url = new URL(window.location.href);
    
    if (languageId) {
      url.searchParams.set('language_id', languageId);
    } else {
      url.searchParams.delete('language_id');
    }
    
    // Preserve the page parameter if it exists
    window.location.href = url.toString();
  };

  return (
    <LanguageFilter
      languages={languages}
      selectedLanguageId={selectedLanguageId}
      onFilterChange={handleFilterChange}
    />
  );
};

export default ExerciseLanguageFilter; 