import type { LibraryFile } from './types';

const MB = 1024 ** 2;

export const defaultLibraryFiles: LibraryFile[] = [
  { id: 'archives-2023', name: 'Archives_2023.zip', type: 'archive', sizeBytes: 125 * MB, sizeLabel: '125 MB', owner: 'Service Archives', category: 'Archives', modifiedAt: '2024-01-15T10:00:00' },
  { id: 'budget-2024', name: 'Budget_2024_Final.pdf', type: 'pdf', sizeBytes: 2.4 * MB, sizeLabel: '2.4 MB', owner: 'Marie Dubois', category: 'Finances', modifiedAt: '2026-08-30T09:00:00', isNew: true },
  { id: 'inauguration', name: 'Photo_Inauguration_Parc.jpg', type: 'image', sizeBytes: 3.2 * MB, sizeLabel: '3.2 MB', owner: 'Thomas Bernard', category: 'Communication', modifiedAt: '2026-08-29T16:00:00', isNew: true },
  { id: 'council', name: 'Presentation_Conseil_Municipal.pptx', type: 'document', sizeBytes: 5.1 * MB, sizeLabel: '5.1 MB', owner: 'Jean Dupont', category: 'Administration', modifiedAt: '2026-08-22T12:00:00' },
  { id: 'urban-report', name: 'Rapport_Urbanisme_Octobre.docx', type: 'document', sizeBytes: 1.8 * MB, sizeLabel: '1.8 MB', owner: 'Pierre Martin', category: 'Urbanisme', modifiedAt: '2026-08-20T08:30:00' },
  { id: 'population', name: 'Statistiques_Population.xlsx', type: 'spreadsheet', sizeBytes: 856 * 1024, sizeLabel: '856 KB', owner: 'Sophie Leroy', category: 'Démographie', modifiedAt: '2026-09-01T10:30:00', isNew: true },
];

export const defaultFileCategories = ['Administration', 'Archives', 'Communication', 'Démographie', 'Finances', 'Urbanisme'];

export const defaultAcceptedFileExtensions = [
  '.pdf', '.doc', '.docx', '.odt', '.ppt', '.pptx', '.xls', '.xlsx', '.ods', '.csv',
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.zip',
];
