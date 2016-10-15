module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
        release: ['release/*']
    },
    compress: {
        main: {
            options: {
            archive: 'release/chrome-web-page-downloader.zip'
            },
            files: [
            {src: ['js/**','downloadpopup.html','icon.png','manifest.json'], dest: '/'}
            ]
        }
    }
  });

  grunt.registerTask('default', ['clean','compress']);

};