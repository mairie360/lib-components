const urls = require('./lhci-urls.json');

module.exports = {
  ci: {
    collect: {
      staticDistDir: './storybook-static',
      url: urls,
      numberOfRuns: 1,
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      command: 'npx serve ./storybook-static -l 8080',
      port: 8080,
      waitForReady: true,
    },
  },
};
