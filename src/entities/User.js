import { ClassEvent } from "../utils/ClassEvent";
import { sleep } from '../utils/sleep'

export class User extends ClassEvent {

  constructor(email){
    super()
    this._data = {}
    
    this.verifyUserExists(email).then((userExists) => {
      if (!userExists) {
        this.createDefaultUser()
      }

      if (email) {
        this.findByEmail(email).then((userContent) => {
          if (userContent) {
            this._data = userContent
            this.trigger('datachange', this._data)
          }
        })
  
      }
    })
  }

  async findByEmail(email) {
    await sleep() 
    return window.datasource.findOne(`users-${email}`) 
  }

  createDefaultUser() {
    window.datasource.save('users-contato@guilhermeselair.dev', {
        name: 'Guilherme Selair',
        email: 'contato@guilhermeselair.dev',
        photo: 'https://github.com/guiselair.png',
    })

    
  }

  async verifyUserExists(email) {
    const userContent = await this.findByEmail(email)
    return !!userContent
  }

  get name() {
    return this._data.name
  }

  get email() {
    return this._data.email
  }

  get photo() {
    return this._data.photo
  }

  set photo(value) {
    this._data.photo = value
  }

  set name(value) {
    this._data.name = value
  }

  set email(value) {
    this._data.email = value
  }

}