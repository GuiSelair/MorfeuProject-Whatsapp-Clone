const path = require('path')
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = path.resolve(__dirname, '../../dist/pdf.worker.bundle.js')

export class DocumentPreviewController {
  constructor(file) {
    this._file = file;

  }

  getPreviewData() {
    console.log('Tipo do arquivo', this._file.type)
    return new Promise((resolve, reject) => {
      switch(this._file.type) {
        case 'image/png':
        case 'image/jpeg':
        case 'image/jpg':
        case 'image/gif':
          const reader = new FileReader();
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
          break;
       default:
          reject()
          break;
      }
    })
  }
}