
export class Datasource {

  constructor(datasourceApi) {
    this.messages = []
    this.api = datasourceApi
  }

  findOne(key) {
    return this.api.get(key)
  }

  findAll(key) {
      const values = []
      for (let i = 0; i < this.api.lenght; i++) {
        const keyFound = this.api.key(i)
        if(keyFound.includes(`${this.api.getBaseKey}:${key}`)){
          values.push(JSON.parse(window.localStorage.getItem(keyFound)))
        }
      }
      return values
  }

  save(key, value) {
    return this.api.set(key, value)
  }

}