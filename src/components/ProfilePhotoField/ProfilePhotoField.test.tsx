import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { PROFILE_PHOTO_FORMAT_ERROR, PROFILE_PHOTO_SIZE_ERROR, ProfilePhotoField } from './ProfilePhotoField';

const image = (name: string, type: string, size: number) => { const file = new File(['x'], name, { type }); Object.defineProperty(file, 'size', { value: size }); return file; };
const input = (container: HTMLElement) => container.querySelector('input[type="file"]') as HTMLInputElement;

describe('ProfilePhotoField (MAIR-936)', () => {
  it('shows the initials and the drop prompt when empty', async () => {
    const { container } = render(<ProfilePhotoField label="Photo de profil" initials="QT" onChange={jest.fn()} />);
    expect(screen.getByText('QT')).toBeInTheDocument();
    expect(screen.getByText('PNG, JPG · 2 Mo max')).toBeInTheDocument();
    expect(container.querySelector('[data-state="empty"]')).not.toBeNull();
    expect(input(container)).toHaveAttribute('accept', 'image/jpeg,image/png');
    expect((await axe(container)).violations).toEqual([]);
  });

  it('accepts a JPG or PNG and offers « Remplacer · Retirer »', () => {
    const onChange = jest.fn();
    const { container } = render(<ProfilePhotoField label="Photo de profil" initials="QT" onChange={onChange} />);
    const photo = image('portrait.png', 'image/png', 820_000);
    fireEvent.change(input(container), { target: { files: [photo] } });
    expect(onChange).toHaveBeenCalledWith(photo);
    expect(screen.getByText('portrait.png · 820 Ko')).toBeInTheDocument();
    expect(screen.getByText('Remplacer')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retirer' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(container.querySelector('[data-state="empty"]')).not.toBeNull();
  });

  it.each([
    [image('cv.pdf', 'application/pdf', 1000), PROFILE_PHOTO_FORMAT_ERROR],
    [image('grande.jpg', 'image/jpeg', 2_500_000), PROFILE_PHOTO_SIZE_ERROR],
  ])('rejects %s with the shared message, linked to the field', (file, message) => {
    const onChange = jest.fn();
    const { container } = render(<ProfilePhotoField label="Photo de profil" initials="QT" onChange={onChange} />);
    fireEvent.drop(container.querySelector('[data-state]')!, { dataTransfer: { files: [file] } });
    expect(onChange).not.toHaveBeenCalled();
    expect(input(container)).toHaveAttribute('aria-invalid', 'true');
    expect(input(container)).toHaveAccessibleDescription(expect.stringContaining(message));
  });

  it('previews the current photo and lets the front error win', () => {
    const { container } = render(<ProfilePhotoField label="Photo de profil" initials="QT" value="/photo.jpg" error="Envoi impossible." onChange={jest.fn()} />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/photo.jpg');
    expect(screen.getByText('Photo de profil actuelle')).toBeInTheDocument();
    expect(screen.getByText('Envoi impossible.')).toBeInTheDocument();
    fireEvent.dragOver(container.querySelector('[data-state]')!);
    expect(container.querySelector('[data-dragging="true"]')).not.toBeNull();
    fireEvent.dragLeave(container.querySelector('[data-state]')!);
    expect(container.querySelector('[data-dragging]')).toBeNull();
  });
});
