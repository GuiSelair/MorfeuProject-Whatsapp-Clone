const path = require('path')
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = path.resolve(__dirname, '../../dist/pdf.worker.bundle.js')

export class DocumentPreviewController {
  constructor(file) {
    this._file = file;

  }

  getPreviewData() {
    let reader = null;
    return new Promise((resolve, reject) => {
      switch(this._file.type) {
        case 'image/png':
        case 'image/jpeg':
        case 'image/jpg':
        case 'image/gif':
          reader = new FileReader();
          reader.onload = () => {
            resolve({
              src: reader.result,
              info: this._file.name
            })
          }
          reader.onerror = (error) => {
            reject(error)
          }

          reader.readAsDataURL(this._file);
          break;
        case 'application/pdf':
          reader = new FileReader();

          reader.onload = () => {
            pdfjsLib.getDocument(new Uint8Array(reader.result))
              .then(pdfPreview => {
                pdfPreview.getPage(1).then(pdfFirstPage => {
                  const pdfViewPort = pdfFirstPage.getViewport(1);
                  const canvas = document.createElement('canvas');
                  const canvasContext = canvas.getContext('2d');
                  canvas.width = pdfViewPort.width;
                  canvas.height = pdfViewPort.height;

                  pdfFirstPage.render({
                    canvasContext,
                    viewport: pdfViewPort
                  }).then(() => {
                    let _s = (pdfPreview.numPages > 1) ? 's' : ''
                    resolve({
                      src: canvas.toDataURL('image/png'),
                      info: `${pdfPreview.numPages} página${_s}`
                    })
                  }).catch(error => reject(error))
                })
              })
              .catch(error => reject(error))
          }

          reader.onerror = (error) => {
            reject(error)
          }

          reader.readAsArrayBuffer(this._file)

          break;
       default:
          reject()
          break;
      }
    })
  }
}