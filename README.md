# Outlier TXT Frontends

## Description
This repository contains the user interfaces for Outlier's sidebars, specifically designed for the following dashboards:
- Broadcast Dashboard
- Campaign Dashboard
- Conversation Lookup

These sidebars are integrated into the team's Missive workspace.

## Development

Clone the repository

```bash
git clone git@github.com:PublicDataWorks/txt-outlier-frontend.git
cd txt-outlier-frontend
```

Run this command to copy `.env` file from `.env.example`:
```sh
cp ./.env.example ./.env
```

Set up your Node.js to the correct version stated on `.nvmrc`

Install the dependencies:

```bash
npm install
```

Start app in dev mode:
```sh
npm run dev
```
Open the project in browser using this link:
[http://localhost:5173](http://localhost:5173)

**HTTPS and Caddy**

To enable HTTPS for integration with Missive, we use Caddy as a web server. Caddy automatically handles HTTPS, making it easier to test features that require a secure connection, such as Missive-related integrations. To set up Caddy, run the following command:

```sh
caddy run
```

With Caddy running, the app will be accessible at `https://localhost`. You can then add this URL to Missive as a sidebar, which is useful for testing integrations like lookup and dark mode.

## Run tests

To run unit test:

```bash
npm run test
```

## Deployment

To build the project locally:

```bash
npm run build
```

The app is auto-deployed to S3 with Github action. More detail could be found on `.github/` directory.


## Project architecture

```
.
├── Caddyfile                  # Configuration for the Caddy web server
├── components.json            # JSON file listing UI components
├── eslint.config.js           # ESLint configuration file for linting JavaScript/TypeScript code
├── index.html                 # Entry HTML file
├── LICENSE                    # Project license information
├── package.json               # Project metadata and dependencies
├── package-lock.json          # Lockfile for npm dependencies
├── postcss.config.js          # Configuration for PostCSS
├── prettier.config.js         # Prettier configuration file for code formatting
├── public                     # Directory for publicly accessible assets
├── README.md                  # Project documentation
├── src                        # Source code directory
│   ├── apis                     # API service modules
│   ├── App.css                  # Global CSS for the App component
│   ├── App.tsx                  # Main App component
│   ├── components               # Reusable React components (schadcn)
│   ├── convo-sidebar            # Special directory for legacy page with old design (Conversation lookup feature)
│   ├── hooks                    # Custom React hooks
│   ├── index.css                # Global styles
│   ├── lib                      # Utility libraries and helper functions
│   ├── main.tsx                 # Application entry point
│   ├── pages                    # Page components for the application
│   │   ├── broadcast              # Broadcast-related sidebar components
│   │   └── campaign               # Campaign-related sidebar components
│   ├── vite-env.d.ts            # TypeScript environment declarations for Vite
│   └── vitest-setup.ts          # Setup file for Vitest testing framework
├── tailwind.config.js         # Tailwind CSS configuration file
├── tsconfig.app.json          # TypeScript configuration for the application
├── tsconfig.json              # Base TypeScript configuration
├── tsconfig.node.json         # TypeScript configuration for Node.js-specific files
└── vite.config.ts             # Vite configuration file

```


## Contributing

### Coding style


Toolings:

We are using `Prettier` to format the code, please add it to your editor/IDE and make sure that it picks up the right config of this project at `prettier.config.js`.

Make sure to run `npm run lint` before every commit. You can also install `eslint` plugin to your editor/IDE to see the visualized error while coding.

Please note that the unassigned imports (i.e. `import './*.scss'`) are ignored by the linter, please put them together with the sibling import group.


### Git Workflow

To ensure a smooth and efficient development process, we follow a structured Git workflow. This helps maintain code quality and facilitates collaboration among team members. Please adhere to the following steps when contributing to the project:

1. **Checkout the Main Branch**:
   - Begin by ensuring that your local `main` branch is up-to-date. This serves as the base for all new work.
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create a New Branch**:
   - For any new features, refactoring, chores, or bug fixes, create a new branch. Use a descriptive name prefixed with the type of work you're doing:
     - `features/your-feature-name` for new features
     - `refactors/your-refactor-task` for code refactoring
     - `chores/your-bugfix-description` for minor chores
     - `bugs/your-bugfix-description` for bug fixes
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Commits**:
   - Work on your task and make regular commits with clear and descriptive messages. This helps in tracking changes and understanding the history of modifications.
   ```bash
   git add -p
   git commit -m "Add descriptive commit message"
   ```

4. **Merge to Develop**:
   - Once your work on the branch is complete, merge it into the `develop` branch. This triggers an automatic deployment to the staging environment for testing.
   ```bash
   git checkout develop
   git pull origin develop
   git merge feature/your-feature-name
   git push origin develop
   ```

5. **Open a Pull Request to Main**:
   - After merging to `develop`, open a pull request (PR) to merge your changes into the `main` branch. Address any feedback or required changes from code reviews.
   - Remember to re-merge your updated branch into `develop` after incorporating review feedback to ensure the staging environment is up-to-date.

6. **Merge Code to Main**:
   - Once the pull request is approved and all changes are finalized, merge your branch into the `main` branch. This marks the completion of your task.
   ```bash
   git checkout main
   git merge feature/your-feature-name
   git push origin main
   ```
