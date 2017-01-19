module.exports = function (grunt) {
    grunt.registerTask('scrape', '', function(grunt, options){
        var options = this.options({
          urls: [],
          find_in: 'body',
          doctypes: ['pdf'],
          url_prefix: '',
          label_selector: null,
          folder: 'tmp',
          data_file: 'data_file.txt',
          timeout: 5,
          connect_timeout: 2
        });

        var done = this.async();
        var Curl = require('node-libcurl').Curl;
        var jsdom = require('node-jsdom');
        var fs = require('fs');


        var urls = options.urls;
        var find_in = options.find_in;
        var doctypes = options.doctypes;
        var url_prefix = options.url_prefix;
        var label_selector = options.label_selector;
        var tmp_folder = options.folder;
        var data_file_path = tmp_folder + '/' + options.data_file;
        var timeout = options.timeout;
        var connect_timeout = options.connect_timeout;
        
        fs.writeFileSync( data_file_path, '');

        var url_count = 0;
        var total_docs = 0;

        function getData() {
          //for each page, get all of the PDFs, DOCs, etc.

          var u = urls[url_count];
          console.log('Getting page data: ' + u.name);
          jsdom.env({
            url: u.url,
            scripts: ["http://code.jquery.com/jquery.js"],
            done: function(errors, window) {
              var $ = window.$;
              var doctypes_selectors = [];
              doctypes.forEach(function(d){
                doctypes_selectors.push('a[href$=".' + d + '"]');
              });
              var datarows = $(find_in).filter(function(){
                return ($(this).find(doctypes_selectors.join(',')).length > 0);
              });

              var datadocs = datarows.find(doctypes_selectors.join(','));
              u.docs = [];
              datadocs.each(function(){
                var fbits = $(this).attr('href').split('/');
                var o = {
                  original_url: url_prefix + $(this).attr('href'),
                  filename: fbits[fbits.length-1],
                  page: u.name,
                  label: ''
                };

                if(label_selector) {
                  eval('o.label = ' + label_selector + ';');
                  o.label = o.label.replace(/\r?\n|\r/g, ' ');
                }

                u.docs.push(o);

                //write info to the data file
                fs.appendFileSync( data_file_path, '"' + o.page + '","' + o.filename + '","' + o.label + '"' +  "\n" );

              });
              url_count++;
              total_docs += u.docs.length;

              if(url_count == urls.length){
                console.log('Getting ' + total_docs + ' total documents');
                url_count = 0;
                getFiles();
              }
              else {
                getData();
              }
            }
          });
        }

        //Retrieve the actual files and write to disk
        function getFiles(){
          if(url_count == urls.length){
            console.log('Finished processing documents');
            done();
            return;
          }

          var doc_count = 0;
          var u = urls[url_count];

          var path = tmp_folder + '/' + u.name.replace(/\s/g, '-').toLowerCase();
          try {
            fs.mkdirSync(path);
          } catch(e) {
            if ( e.code != 'EEXIST' ) throw e;
          }

          console.log('Getting documents: ' + u.name);

          if ((!u.docs) || (u.docs.length == 0) ) {
            url_count++;
            getFiles();
          }

          u.docs.forEach(function(o){
            var fileOut = fs.openSync( path + '/' + o.filename, 'w+' );
            var curl = new Curl();
            curl.setOpt('URL', o.original_url);
            curl.setOpt('SSL_VERIFYPEER', false);
            curl.setOpt('CONNECTTIMEOUT', connect_timeout);
            curl.setOpt('TIMEOUT', timeout);
            curl.setOpt('WRITEFUNCTION', function( buff, nmemb, size ){

              var written = 0;

              if ( fileOut ) {
                  written = fs.writeSync( fileOut, buff, 0, nmemb * size );
              } else {
                  /* listing output */
                  process.stdout.write( buff.toString() );
                  written = size * nmemb;
              }

              return written;
            });

            curl.on( 'error', function () {
              doc_count++;
              console.log(doc_count + '. ##  NO DATA ## - ' + o.filename );
              this.close();
              if(u.docs.length == doc_count) {
                url_count++;
                getFiles();
              }

              if(url_count == urls.length){
                console.log('Finished processing documents');
                done();
              }
            });

            curl.on( 'end', function ( statusCode, body, headers ) {
                fs.closeSync( fileOut );
                this.close();
                doc_count++;
                console.log(doc_count + '. ' + o.filename );

                if(u.docs.length == doc_count) {
                  url_count++;
                  getFiles();
                }
            });

            curl.perform();

          });
      }

      getData();
    });
}
