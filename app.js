const express = require("express");
const cookieParser = require("cookie-parser"); // auth-middleware.js에서 쿠키 정보 받아오기

const app = express();
const PORT = 3000;

const userRouter = require("./routes/01_user");
const postsRouter = require("./routes/02_post");
const commentsRouter = require("./routes/03_comment");
const likesRouter = require("./routes/04_like");

app.use(express.json());
app.use(cookieParser()); // auth-middleware.js에서 쿠키 정보 받아오기
app.use("/api", [userRouter, postsRouter, commentsRouter, likesRouter]);

app.listen(PORT, () => {
  console.log(PORT, "포트 번호로 서버가 실행되었습니다.");
});
