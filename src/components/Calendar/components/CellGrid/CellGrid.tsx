'use client';

import React from 'react';

import { Cell, type CellProps } from './components/Cell';

export type GridCell = Omit<CellProps, 'onPick'>;

export interface CellGridProps {
  /** Accessible name of the group (« Mois de 2026 », « Années 2016 à 2027 »). */
  label: string;
  cells: GridCell[];
  onPick: (value: string) => void;
}

/** The months and years views of Calendar (MAIR-1099): twelve cells, three per row. */
export function CellGrid({ label, cells, onPick }: CellGridProps) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-3" style={{ gap: 6, paddingTop: 6 }}>
      {cells.map(cell => <Cell key={cell.value} {...cell} onPick={onPick} />)}
    </div>
  );
}
