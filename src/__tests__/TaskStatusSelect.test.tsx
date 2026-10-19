import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { TaskStatusSelect } from '../components/TaskStatusSelect';

const statuses = [
  {id:'new',name:'À qualifier',color:'#1256a6',category:'todo' as const},
  {id:'work',name:'Instruction',color:'#536171',category:'inprogress' as const},
];
it('announces the project status list and reports its selected identifier',async()=>{
  const user=userEvent.setup(), onChange=jest.fn();
  const {container}=render(<TaskStatusSelect statuses={statuses} value="new" label="Statut de la tâche" onChange={onChange}/>);
  const select=screen.getByRole('combobox',{name:'Statut de la tâche'});
  await user.tab();expect(select).toHaveFocus();
  await user.selectOptions(select,'work');expect(onChange).toHaveBeenCalledWith('work');
  expect(screen.getAllByRole('option').map(option=>option.textContent)).toEqual(['À qualifier','Instruction']);
  expect((await axe(container)).violations).toEqual([]);
});
it('keeps an unknown status visible without silently choosing another status',()=>{
  const onChange=jest.fn();render(<TaskStatusSelect statuses={statuses} value="removed" label="Statut" onChange={onChange}/>);
  expect(screen.getByRole('combobox',{name:'Statut'})).toBeDisabled();
  expect(screen.getByRole('option',{name:'Statut indisponible'})).toHaveValue('removed');
  expect(onChange).not.toHaveBeenCalled();
});
it('disables a pending change and an unavailable empty list',()=>{
  const {rerender}=render(<TaskStatusSelect statuses={statuses} value="new" label="Statut" disabled onChange={jest.fn()}/>);
  expect(screen.getByRole('combobox')).toBeDisabled();
  rerender(<TaskStatusSelect statuses={[]} value="" label="Statut" onChange={jest.fn()}/>);
  expect(screen.getByRole('combobox')).toBeDisabled();
});
