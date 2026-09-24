const common = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function GridIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="2" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="2" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="2" />
    </svg>
  );
}

export function ListIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </svg>
  );
}

export function BookIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21V5.5Z" />
      <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
    </svg>
  );
}

export function TrophyIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M8 4h8v5a4 4 0 1 1-8 0V4Z" />
      <path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3" />
      <path d="M10 15v2h4v-2M8.5 21h7l-1-4h-5l-1 4Z" />
    </svg>
  );
}

export function InfoIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v.01M12 11v5" />
    </svg>
  );
}

export function UsersIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3 2.5-5.3 5.5-5.3s5.5 2.3 5.5 5.3" />
      <path d="M15.5 6a3 3 0 0 1 0 6M18.5 20c0-2.6-1.8-4.7-4-5.2" />
    </svg>
  );
}

export function MegaphoneIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M3 10v4a1 1 0 0 0 1 1h2l9 5V4l-9 5H4a1 1 0 0 0-1 1Z" />
      <path d="M17 9.5a4.5 4.5 0 0 1 0 5" />
    </svg>
  );
}

export function LogOutIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M15 16l5-4-5-4M20 12H9" />
    </svg>
  );
}

export function PlusIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function EditIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4 20h4L19.5 8.5a2 2 0 0 0-4-4L4 15.5V20Z" />
    </svg>
  );
}

export function TrashIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 .9h8a1 1 0 0 0 1-.9l1-13" />
    </svg>
  );
}

export function MenuIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function DownloadIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M12 3v13m0 0-4.5-4.5M12 16l4.5-4.5" />
      <path d="M4 19.5h16" />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function CheckCircleIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5.5" />
    </svg>
  );
}

export function AlertIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4M12 17.5v.01" />
    </svg>
  );
}
