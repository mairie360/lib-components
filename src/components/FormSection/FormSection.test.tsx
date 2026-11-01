import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormActions } from '../FormActions';
import { TextField } from '../TextField';
import { FormSection } from './FormSection';

describe('FormSection (MAIR-608)', () => {
  it('disables the fields while busy and renders the status, cancel and save actions', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    const onSubmit = jest.fn((event: React.FormEvent) => event.preventDefault());
    const { rerender } = render(
      <form onSubmit={onSubmit}>
        <FormSection title="Informations personnelles" description="Visibles par les autres agents." footer={<FormActions status="Aucune modification à enregistrer." onCancel={onCancel} saveDisabled />}>
          <TextField label="Prénom" />
        </FormSection>
      </form>,
    );
    expect(screen.getByRole('region', { name: 'Informations personnelles' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Aucune modification à enregistrer.');
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    rerender(
      <form onSubmit={onSubmit}>
        <FormSection title="Informations personnelles" busy footer={<FormActions busy onCancel={onCancel} />}>
          <TextField label="Prénom" />
        </FormSection>
      </form>,
    );
    expect(screen.getByLabelText('Prénom')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeDisabled();
  });
});
