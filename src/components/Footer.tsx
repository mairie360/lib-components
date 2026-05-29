import React from 'react';

export type FooterLink = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export interface FooterProps {
  /** Product or application name */
  productName?: string;
  /** Copyright year */
  year?: number;
  /** Product version displayed in the footer */
  version?: string;
  /** Links displayed on the right side */
  links?: FooterLink[];
  /** Additional CSS classes for the footer container */
  className?: string;
}

const defaultFooterLinks: FooterLink[] = [
  { label: 'Support technique' },
  { label: 'Documentation' },
  { label: "Conditions d'utilisation" },
];

export const Footer = ({
  productName = 'Mairie360',
  year = new Date().getFullYear(),
  version = '2.1.0',
  links = defaultFooterLinks,
  className = '',
}: FooterProps) => {
  const renderLink = (link: FooterLink) => {
    const className =
      'text-sm font-medium text-[#4c5258] transition-colors hover:text-[#1256a6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b908d]/30 rounded-sm';

    if (link.href) {
      return (
        <a href={link.href} className={className}>
          {link.label}
        </a>
      );
    }

    return (
      <button type="button" className={className} onClick={link.onClick}>
        {link.label}
      </button>
    );
  };

  return (
    <footer
      className={`flex min-h-16 w-full flex-col gap-3 border-t border-[#b9d6d5] bg-white px-6 py-4 text-[#4c5258] shadow-[0_-1px_5px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span>{`© ${year} ${productName}`}</span>
        <span className="text-[#4b908d]" aria-hidden="true">
          •
        </span>
        <span>{`Version ${version}`}</span>
      </div>

      <nav aria-label="Liens du pied de page" className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {links.map((link, index) => (
          <React.Fragment key={`${link.label}-${index}`}>
            {index > 0 && (
              <span className="text-[#4b908d]" aria-hidden="true">
                •
              </span>
            )}
            {renderLink(link)}
          </React.Fragment>
        ))}
      </nav>
    </footer>
  );
};
