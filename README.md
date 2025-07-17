## How to run the project locally

- Install **node.js 22.XX** version (see [instructions](https://nodejs.org/en/download/package-manager/) for your OS).

- Install globally [PNPM](https://pnpm.io/installation):

```bash
npm install -g pnpm
```

- Create project folder and clone files from Git into:

```bash
# download project from remote repository
git clone origin git@github.com:vuelessjs/vueless-quickstart.git

# go to project folder
cd <project_name>
```

- Install project dependencies (node_modules):

```bash
pnpm install
```

- Create environment file:

```bash
#  for local environment
cp .env.local.example .env.local
```

- Run the app in **development** mode:

```bash
pnpm dev
```

- The project is ready!

## REST API

- Docs URL: **[add credentials here later]**

## Additional commands

- Open Storybook (frontend base UI components documentation):

```bash
# run Storybook in development mode (with docs and stories):
# It's good for debugging components.
pnpm sb:dev-full

# run Storybook in development mode (with docs only):
pnpm sb:dev

# build Storybook (to publish in the web):
pnpm sb:build

# Run the built storybook application (`/storybook-static` folder) in production mode:
pnpm sb:preview
```

- Run code-style check / formatting:

```bash
# check code style (only show errors)
pnpm lint

# check code style and fix all possible errors
pnpm lint:fix

# check code style of given file paths (fail pipeline if at least 1 error or warning appears)
pnpm lint:ci
```

- Run auto tests:

```bash
# start unit tests
pnpm test:unit

# start end to end tests
pnpm test:e2e

# start end to end tests in headless mode (no UI)
pnpm test:e2e-ci
```

- Build application:

```bash
# create env file
cp .env.example .env

# replace env variables
sed -i "s|{{DOMAIN}}|$FE_URL|g" .env                    # set VITE_DOMAIN
sed -i "s|{{API_DOMAIN}}|$API_URL|g" .env               # set VITE_API_DOMAIN
sed -i "s|{{AUTH0_DOMAIN}}|$AUTH0_DOMAIN|g" .env        # set VITE_AUTH0_DOMAIN
sed -i "s|{{AUTH0_CLIENT_ID}}|$AUTH0_CLIENT_ID|g" .env  # set VITE_AUTH0_CLIENT_ID

# build the project
pnpm build
# TIP: 📐
# to analise and reduce the build size see the report.html in a project root folder.

# copy all files from `dist` folder to the deploy folder
cp -r dist/. $DEPLOY_PATH
```

- Run the built application from a `/dist` folder in **production mode**:

```bash
pnpm preview
```

- Update browserslist DB to the latest version (it changes pnpm.lock only):

```bash
npx browserslist@latest --update-db
```

- **Note**: `pnpm` automatically calls the` postinstall` command,
  which generate components web-types for IDE (props autocomplete).
If you need to do this manually, just use the command below:

```bash
node .vueless/our.library.web-types-gen
```
