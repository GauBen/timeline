# Default recipe: `just` will display the list of tasks
_list:
  @just --list --justfile {{justfile()}} --unsorted

# Install dependencies and build the app
build:
  yarn install --immutable
  yarn build

# Get the development environment up and running
dev: build
  yarn supabase start
  yarn prisma migrate deploy
  yarn dev

# Clean up the development database
reset:
  yarn db:reset

# Deploy the app to Vercel
deploy token: build
  yarn vercel --cwd=packages/app --token={{token}} pull --yes --environment=production
  yarn vercel --cwd=packages/app --token={{token}} deploy --prebuilt --prod --skip-domain > deployment-url.txt
  yarn supabase db push --db-url="${DATABASE_DIRECT_URL%%\?*}" && yarn prisma migrate deploy
  # We need to specify which organization (scope) owns the deployment,
  # otherwise it fails with "Deployment belongs to a different team"
  yarn vercel --cwd=packages/app --token={{token}} promote $(cat deployment-url.txt) --scope="$VERCEL_ORG_ID"
