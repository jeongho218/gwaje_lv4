const express = require("express");
const { Comments, Posts } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();
const { Op } = require("sequelize"); // sequelize 연산자 문법 Op 사용을 위한 호출

// 댓글 작성 API
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;
  const { comment } = req.body;

  if (!userId) {
    res.status(403).json({ errorMessage: "로그인 후 사용 가능합니다." });
    return;
  }

  if (!comment) {
    return res
      .status(412)
      .json({ errorMessage: "댓글의 형식이 올바르지 않습니다." });
  }

  try {
    const createComment = await Comments.create({
      PostId: postId,
      UserId: userId,
      comment: comment,
    });
    return res.status(200).json({ message: "댓글이 등록되었습니다." });
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "댓글 작성에 실패하였습니다." });
  }
});

// 댓글 조회 API
router.get("/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params;

  const isExistPost = await Posts.findOne({
    where: { postId: postId },
  });

  const isExistComment = await Comments.findOne({
    where: { PostId: postId },
  });

  const comment = await Comments.findAll({
    include: { model: Posts, attributes: ["postId", "UserId"] },
    attributes: [
      "commentId",
      "UserId",
      "PostId",
      "comment",
      "createdAt",
      "updatedAt",
    ],
    where: { PostId: postId },
    order: [["createdAt", "DESC"]],
  });

  if (!isExistPost) {
    return res
      .status(404)
      .json({ errorMessage: "게시글 번호를 다시 확인해주세요" });
  }

  if (!isExistComment) {
    return res
      .status(404)
      .json({ errorMessage: "게시글에 댓글이 등록되어있지 않습니다." });
  }

  try {
    return res.status(200).json({ comments: comment });
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "댓글 조회에 실패하였습니다." });
  }
});

// 댓글 수정 API
router.put(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;
    const { comment } = req.body;

    if (!userId) {
      return res
        .status(403)
        .json({ errorMessage: "로그인이 필요한 기능입니다." });
    }

    const isExistPost = await Posts.findOne({
      where: { postId: postId },
    });

    if (!isExistPost) {
      return res
        .status(404)
        .json({ errorMessage: "게시글 번호를 다시 확인해주세요" });
    }

    const isExistComment = await Comments.findOne({
      where: { [Op.and]: [{ commentId: commentId }, { PostId: postId }] },
    });
    // console.log("존재하는 댓글인가?", isExistComment);

    if (!isExistComment) {
      return res
        .status(404)
        .json({ errorMessage: "댓글 번호를 다시 확인해주세요" });
    }

    const commentOwner = await Comments.findOne({
      where: { [Op.and]: [{ commentId: commentId }, { PostId: postId }] },
    });
    console.log("현재 접속한 사용자의 ID", userId);
    console.log("댓글 작성자의 ID", commentOwner.dataValues.UserId);

    if (commentOwner.dataValues.UserId !== userId) {
      return res
        .status(403)
        .json({ errorMessage: "다른 사람의 댓글은 수정할 수 없습니다." });
    }

    if (!comment) {
      return res
        .status(412)
        .json({ errorMessage: "댓글의 데이터 형식이 올바르지 않습니다." });
    }

    try {
      await Comments.update(
        {
          comment: comment,
        },
        { where: { commentId: commentId } }
      );
      return res.status(200).json({ message: "댓글이 수정되었습니다." });
    } catch (error) {
      return res
        .status(400)
        .json({ errorMessage: "댓글 수정에 실패하였습니다." });
    }
  }
);

// 댓글 삭제 API
router.delete(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;

    if (!userId) {
      return res
        .status(403)
        .json({ errorMessage: "로그인이 필요한 기능입니다." });
    }

    const isExistPost = await Posts.findOne({
      where: { postId: postId },
    });

    if (!isExistPost) {
      return res
        .status(404)
        .json({ errorMessage: "게시글 번호를 다시 확인해주세요" });
    }

    const isExistComment = await Comments.findOne({
      where: { [Op.and]: [{ commentId: commentId }, { PostId: postId }] },
    });

    if (!isExistComment) {
      return res
        .status(404)
        .json({ errorMessage: "댓글 번호를 다시 확인해주세요" });
    }

    const commentOwner = await Comments.findOne({
      where: { [Op.and]: [{ commentId: commentId }, { PostId: postId }] },
    });
    console.log("현재 접속한 사용자의 ID", userId);
    console.log("댓글 작성자의 ID", commentOwner.dataValues.UserId);

    if (commentOwner.dataValues.UserId !== userId) {
      return res
        .status(403)
        .json({ errorMessage: "다른 사람의 댓글은 삭제할 수 없습니다." });
    }

    try {
      await Comments.destroy({
        where: { commentId: commentId },
        attributes: [
          "commentId",
          "UserId",
          "PostId",
          "comment",
          "createdAt",
          "updatedAt",
        ],
      });
      return res.status(200).json({ message: "댓글이 삭제되었습니다." });
    } catch (error) {
      res.status(400).json({ errorMessage: "댓글 삭제에 실패하였습니다." });
    }
  }
);

module.exports = router;
