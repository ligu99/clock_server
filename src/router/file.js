const express = require("express");
const router = express.Router();
const xlsx = require("node-xlsx");
const path = require('path');
const Busboy = require('busboy');
const fs = require('fs');
const { randomFillSync } = require('crypto');
const iconv = require('iconv-lite');
const query = require("../db/pool.js");
// 忽略警告
iconv.skipDecodeWarning = true;

// 处理上传文件服务
router.post('/file/upload', (req, res) => {
    const { type } = req.query;
    let dir = type === "T" ? "toolupload_T" : "toolupload_D";
    const busboy = Busboy({ headers: req.headers });
    var saveTo = "", fileName = "";
    busboy.on('file', (fieldname, file, info) => {
        const { filename, encoding, mimeType } = info;
        fileName = iconv.decode(filename, 'utf8');
        saveTo = path.join(__dirname, "../../", dir, fileName);
        file.pipe(fs.createWriteStream(saveTo));
    });

    busboy.on('finish', function () {
        res.send({ code: 200, msg: "ok" });
        setTimeout(() => {
            readFileToDB(fileName, type);
        }, 1000);
    });

    return req.pipe(busboy);
});

// 文件下載服务
router.get('/file/download', (req, res) => {
    const { filePath, type } = req.query;
    let dir = type === "T" ? "toolupload_T" : "toolupload_D";
    const file = fs.createReadStream(path.join(__dirname, "../../", dir, filePath));
    res.writeHead(200, {
        'Content-Type': 'routerlication/force-download',
        'Content-Disposition': `attachment; filename=${encodeURIComponent(filePath)}`
    });
    file.pipe(res)
});
// 文件删除
router.delete('/file/delete', (req, res) => {
    const { filePath, type } = req.body;
    let dir = type === "T" ? "toolupload_T" : "toolupload_D";
    let url = path.join(__dirname, "../../", dir, filePath);
    let sql = `delete from file_list where filename='${filePath}'`;
    query(sql, function (err, rows) {
        if (err) {
            res.send("err：" + err);
        } else {
            if (fs.existsSync(url)) {
                fs.unlinkSync(url);
                res.send({ code: 200, msg: "ok" });
            } else {
                res.send({code: 201, msg: "文件不存在或已被删除" });
            }
        }
    });
});

// 获取一个哈希值
const random = (() => {
    const buf = Buffer.alloc(16);
    return () => randomFillSync(buf).toString('hex');
})();

// 读取表格数据写入数据库
function readFileToDB(file, type) {
    let dir = type === "T" ? "toolupload_T" : "toolupload_D";
    let dirpath = path.join(__dirname, "../../", dir, file);
    const sheets = xlsx.parse(dirpath);
    // 查看页面数
    // console.log(sheets.length);
    // 打印页面信息..
    const sheet = sheets[0];
    // 打印页面数据
    // console.log(sheet.data);
    // 表头
    let Title = sheet.data[2];
    let dataList = [];
    sheet.data.forEach((row, index) => {
        if (row.length <= 0) return;
        // 输出每行内容
        // console.log(row);
        //整一个新对象
        var NewVot = {}
        // 数组格式, 根据不同的索引取数据
        if (index <= 2) {//标题栏读过了，所以此处不读
            return
        } else {
            for (let i = 0; i < Title.length; i++) {
                Title[i] = Title[i].replace(/(\r\n)|(\n)/g, "");
                NewVot[Title[i]] = row[i] || null;
            }
            dataList.push(NewVot)
        }
    })
    let checkSql = `SELECT * From file_list where filename = '${file}' and filetype='${type}'`;
    let insertSql = `insert into file_list (filename,filedata,filetype) values ('${file}','${JSON.stringify(dataList)}','${type}')`;
    let updateSql = `update file_list set filedata='${JSON.stringify(dataList)}' where filename='${file}' and filetype='${type}'`;
    query(checkSql, function (err, result) {
        if (err) {
            console.log("err：" + err);
            return;
        } else {
            if (result.length > 0) {
                query(updateSql, function (err, result) {
                    if (err) {
                        console.log("err：" + err);
                        return;
                    }
                });
            } else {
                query(insertSql, function (err, result) {
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
router.get("/file/list", function (req, res) {
    // 数据库操作
    let { type } = req.query;
    let sql = `SELECT * FROM file_list where filetype = '${type}'`;
    query(sql, function (err, result) {
        if (err) {
            res.send("err：" + err);
            return;
        }
        res.send({ code: 200, msg: "ok", items: result });
    });
});
// 获取用户密码
router.post("/file/admin", function (req, res) {
    // 数据库操作
    let { pwd } = req.body;
    let sql = `SELECT * FROM file_list where filename = 'adminpwd' and filedata = '${pwd}'`;
    query(sql, function (err, result) {
        if (err) {
            res.send("err：" + err);
            return;
        }
        if (result.length > 0) {
            res.send({ code: 200, msg: "ok" });
        } else {
            res.send({ code: 201, msg: "密码错误" });
        }
    });
});

module.exports = router;