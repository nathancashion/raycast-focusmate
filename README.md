# Focusmate Raycast Extension

A Raycast extension for managing your FocusMate focus sessions. Schedule, join, and manage your focus sessions directly from Raycast.

## Features

- **View Sessions**: See all your upcoming, active, and past focus sessions
- **Schedule Sessions**: Create new focus sessions with flexible timing and duration options
- **Join Sessions**: Quick access to join active sessions
- **Cancel Sessions**: Cancel upcoming sessions when needed
- **Session Details**: View detailed information about each session including partner info

## Setup

1. **Get your FocusMate API Key**:
   - Log into your [FocusMate account](https://app.focusmate.com/)
   - Go to your **Settings page** (click your profile in the top right)
   - Look for the **API Key** or **Developer** section
   - Generate or copy your personal API key
   - Note: Each FocusMate user gets one API key for accessing their personal session data via the [FocusMate Public API](https://apidocs.focusmate.com/)

2. **Configure the Extension**:
   - Open Raycast
   - Run the "Focusmate" command
   - When prompted, paste your FocusMate API key
   - Or use `Cmd + ,` to open preferences and set your API key

## Usage

### Commands
- **Focusmate**: Main command to view and manage your sessions

### Keyboard Shortcuts
- `Cmd + O`: Join the selected session
- `Cmd + N`: Schedule a new session
- `Cmd + R`: Refresh the session list
- `Cmd + ,`: Open extension preferences

### Features

#### Session List
- Shows all your sessions from today onwards
- Color-coded status indicators:
  - 🟢 **Active**: Session is currently running
  - 🟡 **Upcoming**: Session is scheduled for the future
  - ✅ **Completed**: Session has finished
  - ❌ **Cancelled**: Session was cancelled

#### Schedule Session
- Select date and time for your focus session
- Choose duration (25 min, 50 min, 75 min, or 2 hours)
- Sessions are automatically available for others to join
- Can be used as solo focus sessions

#### Session Details
- View complete session information
- See partner details when available
- Quick actions to join or cancel sessions

## Troubleshooting

### Authentication Issues
- Make sure your FocusMate API key is valid
- Check that you have the correct permissions in your FocusMate account
- Update your API key in the extension preferences

### No Sessions Showing
- Ensure you're signed in to FocusMate and have sessions scheduled
- Try refreshing the list with `Cmd + R`
- Check your API key configuration

## Development

This extension is built with:
- [Raycast API](https://developers.raycast.com/)
- [FocusMate Public API](https://apidocs.focusmate.com/)
- TypeScript + React

### Local Development
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

## License

MIT
