const axios = require("axios");
function toClock(token) {
  axios({
    method: "post",
    url: "https://eyme.eyadvisory.cn/timesheet/save",
    data: {
      city: "广州市",
      country: "中国",
      dateType: "0",
      myHealth: "一切正常",
      district: "天河区",
      province: "广东省",
    },
    headers: {
      "Content-Type": "application/json",
      "AC-Token": `WX-AUTH ${token}`,
    },
  })
    .then(res => {

    })
    .catch(error => {

    });
}

module.exports = {toClock};
