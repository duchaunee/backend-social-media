import express from "express";
import authRouter from "./auth.routes.js";
import usersRouter from "./users.routes.js";
import postsRouter from "./posts.routes.js";

const router = express.Router();
// const router1 = express.Router();
// const router2 = express.Router();

// router.use("/api", router1.use("/v1", router2.use("/auth", authRouter)));
// router2.use("/auth", authRouter);
// router1.use("/v1", router2);
// router.use("/api", router1);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/posts", postsRouter);

export default router;
