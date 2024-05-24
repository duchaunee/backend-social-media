import express from "express";
import { accessTokenMiddleware } from "../middlewares/auth.middleware";
import {
  commentPostController,
  createPostController,
  deletePostController,
  getCommentsController,
  getPostsController,
  getUserPostsController,
  likeCommentController,
  likePostController,
  replyPostCommentController,
} from "../controller/posts.controller";

const postsRouter = express.Router();
/**
 * Create a new post
 */
postsRouter.post("/create-post", accessTokenMiddleware, createPostController);

/**
 * Get a post by postId
 */
postsRouter.post("/:postId", accessTokenMiddleware, getPostsController);

/**
 * Get ALl Post By User
 */
postsRouter.post(
  "/get-user-posts/:userId",
  accessTokenMiddleware,
  getUserPostsController
);

/**
 * Get all comments from a post
 */
postsRouter.get(
  "/comments/:postId",
  accessTokenMiddleware,
  getCommentsController
);

/**
 * Comment a post
 */
postsRouter.post(
  "/comment/:postId",
  accessTokenMiddleware,
  commentPostController
);
/**
 * Like a post
 */
postsRouter.post("/like/:postId", accessTokenMiddleware, likePostController);

/**
 * Reply a comment
 */
postsRouter.post(
  "/reply-comment/:commentId",
  accessTokenMiddleware,
  replyPostCommentController
);

/**
 * Like a comment/ a reply comment
 */
postsRouter.post(
  "/like-comment/:commentId/:replyId",
  accessTokenMiddleware,
  likeCommentController
);

/**
 * Delete a post
 */
postsRouter.delete("/:postId", accessTokenMiddleware, deletePostController);

export default postsRouter;
