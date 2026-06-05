import { useEffect, useMemo, useState } from 'react';
import type {
  GenerationMode,
  IconSize,
  LogicalIconRecord,
  TestGenerateResult,
} from '@plasma-icons-mapper/shared';
import {
  getGenerationStatus,
  listLogicalIcons,
  startGeneration,
  testGeneration,
  updateIconDescription,
} from '../api';
import { iconSvgUrl } from '../api';

const STATUS_TOOLTIP = [
  'Missing: no generated description exists yet.',
  'Stale: a description exists, but the SVG changed since it was generated.',
  'Generated: the description matches the current SVG.',
].join('\n');

const ICONS_PER_PAGE = 50;
type StatusFilter = 'all' | 'missing' | 'stale' | 'generated';

export function AdminPage() {
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getGenerationStatus>> | null>(null);
  const [icons, setIcons] = useState<LogicalIconRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mode, setMode] = useState<GenerationMode>('missing');
  const [model, setModel] = useState('google/gemini-2.5-flash');
  const [promptOverride, setPromptOverride] = useState('');
  const [testResults, setTestResults] = useState<TestGenerateResult[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingDescriptionId, setEditingDescriptionId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState('');
  const [savingDescriptionId, setSavingDescriptionId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('missing');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [nameFilter, setNameFilter] = useState('');
  const [page, setPage] = useState(1);

  async function refresh() {
    const [statusResponse, iconsResponse] = await Promise.all([
      getGenerationStatus(),
      listLogicalIcons(),
    ]);
    setStatus(statusResponse);
    setIcons(iconsResponse.icons);
  }

  useEffect(() => {
    refresh().catch((err) => setError(err instanceof Error ? err.message : 'Failed to load admin data'));
  }, []);

  const testResultsById = Object.fromEntries(testResults.map((result) => [result.id, result]));

  const categoryOptions = useMemo(
    () => Array.from(new Set(icons.map((icon) => icon.category))).sort((a, b) => a.localeCompare(b)),
    [icons],
  );

  const filteredIcons = useMemo(() => {
    const normalizedNameFilter = nameFilter.trim().toLowerCase();

    return icons.filter((icon) => {
      const matchesStatus = statusFilter === 'all' || icon.generationStatus === statusFilter;
      const matchesCategory = categoryFilter === 'all' || icon.category === categoryFilter;
      const matchesName =
        !normalizedNameFilter || icon.name.toLowerCase().includes(normalizedNameFilter);

      return matchesStatus && matchesCategory && matchesName;
    });
  }, [categoryFilter, icons, nameFilter, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, nameFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredIcons.length / ICONS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = filteredIcons.length ? (currentPage - 1) * ICONS_PER_PAGE : 0;
  const pageIcons = filteredIcons.slice(pageStart, pageStart + ICONS_PER_PAGE);
  const pageEnd = pageStart + pageIcons.length;

  function getDescriptionForIcon(icon: LogicalIconRecord): string | undefined {
    return icon.description ?? testResultsById[icon.logicalId]?.description;
  }

  function toggleSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function formatSizes(sizes: IconSize[]): string {
    return sizes.join(', ');
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await startGeneration({
        mode,
        iconIds: selectedIds.length ? selectedIds : undefined,
        model,
      });
      setMessage('Generation finished.');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleTest() {
    if (!selectedIds.length) {
      setError('Select at least one icon to test generation.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await testGeneration({
        iconIds: selectedIds,
        model,
        promptOverride: promptOverride || undefined,
      });
      setTestResults(response.results);
      setMessage('Test generation completed.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test generation failed');
    } finally {
      setLoading(false);
    }
  }

  function startEditingDescription(icon: LogicalIconRecord) {
    setEditingDescriptionId(icon.logicalId);
    setEditingDescription(getDescriptionForIcon(icon) ?? '');
    setError(null);
    setMessage(null);
  }

  function cancelEditingDescription() {
    setEditingDescriptionId(null);
    setEditingDescription('');
  }

  async function handleSaveDescription(icon: LogicalIconRecord) {
    const description = editingDescription.trim();
    if (!description) {
      setError('Description cannot be empty.');
      return;
    }

    setSavingDescriptionId(icon.logicalId);
    setError(null);
    setMessage(null);
    try {
      const response = await updateIconDescription({
        iconId: icon.logicalId,
        description,
      });
      setIcons((current) =>
        current.map((item) =>
          item.logicalId === response.icon.logicalId ? response.icon : item,
        ),
      );
      setStatus(response.status);
      setTestResults((current) => current.filter((result) => result.id !== icon.logicalId));
      setEditingDescriptionId(null);
      setEditingDescription('');
      setMessage('Description updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update description');
    } finally {
      setSavingDescriptionId(null);
    }
  }

  return (
    <div className="admin-layout">
      <div className="panel">
        <h2>Description Coverage</h2>
        {status ? (
          <div className="status-grid">
            <div className="status-card"><strong>{status.totalIcons}</strong><span>Unique icons</span></div>
            <div className="status-card"><strong>{status.totalPhysicalIcons}</strong><span>SVG files</span></div>
            <div className="status-card"><strong>{status.withDescription}</strong><span>Generated</span></div>
            <div className="status-card"><strong>{status.missing}</strong><span>Missing</span></div>
            <div className="status-card"><strong>{status.stale}</strong><span>Stale</span></div>
            <div className="status-card"><strong>{status.failed}</strong><span>Failed</span></div>
          </div>
        ) : (
          <p className="muted">Loading status...</p>
        )}
        {status?.log.inProgress && (
          <p>
            Generation in progress: {status.log.processed}/{status.log.total}
          </p>
        )}
      </div>

      <div className="panel admin-controls">
        <h2>Generation Controls</h2>
        <select value={mode} onChange={(event) => setMode(event.target.value as GenerationMode)}>
          <option value="missing">Missing only</option>
          <option value="stale">Missing + stale</option>
          <option value="force">Force regenerate</option>
        </select>
        <input value={model} onChange={(event) => setModel(event.target.value)} placeholder="OpenRouter model" />
        <textarea
          value={promptOverride}
          onChange={(event) => setPromptOverride(event.target.value)}
          placeholder="Optional prompt override for test generation"
          rows={4}
        />
        <p className="muted">
          Descriptions are generated once per icon and shared across all sizes. Test selected icons
          previews without saving. Use Run generation to persist.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Running...' : 'Run generation'}
          </button>
          <button type="button" onClick={handleTest} disabled={loading}>
            Test selected icons
          </button>
        </div>
        {message && <p>{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>

      {testResults.length > 0 && (
        <div className="panel">
          <h2>Test Results (not saved)</h2>
          {testResults.map((result) => (
            <div key={result.id} className="test-result-item">
              <strong>{result.id}</strong>
              <p>{result.description || result.rawResponse || 'No description returned.'}</p>
              {result.tags.length > 0 && <p className="muted">Tags: {result.tags.join(', ')}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="panel">
        <div className="search-controls">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="missing">Missing</option>
            <option value="stale">Stale</option>
            <option value="generated">Generated</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
            placeholder="Filter by name"
            aria-label="Filter by name"
          />
          <button
            type="button"
            onClick={() => setSelectedIds(pageIcons.map((icon) => icon.logicalId))}
            disabled={!pageIcons.length}
          >
            Select visible
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th />
              <th>Preview</th>
              <th>Name</th>
              <th>Category</th>
              <th>Sizes</th>
              <th>
                <span
                  className="tooltip-help"
                  data-tooltip={STATUS_TOOLTIP}
                  aria-label={STATUS_TOOLTIP}
                  tabIndex={0}
                >
                  Status
                </span>
              </th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {pageIcons.map((icon) => (
              <tr key={icon.logicalId}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(icon.logicalId)}
                    onChange={() => toggleSelection(icon.logicalId)}
                  />
                </td>
                <td>
                  <img src={iconSvgUrl(icon.previewId)} alt={icon.name} width={24} height={24} />
                </td>
                <td>{icon.name}</td>
                <td>{icon.category}</td>
                <td className="muted">{formatSizes(icon.sizesAvailable)}</td>
                <td>{icon.generationStatus}</td>
                <td className="description-cell">
                  {editingDescriptionId === icon.logicalId ? (
                    <div className="description-editor">
                      <textarea
                        value={editingDescription}
                        onChange={(event) => setEditingDescription(event.target.value)}
                        rows={4}
                        aria-label={`Edit description for ${icon.name}`}
                      />
                      <div className="description-actions">
                        <button
                          type="button"
                          onClick={() => handleSaveDescription(icon)}
                          disabled={savingDescriptionId === icon.logicalId}
                        >
                          {savingDescriptionId === icon.logicalId ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditingDescription}
                          disabled={savingDescriptionId === icon.logicalId}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : getDescriptionForIcon(icon) ? (
                    <>
                      {testResultsById[icon.logicalId] && !icon.description && (
                        <span className="preview-badge">preview</span>
                      )}
                      {getDescriptionForIcon(icon)}
                      <button
                        type="button"
                        className="inline-action"
                        onClick={() => startEditingDescription(icon)}
                      >
                        Edit
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="muted">—</span>
                      <button
                        type="button"
                        className="inline-action"
                        onClick={() => startEditingDescription(icon)}
                      >
                        Add
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!pageIcons.length && (
              <tr>
                <td colSpan={7} className="muted">
                  No icons match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="pagination">
          <p className="muted">
            Showing {pageIcons.length ? pageStart + 1 : 0}-{pageEnd} of {filteredIcons.length} icons
          </p>
          <div className="pagination-controls">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {status?.log.failures?.length ? (
        <div className="panel">
          <h2>Recent Failures</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Error</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {status.log.failures.map((failure) => (
                <tr key={`${failure.id}-${failure.failedAt}`}>
                  <td>{failure.id}</td>
                  <td className="error">{failure.error}</td>
                  <td>{failure.failedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
