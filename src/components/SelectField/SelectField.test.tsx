import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectField } from './SelectField';

const options = [{ value: 'dashboard', label: 'Tableau de bord' }, { value: 'projects', label: 'Projets' }, { value: 'calendar', label: 'Calendrier' }] as const;

describe('SelectField (MAIR-608)', () => {
  it('renders a native select with a placeholder and reports the chosen value', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<SelectField label="Page d’accueil" options={options} value="" onChange={onChange} hint="Ouverte après la connexion." />);
    const select = screen.getByLabelText('Page d’accueil');
    expect(within(select).getAllByRole('option')).toHaveLength(4);
    await user.selectOptions(select, 'projects');
    expect(onChange).toHaveBeenCalledWith('projects');
  });
  it('omits the placeholder entry when every option is a real choice', () => {
    render(<SelectField label="Récurrence" placeholder={null} value="none" options={[{ value: 'none', label: 'Ne se répète pas' }, { value: 'daily', label: 'Tous les jours' }]} />);
    expect(within(screen.getByLabelText('Récurrence')).getAllByRole('option')).toHaveLength(2);
  });
});
