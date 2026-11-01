import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileField } from './FileField';

describe('FileField (MAIR-608)', () => {
  it('reports selected files and lets the agent remove them', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    const { rerender } = render(<FileField label="Photo de profil" onChange={onChange} constraint="PNG, JPG · 2 Mo max" />);
    expect(screen.getByText('PNG, JPG · 2 Mo max')).toBeInTheDocument();
    await user.upload(screen.getByLabelText(/Photo de profil/), file);
    expect(onChange).toHaveBeenLastCalledWith([file]);
    rerender(<FileField label="Photo de profil" onChange={onChange} files={[file]} previewSrc="blob:photo" />);
    expect(screen.getByText(/photo\.png/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retirer' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
  it('lets the same file be picked again after a removal (CodeRabbit on #467)', () => {
    const onChange = jest.fn();
    render(<FileField label="Pièce jointe" onChange={onChange} />);
    const input = screen.getByLabelText('Pièce jointe') as HTMLInputElement;
    const file = new File(['x'], 'plan.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalledWith([file]);
    expect(input.value).toBe('');
  });
});
