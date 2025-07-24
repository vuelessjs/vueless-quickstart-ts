## How to run the project locally

- Install **node.js 22.XX** version (see [instructions](https://nodejs.org/en/download/package-manager/) for your OS).

- Create project folder and clone files from Git into:

```bash
# download project from remote repository
git clone origin git@github.com:vuelessjs/vueless-quickstart.git

# go to project folder
cd <project_name>
```

- Install project dependencies (node_modules):

```bash
npm install
```

- Create environment file:

```bash
#  for local environment
cp .env.local.example .env.local
```

- Run the app in **development** mode:

```bash
npm dev
```

- The project is ready!

## Additional commands

- Open Storybook (frontend base UI components documentation):

```bash
# run Storybook in development mode (with docs and stories):
# It's good for debugging components.
npm sb:dev-full

# run Storybook in development mode (with docs only):
npm sb:dev

# build Storybook (to publish in the web):
npm sb:build

# Run the built storybook application (`/storybook-static` folder) in production mode:
npm sb:preview
```

- Run code-style check / formatting:

```bash
# check code style (only show errors)
npm lint

# check code style and fix all possible errors
npm lint:fix

# check code style of given file paths (fail pipeline if at least 1 error or warning appears)
npm lint:ci
```

- Run auto tests:

```bash
# start unit tests
npm test:unit
```

- Build application:

```bash
# create env file
cp .env.example .env

# replace env variables
sed -i "s|{{DOMAIN}}|$FE_URL|g" .env                    # set VITE_DOMAIN
sed -i "s|{{API_DOMAIN}}|$API_URL|g" .env               # set VITE_API_DOMAIN

# build the project
npm build

# copy all files from `dist` folder to the deploy folder
cp -r dist/. $DEPLOY_PATH
```

- Run the built application from a `/dist` folder in **production mode**:

```bash
npm preview
```

- Update browserslist DB to the latest version:

```bash
npx browserslist@latest --update-db
```
