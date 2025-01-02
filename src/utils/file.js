import {
  writeFileSync,
  readFileSync,
  existsSync,
  mkdirSync,
  appendFileSync,
} from 'fs';
import { join } from 'path';

const path = (filename) => join(process.cwd(), filename);

export const createFile = (filename, content) => {
  const filePath = path(filename);

  writeFileSync(filePath, content);
  console.log(`✅ Created ${filename}`);

  return filePath;
};

export const addToGitignore = (entry) => {
  const gitignorePath = path('.gitignore');

  if (!existsSync(gitignorePath)) {
    writeFileSync(gitignorePath, '');
  }

  const content = readFileSync(gitignorePath, 'utf8');
  const lines = content.split('\n');

  if (lines.includes(entry)) {
    console.log(`ℹ️ ${entry} already exists in .gitignore`);
    return false;
  }

  appendFileSync(gitignorePath, `\n${entry}`);
  console.log(`✅ Added ${entry} to .gitignore`);

  return true;
};

export const ensureDirectoryExists = (directory) => {
  const dirPath = path(directory);

  if (existsSync(dirPath)) {
    return false;
  }

  mkdirSync(dirPath, { recursive: true });
  console.log(`✅ Created directory ${directory}`);

  return true;
};
