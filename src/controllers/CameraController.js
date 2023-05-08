export class CameraController {
  constructor(videoEl){
    this._videoEl = videoEl;

    navigator.mediaDevices.getUserMedia({
      video: true
    }).then(stream => {
      if ("srcObject" in this._videoEl) {
        this._videoEl.srcObject = stream;
      } else {
        this._videoEl.src = window.URL.createObjectURL(stream);
      }

      this._videoEl.play();
    }).catch(error => console.log(error))
  }
}