import { ClassEvent } from "../utils/ClassEvent";
import { Chat } from "./Chat";

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
      lastMessage: this.getLastMessage(email).message || lastMessage,
      lastMessageTime: this.getLastMessage(email).time || new Date().toISOString(),
      status: 'online',
    }
  }

  getLastMessage(email) {
    const chatFounded = Chat.find(email)
    if (!chatFounded || !chatFounded.messages.length) return { message: '', time: '' }
    const lastMessage = chatFounded.messages[chatFounded.messages.length - 1]
    const time = new Date(lastMessage.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return { message: lastMessage.content, time: time }
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