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

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.post("/charge", (req, res) => {
  const courseprice = 128;
  try {
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
              currency: "usd",
              customer: customer.id,
            })
            .then((x) => {
              console.log(x);
              res.render("./completed.html");
              var options = {
                method: "POST",
                url: "https://docs.google.com/forms/u/1/d/e/1FAIpQLScDpQR2gQ4EhmkOlFX6JXWSjwDCDYMUAfZvB4qRL7xyeXy3kQ/formResponse",
                formData: {
                  "entry.1896806186": req.body.name ? req.body.name : "",
                  "entry.673454844": req.body.phone ? req.body.phone : "",
                  "entry.1920172636": req.body.email ? req.body.email : "",
                  "entry.1648267103": courseprice,
                },
              };
              request(options, function (error, response) {
                if (error) console.log(error);
                // console.log(response.body);
              });
            })
        // .then(() =>
        //   res.render(req.body.url.split("charge.html").join("completed.html"))
        // )
      )
      // .then(() => res.render("./completed.html"))
      .catch((err) => {
        console.log(err);
        res.render("./charge.html", {
          warning: err.raw.message ? err.raw.message : "Error",
        });
      });
  } catch (err) {
    console.log(err);
    res.render("./charge.html", {
      warning: "Error",
    });
  }
});

// Future Code Goes Here

const port = 80;
app.listen(port, () => console.log("Server is running..."));
