# Scraper
#### Gather documents (PDFs, DOCs, etc.) from a set of web pages

Say you have a set of web pages, in an old-school table layout or something similar, and need an easy way to gather up the all of the documents those pages link to (think many pages with tables of PDFs -- see any government website).

Scraper will make requests to each page in a set, look for any hyperlink ending in a particular file type and store the files, as well as create a CSV/Text file with some data annotations.

To install `$ npm install`

Rename `Gruntfile.sample.js` to `Gruntfile.js`. Add your options.

In `Gruntfile.js`, create an array of URLs:
```
...
scraper: {
  options: {
    urls: [
      { name: 'Page One', url: '/page/path/something.html' },
      { name: 'Page Two', url: '/page/path/something-else.html'}
    ]
  }
}
```

Then run `$ grunt scrape`

## Options

### url_prefix
If the endpoint documents are referenced with a relative URL on the pages, pass in the complete domain to get the docs `https://www.example.com`

### find_in
Searches are done against the `body` node by default. Substitute any valid jQuery selector: `article table:first`

### filetypes
Array of filetypes to match against; `['pdf']` by default

### label_selector
Pass a complete jQuery selector as a string to get relevant text to label each document in the data CSV/Text file.
`"$(this).parents('tr').children('td:first').text()"`

### folder
Folder to house the documents. Defaults to `tmp`.

### data_file
File name of the CSV/Text data file. Defaults to `data_file.txt`; will reside in the `folder` folder.

### timeout
Time (in seconds) to wait for the document to load. Defaults to 5 seconds.

### connect_timeout
Time (in seconds) to wait for the initial server response. Defaults to 2 seconds.
