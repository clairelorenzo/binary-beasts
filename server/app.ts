import AuthenticatingConcept from "./concepts/authenticating";
import CommentingConcept from "./concepts/commenting";
import FriendingConcept from "./concepts/friending";
import MessagingConcept from "./concepts/messaging";
import PostingConcept from "./concepts/posting";
import SessioningConcept from "./concepts/sessioning";
import TrackingConcept from "./concepts/tracking";
import PointingConcept from "./concepts/pointing";

// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Posting = new PostingConcept("posts");
export const Friending = new FriendingConcept("friends");
export const Tracking = new TrackingConcept();
export const Messaging = new MessagingConcept("messages");
export const Commenting = new CommentingConcept("comments");
export const Pointing = new PointingConcept("points");
