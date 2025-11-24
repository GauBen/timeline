# Default recipe: run `just` to display the list of tasks
_:
  @just --list --justfile {{justfile()}} --unsorted

# Get the development environment up and running
[group('development')]
dev: build
  yarn wrangler d1 migrations apply timeline
  yarn turbo run dev

# Lint and auto-fix the code
[group('development')]
lint:
  yarn eslint --fix .
  yarn prettier --write --list-different .
  yarn stylelint "**/src/**/*.{css,scss,svelte}" --fix

# Open the storybook for Uistiti
[group('development')]
storybook:
  yarn workspace uistiti storybook dev -p 6006

# Install dependencies and build the monorepo
[group('deployment')]
build:
  yarn install --immutable
  yarn turbo run build

# Deploy the app to Cloudflare
[group('deployment')]
deploy:
  sed -i 's/"nodejs"/"workerd"/g' packages/db/prisma/schema.prisma
  just build
  yarn wrangler versions upload --message="$COMMIT_MESSAGE" | tee deploy.log
  yarn wrangler d1 migrations apply timeline --remote
  yarn wrangler versions deploy -y $(grep -oP '(?<=Worker Version ID: ).+' deploy.log)@100%

# Open Prisma Studio on the local database
[group('database')]
studio:
  yarn workspace db prisma studio

# Create a new Prisma migration
[group('database')]
create-migration name:
  yarn workspace db prisma migrate diff \
    --from-config-datasource --to-schema="$(realpath packages/db/prisma/schema.prisma)" --script \
    --output=$(realpath migrations)/$(date +%Y%m%d%H%M%S)_{{name}}.sql

# Apply migrations to the local database
[group('database')]
apply-migrations:
  yarn wrangler d1 migrations apply timeline
