export function Icon({ name, className }) {
  const title = name ? `${name} icon` : "icon";
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
    focusable: false,
  };

  switch (name) {
    case "shield":
      return (
        <svg {...common}>
          <title>{title}</title>
          <path
            d="M12 3l7 4v6c0 5-3.5 8-7 8s-7-3-7-8V7l7-4z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M9.5 12l1.7 1.7L14.8 10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "trophy":
      return (
        <svg {...common}>
          <title>{title}</title>
          <path
            d="M7 4h10v3a5 5 0 01-10 0V4z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M9 20h6M10 16h4v4h-4v-4z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M7 6H4v1a4 4 0 003 3M17 6h3v1a4 4 0 01-3 3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <title>{title}</title>
          <path
            d="M16 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M9.5 11a3 3 0 100-6 3 3 0 000 6z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M21 20v-1a3.5 3.5 0 00-2.5-3.4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M16.5 5.3a3 3 0 010 5.7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <title>{title}</title>
          <path
            d="M12 21s-7-4.4-9.2-9.1C1.2 8.6 3.3 5.5 6.7 5.1c1.7-.2 3.3.6 4.3 1.9 1-1.3 2.6-2.1 4.3-1.9 3.4.4 5.5 3.5 3.9 6.8C19 16.6 12 21 12 21z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "fitness":
      return (
        <svg {...common}>
          <title>{title}</title>
          <path
            d="M7 10l10 4M6 8l-2 2 4 4 2-2M18 10l2-2-4-4-2 2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "brain":
      return (
        <svg {...common}>
          <title>{title}</title>
          <path
            d="M9.5 4a3 3 0 00-3 3v1a3 3 0 000 6v2a3 3 0 003 3h.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M14.5 4a3 3 0 013 3v1a3 3 0 010 6v2a3 3 0 01-3 3H14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M10 8h4M10 12h4M10 16h4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <title>{title}</title>
          <path
            d="M12 21a9 9 0 110-18 9 9 0 010 18z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M12 17a5 5 0 100-10 5 5 0 000 10z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path d="M12 13a1 1 0 100-2 1 1 0 000 2z" fill="currentColor" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <title>{title}</title>
          <path
            d="M12 2l1.2 4.3L18 7.5l-4.3 1.2L12 13l-1.2-4.3L6 7.5l4.8-1.2L12 2z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M4 13l.7 2.4L7 16l-2.3.6L4 19l-.7-2.4L1 16l2.3-.6L4 13z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <title>{title}</title>
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <title>{title}</title>
          <path
            d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <title>{title}</title>
          <path
            d="M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      );
  }
}
