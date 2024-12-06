import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface UpvoteDoc extends BaseDoc {
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
    const upvoteArray = await this.upvotes.readMany({ post: post });
    console.log("POST ID: ", post);
    console.log("NUMBER OF VOTES: ", upvoteArray.length);
    return upvoteArray.length;
  }

  async upvote(post: ObjectId, upvoter: ObjectId) {
    const upvoteObject = await this.upvotes.readOne({ post: post, upvoter: upvoter });
    if (!upvoteObject) {
      await this.upvotes.createOne({ post, upvoter });
      return { upvotes: await this.getNumUpvotes(post) };
    }
  }

  async userUpvotedPost(post: ObjectId, upvoter: ObjectId) {
    const upvoteObject = await this.upvotes.readOne({ post: post, upvoter: upvoter });
    if (!upvoteObject) {
      return false;
    }
    return true;
  }

  async removeUpvote(post: ObjectId, upvoter: ObjectId) {
    await this.upvotes.deleteOne({ post: post, upvoter: upvoter });
    return { upvotes: await this.getNumUpvotes(post) };
  }

  async assertUpvoterIsUser(post: ObjectId, upvoter: ObjectId) {
    const upvoteObject = await this.upvotes.readOne({ post: post, upvoter: upvoter });
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
