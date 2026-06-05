import type { SearchResultItem } from '@plasma-icons-mapper/shared';
import { iconSvgUrl } from '../api';

interface IconCardProps {
  icon: SearchResultItem;
  selected?: boolean;
  showScore?: boolean;
  onClick?: () => void;
}

export function IconCard({ icon, selected, showScore, onClick }: IconCardProps) {
  return (
    <button type="button" className={`icon-card ${selected ? 'selected' : ''}`} onClick={onClick}>
      <div className="icon-preview">
        <img src={iconSvgUrl(icon.id)} alt={icon.name} />
      </div>
      <div className="icon-meta">
        <strong>{icon.name}</strong>
        <div>{icon.category}</div>
        {icon.variant && <div className="muted">{icon.variant}</div>}
        {showScore && <div className="score">Score: {icon.score}</div>}
      </div>
    </button>
  );
}
