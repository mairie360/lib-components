import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { OneTimeCodeField } from './OneTimeCodeField';

// MAIR-1067: Figma `Field/OneTimeCode`: authenticator code and recovery code.
describe('MAIR-1067 OneTimeCodeField', () => {
  it('is the authenticator field by default: label, numeric keypad, one-time-code autocomplete', () => {
    render(<OneTimeCodeField />);
    const input = screen.getByLabelText('Code à 6 chiffres');
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAttribute('autocomplete', 'one-time-code');
    expect(input).toHaveAttribute('maxlength', '6');
    expect(input).toHaveAttribute('placeholder', '123 456');
    expect(input).toHaveAttribute('data-kind', 'totp');
  });

  it('keeps the digits only and reports the cleaned value', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<OneTimeCodeField onValueChange={onValueChange} />);
    const input = screen.getByLabelText('Code à 6 chiffres') as HTMLInputElement;
    await user.type(input, '12a3 4');
    expect(input.value).toBe('1234');
    expect(onValueChange).toHaveBeenLastCalledWith('1234');
  });

  it('cleans a pasted code and calls onComplete at the sixth digit only', () => {
    const onComplete = jest.fn();
    render(<OneTimeCodeField onComplete={onComplete} />);
    const input = screen.getByLabelText('Code à 6 chiffres') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '12345' } });
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: '123 456' } });
    expect(input.value).toBe('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('is the recovery field with kind="recovery": uppercase, dash after the fourth character, no onComplete', async () => {
    const user = userEvent.setup();
    const onComplete = jest.fn();
    render(<OneTimeCodeField kind="recovery" onComplete={onComplete} />);
    const input = screen.getByLabelText('Code de secours') as HTMLInputElement;
    expect(input).toHaveAttribute('data-kind', 'recovery');
    expect(input).toHaveAttribute('autocomplete', 'off');
    await user.type(input, 'a1b2c3d4');
    expect(input.value).toBe('A1B2-C3D4');
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('stays controlled: the parent value is what is displayed, onChange still fires', () => {
    const onChange = jest.fn();
    const Controlled = () => {
      const [value, setValue] = React.useState('');
      return <OneTimeCodeField value={value} onChange={onChange} onValueChange={setValue} />;
    };
    render(<Controlled />);
    const input = screen.getByLabelText('Code à 6 chiffres') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '9 8 7' } });
    expect(input.value).toBe('987');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('shows the error with role=alert, linked to the input, and a custom label', () => {
    render(<OneTimeCodeField label="Code de vérification" error="Code incorrect" />);
    const input = screen.getByLabelText('Code de vérification');
    expect(screen.getByRole('alert')).toHaveTextContent('Code incorrect');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')).toContain('-error');
  });

  it('marks its root and has no accessibility violation in both kinds', async () => {
    const { container } = render(<><OneTimeCodeField /><OneTimeCodeField kind="recovery" /></>);
    expect(container.querySelector('[data-m360-component~="OneTimeCodeField"]')).not.toBeNull();
    expect((await axe(container)).violations).toEqual([]);
  });
});
