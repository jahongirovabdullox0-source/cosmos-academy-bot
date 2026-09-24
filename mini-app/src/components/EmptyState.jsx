export function EmptyState({ icon = '📭', title, action = null }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <div>{title}</div>
      {action}
    </div>
  );
}
