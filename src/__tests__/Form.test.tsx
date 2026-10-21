import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import '@testing-library/jest-dom';

import { Form, FormField, fieldErrorMessage, useZodForm } from '../forms';
import { EmailField, NameField } from '../components/FieldPresets';
import { SelectField } from '../components/SelectField';
import { FormActions } from '../components/FormActions';

const schema = z.object({
  first_name: z.string().min(1, 'Le prénom est obligatoire.'),
  email: z.string().email('Adresse e-mail invalide.'),
  home_page: z.enum(['dashboard', 'projects'], { errorMap: () => ({ message: 'Choisissez une page d’accueil.' }) }),
});

function ProfileForm({ onSubmit }: { onSubmit: (values: z.infer<typeof schema>) => void }) {
  const form = useZodForm(schema, { defaultValues: { first_name: '', email: '', home_page: undefined } });
  return (
    <Form form={form} onSubmit={onSubmit} aria-label="Profil">
      <FormField name="first_name" render={({ error, ...field }) => <NameField label="Prénom" {...field} error={error} />} />
      <FormField name="email" render={({ error, ...field }) => <EmailField {...field} error={error} />} />
      <FormField name="home_page" render={({ error, value, onChange, ...field }) => <SelectField label="Page d’accueil" options={[{ value: 'dashboard', label: 'Tableau de bord' }, { value: 'projects', label: 'Projets' }]} value={value ?? ''} onChange={onChange} {...field} error={error} />} />
      <FormActions busy={form.formState.isSubmitting} />
    </Form>
  );
}

describe('Form adapter (MAIR-608)', () => {
  it('blocks an invalid submission, shows every zod message through the fields and submits once valid', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<ProfileForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(onSubmit).not.toHaveBeenCalled();
    const alerts = await screen.findAllByRole('alert');
    expect(alerts.map((alert) => alert.textContent)).toEqual(['Le prénom est obligatoire.', 'Adresse e-mail invalide.', 'Choisissez une page d’accueil.']);
    expect(screen.getByLabelText('Prénom')).toHaveAttribute('aria-invalid', 'true');
    await user.type(screen.getByLabelText('Prénom'), 'Marie');
    await user.type(screen.getByLabelText('Adresse e-mail'), 'marie@mairie.fr');
    await user.selectOptions(screen.getByLabelText('Page d’accueil'), 'projects');
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({ first_name: 'Marie', email: 'marie@mairie.fr', home_page: 'projects' });
  });

  it('extracts the first message of a nested error', () => {
    expect(fieldErrorMessage(undefined)).toBeUndefined();
    expect(fieldErrorMessage({ type: 'custom', message: 'Direct' })).toBe('Direct');
    expect(fieldErrorMessage({ type: 'custom', message: '', root: { type: 'custom', message: 'Nested' } } as never)).toBe('Nested');
  });
});
