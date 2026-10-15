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
  /** Compact application information on the dark sidebar, or the standalone horizontal footer. */
  variant?: 'horizontal' | 'sidebar';
  /** Additional CSS classes for the footer container */
  className?: string;
}

export const Footer = ({
  productName = 'Mairie360',
  year = new Date().getFullYear(),
  version,
  links = [],
  variant = 'horizontal',
  className = '',
}: FooterProps) => {
  const actionableLinks = links.filter((link) => Boolean(link.href || link.onClick));
  const isSidebar = variant === 'sidebar';
  const FooterContainer = isSidebar ? 'div' : 'footer';
  const renderLink = (link: FooterLink) => {
    const className = isSidebar
      ? 'rounded-sm text-xs font-medium text-[var(--mairie-navigation-text)] transition-colors hover:text-[var(--mairie-on-action)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-on-action)]'
      : 'text-sm font-medium text-[var(--mairie-muted)] transition-colors hover:text-[var(--mairie-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/30 rounded-sm';

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
    <FooterContainer
      role={isSidebar ? undefined : 'contentinfo'}
      className={`${isSidebar
        ? 'flex w-full flex-col items-center gap-3 border-t border-[var(--mairie-navigation-border)]/45 bg-transparent px-4 py-5 text-[var(--mairie-navigation-text)]'
        : 'flex min-h-16 w-full flex-col gap-3 border-t border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-6 py-4 text-[var(--mairie-muted)] shadow-[var(--mairie-shadow)] sm:flex-row sm:items-center sm:justify-between sm:gap-6'} ${className}`}
    >
      <div className={isSidebar ? 'flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-xs' : 'flex flex-wrap items-center gap-x-4 gap-y-2 text-sm'}>
        <span>{`© ${year} ${productName}`}</span>
        {version && (
          <>
            <span className={isSidebar ? 'text-[var(--mairie-navigation-text)]' : 'text-[var(--mairie-navigation-border)]'} aria-hidden="true">•</span>
            <span>{`Version ${version}`}</span>
          </>
        )}
      </div>

      {actionableLinks.length > 0 && <nav aria-label="Liens du pied de page" className={`flex flex-wrap items-center gap-y-2 ${isSidebar ? 'justify-center gap-x-2' : 'gap-x-4'}`}>
        {actionableLinks.map((link, index) => (
          <React.Fragment key={`${link.label}-${index}`}>
            {index > 0 && (
              <span className={isSidebar ? 'text-[var(--mairie-navigation-text)]' : 'text-[var(--mairie-navigation-border)]'} aria-hidden="true">
                •
              </span>
            )}
            {renderLink(link)}
          </React.Fragment>
        ))}
      </nav>}
    </FooterContainer>
  );
};
