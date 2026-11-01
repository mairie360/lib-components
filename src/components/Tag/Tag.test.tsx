import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tag, TagList } from './Tag';

describe('Tag (MAIR-608)', () => {
  it('removes a tag through an accessible button and lists tags under a name', async () => {
    const user = userEvent.setup(); const remove = jest.fn();
    const { rerender } = render(<TagList label="Étiquettes du projet" items={['Voirie', 'Urgent']} onRemove={remove} />);
    expect(screen.getByRole('list', { name: 'Étiquettes du projet' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retirer Urgent' })); expect(remove).toHaveBeenCalledWith('Urgent');
    rerender(<TagList label="Étiquettes" items={[]} emptyText="Aucune étiquette" />); expect(screen.getByText('Aucune étiquette')).toBeInTheDocument();
    expect(screen.getByText('Aucune étiquette')).toHaveAttribute('data-preset', 'Help');
    rerender(<Tag label="Lecture seule" />); expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
