export const joinDashboardClasses = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export const clampDashboardProgress = (value: number) => Math.min(100, Math.max(0, value));

export const dashboardCardActionClasses =
  'rounded-md border border-[#d8d2ca] bg-[#fbfaf9] px-3 py-2 text-sm font-medium text-[#243041] hover:bg-white';
