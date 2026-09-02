export type LibraryFileType = 'pdf' | 'document' | 'spreadsheet' | 'image' | 'archive';
export type FilesViewMode = 'grid' | 'list';
export type FilesSortMode = 'name' | 'recent' | 'size';
export type LibraryFileAction = 'open' | 'download' | 'share' | 'delete';

export interface LibraryFile {
  id: string;
  name: string;
  type: LibraryFileType;
  sizeBytes: number;
  sizeLabel: string;
  owner: string;
  category: string;
  modifiedAt: string;
  isNew?: boolean;
  allowedActions?: LibraryFileAction[];
}

export interface FileUploadValues {
  file: File;
  category: string;
}

export interface FilesFilterState {
  search: string;
  type: LibraryFileType | 'all';
  sort: FilesSortMode;
  view: FilesViewMode;
}
