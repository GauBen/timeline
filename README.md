# Timeline

A new social network??

[Discover Timeline on the public alpha website](https://timeline.gautier.dev/)

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
- [x] Proper timezone support
- [ ] ⏳ Sync with Google Calendar
- [ ] Publish pictures
- [x] Habit tracker
- [x] Journaling
- [ ] UI consistency
- [ ] UX consistency

## Development

To develop Timeline, you'll need a working Node+Yarn environment, as well as a Docker-compatible container runtime. It is recommended using [mise](https://mise.jdx.dev/): the [`mise install` command](https://mise.jdx.dev/cli/install.html) will set up the development environment for you, in seconds.

```bash
# Clone the repository
gh repo clone GauBen/timeline

# Install and cache dev tools with mise
mise install

# Start the application in dev mode
mise dev
```

You can run `mise run` to get a list of available commands.
