import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Avatar } from '../components/Avatar';
it('uses meaningful image text then falls back to initials after a failed image load', () => {
  render(<Avatar src="/avatar.png" alt="Anne Marie" fallback="AM" />); fireEvent.error(screen.getByRole('img', { name: 'Anne Marie' })); expect(screen.queryByRole('img')).not.toBeInTheDocument(); expect(screen.getByText('AM')).toBeVisible();
});
