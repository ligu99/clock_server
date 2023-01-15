const express = require("express");
const router = express.Router();

const eyclock = require("./eyclock");
const file = require("./file");
const media = require("./media");

// router.use("/user",eyclock);前面有/user，那模块里面的接口地址则不用写/user
router.use(eyclock);
router.use(file);
router.use(media);

module.exports = router;