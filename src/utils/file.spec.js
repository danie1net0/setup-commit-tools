import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { join } from 'path';

const mockWriteFileSync = jest.fn();
const mockReadFileSync = jest.fn();
const mockExistsSync = jest.fn();
const mockMkdirSync = jest.fn();
const mockAppendFileSync = jest.fn();

jest.unstable_mockModule('fs', () => ({
  writeFileSync: mockWriteFileSync,
  readFileSync: mockReadFileSync,
  existsSync: mockExistsSync,
  mkdirSync: mockMkdirSync,
  appendFileSync: mockAppendFileSync,
}));

const { createFile, addToGitignore, ensureDirectoryExists } = await import(
  './file.js'
);

describe('File Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(console, 'log').mockImplementation(() => {});

    mockWriteFileSync.mockReset();
    mockReadFileSync.mockReset();
    mockExistsSync.mockReset();
    mockMkdirSync.mockReset();
    mockAppendFileSync.mockReset();
  });

  describe('createFile', () => {
    const filename = 'test.js';
    const content = 'test content';
    const expectedPath = join(process.cwd(), filename);

    it('should create a file with the given content', () => {
      const output = createFile(filename, content);

      expect(mockWriteFileSync).toHaveBeenCalledWith(expectedPath, content);
      expect(console.log).toHaveBeenCalledWith(`✅ Created ${filename}`);
      expect(output).toBe(expectedPath);
    });

    it('should handle file creation error', () => {
      mockWriteFileSync.mockImplementation(() => {
        throw new Error('File creation failed');
      });

      expect(() => createFile(filename, content)).toThrow(
        'File creation failed'
      );
    });

    it('should handle empty content', () => {
      createFile(filename, '');

      expect(mockWriteFileSync).toHaveBeenCalledWith(expectedPath, '');
    });

    it('should handle nested file paths', () => {
      const nestedPath = 'dir1/dir2/test.js';
      const expectedNestedPath = join(process.cwd(), nestedPath);

      const output = createFile(nestedPath, content);

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expectedNestedPath,
        content
      );
      expect(output).toBe(expectedNestedPath);
    });
  });

  describe('addToGitignore', () => {
    const gitignorePath = join(process.cwd(), '.gitignore');

    it('should create .gitignore if it does not exist', () => {
      mockExistsSync.mockReturnValue(false);
      mockReadFileSync.mockReturnValue('');

      const output = addToGitignore('node_modules/');

      // Assert
      expect(mockWriteFileSync).toHaveBeenCalledWith(gitignorePath, '');
      expect(mockAppendFileSync).toHaveBeenCalledWith(
        gitignorePath,
        '\nnode_modules/'
      );
      expect(output).toBe(true);
    });

    it('should add new entry to existing .gitignore', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('dist/\ncoverage/');

      const output = addToGitignore('node_modules/');

      expect(mockWriteFileSync).not.toHaveBeenCalled();
      expect(mockAppendFileSync).toHaveBeenCalledWith(
        gitignorePath,
        '\nnode_modules/'
      );
      expect(output).toBe(true);
    });

    it('should not add duplicate entries', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('node_modules/\ndist/');

      const output = addToGitignore('node_modules/');

      expect(mockAppendFileSync).not.toHaveBeenCalled();
      expect(output).toBe(false);
    });

    it('should handle empty .gitignore', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('');

      const output = addToGitignore('node_modules/');

      expect(mockAppendFileSync).toHaveBeenCalledWith(
        gitignorePath,
        '\nnode_modules/'
      );
      expect(output).toBe(true);
    });

    it('should handle file read error', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation(() => {
        throw new Error('Read failed');
      });

      expect(() => addToGitignore('node_modules/')).toThrow('Read failed');
    });

    it('should handle file write error', () => {
      mockExistsSync.mockReturnValue(false);
      mockWriteFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      expect(() => addToGitignore('node_modules/')).toThrow('Write failed');
    });
  });

  describe('ensureDirectoryExists', () => {
    const dirPath = join(process.cwd(), 'test-dir');

    it('should create directory if it does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      const output = ensureDirectoryExists('test-dir');

      expect(mockMkdirSync).toHaveBeenCalledWith(dirPath, { recursive: true });
      expect(console.log).toHaveBeenCalledWith('✅ Created directory test-dir');
      expect(output).toBe(true);
    });

    it('should not create directory if it already exists', () => {
      mockExistsSync.mockReturnValue(true);

      const output = ensureDirectoryExists('test-dir');

      expect(mockMkdirSync).not.toHaveBeenCalled();
      expect(output).toBe(false);
    });

    it('should handle nested directories', () => {
      const nestedPath = 'dir1/dir2/dir3';
      const expectedNestedPath = join(process.cwd(), nestedPath);
      mockExistsSync.mockReturnValue(false);

      const output = ensureDirectoryExists(nestedPath);

      expect(mockMkdirSync).toHaveBeenCalledWith(expectedNestedPath, {
        recursive: true,
      });
      expect(output).toBe(true);
    });

    it('should handle directory creation error', () => {
      mockExistsSync.mockReturnValue(false);
      mockMkdirSync.mockImplementation(() => {
        throw new Error('Directory creation failed');
      });

      expect(() => ensureDirectoryExists('test-dir')).toThrow(
        'Directory creation failed'
      );
    });
  });
});
