import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockExecSync = jest.fn();

jest.unstable_mockModule('child_process', () => ({
  execSync: mockExecSync,
}));

const { executeCommand } = await import('./command.js');

describe('Command Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should execute command successfully', () => {
    mockExecSync.mockImplementation(() => {});

    const output = executeCommand('test command');

    expect(output).toBe(true);
    expect(mockExecSync).toHaveBeenCalledWith('test command', {
      stdio: 'inherit',
    });
  });

  it('should throw error when command fails', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('Command failed');
    });

    expect(() => executeCommand('failing command')).toThrow('Command failed');

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('failing command')
    );
  });
});
