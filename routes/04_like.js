const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const { Likes, Users, Posts } = require("../models");
const router = express.Router();
const { Op } = require("sequelize"); // sequelize 연산자 문법 Op 사용을 위한 호출

// 게시글 좋아요 API
router.put("/posts/:postId/like", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;

  if (!userId) {
    return res.status(403).json({ errorMessage: "로그인 후 사용 가능합니다." });
  }

  console.log("현재 접속한 사용자의 ID", userId);

  const post = await Posts.findOne({
    where: { postId: postId },
    attribute: ["liked"],
  });
  //   console.log(post)
  console.log("현재 게시글의 좋아요 수", post.dataValues.liked);

  if (!post) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  try {
    // 좋아요, 좋아요 취소 로직
    const didILike = await Likes.findOne({
      where: { [Op.and]: [{ PostId: postId }, { UserId: userId }] },
    });
    // console.log("좋아요했던가?", didILike);

    if (!didILike) {
      // 없다면 좋아요 등록
      await Likes.create({ PostId: postId, UserId: userId });
      return res.status(200).json({ LIKE: "해당 게시글에 좋아요 했습니다." });
    } else if (didILike) {
      // 있다면 좋아요 취소
      await Likes.destroy({
        where: { [Op.and]: [{ PostId: postId }, { UserId: userId }] },
      });

      return res
        .status(200)
        .json({ CANCEL: "해당 게시글의 좋아요를 취소했습니다." });
    }
    // 기능 작동은 하는데 이런 식으로 하면 likeId가 끝도없이 계속 늘어난다..
    // 당장은 괜찮겠지만 12351235125 이 정도로 늘어나면 문제 생길텐데
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "좋아요 작업에 실패했습니다." });
  }
});

// 좋아요 게시글 조회 API
router.get("/posts/like", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  if (!userId) {
    return res.status(403).json({ errorMessage: "로그인 후 사용 가능합니다." });
  }

  // include 써서..?
  // 내 계정의 좋아요한 게시글
  // 좋아요 테이블에 있는 내 계정의 userid를 싹 불러와서
  // 해당 행에서 postid를 불러오고...

  //   - 로그인 토큰에 해당하는 사용자가 좋아요 한 글에 한해서, 조회할 수 있게 하기
  //   - 제목, 작성자명(nickname), 작성 날짜, 좋아요 갯수를 조회하기

  // const likePosts = await
  //const posts = await Posts.findAll({
  // include: [{ model: Users, attributes: ["email"] }],
  // attributes: ["postId","userId", "email", "title", "createdAt", "updatedAt"],
  // order: [["liked", "DESC"]],
  //   });
  // return res.status(200).json({posts:likePosts})
  //   - 제일 좋아요가 많은 게시글을 맨 위에 정렬하기 (내림차순)

  // 로직
  //   # 200 좋아요 게시글 조회에 성공한 경우
  // {
  // "posts": [
  // {
  // "postId": 4,
  // "userId": 1,
  // "nickname": "Developer",
  // "title": "안녕하세요 4번째 게시글 제목입니다.",
  // "createdAt": "2022-07-25T07:58:39.000Z",
  // "updatedAt": "2022-07-25T07:58:39.000Z",
  // "likes": 1
  // }
  // ]
  // }

  try {
    // 좋아요 조회 로직
    // return res.status(200).json({yourLIkePosts:likePosts})
    console.log("try 안까진 들어옴");
    return;
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "좋아요 게시글 조회에 실패하였습니다." });
  }
});

module.exports = router;
