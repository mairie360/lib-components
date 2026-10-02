import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { ElearningCatalog, type ElearningCourse } from '../components/ElearningCatalog';
import { ElearningCourseDetailsModal } from '../components/ElearningCourseDetailsModal';
import { ElearningCourseRating } from '../components/ElearningCourseRating';

const deferred = () => {
  let resolve!: (value: boolean) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<boolean>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
};

const course: ElearningCourse = {
  id: 'course', title: 'Parcours apprenant', description: 'Description du serveur', progress: 0,
  details: {
    title: 'Parcours apprenant', description: 'Description du serveur', progress: 0,
    chapters: [{ id: 'chapter', title: 'Chapitre serveur', duration: '5 min', contents: [
      { id: 'content', title: 'Ressource serveur', type: 'document', completed: false },
    ] }],
  },
};

it('locks both card actions and the reader until the start promise settles, then permits retry', async () => {
  const request = deferred();
  const start = jest.fn().mockReturnValueOnce(request.promise).mockReturnValue(true);
  render(<ElearningCatalog courses={[course]} onCourseAction={start} onCourseContentComplete={() => true} />);
  const poster = screen.getByRole('button', { name: 'Ouvrir la formation Parcours apprenant' });
  fireEvent.click(poster);
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveAttribute('aria-busy', 'true');
  expect(poster).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Commencer' })).toBeDisabled();
  expect(within(dialog).getByRole('button', { name: 'Marquer Ressource serveur comme terminé' })).toBeDisabled();
  expect(within(dialog).getByRole('button', { name: 'Fermer le détail du cours' })).toBeDisabled();
  fireEvent.click(poster);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(start).toHaveBeenCalledTimes(1);
  expect(dialog).toBeInTheDocument();
  await act(async () => request.resolve(false));
  expect(within(dialog).getByRole('alert')).toHaveTextContent('n’a pas pu être démarrée');
  expect(dialog).toHaveAttribute('aria-busy', 'false');
  fireEvent.keyDown(document, { key: 'Escape' });
  fireEvent.click(poster);
  expect(start).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it.each(['false', 'rejection'] as const)('retains confirmed progress after a pending completion %s, and retries once', async (failure) => {
  const request = deferred();
  const complete = jest.fn().mockReturnValueOnce(request.promise).mockReturnValue(true);
  const { rerender } = render(<ElearningCatalog courses={[course]} initialCourseId="course" onCourseContentComplete={complete} />);
  const dialog = screen.getByRole('dialog');
  const mark = within(dialog).getByRole('button', { name: 'Marquer Ressource serveur comme terminé' });
  fireEvent.click(mark);
  expect(dialog).toHaveAttribute('aria-busy', 'true');
  expect(mark).toBeDisabled();
  expect(within(dialog).getByText('0%')).toBeInTheDocument();
  fireEvent.click(mark);
  fireEvent.keyDown(document, { key: 'Escape' });
  fireEvent.mouseDown(dialog.parentElement!);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(dialog).toBeInTheDocument();
  await act(async () => {
    if (failure === 'false') request.resolve(false);
    else request.reject(new Error('Refused'));
  });
  expect(within(dialog).getByRole('alert')).toHaveTextContent('progression est conservée');
  expect(within(dialog).getByText('0%')).toBeInTheDocument();
  expect(mark).toBeEnabled();
  fireEvent.click(mark);
  expect(complete).toHaveBeenCalledTimes(2);
  expect(complete.mock.calls[1]).toEqual(complete.mock.calls[0]);
  const confirmed: ElearningCourse = { ...course, progress: 100, details: {
    ...course.details!, progress: 100, completed: true, chapters: [{
      ...course.details!.chapters[0], completed: true,
      contents: [{ ...course.details!.chapters[0].contents![0], completed: true }],
    }],
  } };
  rerender(<ElearningCatalog courses={[confirmed]} initialCourseId="course" onCourseContentComplete={complete} />);
  expect(within(dialog).getByText('100%')).toBeInTheDocument();
  expect(within(dialog).getByRole('button', { name: 'Ressource serveur terminé' })).toBeDisabled();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('never applies optimistic completion before an asynchronous server confirmation', async () => {
  const request = deferred();
  render(<ElearningCourseDetailsModal open {...course.details!} onContentComplete={() => request.promise} />);
  fireEvent.click(screen.getByRole('button', { name: 'Marquer Ressource serveur comme terminé' }));
  expect(screen.getByText('0%')).toBeInTheDocument();
  await act(async () => request.resolve(true));
  expect(screen.getByText('100%')).toBeInTheDocument();
});

it.each(['false', 'rejection'] as const)('freezes rating selection and preserves it after %s until a confirmed retry', async (failure) => {
  const request = deferred();
  const rate = jest.fn().mockReturnValueOnce(request.promise).mockResolvedValue(true);
  const completed: ElearningCourse = { ...course, progress: 100, details: { ...course.details!, progress: 100, completed: true } };
  render(<ElearningCatalog courses={[completed]} initialCourseId="course" onCourseRatingSubmit={rate} />);
  const dialog = screen.getByRole('dialog');
  const star = within(dialog).getByRole('button', { name: 'Donner la note 5 sur 5' });
  fireEvent.click(star);
  fireEvent.click(within(dialog).getByRole('button', { name: 'Envoyer la note' }));
  const pending = within(dialog).getByRole('button', { name: 'Enregistrement…' });
  expect(pending).toBeDisabled();
  expect(star).toBeDisabled();
  expect(star).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(pending);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(rate).toHaveBeenCalledTimes(1);
  expect(dialog).toBeInTheDocument();
  await act(async () => {
    if (failure === 'false') request.resolve(false);
    else request.reject(new Error('Refused'));
  });
  expect(star).toHaveAttribute('aria-pressed', 'true');
  expect(star).toBeEnabled();
  expect(within(dialog).getByText('Envoyer la note')).toBeEnabled();
  await act(async () => fireEvent.click(within(dialog).getByRole('button', { name: 'Envoyer la note' })));
  expect(rate).toHaveBeenCalledTimes(2);
  expect(rate.mock.calls[1][1]).toBe(5);
  expect(within(dialog).getByRole('button', { name: 'Note envoyée' })).toBeDisabled();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('supports a synchronous rating host without a pending state or duplicate confirmation', () => {
  const rate = jest.fn();
  render(<ElearningCourseRating onSubmit={rate} />);
  fireEvent.click(screen.getByRole('button', { name: 'Donner la note 4 sur 5' }));
  fireEvent.click(screen.getByRole('button', { name: 'Envoyer la note' }));
  expect(screen.getByRole('button', { name: 'Note envoyée' })).toBeDisabled();
  expect(rate).toHaveBeenCalledTimes(1);
});
