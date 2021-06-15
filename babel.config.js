module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['maintained node versions']
        }
      }
    ]
  ],
  plugins: [],
  env: {
    test: {
      plugins: ['istanbul'],
      sourceMaps: 'inline',
      retainLines: true
    }
  }
}
