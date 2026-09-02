export const joinDashboardClasses = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export const clampDashboardProgress = (value: number) => Math.min(100, Math.max(0, value));
