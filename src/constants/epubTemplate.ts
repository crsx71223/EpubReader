export const EPUB_HTML_TEMPLATE = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js"></script>
    <style>
      body { margin: 0; padding: 0; background-color: #fafafa; }
      #viewer { width: 100vw; height: 100vh; overflow: hidden; display: flex; justify-content: center; align-items: center; }
      #error { color: red; text-align: center; display: none; padding: 20px; font-family: sans-serif; font-weight: bold; }
    </style>
  </head>
  <body>
    <div id="viewer"></div>
    <div id="error"></div>
    <script>
      function renderBook(event) {
        try {
          var bookData = event.data;
          if (!bookData || bookData === 'READY') return; 
          
          var book = ePub(bookData, { encoding: "base64" });
          var rendition = book.renderTo("viewer", {
            width: "100%",
            height: "100%",
            spread: "none"
          });
          
          rendition.display();

          rendition.on("touchstart", function(event) {
            var startX = event.changedTouches[0].clientX;
            var screenWidth = window.innerWidth;
            
            if (startX < screenWidth / 3) {
              rendition.prev();
            } 
            else if (startX > screenWidth * 2 / 3) {
              rendition.next();
            }
          });

          rendition.on("click", function(event) {
            var clientX = event.clientX;
            var screenWidth = window.innerWidth;
            
            if (clientX < screenWidth / 3) {
              rendition.prev();
            } else if (clientX > screenWidth * 2 / 3) {
              rendition.next();
            }
          });

        } catch (e) {
          document.getElementById('error').style.display = 'block';
          document.getElementById('error').innerText = 'EPUB Engine Error: ' + e.message;
        }
      }

      window.addEventListener('message', renderBook);
      document.addEventListener('message', renderBook);

      window.onload = function() {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage("READY");
        }
      };
    </script>
  </body>
  </html>
`;
