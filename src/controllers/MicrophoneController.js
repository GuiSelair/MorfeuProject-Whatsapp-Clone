import { ClassEvent } from "../Utils/ClassEvent";

export class MicrophoneController extends ClassEvent {
  constructor(audioEl){
    super();
    this._audioEl = audioEl;
    this._stream = null;


    navigator.mediaDevices.getUserMedia({
      audio: true
    }).then(stream => {
      this._stream = stream;
      this._audioEl = new Audio();

      if ("srcObject" in this._audioEl) {
        this._audioEl.srcObject = stream;
      } else {
        this._audioEl.src = window.URL.createObjectURL(stream);
      }

      this._audioEl.srcObject = stream;

      this._audioEl.play();
      this.trigger('play', this._audioEl);
    }).catch(error => console.log(error))
  }

  stop(){
    this._stream.getTracks().forEach(track => {
      track.stop();
    });
  }
}