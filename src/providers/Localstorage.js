export class LocalStorage {
  constructor(baseKey){
    this.baseKey = baseKey
  }

  get(key){
    return JSON.parse(window.localStorage.getItem(`${this.baseKey}:${key}`))
  }

  set(key, value){
    window.localStorage.setItem(`${this.baseKey}:${key}`, JSON.stringify(value))
  }

  remove(key){
    window.localStorage.removeItem(`${this.baseKey}:${key}`)
  }

  clear(){
    window.localStorage.clear()
  }

  getBaseKey(){
    return this.baseKey
  }
  
  lenght(){
    return window.localStorage.length
  }

  key(index){
    return window.localStorage.key(index)
  }

}