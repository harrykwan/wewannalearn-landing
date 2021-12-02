require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const stripe = require("stripe")(process.env.stripe_sk); // Add your Secret Key Here

const app = express();
app.use(cors());

// This will make our form data much more useful
app.use(bodyParser.urlencoded({ extended: true }));

// This will set express to render our views folder, then to render the files as normal html
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

app.use(express.static(path.join(__dirname, "./views")));

app.post("/charge", (req, res) => {
  try {
    stripe.customers
      .create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        source: req.body.stripeToken,
      })
      .then((customer) =>
        stripe.charges
          .create({
            amount: 100,
            currency: "hkd",
            customer: customer.id,
          })
          .then(() =>
            res.render(req.body.url.split("charge.html").join("completed.html"))
          )
      )

      .catch((err) => console.log(err));
  } catch (err) {
    res.send(err);
  }
});

// Future Code Goes Here

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server is running..."));
