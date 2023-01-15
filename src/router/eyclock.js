const express = require("express");
const router = express.Router();
const query = require("../db/pool.js");
// 查
router.get("/user/list", function (req, res) {
    // 数据库操作
    let { id } = req.query;
    let sql = "SELECT * FROM user_list";
    // if (id) {
    //   sql += "where 1=1 and id ='" + id + "'";
    // }
    query(sql, function (err, result) {
        if (err) {
            res.send("err：" + err);
            return;
        }
        for (let i = 0; i < result.length; i++) {
            let t = new Date(result[i].upDate).toJSON();
            result[i].upDate = t.substring(0, 10);
            delete result[i].password;
        }
        res.send({ code: 200, msg: "ok", items: result });
    });
});
// 查
router.get("/user/list/:mail", function (req, res) {
    // 数据库操作
    let { mail } = req.params;
    let sql = `SELECT * FROM user_list where email = '${mail}'`;
    query(sql, function (err, result) {
        if (err) {
            res.send("err：" + err);
            return;
        }
        res.send({ code: 200, msg: "ok", items: result });
    });
});
// 增
router.post("/user/add", function (req, res) {
    //获取及处理增加的数据
    let { name, token, email, pwd } = req.body;
    let sql = `insert into user_list(name,token,email,password) values('${name}','${token}','${email}','${pwd}')`;
    query(sql, function (err, rows) {
        if (err) {
            res.send("err：" + err);
        } else {
            res.send({ code: 200, msg: "ok" });
        }
    });
});

// 删
router.delete("/user/del", function (req, res) {
    // 数据库操作
    let { id } = req.body;
    let sql = "delete from user_list where id=" + id;
    query(sql, function (err, rows) {
        if (err) {
            res.send("err：" + err);
        } else {
            res.send({ code: 200, msg: "ok" });
        }
    });
});
// 改
router.post("/user/update", function (req, res) {
    // 数据库操作
    let { id, token, email, pwd } = req.body;
    let sql = `update user_list set token='${token}',email='${email}' where id=${id} and password='${pwd}'`;
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
// 改密碼
router.post("/user/changepwd", function (req, res) {
    // 数据库操作
    let { email, oldpwd, newpwd } = req.body;
    let sql = `update user_list set password='${newpwd}' where email='${email}' and password='${oldpwd}'`;
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
// 用戶測試打卡
router.get("/user/testclock", function (req, res) {
    // 数据库操作
    let { id, pwd } = req.query;
    let sql = `SELECT * FROM user_list where id='${id}' and password='${pwd}'`;
    query(sql, function (err, result) {
        if (err) {
            res.send("err：" + err);
            return;
        } else if (result.length > 0) {
            res.send({ code: 200, msg: "ok" });
        } else {
            res.send("err");
        }
    });
});

// 修改打卡狀態
router.post("/user/changestatus", function (req, res) {
    let { email, clockStatus } = req.body;
    let sql = `update user_list set clockStatus='${clockStatus}' where email='${email}'`;
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

module.exports = router;