var mysql = require("mysql");
const { DBHOST, DBPASSWORD } = require("./config.json");
var pool = mysql.createPool({
    host: DBHOST,
    user: "root",
    port: "3306",
    password: DBPASSWORD,
    database: "ey_clock",
    useConnectionPooling: true,// 解決Error: Cannot enqueue Query after fatal error
    multipleStatements: true // 支持执行多条 sql 语句
});

var query = function (sql, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log("建立连接失败");
        } else {
            // console.log("建立连接成功");
            // console.log(pool._allConnections.length); //  1
            connection.query(sql, function (err, rows) {
                if (err) {
                    console.log("查询失败");
                    callback(err, null)
                } else {
                    // console.log(rows);
                    callback(null, rows)
                }
                // 当不再使用时，归还到连接池中
                connection.release();
                // 当不再使用时并要从连接池中移除
                connection.destroy();
                // console.log(pool._allConnections.length);  // 0
            })
        }
    })
};

module.exports = query;