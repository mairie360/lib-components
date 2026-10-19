import { formatFileSize, getLibraryFileType, joinFileClasses, normalizeFileSearch } from '../components/files/utils';

it('matches French accented search independently of case and omits empty class tokens', () => {
  expect(normalizeFileSearch('ÉTÉ À LA MAIRIE')).toBe('ete a la mairie');
  expect(joinFileClasses('base', false, null, '', undefined, 'selected')).toBe('base selected');
});
it.each([['report.PDF', 'pdf'], ['letter.doc', 'document'], ['slides.pptx', 'document'], ['table.CSV', 'spreadsheet'], ['image.JPEG', 'image'], ['bundle.zip', 'archive'], ['README', 'archive'], ['no-extension.', 'archive']])('classifies %s by its actual extension', (name, expected) => { expect(getLibraryFileType(name)).toBe(expected); });
it.each([[0, '1 KB'], [1024, '1 KB'], [1536, '2 KB'], [1048576, '1.0 MB'], [1572864, '1.5 MB'], [1073741824, '1.0 GB']])('formats a %s-byte file in a readable unit', (size, expected) => { expect(formatFileSize(size)).toBe(expected); });
