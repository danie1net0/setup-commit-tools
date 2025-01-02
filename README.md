# Commit Tools Setup

A CLI tool to automatically set up Git commit conventions and code formatting in your projects.

## Features

- 🎯 Automated setup of commit conventions
- 💅 Code formatting with Prettier
- 🐶 Git hooks with Husky
- 📝 Commit message linting with Commitlint
- 🔧 Interactive commit creation with Commitizen

## Installation

```bash
npm install -g commit-tools-setup
```

## Usage

In your project directory, run:

```bash
setup-commit-tools
```

This will:
1. Install necessary dependencies
2. Configure Prettier for code formatting
3. Set up Commitlint for commit message validation
4. Configure Commitizen for interactive commits
5. Install Husky Git hooks
6. Update package.json scripts

## Git Hooks Installed

- **pre-commit**: Automatically formats code
- **prepare-commit-msg**: Enables Commitizen
- **commit-msg**: Validates commit messages
- **pre-push**: Checks code formatting

## Configuration

The tool sets up the following configurations:

### Prettier
- Semi-colons enabled
- Single quotes
- 2 space indentation
- 80 character line width
- ES5 trailing commas

### Commitlint
- Uses conventional commit standards
- Enforces consistent commit message format

## License

CC0-1.0