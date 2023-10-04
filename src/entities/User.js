import { ClassEvent } from "../utils/ClassEvent";
import { sleep } from '../utils/sleep'
import { Contact } from "./Contact";

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
      this.trigger('datachange', this._data)
    })
  }

  update(userContentUpdated) {
    this._data = Object.assign(this._data, userContentUpdated)
    window.datasource.save(`users-${this.email}`, this._data)
    this.trigger('datachange', this._data)
  }

  addContact(newContact) {
    window.datasource.save(`contact-${newContact.email}`, newContact)
    this._data.contacts.push(newContact.toJSON())
    this.trigger('contactschange', this._data.contacts)
  }

  loadContacts() {
    return new Promise((resolve, reject) => {
      sleep(100).then(() => {
        const contactsFounded = window.datasource.findAll('contact')

        if (!contactsFounded) { return resolve() }
        
        contactsFounded.forEach(contact => {
          this._data.contacts.push(new Contact({
            email: contact.email,
            name: contact.name,
            photo: contact.photo,
            lastMessage: contact.lastMessage,
          }))
        
        })

        resolve(this._data.contacts)
        this.trigger('contactschange', this._data.contacts)
      })
    })
  }

  filterContacts(filter) {
    const contactsFounded = window.datasource.findAll('contact')
    const filteredContacts = contactsFounded.filter(contact => contact.name.toLowerCase().includes(filter.toLowerCase()))

    this._data.contacts = filteredContacts.map(contact => new Contact({
      email: contact.email,
      name: contact.name,
      photo: contact.photo,
      lastMessage: contact.lastMessage,
    }))
    this.trigger('contactschange', this._data.contacts)
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