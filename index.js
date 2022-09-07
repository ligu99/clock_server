const express = require("express");
const mysql = require("mysql");
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

// const {connect} =require("./db/connnect.js")

// const host = ip=== "81.71.123.165" ? "localhost" : "81.71.123.165";

var connect = mysql.createConnection({
  host: "localhost",
  user: "root",
  port: "3306",
  password: "",
  database: "ey_clock",
  useConnectionPooling: true,// 解決Error: Cannot enqueue Query after fatal error
});
// 連接數據庫
connect.connect();

// 创建 application/x-www-form-urlencoded 编码解析(post方法)
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// 靜態資源服務器
app.use(express.static("./web/dist"))
//设置跨域访问
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// 查
app.get("/user/list", function(req, res) {
  // 数据库操作
  let { id } = req.query;
  let sql = "SELECT * FROM user_list";
  // if (id) {
  //   sql += "where 1=1 and id ='" + id + "'";
  // }

  connect.query(sql, function(err, result) {
    if (err) {
        res.send("err：" + err);
      return;
    }
    for(let i=0;i<result.length;i++){
        let t = new Date(result[i].upDate).toJSON();
        result[i].upDate=t.substring(0,10);
        delete result[i].password;
    }
    res.send({ code: 200, msg: "ok", items: result });
  });
});

// 增
app.post("/user/add", function(req, res) {
  //获取及处理增加的数据
  let {name,token,email,pwd} = req.body;
  let sql =`insert into user_list(name,token,email,password) values('${name}','${token}','${email}','${pwd}')`;
  connect.query(sql, function(err, rows) {
    if (err) {
      res.send("err：" + err);
    } else {
      res.send({ code: 200, msg: "ok" });
    }
  });
});

// 删
app.delete("/user/del", function(req, res) {
  // 数据库操作
  let {id} = req.body;
  let sql="delete from user_list where id=" + id;
  connect.query(sql, function(err, rows) {
    if (err) {
      res.send("err：" + err);
    } else {
      res.send({ code: 200, msg: "ok" });
    }
  });
});
// 改
app.post("/user/update", function(req, res) {
  // 数据库操作
  let {id,token,email,pwd} = req.body;
  let sql=`update user_list set token='${token}',email='${email}' where id=${id} and password='${pwd}'`;
  connect.query(sql, function(err, rows) {
    if (err) {
      res.send("err：" + err);
    } else if(rows.changedRows!=0 || rows.affectedRows!=0) {
      res.send({ code: 200, msg: "ok" });
    }else{
      res.send({ code: 201, msg: "修改失敗！" });
    }
  });
});
// 改密碼
app.post("/user/changepwd", function(req, res) {
  // 数据库操作
  let {email,oldpwd,newpwd} = req.body;
  let sql=`update user_list set password='${newpwd}' where email='${email}' and password='${oldpwd}'`;
  connect.query(sql, function(err, rows) {
    if (err) {
      res.send("err：" + err);
    } else if(rows.changedRows!=0 || rows.affectedRows!=0) {
      res.send({ code: 200, msg: "ok" });
    }else{
      res.send({ code: 201, msg: "修改失敗！" });
    }
  });
});
// 用戶測試打卡
app.get("/user/testclock", function(req, res) {
  // 数据库操作
  let { id,pwd } = req.query;
  let sql = `SELECT * FROM user_list where id='${id}' and password='${pwd}'`;

  connect.query(sql, function(err, result) {
    if (err) {
      res.send("err：" + err);
      return;
    } else if(result.length>0) {
      res.send({ code: 200, msg: "ok" });
    }else{
      res.send("err");
    }
  });
});

// 修改打卡狀態
app.post("/user/changestatus", function(req, res) {
  let {email,clockStatus} = req.body;
  let sql=`update user_list set clockStatus='${clockStatus}' where email='${email}'`;
  connect.query(sql, function(err, rows) {
    if (err) {
      res.send("err：" + err);
    } else if(rows.changedRows!=0 || rows.affectedRows!=0) {
      res.send({ code: 200, msg: "ok" });
    }else{
      res.send({ code: 201, msg: "修改失敗！" });
    }
  });
});

// 修改媒体ID
app.post("/media/change", function(req, res) {
  let {mediaId} = req.body;
  let sql=`update media_list set mediaId='${mediaId}' where id='1'`;
  connect.query(sql, function(err, rows) {
    if (err) {
      res.send("err：" + err);
    } else if(rows.changedRows!=0 || rows.affectedRows!=0) {
      res.send({ code: 200, msg: "ok" });
    }else{
      res.send({ code: 201, msg: "修改失敗！" });
    }
  });
});
// 查
app.get("/media/list", function(req, res) {
  let sql = "SELECT * FROM user_list where id=1";
  connect.query(sql, function(err, result) {
    if (err) {
        res.send("err：" + err);
      return;
    }
    res.send({ code: 200, msg: "ok", items: result });
  });
});


app.listen(port, () => {
  console.log("服務已啓動:"+new Date(Date.now()));
  console.log(`Service is running! http://localhost:${port}`);
});
