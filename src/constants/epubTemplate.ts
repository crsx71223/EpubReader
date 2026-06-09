export const EPUB_HTML_TEMPLATE = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js"></script>
    <style>
      body { margin: 0; padding: 0; background-color: #fafafa; }
      #viewer { width: 100vw; height: 100vh; overflow: hidden; }
    </style>
  </head>
  <body>
    <div id="viewer"></div>
    <script>
      window.addEventListener('message', function(event) {
        try {
          var bookData = event.data;
          var book = ePub(bookData, { encoding: "base64" });
          var rendition = book.renderTo("viewer", {
            width: "100%",
            height: "100%",
            spread: "none"
          });
          rendition.display();
        } catch (e) {
          document.getElementById('viewer').innerHTML = '<p style="text-align:center; margin-top: 50px;">Failed to render book.</p>';
        }
      });
    </script>
  </body>
  </html>
`;
