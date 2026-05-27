# Firebase Realtime Database

User brackets are stored under `frenchOpen2026/brackets/{userId}`. Official results are stored under `frenchOpen2026/official`. These are **sibling** paths: updating `official` does not read or write `brackets`.

If you can save user brackets but **not** the official bracket, your security rules almost certainly allow `brackets` but omit `official`. Fix it in the console:

1. Open [Firebase Console](https://console.firebase.google.com) → your project → **Realtime Database** → **Rules**.
2. Publish the rules from `database.rules.json` in this folder (copy/paste the JSON).

Or deploy rules with the Firebase CLI (from this directory):

```bash
firebase deploy --only database
```

(requires `firebase.json` with a `database` section pointing at `database.rules.json`)

## Rules file

The repo includes `database.rules.json` so `official` has explicit `.read` / `.write` alongside `brackets`, without putting everything under one wildcard that could be mis-scoped.
