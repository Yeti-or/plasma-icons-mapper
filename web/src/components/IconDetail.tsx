import type { SearchResultItem } from '@plasma-icons-mapper/shared';
import { iconSvgUrl } from '../api';

interface IconDetailProps {
  icon: SearchResultItem | null;
}

export function IconDetail({ icon }: IconDetailProps) {
  if (!icon) {
    return (
      <div className="panel detail-panel muted">
        Select an icon to see details.
      </div>
    );
  }

  return (
    <div className="panel detail-panel">
      <h2>{icon.name}</h2>
      <p className="muted">
        {icon.category} · size {icon.size} · {icon.variant ?? 'default'}
      </p>
      <p>{icon.description ?? 'No description generated yet.'}</p>
      {icon.tags?.length ? (
        <p>
          <strong>Tags:</strong> {icon.tags.join(', ')}
        </p>
      ) : null}
      <div className="detail-preview">
        {icon.sizesAvailable.map((size) => {
          const id = `${size}/${icon.category}/${icon.name}`;
          return (
            <div key={id} className="detail-preview-item">
              <img src={iconSvgUrl(id)} alt={`${icon.name} ${size}px`} width={48} height={48} />
              <div>{size}px</div>
            </div>
          );
        })}
      </div>
      <p className="muted">Path: {icon.relativePath}</p>
    </div>
  );
}
