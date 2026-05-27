// Icons — minimal stroke set, 24x24 viewBox, currentColor.
// Stroke 1.6 for a refined editorial feel.

const I = ({ children, size = 22, stroke = 1.6, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {children}
  </svg>
);

const Icon = {
  // navigation
  Back:    (p) => <I {...p}><path d="M15 5l-7 7 7 7" /></I>,
  Forward: (p) => <I {...p}><path d="M9 5l7 7-7 7" /></I>,
  Close:   (p) => <I {...p}><path d="M6 6l12 12M18 6L6 18" /></I>,
  More:    (p) => <I {...p}><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/></I>,
  ChevronDown: (p) => <I {...p}><path d="M5 9l7 7 7-7" /></I>,
  ChevronRight:(p) => <I {...p}><path d="M9 5l7 7-7 7" /></I>,

  // tab bar
  Calendar: (p) => <I {...p}><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></I>,
  Users:    (p) => <I {...p}><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><path d="M15 6.5a3 3 0 010 5.5"/><path d="M16.8 19c0-2.4 1.5-4 3.7-4.7"/></I>,
  Settings: (p) => <I {...p}><circle cx="12" cy="12" r="2.6"/><path d="M19.4 12a7.4 7.4 0 00-.1-1.3l1.9-1.4-1.8-3.1-2.2.8a7.5 7.5 0 00-2.2-1.3L14.5 3h-5l-.5 2.7a7.5 7.5 0 00-2.2 1.3l-2.2-.8L2.8 9.3l1.9 1.4a7.4 7.4 0 000 2.6L2.8 14.7l1.8 3.1 2.2-.8a7.5 7.5 0 002.2 1.3L9.5 21h5l.5-2.7a7.5 7.5 0 002.2-1.3l2.2.8 1.8-3.1-1.9-1.4c.1-.4.1-.9.1-1.3z"/></I>,

  // actions
  Plus:    (p) => <I {...p}><path d="M12 5v14M5 12h14" /></I>,
  Search:  (p) => <I {...p}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></I>,
  Filter:  (p) => <I {...p}><path d="M4 5h16M7 12h10M10 19h4" /></I>,
  Edit:    (p) => <I {...p}><path d="M4 20h4l10-10-4-4L4 16v4z" /><path d="M14 6l4 4"/></I>,
  Trash:   (p) => <I {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></I>,
  Check:   (p) => <I {...p}><path d="M5 12l5 5L20 7" /></I>,
  Phone:   (p) => <I {...p}><path d="M5 4h4l2 5-3 2a12 12 0 005 5l2-3 5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/></I>,
  Mail:    (p) => <I {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/></I>,
  Note:    (p) => <I {...p}><path d="M5 4h10l4 4v12H5z"/><path d="M15 4v4h4"/></I>,
  Sparkle: (p) => <I {...p}><path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4z"/><path d="M19 4l.7 1.8L21.5 6.5l-1.8.7L19 9l-.7-1.8L16.5 6.5l1.8-.7L19 4z"/></I>,
  Clock:   (p) => <I {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/></I>,
  MapPin:  (p) => <I {...p}><path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></I>,
  Tennis:  (p) => <I {...p}><circle cx="12" cy="12" r="9"/><path d="M3.5 8.5C7 9 10 12 10.5 15.5M20.5 15.5C17 15 14 12 13.5 8.5"/></I>,
  Key:     (p) => <I {...p}><circle cx="8" cy="13" r="4"/><path d="M11 11l9-9M16 6l3 3M14 8l3 3"/></I>,
  Link:    (p) => <I {...p}><path d="M10 14a4 4 0 015.7 0l3-3a4 4 0 10-5.7-5.7L11 8"/><path d="M14 10a4 4 0 01-5.7 0M8 12l-3 3a4 4 0 105.7 5.7l2-2"/></I>,
  Bell:    (p) => <I {...p}><path d="M6 9a6 6 0 0112 0v4l2 3H4l2-3V9z"/><path d="M10 19a2 2 0 004 0"/></I>,
  Send:    (p) => <I {...p}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></I>,
  Eye:     (p) => <I {...p}><path d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></I>,
  EyeOff:  (p) => <I {...p}><path d="M3 3l18 18"/><path d="M10.5 6.7A11 11 0 0112 6.5c6.5 0 10.5 7 10.5 7a17.6 17.6 0 01-3.9 4.6"/><path d="M6.5 7.8C3 9.7 1.5 12.5 1.5 12.5s4 7 10.5 7c1.8 0 3.3-.5 4.7-1.3"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/></I>,
  Copy:    (p) => <I {...p}><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/></I>,
  Refresh: (p) => <I {...p}><path d="M3 12a9 9 0 0115-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-15 6.7L3 16"/><path d="M3 21v-5h5"/></I>,
  ArrowRight: (p) => <I {...p}><path d="M5 12h14M13 6l6 6-6 6"/></I>,
  Sun:     (p) => <I {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></I>,

  // serves a placeholder portrait shape
  Person:  (p) => <I {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></I>,

  Logo: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Tennis-ball seam: editorial mark in clay */}
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3 12C9 12.5 14 17 14.5 23M29 20C23 19.5 18 15 17.5 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),
};

window.Icon = Icon;
