export interface EmptyStateProps {
  message: string;
}

/** Muted placeholder line — used for empty results or "nothing selected yet" states. */
export function EmptyState({ message }: EmptyStateProps) {
  return <p className="text-sm text-ink-muted">{message}</p>;
}
