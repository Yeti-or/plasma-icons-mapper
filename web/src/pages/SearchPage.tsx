import { useEffect, useState } from 'react';
import type { IconSize, SearchResultItem } from '@plasma-icons-mapper/shared';
import { DEFAULT_ICON_SIZE, ICON_SIZES } from '@plasma-icons-mapper/shared';
import { searchIcons } from '../api';
import { IconCard } from '../components/IconCard';
import { IconDetail } from '../components/IconDetail';

export function SearchPage() {
  const [mode, setMode] = useState<'name' | 'description'>('name');
  const [query, setQuery] = useState('');
  const [size, setSize] = useState<IconSize>(DEFAULT_ICON_SIZE);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selected, setSelected] = useState<SearchResultItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelected(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await searchIcons({ mode, query, size });
        setResults(response.results);
        setSelected(response.results[0] ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [mode, query, size]);

  return (
    <div>
      <div className="panel">
        <div className="search-controls">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              mode === 'name'
                ? 'Search by icon name, e.g. heartCircleFill'
                : 'Search by description, e.g. icon inside circle'
            }
          />
          <select value={mode} onChange={(event) => setMode(event.target.value as 'name' | 'description')}>
            <option value="name">By name</option>
            <option value="description">By description</option>
          </select>
          <select value={size} onChange={(event) => setSize(Number(event.target.value) as IconSize)}>
            {ICON_SIZES.map((iconSize) => (
              <option key={iconSize} value={iconSize}>
                Size {iconSize}
              </option>
            ))}
          </select>
        </div>

        {loading && <p className="muted">Searching...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && query && results.length === 0 && (
          <p className="muted">No icons found.</p>
        )}

        <div className="icon-grid">
          {results.map((icon) => (
            <IconCard
              key={icon.id}
              icon={icon}
              selected={selected?.id === icon.id}
              showScore={mode === 'description'}
              onClick={() => setSelected(icon)}
            />
          ))}
        </div>
      </div>

      <IconDetail icon={selected} />
    </div>
  );
}
