# Default recipe: run `just` to display the list of tasks
_:
  @just --list --justfile {{justfile()}} --unsorted

# Install dependencies and build the monorepo
build:
  yarn install --immutable
  yarn turbo run build

# Get the development environment up and running
dev: build
  yarn supabase start
  yarn prisma migrate deploy
  yarn turbo run dev

# Reset the development database
reset:
  yarn supabase db reset
  yarn prisma migrate deploy

# Stop the development containers
stop:
  yarn supabase stop

# Lint and auto-fix the code
lint:
  yarn prettier --write --list-different .
  yarn eslint --fix .

# Deploy the app to Vercel
deploy token: build
  yarn vercel --cwd=packages/app --token={{token}} pull --yes --environment=production
  yarn vercel --cwd=packages/app --token={{token}} deploy --prebuilt --prod --skip-domain > deployment-url.txt
  yarn supabase db push --db-url="${DATABASE_DIRECT_URL%%\?*}" && yarn prisma migrate deploy
  # We need to specify which organization (scope) owns the deployment,
  # otherwise it fails with "Deployment belongs to a different team"
  yarn vercel --cwd=packages/app --token={{token}} promote $(cat deployment-url.txt) --scope="$VERCEL_ORG_ID"
