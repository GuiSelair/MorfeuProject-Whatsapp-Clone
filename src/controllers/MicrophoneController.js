import { ClassEvent } from "../Utils/ClassEvent";

export class MicrophoneController extends ClassEvent {
  constructor(audioEl){
    super();
    this._audioEl = audioEl;
    this._stream = null;
    this._mediaRecorder = null;
    this._recordedChunks = null;
    this._recorderMimeType = 'audio/webm';

    navigator.mediaDevices.getUserMedia({
      audio: true
    }).then(stream => {
      this._stream = stream;
      this.trigger('ready', this._stream);
    }).catch(error => console.log(error))
  }

  stop(){
    this._stream.getTracks().forEach(track => {
      track.stop();
    });
  }

  startTimer() {
    let start = Date.now();

    this._recordMicrophoneInterval = setInterval(() => {
        this.trigger('recordtimer', Date.now() - start)
    }, 100);
  }

  stopTimer() {
    clearInterval(this._recordMicrophoneInterval);
  }

  startRecorder(){
    if (this._stream){
      this._mediaRecorder = new MediaRecorder(this._stream, { mimeType: this._recorderMimeType })
      this._recordedChunks = [];

      this._mediaRecorder.addEventListener('dataavailable', event => {
        if (event.data.size > 0) this._recordedChunks.push(event.data);
      })

      this._mediaRecorder.addEventListener('stop', event => {
        const blob = new Blob(this._recordedChunks, {
          type: this._recorderMimeType
        });

        const filename = `rec${Date.now()}.webm`;

        const file = new File([blob], filename, {
          lastModified: Date.now(),
          type: this._recorderMimeType
        })
        console.log(file)

      })

      this._mediaRecorder.start();
      this.startTimer();
    }
  }

  stopRecorder(){
    if (this._stream && this._mediaRecorder){
      console.log('stopRecorder')
      this._mediaRecorder.stop();
      this.stop();
      this.stopTimer();
    }
  }
}