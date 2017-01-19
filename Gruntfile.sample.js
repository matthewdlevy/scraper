module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.loadTasks('tasks');
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    scrape: {
      options: {
        urls: [
          {
              name: 'Page One',
              url: "https://www.example.com/some-page.html"
          }
        ]
      }
    }
  });
};
