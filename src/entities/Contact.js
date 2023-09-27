import { ClassEvent } from "../utils/ClassEvent";

export class Contact extends ClassEvent {
  constructor({
    email,
    name, 
    photo,
    lastMessage,
    chatId,
  }) {
    super()
    this._data = {
      email,
      name,
      photo,
      lastMessage: lastMessage || 'Mensagem de teste',
      lastMessageTime: '21:00',
      status: 'online',
    }
  }

  toJSON() {
    return this._data
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

  get lastMessageTime() {
    return this._data.lastMessageTime
  }

  get lastMessage() {
    return this._data.lastMessage
  }

  get status() {
    return this._data.status
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