const stripe = Stripe(
  // "pk_test_51I82ZnDb6MZGA6DdGDNhVtKtJjATBtdGsU64JYb5q4rBW6eb3wngFBqq4fxwB2O1xjpBkehtRJcQGrC6JdJmg8bf00p4ZhhwkT"
  "pk_live_51I82ZnDb6MZGA6DdbkUyj28xhv1i5mPcnnLlmlXvwJeLOEIA5fI8FwmcRO1bYcx3l7yS5f3q2lKlI62pOtsQUfVm00sezNE5nI"
); // Your Publishable Key
const elements = stripe.elements();

// Create our card inputs
var style = {
  base: {
    color: "#000",
  },
};

const card = elements.create("card", { style });
card.mount("#card-element");

const form = document.querySelector("form");
const errorEl = document.querySelector("#card-errors");

// Give our token to our form
const stripeTokenHandler = (token) => {
  console.log(token);
  const hiddenInput = document.createElement("input");
  hiddenInput.setAttribute("type", "hidden");
  hiddenInput.setAttribute("name", "stripeToken");
  hiddenInput.setAttribute("value", token.id);
  form.appendChild(hiddenInput);

  form.submit();
};

// Create token from card data
form.addEventListener("submit", (e) => {
  e.preventDefault();

  stripe.createToken(card).then((res) => {
    if (res.error) errorEl.textContent = res.error.message;
    else stripeTokenHandler(res.token);
  });
});
