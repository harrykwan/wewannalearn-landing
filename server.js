require("dotenv").config();
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
    minibus: 499,
    minibusaddon: 558,
    doublestick: 479,
    doublestickaddon: 559,
    saurce: 399,
    saurceaddon: 598,
  };

  const courseimglist = {
    minibus:
      "https://harrykwan.github.io/wewannalearn-stripe-api/views/img/homepage/busvideopreview.jpg",
    minibusaddon:
      "https://harrykwan.github.io/wewannalearn-stripe-api/views/img/homepage/busvideopreview.jpg",
    doublestick:
      "https://harrykwan.github.io/wewannalearn-stripe-api/views/img/homepage/doublestickvideopreview.jpg",
    doublestickaddon:
      "https://harrykwan.github.io/wewannalearn-stripe-api/views/img/homepage/doublestickvideopreview.jpg",
    saurce:
      "https://harrykwan.github.io/wewannalearn-stripe-api/views/img/homepage/saurcevideopreview.jpg",
    saurceaddon:
      "https://harrykwan.github.io/wewannalearn-stripe-api/views/img/homepage/saurcevideopreview.jpg",
  };

  try {
    const courseprice = coursepricelist[req.body.coursecode]
      ? coursepricelist[req.body.coursecode]
      : 0;
    if (coursepricelist == 0) throw "wrong course code";
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
                  subject: "多謝購買課程",
                  to: "harry1998kwan@gmail.com",
                  courseimg: courseimglist[req.body.course],
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

const port = 80;
app.listen(port, () => console.log("Server is running..."));
