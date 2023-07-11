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

  if (!post) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }
  console.log(post);
  console.log("현재 게시글의 좋아요 수", post.dataValues.liked);

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
router.get("/likePost", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  if (!userId) {
    return res.status(403).json({ errorMessage: "로그인 후 사용 가능합니다." });
  }

  // 앞으로 진행할 개선 사항
  // posts 모델에 컬럼 liked를 추가한 이유는
  // 게시글 상세 조회했을때
  // 해당 게시글에 좋아요가 몇개 찍혀있는지 확인하고 싶어서

  // posts 모델에서 컬럼 liked 빼고, (혹은 사용하지 않되 일단 두고)
  // 게시글 상세 조회에서의 좋아요는 Likes.findAll 해서 컬럼 PostId와
  // 파라미터 postId가 일치하는 데이터 몇개인지 불러오는 식으로 처리할 것.

  // 하고 싶은 것
  // 현재 로그인한 사용자가 좋아요 등록했던 게시글을 나열
  // 1. Likes 테이블에서 현재 로그인한 사용자와 userId가 같은 데이터 추출

  // 2. 1의 내용 중 PostID와 Posts 테이블의 postId가 일치하는 데이터를 추출

  // 3. 2의 내용을 postId, userId, email, title, createdAt, updatedAt으로 출력

  // 4. 좋아요 개수 파악하기

  // 5. 좋아요가 높은 게시글부터 정렬

  const likedPost = await Likes.findAll({
    where: { UserId: userId },
    attributes: ["UserId"],
    include: {
      model: Posts,
      // where: { postId: postId },
      attributes: [
        "postId",
        "UserId",
        "title",
        "content",
        "createdAt",
        "updatedAt",
      ],
    },
    // order:[["liked", "DESC"]],
  });

  try {
    // 좋아요 조회 로직
    console.log("try 안까진 들어옴");
    return res.status(200).json({ yourLIkePosts: likedPost });
    // return;
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "좋아요 게시글 조회에 실패하였습니다." });
  }
});

module.exports = router;
