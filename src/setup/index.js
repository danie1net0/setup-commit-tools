import { existsSync, chmodSync } from 'fs';
import { executeCommand } from '../utils/command.js';
import {
  createFile,
  addToGitignore,
  ensureDirectoryExists,
} from '../utils/file.js';
import {
  prettierConfig,
  commitlintConfig,
  huskyHooks,
} from '../config/files.js';

export const setupDependencies = () => {
  console.info(existsSync('package.json'));
  if (!existsSync('package.json')) {
    console.log('❌ package.json not found. Initializing npm project...');
    executeCommand('npm init -y');
  }

  console.log('📦 Installing dependencies...');
  executeCommand(
    'npm install --save-dev husky @commitlint/config-conventional @commitlint/cli commitizen cz-conventional-changelog prettier'
  );
};

export const setupHusky = () => {
  console.log('🐶 Configuring Husky...');
  executeCommand('npm pkg set scripts.prepare="husky"');
  executeCommand('npm run prepare');

  ensureDirectoryExists('.husky');

  // Create hooks
  console.log('🔗 Creating husky hooks...');
  createFile('.husky/pre-commit', huskyHooks.preCommit);
  createFile('.husky/prepare-commit-msg', huskyHooks.prepareCommitMsg);
  createFile('.husky/commit-msg', huskyHooks.commitMsg);
  createFile('.husky/pre-push', huskyHooks.prePush);

  // Make hooks executable
  chmodSync('.husky/pre-commit', '755');
  chmodSync('.husky/commit-msg', '755');
  chmodSync('.husky/prepare-commit-msg', '755');
  chmodSync('.husky/pre-push', '755');
};

export const setupCommitizen = () => {
  console.log('🔧 Configuring Commitizen...');
  executeCommand(
    'npx commitizen init cz-conventional-changelog --save-dev --save-exact --force'
  );
};

export const setupPrettier = () => {
  console.log('💅 Configuring Prettier...');
  createFile('.prettierrc', JSON.stringify(prettierConfig, null, 2));
};

export const setupCommitlint = () => {
  console.log('📝 Configuring Commitlint...');
  createFile('commitlint.config.js', commitlintConfig);
};

export const setupScripts = () => {
  console.log('📄 Updating package.json scripts...');
  executeCommand('npm pkg set scripts.format="prettier --write src"');
  executeCommand('npm pkg set scripts.format:check="prettier --check src"');
};

export const setup = () => {
  console.log('🚀 Starting tools configuration...');

  try {
    setupDependencies();
    setupPrettier();
    setupCommitlint();
    setupCommitizen();
    setupHusky();
    setupScripts();

    // Update .gitignore
    console.log('📝 Checking/updating .gitignore...');
    addToGitignore('.husky/_');

    console.log('✅ Configuration completed successfully!');
  } catch (error) {
    console.error('❌ Error during configuration:', error);
    process.exit(1);
  }
};
