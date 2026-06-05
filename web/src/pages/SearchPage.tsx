import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SearchResultItem } from '@plasma-icons-mapper/shared';
import { searchIcons } from '../api';
import { IconCard } from '../components/IconCard';
import { IconDetail } from '../components/IconDetail';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.has('description') ? 'description' : 'name';
  const initialQuery = searchParams.get(initialMode) ?? '';
  const [mode, setMode] = useState<'name' | 'description'>(initialMode);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selected, setSelected] = useState<SearchResultItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedId = searchParams.get('selected');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelected(null);
      setSearchParams({}, { replace: true });
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await searchIcons({ mode, query });
        setResults(response.results);
        setSelected(response.results.find((result) => result.id === selectedId) ?? response.results[0] ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [mode, query, selectedId, setSearchParams]);

  useEffect(() => {
    if (!query.trim()) return;

    const nextParams = new URLSearchParams({
      [mode]: query,
    });

    if (selected?.id) {
      nextParams.set('selected', selected.id);
    }

    setSearchParams(nextParams, { replace: true });
  }, [mode, query, selected?.id, setSearchParams]);

  function handleSelect(icon: SearchResultItem) {
    setSelected(icon);
  }

  return (
    <div>
      <div className="panel">
        <div className="search-controls">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              mode === 'name'
                ? 'Search by icon name, e.g. ArrowBarDown'
                : 'Search by description, e.g. icon inside circle'
            }
          />
          <select value={mode} onChange={(event) => setMode(event.target.value as 'name' | 'description')}>
            <option value="name">By name</option>
            <option value="description">By description</option>
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
              onClick={() => handleSelect(icon)}
            />
          ))}
        </div>
      </div>

      <IconDetail icon={selected} />
    </div>
  );
}
