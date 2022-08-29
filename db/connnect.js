var mysql = require("mysql");
var ip = require('ip');
var ip = ip.address();

const host = ip=== "81.71.123.165" ? "localhost" : "81.71.123.165";

var connect = mysql.createConnection({
  host: host,
  user: "root",
  port: "3306",
  password: "",
  database: "ey_clock",
  useConnectionPooling: true,// 解決Error: Cannot enqueue Query after fatal error
});
// 連接數據庫
connect.connect();

//將該連線拋給外部進行訪問
module.exports = {connect};
