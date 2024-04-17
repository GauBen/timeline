# Timeline

A new social network??

[Discover Timeline on the public alpha website](https://timeline-dev.vercel.app/auth)

## Features

Here is a simple roadmap of what's to come:

- [x] Register and login with Google
- [x] Desktop layout
- [x] Create events
- [x] Events can be public or private
- [ ] Mobile layout
- [ ] User page
- [ ] Follow users
- [ ] Share events with specific people
- [ ] Event duration
- [ ] Proper timezone support
- [ ] UI consistency
- [ ] Sync with Google Calendar
- [ ] Publish pictures

## Development

To develop Timeline, you'll need a working Node+Yarn environment, as well as a Docker-compatible container runtime.

```bash
# Clone the repository
gh repo clone GauBen/timeline

# Install dependencies
yarn install

# Start the local Supabase instance
yarn supabase start

# Start the development server
yarn dev
```
