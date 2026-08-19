import React from 'react';

export type IconName =
  | 'shield'
  | 'shield-check'
  | 'shield-alert'
  | 'lock'
  | 'alert-triangle'
  | 'check'
  | 'check-circle'
  | 'x-circle'
  | 'database'
  | 'brain'
  | 'search'
  | 'activity'
  | 'clock'
  | 'file'
  | 'chevron-right'
  | 'chevron-down'
  | 'arrow-down'
  | 'arrow-right'
  | 'eye'
  | 'refresh'
  | 'tag'
  | 'layers'
  | 'terminal'
  | 'scale'
  | 'gavel'
  | 'gauge'
  | 'inbox'
  | 'wifi-off';

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

const paths: Record<IconName, React.ReactNode> = {
  shield: (
    <path d="M12 2.5 4.5 5.5v6c0 5 3.2 8.4 7.5 10 4.3-1.6 7.5-5 7.5-10v-6L12 2.5Z" />
  ),
  'shield-check': (
    <>
      <path d="M12 2.5 4.5 5.5v6c0 5 3.2 8.4 7.5 10 4.3-1.6 7.5-5 7.5-10v-6L12 2.5Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  'shield-alert': (
    <>
      <path d="M12 2.5 4.5 5.5v6c0 5 3.2 8.4 7.5 10 4.3-1.6 7.5-5 7.5-10v-6L12 2.5Z" />
      <path d="M12 8v4.5" />
      <path d="M12 15.5h.01" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" />
      <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
    </>
  ),
  'alert-triangle': (
    <>
      <path d="M10.6 3.9 2.9 18a1.6 1.6 0 0 0 1.4 2.4h15.4a1.6 1.6 0 0 0 1.4-2.4L13.4 3.9a1.6 1.6 0 0 0-2.8 0Z" />
      <path d="M12 9.5V14" />
      <path d="M12 17h.01" />
    </>
  ),
  check: <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />,
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.3 2.6 2.6L16.3 9" />
    </>
  ),
  'x-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
      <path d="M4.5 5.5V18c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3V5.5" />
      <path d="M4.5 11.75c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3" />
    </>
  ),
  brain: (
    <>
      <path d="M9.5 3.5a3 3 0 0 0-3 3v.3A3.2 3.2 0 0 0 4.7 12a3.3 3.3 0 0 0 .3 5.4A3 3 0 0 0 8 21a2.9 2.9 0 0 0 1.5-.4" />
      <path d="M14.5 3.5a3 3 0 0 1 3 3v.3a3.2 3.2 0 0 1 1.8 5.2 3.3 3.3 0 0 1-.3 5.4A3 3 0 0 1 16 21a2.9 2.9 0 0 1-1.5-.4" />
      <path d="M9.5 3.5v17M14.5 3.5v17" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.6-4.6" />
    </>
  ),
  activity: <path d="M3 12h4l2.5-7L14 19l2.5-7H21" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  file: (
    <>
      <path d="M7 3.5h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5v4h4" />
    </>
  ),
  'chevron-right': <path d="m9.5 6 6.5 6-6.5 6" />,
  'chevron-down': <path d="m6 9.5 6 6.5 6-6.5" />,
  'arrow-down': <path d="M12 4.5v14M6 13l6 5.5 6-5.5" />,
  'arrow-right': <path d="M4.5 12h14M13 6l6 6-6 6" />,
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  refresh: (
    <>
      <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8" />
      <path d="M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.7 5.7L4 16" />
      <path d="M4 20v-4h4" />
    </>
  ),
  tag: (
    <>
      <path d="M12.5 3.5H6a1.5 1.5 0 0 0-1.5 1.5v6.5L14 21l7-7-9.5-10.5Z" />
      <path d="M8.5 8h.01" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 8.5 5-8.5 5-8.5-5L12 3Z" />
      <path d="m3.5 13 8.5 5 8.5-5" />
      <path d="m3.5 17.5 8.5 5 8.5-5" />
    </>
  ),
  terminal: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3.5 3L7 15" />
      <path d="M12.5 15h4.5" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18" />
      <path d="M7 21h10" />
      <path d="M4 7h16" />
      <path d="M4 7 2 11.5a2.3 2.3 0 0 0 4.4 0L4 7Z" />
      <path d="M20 7 18 11.5a2.3 2.3 0 0 0 4.4 0L20 7Z" />
    </>
  ),
  gavel: (
    <>
      <path d="m14.5 3.5 6 6-2.1 2.1-6-6 2.1-2.1Z" />
      <path d="m8.4 9.6 6 6-5.3 5.3H3.5v-5.6l4.9-5.7Z" />
      <path d="m11 7 2 2" />
    </>
  ),
  gauge: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12 15.5 8" />
      <path d="M8 15h.01M12 6.5h.01M17 15h.01" />
    </>
  ),
  inbox: (
    <>
      <path d="M3.5 12h5l1.8 3h3.4l1.8-3h5" />
      <path d="M6 5h12l2.5 7v7a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 19v-7L6 5Z" />
    </>
  ),
  'wifi-off': (
    <>
      <path d="M3 8.5a16 16 0 0 1 4.6-2.8M20.9 8.5a16 16 0 0 0-6.4-3.4M6.6 12.5a10.4 10.4 0 0 1 3.6-2M17.4 12.5a10.4 10.4 0 0 0-2.3-1.6" />
      <path d="M9.8 16a5.4 5.4 0 0 1 4.4 0" />
      <path d="M12 20h.01" />
      <path d="m3 3 18 18" />
    </>
  ),
};

const Icon: React.FC<IconProps> = ({ name, size = 16, strokeWidth = 1.7, className, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
  >
    {paths[name]}
  </svg>
);

export default Icon;
