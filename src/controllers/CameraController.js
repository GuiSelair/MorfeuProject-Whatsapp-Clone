class CameraController {
  constructor(videoEl){
    this._videoEl = this.videoEl;

    navigator.mediaDevices.getUserMedia({
      video: true
    }).then(stream => {
      this._stream = stream;
      this._videoEl.src = URL.createObjectURL(stream);
      this._videoEl.play();
    }).catch(error => console.log(error))
  }
}