import { useState, KeyboardEvent } from 'react';
import Button from './ui/Button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  hasActiveSearch: boolean;
}

export default function SearchBar({
  onSearch,
  onClear,
  hasActiveSearch,
}: SearchBarProps) {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    onSearch(searchInput);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchInput('');
    onClear();
  };

  return (
    <div className="flex w-full flex-col items-stretch gap-2 md:max-w-md md:flex-row md:items-center md:gap-3">
      <div className="relative w-full flex-1">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search users..."
          className="w-full pl-4 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900 placeholder:text-gray-400"
        />
      </div>
      <Button onClick={handleSearch} size="md" className="w-full md:w-auto">
        Search
      </Button>
      {hasActiveSearch && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="w-full md:w-auto"
        >
          Clear
        </Button>
      )}
    </div>
  );
}
