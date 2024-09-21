# Timeline

A new social network??

[Discover Timeline on the public alpha website](https://timeline-dev.vercel.app/auth)

## Features

Here is a simple roadmap of what's to come:

- [x] Register and login with Google
- [x] Desktop layout
- [x] Create events
- [x] Events can be public or private
- [x] Mobile layout
- [ ] ⏳ User page
- [x] Follow users
- [ ] ⏳ Share events with specific people
- [ ] Event duration
- [ ] Proper timezone support
- [ ] UI consistency
- [ ] Sync with Google Calendar
- [ ] Publish pictures
- [x] Habit tracker

## Development

To develop Timeline, you'll need a working Node+Yarn environment, as well as a Docker-compatible container runtime. It is recommended using [pkgx](https://pkgx.sh/): the [`dev` command](https://docs.pkgx.sh/using-dev/dev) will set up the development environment for you, in seconds.

```bash
# Clone the repository
gh repo clone GauBen/timeline

# Install and cache dev tools with pkgx
dev

# Start the application in dev mode
just dev
```

You can run `just` to get a list of available commands.
