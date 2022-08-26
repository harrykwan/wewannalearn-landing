require("dotenv").config();
const fs = require("fs");
var https = require("https");
var md5 = require("md5");
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

function addboughtcourse(email, courseid, name, phone) {
  const userid = md5(email);
  var options = {
    method: "POST",
    url: "https://0e1xi0dbje.execute-api.us-east-1.amazonaws.com/addcourse",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userid: userid,
      courseid: courseid,
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });

  options = {
    method: "GET",
    url:
      "https://app.wewannalearn.com/api/newaccount?name=" +
      encodeURIComponent(name) +
      "&email=" +
      encodeURIComponent(email) +
      "&phone=" +
      encodeURIComponent(phone),
    headers: {},
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
}

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

app.get("/test_completed", (req, res, next) => {
  return res.render("./completed_testing.html", {});
});

app.get(
  "/.well-known/acme-challenge/KEeTn_nJMa8VfFngJBEYyyfgQE3Eyiky5zfeUnmA6EU",
  (req, res, next) => {
    return res.send(
      "KEeTn_nJMa8VfFngJBEYyyfgQE3Eyiky5zfeUnmA6EU.WPopRAMiK7fq896tKu_f55uKd7J41QCJN1ZvAHsP6Gs"
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
    res.send("0");
  }
});

app.get("/charge", (req, res, next) => {
  const coursetourl = {
    "Minibus-Sign-Calligraphy": "minibus",
    "Hong-Kong-Nunchaku": "doublestick",
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

app.get("/refer/:refername", (req, res, next) => {
  const coursetourl = {
    "Minibus-Sign-Calligraphy": "minibus",
    "Hong-Kong-Nunchaku": "doublestick",
    "Hong-Kong-Comfort-Food-Cooking": "cooking",
  };

  if (!coursetourl[req.query.course]) {
    return res.render("./charge_" + "minibus_refer" + ".html", {
      warning: "",
      refer: req.params.refername,
    });
  } else {
    return res.render(
      "./charge_" + coursetourl[req.query.course] + "_refer.html",
      {
        warning: "",
        refer: req.params.refername,
      }
    );
  }
});

app.post("/charge", (req, res) => {
  let coursepricelist = {
    minibus: 499,
    minibusaddon: 499 + 99,
    doublestick: 499,
    doublestickaddon: 499 + 299,
    saurce: 499,
    saurceaddon: 499 + 139,
  };

  if (req.body.refer) {
    options = {
      method: "POST",
      url: "https://docs.google.com/forms/u/0/d/e/1FAIpQLScU_I4z95wLrsdaLL-o5YT06iezsyCZecUkSrDsY5q6zHxwaQ/formResponse",
      formData: {
        "entry.185468112": req.body.refer ? req.body.refer : "",
        "entry.1149315447": req.body.coursecode ? req.body.coursecode : "",
      },
    };
    request(options, function (error, response) {
      if (error) console.log(error);
      // console.log(response.body);
    });
  }
  if (req.body.refer) {
    coursepricelist = {
      minibus: 499,
      minibusaddon: 499 + 99,
      doublestick: 499,
      doublestickaddon: 499 + 299,
      saurce: 499,
      saurceaddon: 499 + 139,
    };
  }

  const coursetocourseid = {
    minibus: "minibus_prod",
    minibusaddon: "minibus_prod",
    doublestick: "nanchaku_prod",
    doublestickaddon: "nanchaku_prod",
    saurce: "cooking_prod",
    saurceaddon: "cooking_prod",
  };

  const courseimglist = {
    minibus:
      "https://imagedelivery.net/F-3JVW4H1_xFj9Tfzrx6uA/a90807cb-31a3-4adb-f6f4-99a9313c1d00/public",
    minibusaddon:
      "https://imagedelivery.net/F-3JVW4H1_xFj9Tfzrx6uA/a90807cb-31a3-4adb-f6f4-99a9313c1d00/public",
    doublestick:
      "https://imagedelivery.net/F-3JVW4H1_xFj9Tfzrx6uA/1398af81-3a30-4b9f-db9b-e41f9a310900/public",
    doublestickaddon:
      "https://imagedelivery.net/F-3JVW4H1_xFj9Tfzrx6uA/1398af81-3a30-4b9f-db9b-e41f9a310900/public",
    saurce:
      "https://imagedelivery.net/F-3JVW4H1_xFj9Tfzrx6uA/041df1e4-0825-4778-4a3b-703546b9c400/public",
    saurceaddon:
      "https://imagedelivery.net/F-3JVW4H1_xFj9Tfzrx6uA/041df1e4-0825-4778-4a3b-703546b9c400/public",
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
              // console.log(x);
              res.render("./completed_" + req.body.course + ".html");
              const address = req.body.address ? req.body.address : "";
              const country = req.body.country ? req.body.country : "";
              const city = req.body.city ? req.body.city : "";
              const state = req.body.state ? req.body.state : "";
              const postcode = req.body.postcode ? req.body.postcode : "";
              var options = {
                method: "POST",
                url: "https://docs.google.com/forms/u/1/d/e/1FAIpQLScDpQR2gQ4EhmkOlFX6JXWSjwDCDYMUAfZvB4qRL7xyeXy3kQ/formResponse",
                formData: {
                  "entry.1896806186": req.body.name ? req.body.name : "",
                  "entry.673454844": req.body.phone ? req.body.phone : "",
                  "entry.1920172636": req.body.email ? req.body.email : "",
                  "entry.1648267103":
                    req.body.coursecode + " " + courseprice / 100,
                  "entry.1337606191":
                    address +
                    " | " +
                    country +
                    " | " +
                    city +
                    " | " +
                    state +
                    " | " +
                    postcode,
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
              addboughtcourse(
                req.body.email,
                coursetocourseid[req.body.coursecode],
                req.body.name,
                req.body.phone
              );
            })
            .catch((err) => {
              console.log(err);
              res.render("./charge_" + req.body.course + ".html", {
                warning: err + " (create charge)",
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
    res.render("./charge_" + req.body.course + ".html", {
      warning: "Error",
    });
  }
});

app.get("/paybycash", (req, res, next) => {
  return res.render("./paybycash.html", {});
});

app.post("/paybycash", (req, res) => {
  try {
    const coursetocourseid = {
      minibus: "minibus_prod",
      minibusaddon: "minibus_prod",
      doublestick: "nanchaku_prod",
      doublestickaddon: "nanchaku_prod",
      saurce: "cooking_prod",
      saurceaddon: "cooking_prod",
    };

    const courseimglist = {
      minibus:
        "https://imagedelivery.net/F-3JVW4H1_xFj9Tfzrx6uA/a90807cb-31a3-4adb-f6f4-99a9313c1d00/public",
      minibusaddon:
        "https://imagedelivery.net/F-3JVW4H1_xFj9Tfzrx6uA/a90807cb-31a3-4adb-f6f4-99a9313c1d00/public",
      doublestick:
        "https://imagedelivery.net/F-3JVW4H1_xFj9Tfzrx6uA/1398af81-3a30-4b9f-db9b-e41f9a310900/public",
      doublestickaddon:
        "https://imagedelivery.net/F-3JVW4H1_xFj9Tfzrx6uA/1398af81-3a30-4b9f-db9b-e41f9a310900/public",
      saurce:
        "https://imagedelivery.net/F-3JVW4H1_xFj9Tfzrx6uA/041df1e4-0825-4778-4a3b-703546b9c400/public",
      saurceaddon:
        "https://imagedelivery.net/F-3JVW4H1_xFj9Tfzrx6uA/041df1e4-0825-4778-4a3b-703546b9c400/public",
    };

    const emailtitlelist = {
      minibus: "【匠人精神！手寫小巴牌網上課程】多謝你的訂購！",
      minibusaddon: "【匠人精神！手寫小巴牌網上課程】多謝你的訂購！",
      doublestick: "【型爆！雙節棍入門網上課程】多謝你的訂購！",
      doublestickaddon: "【型爆！雙節棍入門網上課程】多謝你的訂購！",
      saurce: "【快靚正！香港味道煮食網上課程】多謝你的訂購！",
      saurceaddon: "【快靚正！香港味道煮食網上課程】多謝你的訂購！",
    };

    const emailtitle = emailtitlelist[req.body.coursecode]
      ? emailtitlelist[req.body.coursecode]
      : "多謝購買課程";

    if (req.body.coursecode == "minibusaddon") {
      db.push("/minibusaddon/list[]", req.body);
    }

    const address = req.body.address ? req.body.address : "";
    const country = req.body.country ? req.body.country : "";
    const city = req.body.city ? req.body.city : "";
    const state = req.body.state ? req.body.state : "";
    const postcode = req.body.postcode ? req.body.postcode : "";
    var options = {
      method: "POST",
      url: "https://docs.google.com/forms/u/1/d/e/1FAIpQLScDpQR2gQ4EhmkOlFX6JXWSjwDCDYMUAfZvB4qRL7xyeXy3kQ/formResponse",
      formData: {
        "entry.1896806186": req.body.name ? req.body.name : "",
        "entry.673454844": req.body.phone ? req.body.phone : "",
        "entry.1920172636": req.body.email ? req.body.email : "",
        "entry.1648267103": req.body.coursecode + " " + req.body.courseprice,
        "entry.1337606191":
          address +
          " | " +
          country +
          " | " +
          city +
          " | " +
          state +
          " | " +
          postcode,
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
    addboughtcourse(
      req.body.email,
      coursetocourseid[req.body.coursecode],
      req.body.name,
      req.body.phone
    );

    res.render("./completed_" + req.body.coursecode + ".html");
  } catch (err) {
    console.log(err);
    res.send(err);
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
// app.listen(port, () => console.log("Server is running..."));
// set up plain http server
var http = express();

// set up a route to redirect http to https
http.get("*", function (req, res) {
  res.redirect("https://" + req.headers.host + req.url);

  // Or, if you don't want to automatically detect the domain name from the request header, you can hard code it:
  // res.redirect('https://example.com' + req.url);
});

// have it listen on 8080

if (process.env.localhost) app.listen(80);
else http.listen(80);

// httpServer.listen(80);
httpsServer.listen(443);
