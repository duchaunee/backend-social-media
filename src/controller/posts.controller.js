import mongoose from "mongoose";
import Posts from "../models/Post.model";
import Users from "../models/User.model";
import Comments from "../models/Comment.model";

export const getAllPostsController = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return next(new Error("Not Authentication !"));
    }
    const allPosts = await Posts.find()
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl -password",
      })
      .sort({ updatedAt: -1 });

    // const reworkAllPost = allPosts.map((p) => {
    //   const p_obj = p.toObject();
    //   const userId_post = p_obj.userId._id;
    //   return { ...p_obj, yourPost: userId === userId_post.toString() };
    // });

    res.status(200).send({
      status: true,
      data: allPosts,
    });
  } catch (error) {
    next(new Error(error.message));
  }
};

export const createPostController = async (req, res, next) => {
  try {
    const { userId } = req;
    const { description, image } = req.body;

    if (!(description && image)) {
      return next(new Error("Provide description & image !"));
    }

    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return next(new Error("User is not exist !"));
    }

    const newPost = await Posts.create({
      userId,
      description,
      image,
    });

    if (!newPost) return next(new Error("Post can't create"));
    res.status(200).send({
      status: "OK",
      data: newPost,
    });
  } catch (error) {
    next(new Error(error.message));
  }
};

export const getPostsController = async (req, res, next) => {
  try {
    const { userId } = req;
    const { postId } = req.params;
    console.log("postId: ", postId);

    const post = await Posts.findById(postId)
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl -password",
      })
      .populate({
        path: "comments",
      });
    if (!post) return next(new Error("Post is not exist !"));
    res.status(200).json({
      sucess: true,
      message: "successfully",
      data: post,
    });
  } catch (error) {
    next(new Error(error.message));
  }
};

export const getUserPostsController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const post = await Posts.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl -password",
      })
      .sort({ _id: -1 });

    res.status(200).json({
      sucess: true,
      message: "successfully",
      data: post,
    });
  } catch (error) {
    next(new Error(error.message));
  }
};

export const getCommentsController = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const postComments = await Comments.find({ postId })
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl -password",
      })
      .populate({
        path: "replies.userId",
        select: "firstName lastName location profileUrl -password",
      })
      .sort({ _id: -1 });

    res.status(200).json({
      sucess: true,
      message: "successfully",
      data: postComments,
    });
  } catch (error) {
    next(new Error(error.message));
  }
};

export const likePostController = async (req, res, next) => {
  try {
    const { userId } = req;
    const { postId } = req.params;

    const post = await Posts.findById(postId);
    if (!post) return next(new Error("Post is not exist"));

    let isLike = false;
    const liked_index = post.likes.findIndex((pid) => pid === String(userId));
    if (liked_index === -1) {
      isLike = true;
      post.likes.push(userId);
    } else {
      isLike = false;
      post.likes = post.likes.filter((pid) => pid !== String(userId));
    }

    const newPost = await Posts.findByIdAndUpdate(postId, post, {
      new: true,
    });

    res.status(200).json({
      sucess: true,
      isLike,
      message: "successfully",
      data: newPost,
    });
  } catch (error) {
    next(new Error(error.message));
  }
};

export const likeCommentController = async (req, res, next) => {
  try {
    const { userId } = req;
    const { commentId } = req.params;
    const { replyId } = req.body;

    const comment = await Comments.findById(commentId);
    if (!comment) return next(new Error("Comment is not exist"));

    /**
     * không có --> Tức là like comment cha :v nếu truyền thì là like ở reply
     */
    if (!replyId) {
      const liked_index = comment.likes.findIndex(
        (cid) => cid === String(userId)
      );
      if (liked_index === -1) {
        comment.likes.push(userId);
      } else {
        comment.likes = comment.likes.filter((cid) => cid !== String(userId));
      }

      const newComment = await Comments.findByIdAndUpdate(commentId, comment, {
        new: true,
      });

      res.status(200).json({
        sucess: true,
        isLike: liked_index === -1 ? true : false,
        message: "successfully",
        data: newComment,
      });
    } //
    else {
      const replyComments = await Comments.findOne(
        { _id: commentId },
        {
          replies: {
            $elemMatch: {
              _id: replyId,
            },
          },
        }
      );

      const index = replyComments?.replies[0]?.likes.findIndex(
        (i) => i === String(userId)
      );

      if (index === -1) {
        replyComments.replies[0].likes.push(userId);
      } else {
        replyComments.replies[0].likes = replyComments.replies[0]?.likes.filter(
          (i) => i !== String(userId)
        );
      }

      const query = { _id: commentId, "replies._id": replyId };

      const updated = {
        $set: {
          "replies.$.likes": replyComments.replies[0].likes,
        },
      };

      const result = await Comments.updateOne(query, updated, { new: true });
      console.log("result: ", result);

      res.status(201).json(result);
    }
  } catch (error) {
    next(new Error(error.message));
  }
};

export const commentPostController = async (req, res, next) => {
  try {
    const { comment, from } = req.body;
    const { userId } = req;
    const { postId } = req.params;

    if (!comment) {
      return next(new Error("Comment is required !"));
    }
    const user = await Users.findById(userId);
    if (!user) {
      return next(new Error("User is not exist. Try again !"));
    }

    const newComment = new Comments({ comment, from, userId, postId: postId });
    await newComment.save();

    //updating the post with the comments id
    const post = await Posts.findById(postId);
    if (!post) return next(new Error("Post is not exist"));

    post?.comments.push(newComment._id);

    const updatedPost = await Posts.findByIdAndUpdate(postId, post, {
      new: true,
    });

    res.status(201).json({
      updatedPost,
      newComment: {
        ...newComment.toObject(),
        userId: user,
      },
    });
  } catch (error) {
    next(new Error(error.message));
  }
};

export const replyPostCommentController = async (req, res, next) => {
  try {
    const { userId } = req;
    const { comment, replyAt, from } = req.body;
    const { commentId } = req.params;

    if (!comment) {
      return next(new Error("Comment is required !"));
    }

    const commentInfo = await Comments.findById(commentId);
    if (!commentInfo) return next(new Error("Comment is not exist"));

    commentInfo?.replies.push({
      comment,
      replyAt,
      from,
      userId,
      created_At: Date.now(),
    });

    commentInfo.save();

    res.status(200).json(commentInfo);
  } catch (error) {
    next(new Error(error.message));
  }
};

export const deletePostController = async (req, res, next) => {
  try {
    const { userId } = req;
    const { postId } = req.params;

    const post = await Posts.findByIdAndDelete(postId);
    if (!post) {
      return next(new Error("Post id is not invalid !"));
    }
    res.status(200).send({
      status: "OK",
      message: "Delete post successfully !",
    });
  } catch (error) {
    next(new Error(error.message));
  }
};
