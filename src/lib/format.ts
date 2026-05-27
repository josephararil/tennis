export function formatCreatedAt(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString('en-GB', { weekday: 'short' });
  const month = d.toLocaleDateString('en-GB', { month: 'short' });
  const date = d.getDate();
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${day}, ${month} ${date} · ${time}`;
}

export function addMin(t: string, m: number): string {
  const [h, mm] = t.split(':').map(Number);
  const total = h * 60 + mm + m;
  const H = String(Math.floor(total / 60) % 24).padStart(2, '0');
  const M = String(total % 60).padStart(2, '0');
  return `${H}:${M}`;
}

export function deriveInitials(name: string): string {
  return name.trim().split(/\s+/).map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
