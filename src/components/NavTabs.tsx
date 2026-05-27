type Page = 'bracket' | 'view' | 'official' | 'leaderboard';

interface NavTabsProps {
  page: Page;
  onNavigate: (page: Page) => void;
  submittedCount: number;
  variant: 'header' | 'bottom';
}

const TABS: { id: Page; label: string; short: string }[] = [
  { id: 'bracket', label: 'My Bracket', short: 'Mine' },
  { id: 'leaderboard', label: 'Leaderboard', short: 'Board' },
  { id: 'official', label: 'Official', short: 'Official' },
  { id: 'view', label: 'Brackets', short: 'All' },
];

export default function NavTabs({
  page,
  onNavigate,
  submittedCount,
  variant,
}: NavTabsProps) {
  const className =
    variant === 'bottom' ? 'nav-bottom-tabs' : 'nav-links nav-links--header';

  return (
    <div className={className} role="tablist" aria-label="Main navigation">
      {TABS.map(({ id, label, short }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={page === id}
          className={`nav-link ${page === id ? 'nav-link--active' : ''}`}
          onClick={() => onNavigate(id)}
        >
          <span className="nav-link-full">{label}</span>
          <span className="nav-link-short">{short}</span>
          {id === 'view' && submittedCount > 0 && (
            <span className="nav-badge">{submittedCount}</span>
          )}
        </button>
      ))}
    </div>
  );
}
