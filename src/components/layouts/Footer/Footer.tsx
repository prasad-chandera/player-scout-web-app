/** App footer — data attribution and the mock-mode notice. */
export function Footer() {
  return (
    <footer className="relative z-[1] mt-4 border-t border-hairline py-6 text-center text-xs text-ink-muted">
      <div className="seam mx-auto mb-4 max-w-6xl" />
      Developed by Moneyball Minds · Ball-by-ball data ©{" "}
      <a href="https://cricsheet.org" className="text-ink-secondary underline hover:text-series">
        Cricsheet
      </a>{" "}
    </footer>
  );
}
