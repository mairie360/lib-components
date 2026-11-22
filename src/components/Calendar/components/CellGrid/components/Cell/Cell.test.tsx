import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { Cell } from './Cell';

describe('MAIR-1099 Cell', () => {
  it('shows the chosen, current and disabled states', () => {
    const onPick = jest.fn();
    render(<>
      <Cell value="2026-12" text="Décembre" label="décembre 2026" selected current focused onPick={onPick} disabled={false} />
      <Cell value="2026-11" text="Novembre" label="novembre 2026" selected={false} current focused={false} onPick={onPick} disabled={false} />
      <Cell value="2026-01" text="Janvier" label="janvier 2026" selected={false} current={false} focused={false} onPick={onPick} disabled />
    </>);
    const chosen = screen.getByRole('button', { name: 'décembre 2026' });
    expect(chosen).toHaveAttribute('aria-pressed', 'true');
    expect(chosen).toHaveAttribute('tabindex', '0');
    expect(chosen).toHaveTextContent('Décembre');
    expect(screen.getByRole('button', { name: 'novembre 2026' })).toHaveAttribute('aria-current', 'date');
    const disabled = screen.getByRole('button', { name: 'janvier 2026' });
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
    expect(disabled).toHaveAttribute('tabindex', '-1');
    fireEvent.click(disabled);
    fireEvent.click(chosen);
    expect(onPick).toHaveBeenCalledWith('2026-12');
    expect(onPick).toHaveBeenCalledTimes(1);
  });
});
