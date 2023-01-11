const express = require("express");
const bodyParser = require('body-parser');
const Busboy = require('busboy');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;
const xlsx = require("node-xlsx");
const { randomFillSync } = require('crypto');
const os = require('os');
const iconv = require('iconv-lite');
const query =require("./db/pool.js");
// 忽略警告
iconv.skipDecodeWarning = true;

// const host = ip=== "81.71.123.165" ? "localhost" : "81.71.123.165";
// var connect = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   port: "3306",
//   password: "",
//   database: "ey_clock",
//   useConnectionPooling: true,// 解決Error: Cannot enqueue Query after fatal error
// });
// // 連接數據庫
// connect.connect();

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
  query(sql, function(err, result) {
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
  query(sql, function(err, rows) {
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
  query(sql, function(err, rows) {
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
  query(sql, function(err, rows) {
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
  query(sql, function(err, rows) {
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
  query(sql, function(err, result) {
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
  query(sql, function(err, rows) {
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
  query(sql, function(err, rows) {
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
  query(sql, function(err, result) {
    if (err) {
        res.send("err：" + err);
      return;
    }
    res.send({ code: 200, msg: "ok", items: result });
  });
});

// 查电影
app.get("/movie", function(req, res) {
  let { cnname } = req.query;
  // let sql = `SELECT * FROM yyets where cnname = '${cnname}' limit 0,50`;
  let sql = `SELECT * FROM yyets where cnname LIKE '%${cnname}%' limit 0,50`;
  query(sql, function(err, result) {
    if (err) {
        res.send("err：" + err);
      return;
    }
    res.send({ code: 200, msg: "ok", data: result });
  });
});

// 处理上传文件服务
app.post('/upload', (req, res) => {
  const { type } =  req.query;
  const busboy = Busboy({ headers: req.headers });
  var saveTo = "",fileName="";
  busboy.on('file', (fieldname, file, info) => {
    const { filename, encoding, mimeType } = info;
    fileName = iconv.decode(filename, 'utf8');
    saveTo = path.join(__dirname, 'toolupload', fileName);
    file.pipe(fs.createWriteStream(saveTo));
  });

  busboy.on('finish', function () {
    res.send({ code: 200, msg: "ok"});
    setTimeout(() => {
      readFileToDB(fileName,type);
    }, 1000);
  });

  return req.pipe(busboy);
});

// 文件下載服务
app.get('/file/download', (req, res) => {
  const {filePath} =  req.query;
  const file = fs.createReadStream(path.join(__dirname, 'toolupload',filePath));
  res.writeHead(200, {
    'Content-Type': 'application/force-download',
    'Content-Disposition': `attachment; filename=${filePath}`
  });
  file.pipe(res)
});

// 获取一个哈希值
const random = (() => {
  const buf = Buffer.alloc(16);
  return () => randomFillSync(buf).toString('hex');
})();

// 读取表格数据写入数据库
function readFileToDB(file,type){
  const sheets = xlsx.parse("./toolupload/"+file);
  // 查看页面数
  // console.log(sheets.length);
  // 打印页面信息..
  const sheet = sheets[0];
  // 打印页面数据
  // console.log(sheet.data);
  // 表头
  let Title = sheet.data[0];
  let dataList=[];
  sheet.data.forEach((row,index) => {
      // 输出每行内容
      // console.log(row);
      //整一个新对象
      var NewVot = {}
      // 数组格式, 根据不同的索引取数据
      if (index == 0){//标题栏读过了，所以此处不读
        return
      } else {
        for(var i = 0 ; i < Title.length ; i++ ){
            NewVot[Title[i]] = row[i]
        }
        dataList.push(NewVot)
      }
  })
  let checkSql = `SELECT * From file_list where filename = '${file}'`;
  let insertSql =`insert into file_list (filename,filedata,filetype) values ('${file}','${JSON.stringify(dataList)}','${type}')`;
  let updateSql=`update file_list set filedata='${JSON.stringify(dataList)}' where filename='${file}'`;
  query(checkSql, function(err, result) {
    if (err) {
      console.log("err：" + err);
      return;
    }else{
      if(result.length>0){
        query(updateSql, function(err, result) {
          if (err) {
            console.log("err：" + err);
            return;
          }
        });
      }else{
        query(insertSql, function(err, result) {
          if (err) {
            console.log("err：" + err);
            return;
          }
        });
      }
    }
  });
}

// 文件列表
app.get("/file/list", function(req, res) {
  // 数据库操作
  let { type } = req.query;
  let sql = `SELECT * FROM file_list where filetype = '${type}'`;
  query(sql, function(err, result) {
    if (err) {
        res.send("err：" + err);
      return;
    }
    res.send({ code: 200, msg: "ok", items: result });
  });
});

app.listen(port, () => {
  console.log("更新Token+电影搜索+公众号修改媒体ID等服務已啓動:"+new Date(Date.now()));
  console.log(`Service is running! http://localhost:${port}`);
});
