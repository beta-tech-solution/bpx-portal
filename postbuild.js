
const fs = require('fs');
const path = require('path');

const nextDir = path.join(__dirname, '.next');
const serverDir = path.join(nextDir, 'server');
const appDir = path.join(serverDir, 'app');

// Check if the server/app directory exists
if (fs.existsSync(appDir)) {
  const htmlFile = path.join(appDir, 'index.html');
  const destFile = path.join(nextDir, 'index.html');

  // Check if server/app/index.html exists
  if (fs.existsSync(htmlFile)) {
    fs.renameSync(htmlFile, destFile);
    console.log('Moved index.html to .next/ for Capacitor.');
  } else {
    // If the root page is something else, e.g. page.html
    const pageHtmlFile = path.join(appDir, 'page.html');
    if (fs.existsSync(pageHtmlFile)) {
       fs.renameSync(pageHtmlFile, destFile);
       console.log('Moved page.html to .next/index.html for Capacitor.');
    } else {
        // As a fallback, create a minimal index.html to prevent Capacitor from failing.
        // This is useful if the root is fully dynamic and doesn't produce a static shell.
        const fallbackContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>BPX Portal</title>
                <meta http-equiv="refresh" content="0; url=/" />
            </head>
            <body>
                <p>Loading...</p>
            </body>
            </html>
        `;
        fs.writeFileSync(destFile, fallbackContent);
        console.log('Created a fallback index.html for Capacitor.');
    }
  }
} else {
    console.log('Build output directory structure not as expected. Skipping postbuild script.');
}
