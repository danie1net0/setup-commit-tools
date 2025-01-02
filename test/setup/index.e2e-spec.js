import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { setup } from '../../src/setup/index.js';

let testDir;
const originalCwd = process.cwd();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Setup E2E Test', () => {
  beforeEach(done => {
    testDir = path.join(__dirname, `../temp/test-${Date.now()}`);
    fs.mkdirSync(testDir, { recursive: true });

    process.chdir(testDir);

    execSync('git init');
    execSync('git config user.name "Test User"');
    execSync('git config user.email "test@example.com"');

    fs.mkdirSync('src', { recursive: true });

    done();
  });

  afterEach(done => {
    process.chdir(originalCwd);
    done();
  });

  afterAll(done => {
    fs.rmSync(path.join(__dirname, '../temp'), { recursive: true, force: true });
    done();
  });

  describe('Project Setup', () => {
    test('should setup all required files and configurations', () => {
      setup();

      expect(fs.existsSync('package.json')).toBe(true);
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      expect(packageJson.devDependencies).toBeDefined();
      expect(packageJson.devDependencies.husky).toBeDefined();
      expect(packageJson.devDependencies.prettier).toBeDefined();
      expect(packageJson.scripts.format).toBe('prettier --write src');
      expect(packageJson.scripts['format:check']).toBe('prettier --check src');

      expect(fs.existsSync('.prettierrc')).toBe(true);
      const prettierConfig = JSON.parse(fs.readFileSync('.prettierrc', 'utf8'));
      expect(prettierConfig.semi).toBeDefined();
      expect(prettierConfig.singleQuote).toBeDefined();

      expect(fs.existsSync('commitlint.config.js')).toBe(true);
      const commitlintConfig = fs.readFileSync('commitlint.config.js', 'utf8');
      expect(commitlintConfig).toContain('@commitlint/config-conventional');

      expect(fs.existsSync('.husky/pre-commit')).toBe(true);
      expect(fs.existsSync('.husky/commit-msg')).toBe(true);
      expect(fs.existsSync('.husky/prepare-commit-msg')).toBe(true);
      expect(fs.existsSync('.husky/pre-push')).toBe(true);

      const preCommitStats = fs.statSync('.husky/pre-commit');
      const commitMsgStats = fs.statSync('.husky/commit-msg');

      expect(fs.existsSync('.gitignore')).toBe(true);
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      expect(gitignore).toContain('.husky/_');
    });

    test('should handle git hooks workflow', () => {
      setup();

      const testFile = path.join('src', 'test.js');
      const unformattedCode = 'function test(){console.log("test");}';
      fs.writeFileSync(testFile, unformattedCode);

      execSync('git add src/test.js');
      execSync('git commit -m "test: initial commit"', {
        env: { ...process.env, HUSKY: '0' }
      });

      const newCode = 'function test(){alert("test");}';
      fs.writeFileSync(testFile, newCode);
      execSync('git add src/test.js');

      expect(() => {
        execSync('git commit -m "test: update test function"', {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env, HUSKY: '0' }
        });
      }).not.toThrow();

      expect(() => {
        execSync('git commit -m "invalid message"', {
          stdio: ['ignore', 'pipe', 'pipe']
        });
      }).toThrow();
    });

    test('should enforce prettier formatting', () => {
      setup();

      const testFile = path.join('src', 'test.js');
      const unformattedCode = 'function test(){console.log("test");}';
      fs.writeFileSync(testFile, unformattedCode);

      execSync('npm run format');

      const finalContent = fs.readFileSync(testFile, 'utf8');
      const formattedCode = "function test() {\n  console.log('test');\n}\n";
      expect(finalContent).toBe(formattedCode);
    });

    test('should handle pre-existing configurations', () => {
      fs.writeFileSync('.prettierrc', JSON.stringify({ semi: false }));
      fs.writeFileSync('commitlint.config.js', 'module.exports = {}');

      setup();

      const prettierConfig = JSON.parse(fs.readFileSync('.prettierrc', 'utf8'));
      expect(prettierConfig.semi).toBe(true);

      const commitlintConfig = fs.readFileSync('commitlint.config.js', 'utf8');
      expect(commitlintConfig).toContain('@commitlint/config-conventional');
    });

    test('should set correct permissions for all files', () => {
      setup();

      const hookFiles = [
        'pre-commit',
        'commit-msg',
        'prepare-commit-msg',
        'pre-push'
      ];

      for (const hook of hookFiles) {
        const stats = fs.statSync(`.husky/${hook}`);
        const isExecutable = (stats.mode & 0o111) !== 0;
        expect(isExecutable).toBe(true);
      }
    });
  });
});