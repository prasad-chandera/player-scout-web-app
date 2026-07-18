export interface ErrorStateProps {
  message: string;
}

/** Inline error banner — used when a fetch or search fails. */
export function ErrorState({ message }: ErrorStateProps) {
  return (
    <p className="rounded-xl border border-hairline bg-surface px-4 py-3 text-sm text-warn">
      {message}
    </p>
  );
}
