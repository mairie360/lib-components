import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';

import { RecoveryCodes, recoveryCodesText } from './RecoveryCodes';

const codes = ['K3F9-27QX', 'M8TA-4WLB', 'Z2PD-91CR', 'H7GV-60NE', 'Q5JB-38YA', 'X1LU-72DS', 'R9WC-15KT', 'B4NF-83MH', 'T6EA-20ZP', 'D0YS-57VG'];

// MAIR-1070: Figma `Base/RecoveryCodes`: numbered list, copy all, download .txt.
describe('MAIR-1070 RecoveryCodes', () => {
  it('lists the codes numbered, in order', () => {
    render(<RecoveryCodes codes={codes} />);
    const items = within(screen.getByRole('list', { name: 'Codes de secours' })).getAllByRole('listitem');
    expect(items).toHaveLength(10);
    expect(items[0]).toHaveTextContent('01K3F9-27QX');
    expect(items[9]).toHaveTextContent('10D0YS-57VG');
  });

  it('copies every code, one per line', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const onCopy = jest.fn();
    render(<RecoveryCodes codes={codes} onCopy={onCopy} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copier les codes' })); });
    expect(writeText).toHaveBeenCalledWith(recoveryCodesText(codes));
    expect(writeText.mock.calls[0][0].split('\n')).toHaveLength(11);
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('Codes de secours copiés');
  });

  it('downloads a text file with the codes', async () => {
    const createObjectURL = jest.fn().mockReturnValue('blob:codes');
    const revokeObjectURL = jest.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) { expect(this.download).toBe('mes-codes.txt'); });
    const onDownload = jest.fn();
    render(<RecoveryCodes codes={codes} filename="mes-codes.txt" onDownload={onDownload} />);
    fireEvent.click(screen.getByRole('button', { name: 'Télécharger (.txt)' }));
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/plain;charset=utf-8');
    const text = await new Promise<string>((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsText(blob); });
    expect(text).toBe(recoveryCodesText(codes));
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:codes');
    expect(onDownload).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });

  it('marks its root and has no accessibility violation', async () => {
    const { container } = render(<RecoveryCodes codes={codes} />);
    expect(container.firstElementChild).toHaveAttribute('data-m360-component', 'RecoveryCodes');
    expect((await axe(container)).violations).toEqual([]);
  });
});
