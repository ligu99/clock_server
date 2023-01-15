const express = require("express");
const router = express.Router();
const query = require("../db/pool.js");
// 修改媒体ID
router.post("/media/change", function (req, res) {
    let { mediaId } = req.body;
    let sql = `update media_list set mediaId='${mediaId}' where id='1'`;
    query(sql, function (err, rows) {
        if (err) {
            res.send("err：" + err);
        } else if (rows.changedRows != 0 || rows.affectedRows != 0) {
            res.send({ code: 200, msg: "ok" });
        } else {
            res.send({ code: 201, msg: "修改失敗！" });
        }
    });
});
// 查
router.get("/media/list", function (req, res) {
    let sql = "SELECT * FROM user_list where id=1";
    query(sql, function (err, result) {
        if (err) {
            res.send("err：" + err);
            return;
        }
        res.send({ code: 200, msg: "ok", items: result });
    });
});

module.exports = router;