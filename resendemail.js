const request = require("request");
const title = "型爆！雙節棍入門網上課程】多謝你的訂購！";
const email = "kinkcl@gmail.com";
var options = {
  method: "POST",
  url: "https://irq3jumapc.execute-api.us-east-1.amazonaws.com/dev/paymentconfirm",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    subject: title,
    to: email,
    courseimg:
      "https://imagedelivery.net/F-3JVW4H1_xFj9Tfzrx6uA/1398af81-3a30-4b9f-db9b-e41f9a310900/public",
  }),
};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});
