### Basic setup

1. **Install Dependencies**:

```bash
npm install
```

2. **Run the Project in Development Mode**:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

3. **Build the Project:**:

```bash
npm run build
```

## Common Commit Types

The list of commonly used types and their meanings:

- feat: A new feature for the user or system.

  - Example: feat: allow users to upload profile pictures

- fix: A bug fix that corrects an issue in the codebase.

  - Example: fix: resolve alignment issue on the login button

- refactor: A code change that neither fixes a bug nor adds a feature.

  - Example: refactor: simplify user service logic

- docs: Changes related to documentation only (e.g., updating README, adding API docs).

  - Example: docs: update installation guide in README.md

- chore: Minor changes that don't affect production code (e.g., updating build scripts, package manager configs).

  - Example: chore: add prettier configuration file

- style: Changes that do not alter the meaning of the code (e.g., white-space, formatting, missing semi-colons, CSS/UI changes).

  - Example: style: format code according to project guidelines

- perf: A code change that improves performance.

  - Example: perf: optimize database query for user dashboard

- vendor: Updates to third-party dependencies or packages.
  - Example: vendor: upgrade react to version 18.3.0

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience.

## Folder Naming Rule

- Use **Kebab Case** for folder names.

## File Naming Rule

- File prefix rules follow folder rules, using **Camel Case**.
- **Example**: `SearchBar.tsx`

### Additional Notes

- **Use imperative tone**: Start with a verb (e.g., "add," "fix," "update") to describe the change.
- **Be concise yet descriptive**: Keep messages brief but informative.
