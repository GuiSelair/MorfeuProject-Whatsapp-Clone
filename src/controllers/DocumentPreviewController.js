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
        case 'default':
          console.log('Arquivo não suportado')
          break;
      }
    })
  }
}