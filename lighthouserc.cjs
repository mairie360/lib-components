module.exports = {
  ci: {
    collect: {
      staticDistDir: './storybook-static',
      url: require('./lhci-urls.json'),
      numberOfRuns: 1,
      settings: {
        output: ['json'],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
      results: {
        reportPath: 'lhci-reports',
        reportFilename: '[name].report.json',
      },
    },
    server: {
      command: 'npx serve ./storybook-static -l 8080',
      port: 8080,
      waitForReady: true,
    },
  },
};
