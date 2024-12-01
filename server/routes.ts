import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Friending, Messaging, Posting, Sessioning, Tracking } from "./app";
import { PostOptions } from "./concepts/posting";
import { SessionDoc } from "./concepts/sessioning";
import { Difficulty, Task } from "./concepts/tracking";
import Responses from "./responses";

import { z } from "zod";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  //////////////////////////////////// sessioning ////////////////////////////////////

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/users/:username")
  @Router.validate(z.object({ username: z.string().min(1) }))
  async getUser(username: string) {
    return await Authing.getUserByUsername(username);
  }

  @Router.get("/users/id/:id")
  async getUserById(id: string) {
    return await Authing.getUserById(new ObjectId(id));
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
  }

  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }

  //////////////////////////////////// posting ////////////////////////////////////

  @Router.get("/posts")
  @Router.validate(z.object({ author: z.string().optional() }))
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await Authing.getUserByUsername(author))._id;
      posts = await Posting.getByAuthor(id);
    } else {
      posts = await Posting.getPosts();
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: SessionDoc, content: string, subject: string, picture?: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const created = await Posting.create(user, content, subject, picture, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:id")
  async updatePost(session: SessionDoc, id: string, subject?: string, content?: string, picture?: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return await Posting.update(oid, subject, content, picture, options);
  }

  @Router.delete("/posts/:id")
  async deletePost(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return Posting.delete(oid);
  }

  //////////////////////////////////// friending ////////////////////////////////////

  @Router.get("/friends")
  async getFriends(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.idsToUsernames(await Friending.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: SessionDoc, friend: string) {
    const user = Sessioning.getUser(session);
    const friendOid = (await Authing.getUserByUsername(friend))._id;
    return await Friending.removeFriend(user, friendOid);
  }

  @Router.get("/friend/requests")
  async getRequests(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Responses.friendRequests(await Friending.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.sendRequest(user, toOid);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.removeRequest(user, toOid);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.acceptRequest(fromOid, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.rejectRequest(fromOid, user);
  }

  @Router.get("/tracking/percentage")
  async getCompletedPercentage(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const percentage = await Tracking.getCompletedPercentage(user);
    return { msg: "Percentage of tasks completed", percentage };
  }

  @Router.get("/tracking/tasks")
  async getTasks(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const tasks = await Tracking.getTasks(user); // Fetch tasks using the new function
    return { msg: "Tasks retrieved successfully!", tasks };
  }

  @Router.post("/tracking/tasks")
  async createTask(session: SessionDoc, taskName: string, taskDescription: string, reps: number, sets?: number, startingWeight?: number) {
    const user = Sessioning.getUser(session);
    const result = await Tracking.createTask(user, taskName, taskDescription, reps, sets, startingWeight);
    if (result) {
      return { msg: "Task created successfully!" };
    } else {
      return { msg: "Task creation was unsuccessful." };
    }
  }

  @Router.patch("/tracking/tasks/:taskName")
  async updateTask(session: SessionDoc, taskName: string, reps?: number, sets?: number, weight?: number, difficulty?: Difficulty) {
    const user = Sessioning.getUser(session);
    const result = await Tracking.updateTask(user, taskName, reps, sets, weight, difficulty);
    return { msg: "Task updated successfully!", task: result.task };
  }

  @Router.delete("/tracking/tasks/:taskName")
  async deleteTask(session: SessionDoc, taskName: string) {
    const user = Sessioning.getUser(session);
    const result = await Tracking.deleteTask(user, taskName);
    return { msg: result.msg };
  }

  @Router.post("/tracking/goal")
  async setUserGoal(session: SessionDoc, goal: string) {
    const user = Sessioning.getUser(session);
    const result = await Tracking.setUserGoal(user, goal);
    return { msg: result.msg, goal };
  }

  @Router.post("/tracking/tasks/:taskName/completed")
  async toggleTaskCompletion(session: SessionDoc, taskName: string) {
    const user = Sessioning.getUser(session);
    const result = await Tracking.setCompleted(user, taskName);
    return { msg: result.msg };
  }

  @Router.get("/tracking/tasks/:taskName/completed")
  async isTaskCompleted(session: SessionDoc, taskName: string) {
    const user = Sessioning.getUser(session);
    const completed = await Tracking.isCompleted(user, taskName);
    return { taskName, completed };
  }

  @Router.post("/tracking/tasks/reset")
  async resetWeeklyTasks(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const result = await Tracking.resetWeeklyTasks(user);
    return { msg: result.msg };
  }

  @Router.get("/tracking/history")
  async getProgressHistory(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const history = await Tracking.getProgressHistory(user);
    return { msg: "Progress history retrieved successfully!", history };
  }

  @Router.post("/tracking/tasks/:taskName/prompt")
  async promptChange(session: SessionDoc, taskName: string, currentDifficulty: Difficulty) {
    const user = Sessioning.getUser(session);
    const result = await Tracking.promptChange(user, taskName, currentDifficulty);
    return { msg: result.msg, suggestion: result.task || null };
  }

  @Router.post("/tracking/profile")
  async createTrackingProfile(userId: string) {
    const userObjectId = new ObjectId(userId);
    const result = await Tracking.createTrackingDoc(userObjectId);
    return { msg: "Tracking profile created successfully!", trackingProfile: result };
  }

  @Router.post("/conversations")
  async createConversation(session: SessionDoc, recipientId: string) {
    const userId = Sessioning.getUser(session);
    console.log(recipientId);
    if (!recipientId) {
      throw new Error("Recipient ID is required.");
    }

    const participants = [userId, new ObjectId(recipientId)];
    const response = await Messaging.createConversation(participants);

    return response;
  }

  @Router.get("/conversations/:conversationId")
  async getConversation(session: SessionDoc, conversationId: string) {
    const userId = Sessioning.getUser(session);
    const conversation = await Messaging.conversations.readOne({ _id: new ObjectId(conversationId) });
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    if (!conversation.participants.some((id) => id.equals(userId))) {
      throw new Error("Access denied: You are not a participant in this conversation.");
    }

    return { conversation };
  }

  @Router.get("/conversations")
  async getConversations(session: SessionDoc) {
    try {
      const userId = Sessioning.getUser(session);
      const conversations = await Messaging.getConversationsForUser(userId);

      return { conversations };
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw new Error("Failed to fetch conversations.");
    }
  }

  @Router.post("/conversations/messages")
  async sendMessage(session: SessionDoc, conversationId: string, content: string, recipient: string) {
    const sender = Sessioning.getUser(session);
    console.log(recipient);
    const response = await Messaging.sendMessage(new ObjectId(conversationId), content, sender, new ObjectId(recipient));
    return response;
  }

  @Router.post("/conversations/:conversationId/tasks")
  async sendTaskMessage(session: SessionDoc, conversationId: string, content: string, recipient: string, task: Task) {
    const sender = Sessioning.getUser(session);
    const response = await Messaging.sendTaskMessage(new ObjectId(conversationId), content, sender, new ObjectId(recipient), task);
    return response;
  }

  @Router.get("/conversations/:conversationId/messages")
  async getMessages(session: SessionDoc, conversationId: string) {
    const userId = Sessioning.getUser(session);
    const messages = await Messaging.getMessages(new ObjectId(conversationId), userId);
    return { messages };
  }

  @Router.delete("/conversations/:conversationId/messages/:messageId")
  async deleteMessage(session: SessionDoc, conversationId: string, messageId: string) {
    const userId = Sessioning.getUser(session);
    const response = await Messaging.deleteMessage(new ObjectId(conversationId), new ObjectId(messageId), userId);
    return response;
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
