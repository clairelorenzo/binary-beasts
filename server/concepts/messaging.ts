import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface Task {
  name: string;
  description: string;
  reps: number;
  sets?: number;
  weight?: number;
  completed: boolean;
}

export interface MessageDoc extends BaseDoc {
  _id: ObjectId;
  content: string;
  sender: ObjectId;
  recipient: ObjectId;
  task?: Task;
}

export interface ConversationDoc extends BaseDoc {
  _id: ObjectId;
  participants: ObjectId[]; // Users involved in the conversation
  messages: MessageDoc[]; // Messages in the conversation
}

export default class MessagesConcept {
  public readonly conversations: DocCollection<ConversationDoc>;

  constructor(collectionName: string) {
    this.conversations = new DocCollection<ConversationDoc>(collectionName);
  }

  // Create a conversation with specified participants
  async createConversation(participants: ObjectId[]): Promise<{ msg: string; conversationId: ObjectId }> {
    const existingConversation = await this.getConversationBetweenUsers(participants);

    if (existingConversation) {
      return { msg: "Conversation already exists!", conversationId: existingConversation._id };
    }

    const _id = await this.conversations.createOne({
      participants,
      messages: [],
    });

    return { msg: "New conversation created!", conversationId: _id };
  }

  // Send a regular message and add it to the conversation
  async sendMessage(conversationId: ObjectId, content: string, sender: ObjectId, recipient: ObjectId): Promise<{ msg: string; messageId: ObjectId }> {
    const conversation = await this.conversations.readOne({ _id: conversationId });
    console.log(conversation?.participants);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    console.log(
      "Participants:",
      conversation.participants.map((id) => id.toString()),
    );
    console.log("Sender ID:", sender.toString());
    console.log("Recipient ID:", recipient.toString());

    // Verify sender is a participant
    if (!conversation.participants.some((id) => id.equals(sender))) {
      throw new Error("Sender is not a participant in this conversation.");
    }

    // Verify recipient is a participant
    if (!conversation.participants.some((id) => id.equals(recipient))) {
      throw new Error("Recipient is not a participant in this conversation.");
    }

    const messageId = new ObjectId();
    const now = new Date();

    const message: MessageDoc = {
      _id: messageId,
      dateCreated: now,
      dateUpdated: now,
      content,
      sender,
      recipient,
    };

    // Add the message to the conversation
    conversation.messages.push(message);

    // Update the conversation in the database
    await this.conversations.partialUpdateOne({ _id: conversationId }, { messages: conversation.messages });

    console.log("Message sent successfully!");
    return { msg: "Message sent!", messageId };
  }

  // Send a task message and add it to the conversation
  async sendTaskMessage(conversationId: ObjectId, content: string, sender: ObjectId, recipient: ObjectId, task: Task): Promise<{ msg: string; messageId: ObjectId }> {
    const conversation = await this.conversations.readOne({ _id: conversationId });
    console.log(conversation?.participants);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    if (!conversation.participants.some((id) => id.equals(sender))) {
      throw new Error("Sender is not a participant in this conversation.");
    }
    if (!conversation.participants.some((id) => id.equals(recipient))) {
      throw new Error("Recipient is not a participant in this conversation.");
    }

    const messageId = new ObjectId();
    const now = new Date();

    const message: MessageDoc = {
      _id: messageId,
      dateCreated: now,
      dateUpdated: now,
      content,
      sender,
      recipient,
      task,
    };

    conversation.messages.push(message);
    await this.conversations.partialUpdateOne({ _id: conversationId }, { messages: conversation.messages });

    return { msg: "Task message sent!", messageId };
  }

  // Get all messages in a conversation
  async getMessages(conversationId: ObjectId, userId: ObjectId): Promise<MessageDoc[]> {
    const conversation = await this.conversations.readOne({ _id: conversationId });
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    if (!conversation.participants.some((id) => id.equals(userId))) {
      throw new Error("Access denied: You are not a participant in this conversation.");
    }

    return conversation.messages;
  }

  // Delete a message from a conversation
  async deleteMessage(conversationId: ObjectId, messageId: ObjectId, userId: ObjectId): Promise<{ msg: string }> {
    const conversation = await this.conversations.readOne({ _id: conversationId });
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    if (!conversation.participants.some((id) => id.equals(userId))) {
      throw new Error("Access denied: You are not a participant in this conversation.");
    }

    const messageIndex = conversation.messages.findIndex((m) => m._id.equals(messageId));
    if (messageIndex === -1) {
      throw new Error("Message not found.");
    }

    const message = conversation.messages[messageIndex];

    if (!message.sender.equals(userId)) {
      throw new Error("Only the sender can delete this message.");
    }

    conversation.messages.splice(messageIndex, 1);
    await this.conversations.partialUpdateOne({ _id: conversationId }, { messages: conversation.messages });

    return { msg: "Message deleted!" };
  }

  // Get a conversation involving specific users
  async getConversationBetweenUsers(userIds: ObjectId[]): Promise<ConversationDoc | null> {
    return await this.conversations.readOne({
      participants: { $all: userIds },
    });
  }

  // Get all conversations for a specific user
  async getConversationsForUser(userId: ObjectId): Promise<ConversationDoc[]> {
    return await this.conversations.readMany({
      participants: { $in: [userId] },
    });
  }
}
