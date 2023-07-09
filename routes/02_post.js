const express = require("express");
const { Users, Posts } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();

// 게시글 작성 API
router.post("/posts", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { title, content } = req.body;

  if (!userId) {
    res.status(403).json({ errorMessage: "로그인 후 사용 가능합니다." });
    return;
  }

  if (!title) {
    res
      .status(412)
      .json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
    return;
  }

  if (!content) {
    res
      .status(412)
      .json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
    return;
  }

  try {
    const post = await Posts.create({
      title,
      content,
      UserId: userId,
    });
    res.status(201).json({ data: post });
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 작성에 실패하였습니다." });
  }
});

// 게시글 목록 조회 API
router.get("/posts", async (req, res) => {
  try {
    const posts = await Posts.findAll({
      include: [{ model: Users, attributes: ["email"] }],
      attributes: ["postId", "title", "content", "createdAt", "updatedAt"],
      order: [["createdAt", "DESC"]],
      // 생성일을 기준으로 내립차순으로 정렬
    });

    return res.status(200).json({ posts: posts });
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

// 게시글 상세 조회 API
router.get("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Posts.findOne({
      include: [{ model: Users, attributes: ["userId", "email"] }],
      attributes: [
        "postId",
        "title",
        "content",
        "liked",
        "createdAt",
        "updatedAt",
      ],
      where: { postId: postId },
    });

    if (!post) {
      return res
        .status(404)
        .json({ errorMessage: "게시글을 찾을 수 없습니다." });
    }

    return res.status(200).json({ post: post });
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }

  // 추가 하고 싶은 내용
  // 게시글 상세 조회 시 달린 댓글이 몇 개인지, 달린 좋아요가 몇 개인지
  // 좋아요한 사람이 누구인지
});

// 게시글 수정 API
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;
  const { title, content } = req.body;

  const post = await Posts.findOne({
    where: { postId: postId },
    include: [{ model: Users, attributes: ["userId"] }],
  });
  console.log("현재 접속한 사용자의 ID", userId);

  if (!post) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  if (!userId) {
    return res.status(403).json({
      errorMessage:
        "게시글 수정 권한이 존재하지 않습니다. 로그인 후 사용 가능합니다.",
    });
  }

  if (post.User.userId !== userId) {
    console.log("게시글 작성자의 ID", post.User.userId);
    return res
      .status(403)
      .json({ errorMessage: "다른 사람의 게시글은 수정할 수 없습니다." });
  }

  if (!title) {
    res
      .status(412)
      .json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
    return;
  }

  if (!content) {
    res
      .status(412)
      .json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
    return;
  }

  try {
    await Posts.update(
      {
        title,
        content,
      },
      { where: { postId: postId } }
    );
    return res.status(200).json({ message: "게시글이 수정되었습니다." });
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 수정에 실패하였습니다." });
  }
});

// 게시글 삭제 API
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;

  const post = await Posts.findOne({
    where: { postId: postId },
    include: [{ model: Users, attributes: ["userId"] }],
  });
  console.log("현재 접속한 사용자의 ID", userId);

  if (!post) {
    return res.status(404).json({
      errorMessage: "게시글이 존재하지 않습니다.",
    });
  }

  if (!userId) {
    return res.status(403).json({
      errorMessage:
        "게시글의 삭제 권한이 존재하지 않습니다. 로그인 후 사용 가능합니다.",
    });
  }

  if (post.User.userId !== userId) {
    console.log("게시글 작성자의 ID", post.User.userId);
    return res
      .status(403)
      .json({ errorMessage: "다른 사람의 게시글은 삭제할 수 없습니다." });
  }

  try {
    await Posts.destroy({
      where: { postId: postId },
      attributes: [
        "postId",
        "UserId",
        "title",
        "content",
        "liked",
        "createdAt",
        "updatedAt",
      ],
    });
    return res.status(200).json({ message: "게시글이 삭제되었습니다." });
  } catch (error) {
    res.status(400).json({ errorMessage: "게시글 삭제에 실패하였습니다." });
  }
});

module.exports = router;
