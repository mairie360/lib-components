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

describe('MAIR-1260 tag shape and tone', () => {
  it('is rounded and neutral by default', () => {
    render(<Tag label="Agent" />);
    const tag = screen.getByText('Agent');
    expect(tag).toHaveAttribute('data-shape', 'rounded');
    expect(tag).toHaveAttribute('data-tone', 'neutral');
    expect(tag.className).toContain('rounded-md');
  });
  it('draws the purple role pill', () => {
    render(<Tag label="Administrateur" shape="pill" tone="purple" />);
    const tag = screen.getByText('Administrateur');
    expect(tag.className).toContain('rounded-full');
    expect(tag.className).toContain('--mairie-purple-surface');
    expect(tag.className).not.toContain('rounded-md');
  });
});
