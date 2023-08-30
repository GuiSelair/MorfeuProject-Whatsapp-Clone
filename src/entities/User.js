import { ClassEvent } from "../utils/ClassEvent";
import { sleep } from '../utils/sleep'

export class User extends ClassEvent {
  constructor({
    email,
    name,
    photo,
  }){
    super()
    this._data = {
      email,
      name,
      photo,
      contacts: []
    }
    sleep(100).then(() => {
      this.loadContacts()
      this.trigger('datachange', this._data)
    })
  }

  update(userContentUpdated) {
    this._data = Object.assign(this._data, userContentUpdated)
    window.datasource.save(`users-${this.email}`, this._data)
    this.trigger('datachange', this._data)
  }

  addContact(newContact) {
    window.datasource.save(`contact-${this.email}`, newContact)
    this._data.contacts.push(newContact.toJSON())
    this.trigger('newcontact', this._data)
  }

  loadContacts() {
    this._data.contacts = window.datasource.findAll('contact')
  }

  toJSON() {
    return this._data
  }

  static createDefaultUser() {
    const defaultUserData = {
      name: 'Guilherme Selair',
      email: 'contato@guilhermeselair.dev',
      photo: 'https://github.com/guiselair.png',
    }

    window.datasource.save('users-contato@guilhermeselair.dev', defaultUserData)

    return defaultUserData
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