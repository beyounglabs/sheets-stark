# Client (our React code)

This directory is where we store the source code for our client-side React apps.

We have multiple directories in here because our app creates menu items that open multiple dialog windows. Each dialog opens a separate app, so each directory here represents its own distinct React app. Our webpack configuration will generate a separate bundle for each React app.

## Requirements

Each React app will need:

- an entrypoint, usually a file named `index.js`, that loads the app
