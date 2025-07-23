# Default recipe: run `just` to display the list of tasks
_:
  @just --list --justfile {{justfile()}} --unsorted

# Install dependencies and build the monorepo
build:
  yarn install --immutable
  yarn turbo run build

# Get the development environment up and running
dev: build
  yarn wrangler d1 migrations apply timeline
  yarn turbo run dev

# Lint and auto-fix the code
lint:
  yarn eslint --fix .
  yarn prettier --write --list-different .

# Deploy the app to Cloudflare
deploy:
  sed -i 's/"nodejs"/"workerd"/g' packages/db/prisma/schema.prisma
  just build
  yarn wrangler versions upload --message="$COMMIT_MESSAGE" | tee deploy.log
  yarn wrangler d1 migrations apply timeline --remote
  yarn wrangler versions deploy -y $(grep -oP '(?<=Worker Version ID: ).+' deploy.log)@100%
