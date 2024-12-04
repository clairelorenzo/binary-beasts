import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface UpvoteDoc extends BaseDoc {
  postAuthor: ObjectId;
  post: ObjectId;
  upvoter: ObjectId;
}

/**
 * concept: Upvoting
 */
export default class UpvotingConcept {
  public readonly upvotes: DocCollection<UpvoteDoc>;

  /**
   * Make an instance of Upvoting.
   */
  constructor(collectionName: string) {
    this.upvotes = new DocCollection<UpvoteDoc>(collectionName);
  }

  // returns the number of upvotes that a post has
  async getNumUpvotes(post: ObjectId) {
    const upvotes = await this.upvotes.readMany({ post });
    return upvotes.length;
  }

  async upvote(postAuthor: ObjectId, post: ObjectId, upvoter: ObjectId) {
    const upvoteObject = await this.upvotes.readOne({ upvoter: upvoter, post: post });
    if (!upvoteObject) {
      await this.upvotes.createOne({ postAuthor, post, upvoter });
      return { upvotes: await this.getNumUpvotes(post) };
    }
  }

  async userUpvotedPost(upvoter: ObjectId, post: ObjectId) {
    const upvoteObject = await this.upvotes.readOne({ upvoter: upvoter, post: post });
    if (!upvoteObject) {
      return false;
    }
    return true;
  }

  async removeUpvote(postAuthor: ObjectId, post: ObjectId, upvoter: ObjectId) {
    await this.upvotes.deleteOne({ postAuthor, post, upvoter });
    return { upvotes: await this.getNumUpvotes(post) };
  }

  async assertUpvoterIsUser(upvoter: ObjectId, post: ObjectId) {
    const upvoteObject = await this.upvotes.readOne({ upvoter: upvoter, post: post });
    if (!upvoteObject) {
      throw new NotFoundError(`upvote does not exist!`);
    }
    if (upvoteObject.upvoter.toString() !== upvoter.toString()) {
      throw new UpvoterNotMatchError(upvoteObject.upvoter, upvoter);
    }
  }
}

export class UpvoterNotMatchError extends NotAllowedError {
  constructor(
    public readonly upvoter: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} cannot upvote {1}!", upvoter, _id);
  }
}
