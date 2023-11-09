export class Chat {
  constructor() {}

  static createIfNotExists(contactEmail) {
    const chatFounded = Chat.find(contactEmail)

    if (!chatFounded) {
      return Chat.create(contactEmail)
      
    }

    return chatFounded
  }

  static find(contactEmail) {
    return window.datasource.findOne(`chat-${contactEmail}`)
  }

  static create(contactEmail) {
    const newChatToCreate = {
      id: `chat-${contactEmail}`,
      messages: [],
      createdAt: new Date(),
    }

    window.datasource.save(`chat-${contactEmail}`, newChatToCreate)

    return newChatToCreate
  }
}