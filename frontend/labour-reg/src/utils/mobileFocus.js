export function ensureMobileFocus(ev) {
  setTimeout(() => {
    try {
      ev.target.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
      // ignore errors for browsers that don't support this
    }
  }, 250);
}
