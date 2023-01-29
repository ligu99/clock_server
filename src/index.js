const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const query = require("./db/pool.js");
const allRouter = require("./router");
const { PORT } = require("./config.json");

// 创建 application/x-www-form-urlencoded 编码解析(post方法)
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// 靜態資源服務器
app.use(express.static("../web/dist"))
//设置跨域访问
app.all('*', function (req, res, next) {
  const allOrigin = [
    "http://token.philnote.cc", "http://movie.philnote.cc", "http://tool.philnote.cc",
    "http://81.71.123.165:3000", "http://81.71.123.165:8002", "http://81.71.123.165:8010", 
    "http://localhost:8080", "http://localhost:8084"
  ];
  let allowOrigin = "http://81.71.123.165:3000";// "*" 表示所有
  if (allOrigin.includes(req.headers.origin)) {
    allowOrigin = req.headers.origin
  }
  res.header("Access-Control-Allow-Origin", allowOrigin);
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1');
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

// 所有路由
app.use(allRouter);

// 查电影(只有一个接口，就不放到模块里面了)
app.get("/movie", function (req, res) {
  let { cnname } = req.query;
  // let sql = `SELECT * FROM yyets where cnname = '${cnname}' limit 0,50`;
  let sql = `SELECT * FROM yyets where cnname LIKE '%${cnname}%' limit 0,50`;
  query(sql, function (err, result) {
    if (err) {
      res.send("err：" + err);
      return;
    }
    res.send({ code: 200, msg: "ok", data: result });
  });
});

app.listen(PORT, () => {
  console.log("后端服務已啓動:" + new Date(Date.now()));
  console.log(`Service is running! http://localhost:${PORT}`);
});
