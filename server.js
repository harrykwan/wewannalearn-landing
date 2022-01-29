require("dotenv").config();
const fs = require("fs");
var https = require("https");
// var http = require("http");
// var privateKey = fs.readFileSync("./server.key", "utf8");
// var certificate = fs.readFileSync("./server.cert", "utf8");
// var credentials = {
//   key: privateKey,
//   cert: certificate,
//   ca: [fs.readFileSync("./gd_1.crt"), fs.readFileSync("./gd_1.crt")],
// };

// sslpkpath="/etc/letsencrypt/live/wewannalearn.com/privkey.pem"
// sslcertpath="/etc/letsencrypt/live/wewannalearn.com/fullchain.pem"

var privateKey = fs.readFileSync(process.env.sslpkpath, "utf8");
var certificate = fs.readFileSync(process.env.sslcertpath, "utf8");
var credentials = {
  key: privateKey,
  cert: certificate,
};

const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const db = new JsonDB(new Config("myDataBase", true, false, "/"));
const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const stripe = require("stripe")(process.env.stripe_sk); // Add your Secret Key Here
console.log(process.env.stripe_sk);
console.log(process.env.port);
const app = express();
app.use(cors());

// This will make our form data much more useful
app.use(bodyParser.urlencoded({ extended: true }));

// This will set express to render our views folder, then to render the files as normal html
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

app.use(express.static(path.join(__dirname, "./views")));

// app.get("/", (req, res, next) => {
//   return res.status(200).json({
//     message: "Hello from root!",
//   });
// });

app.get("/", (req, res, next) => {
  return res.render("./index.html");
});

app.get("/Minibus-Sign-Calligraphy", (req, res, next) => {
  return res.render("./tutorintro1.html", {});
});

app.get("/Hong-Kong-Nunchaku", (req, res, next) => {
  return res.render("./tutorintro2.html", {});
});

app.get("/Hong-Kong-Comfort-Food-Cooking", (req, res, next) => {
  return res.render("./tutorintro3.html", {});
});

app.get("/teach", (req, res, next) => {
  return res.render("./joinus.html", {});
});

app.get(
  "/.well-known/acme-challenge/hHweofG2gEvExw2U8QIThkAiopM4fKZzC-dLCvnk_Ic",
  (req, res, next) => {
    return res.send(
      "hHweofG2gEvExw2U8QIThkAiopM4fKZzC-dLCvnk_Ic.WPopRAMiK7fq896tKu_f55uKd7J41QCJN1ZvAHsP6Gs"
    );
  }
);

app.get("/getaddoncount", (req, res, next) => {
  try {
    let getaddoncount = db.count("/minibusaddon/list");
    console.log(getaddoncount);
    if (getaddoncount) res.send("" + getaddoncount);
    else res.send("0");
  } catch (e) {
    console.log(e);
    res.send(0);
  }
});

app.get("/charge", (req, res, next) => {
  const coursetourl = {
    "Minibus-Sign-Calligraphy": "minibus",
    "Hong-Kong-Nunchaku": "nunchaku",
    "Hong-Kong-Comfort-Food-Cooking": "cooking",
  };
  if (!coursetourl[req.query.course]) {
    return res.render("./charge_" + "minibus" + ".html", {
      warning: "",
    });
  } else {
    return res.render("./charge_" + coursetourl[req.query.course] + ".html", {
      warning: "",
    });
  }
});

app.post("/charge", (req, res) => {
  const coursepricelist = {
    minibus: 399,
    minibusaddon: 399 + 99,
    doublestick: 399,
    doublestickaddon: 399 + 299,
    saurce: 399,
    saurceaddon: 399 + 138,
  };

  const courseimglist = {
    minibus: "http://wewannalearn.com/img/homepage/busvideopreview.jpg",
    minibusaddon: "http://wewannalearn.com/img/homepage/busvideopreview.jpg",
    doublestick:
      "http://wewannalearn.com/img/homepage/doublestickvideopreview.jpg",
    doublestickaddon:
      "http://wewannalearn.com/img/homepage/doublestickvideopreview.jpg",
    saurce: "http://wewannalearn.com/img/homepage/saurcevideopreview.jpg",
    saurceaddon: "http://wewannalearn.com/img/homepage/saurcevideopreview.jpg",
  };

  const emailtitlelist = {
    minibus: "【匠人精神！手寫小巴牌網上課程】多謝你的訂購！",
    minibusaddon: "【匠人精神！手寫小巴牌網上課程】多謝你的訂購！",
    doublestick: "【型爆！雙節棍入門網上課程】多謝你的訂購！",
    doublestickaddon: "【型爆！雙節棍入門網上課程】多謝你的訂購！",
    saurce: "【快靚正！香港味道煮食網上課程】多謝你的訂購！",
    saurceaddon: "【快靚正！香港味道煮食網上課程】多謝你的訂購！",
  };

  try {
    const courseprice = coursepricelist[req.body.coursecode]
      ? coursepricelist[req.body.coursecode] * 100
      : 0;
    if (coursepricelist == 0) throw "wrong course code";

    const emailtitle = emailtitlelist[req.body.coursecode]
      ? emailtitlelist[req.body.coursecode]
      : "多謝購買課程";

    if (req.body.coursecode == "minibusaddon") {
      db.push("/minibusaddon/list[]", req.body);
    }

    stripe.customers
      .create({
        name: req.body.name ? req.body.name : "",
        email: req.body.email ? req.body.email : "",
        phone: req.body.phone ? req.body.phone : "",
        // address: req.body.address ? req.body.address : "",
        source: req.body.stripeToken,
      })
      .then(
        (customer) =>
          stripe.charges
            .create({
              amount: courseprice,
              currency: "hkd",
              customer: customer.id,
            })
            .then((x) => {
              console.log(x);
              res.render("./completed_" + req.body.course + ".html");
              var options = {
                method: "POST",
                url: "https://docs.google.com/forms/u/1/d/e/1FAIpQLScDpQR2gQ4EhmkOlFX6JXWSjwDCDYMUAfZvB4qRL7xyeXy3kQ/formResponse",
                formData: {
                  "entry.1896806186": req.body.name ? req.body.name : "",
                  "entry.673454844": req.body.phone ? req.body.phone : "",
                  "entry.1920172636": req.body.email ? req.body.email : "",
                  "entry.1648267103": req.body.coursecode + " " + courseprice,
                  "entry.1337606191": req.body.address ? req.body.address : "",
                },
              };
              request(options, function (error, response) {
                if (error) console.log(error);
                // console.log(response.body);
              });
              var options = {
                method: "POST",
                url: "https://irq3jumapc.execute-api.us-east-1.amazonaws.com/dev/paymentconfirm",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  subject: emailtitle,
                  to: req.body.email,
                  courseimg: courseimglist[req.body.coursecode],
                }),
              };
              request(options, function (error, response) {
                if (error) throw new Error(error);
                console.log(response.body);
              });
            })
        // .then(() =>
        //   res.render(req.body.url.split("charge.html").join("completed.html"))
        // )
      )
      // .then(() => res.render("./completed.html"))
      .catch((err) => {
        console.log(err);
        res.render("./charge_" + req.body.course + ".html", {
          warning: err.raw.message ? err.raw.message : "Error",
        });
      });
  } catch (err) {
    console.log(err);
    res.render("./charge_" + req.query.course + ".html", {
      warning: "Error",
    });
  }
});

app.post("/newaccount", (req, res) => {
  console.log(req.body);
  var options = {
    method: "POST",
    url: "https://docs.google.com/forms/u/1/d/e/1FAIpQLSddTSIEeVOtRiy6QI2UeBCuIvNpOMwl5dDMxo3d-ATFfvqVGQ/formResponse",
    formData: {
      "entry.715279161": req.body.name ? req.body.name : "",
      "entry.1341847609": req.body.email ? req.body.email : "",
      "entry.2013507720": req.body.course ? req.body.course : "",
    },
  };
  request(options, function (error, response) {
    if (error) console.log(error);
    // console.log(response.body);
    res.redirect("/charge?course=" + req.body.course);
  });
});

app.use(bodyParser.json());

app.post("/contactus", (req, res) => {
  var options = {
    method: "POST",
    url: "https://irq3jumapc.execute-api.us-east-1.amazonaws.com/dev/contactus",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject: req.body.subject,
      text: req.body.text,
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    res.send(response.body);
  });
});

// Future Code Goes Here

// var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
const port = 80;
app.listen(port, () => console.log("Server is running..."));
// httpServer.listen(80);
httpsServer.listen(443);
