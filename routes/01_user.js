const express = require("express");
const jwt = require("jsonwebtoken");
const { Users } = require("../models");
const router = express.Router();

// 회원 가입 API
router.post("/users", async (req, res) => {
  const { email, password, pwCheck } = req.body;

  const validEmailCheck = (string) => {
    const pattern = /^[a-zA-Z0-9]+@[a-zA-Z]+\.[A-Za-z]+$/;
    return pattern.test(string);
  };

  if (!validEmailCheck(email) || email.length < 3) {
    return res
      .status(400)
      .json({ errorMessage: "닉네임의 형식이 올바르지 않습니다." });
  }

  if (!password || password < 4) {
    return res
      .status(412)
      .json({ errorMessage: "패스워드는 4자이상이어야 합니다." });
  }

  if (password !== pwCheck) {
    return res.status(412).json({
      errorMessage:
        "패스워드가 일치하지 않습니다. 패스워드 재입력은 pwCheck 입니다.",
    });
  }

  const isExistUser = await Users.findOne({ where: { email: email } });
  if (isExistUser) {
    return res
      .status(412)
      .json({ errorMessage: "이미 존재하는 이메일입니다." });
  }

  try {
    await Users.create({ email, password });
    return res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "회원 가입에 실패하였습니다." });
  }
});

// 로그인 API
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await Users.findOne({
    where: { email: email },
  });

  if (!user) {
    return res
      .status(401)
      .json({ errorMessage: "해당하는 사용자가 존재하지 않습니다." });
  } else if (user.password !== password) {
    return res
      .status(401)
      .json({ errorMessage: "비밀번호가 일치하지 않습니다." });
  }

  try {
    // JWT 생성
    const token = jwt.sign(
      {
        userId: user.userId,
      },
      "customized_secret_key"
    );

    // 2. 쿠키 발급
    res.cookie("authorization", `Bearer ${token}`);

    // 3. response
    return res.status(200).json({ message: "로그인에 성공하였습니다." });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "로그인에 실패하였습니다." });
  }
});

// 좋아요한 게시글 조회 API
router.get("users/:userId", async (req, res) => {
  // 에러 처리
  // 403 로그인이 필요한 기능입니다.
  // 예외 400 좋아요한 게시글 조회에 실패하였습니다.
});

// 사용자 목록 조회 API. 개발용
router.get("/users", async (req, res) => {
  const userIdToFind = await Users.findAll({
    attributes: ["userId", "email", "password", "createdAt", "updatedAt"],
    order: [["createdAt", "DESC"]],
  });

  return res.status(200).json({ data: userIdToFind });
});

// 사용자 삭제 API. 개발용
router.delete("/users/:userId", async (req, res) => {
  const { userId } = req.params;

  const userIdToDelete = await Users.findOne({
    where: { userId: userId },
  });

  if (!userIdToDelete) {
    return res.status(404).json({ message: "없는데요?" });
  }

  await userIdToDelete.destroy();
  return res.status(200).json({ message: "삭제되었습니다." });
});

module.exports = router;
