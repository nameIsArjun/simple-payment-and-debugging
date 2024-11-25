document
  .getElementById("paymentForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    // Get form values
    const formElements = getFormValues();

    // Validate form
    const validationResults = validateForm(formElements);

    if (!validationResults.isValid) {
      displayErrors(validationResults.errors);
      return;
    }

    processPayment(formElements);
  });

// Get all input values from the form
function getFormValues() {
  return {
    nameOnCard: document.getElementById("nameOnCard").value.trim(),
    cardNumber: document.getElementById("cardNumber").value.trim(),
    expiryMonth: document.getElementById("expiryMonth").value.trim(),
    expiryYear: document.getElementById("expiryYear").value.trim(),
    cvv: document.getElementById("cvv").value.trim(),
  };
}

// Validate the form fields and return the results
function validateForm({
  nameOnCard,
  cardNumber,
  expiryMonth,
  expiryYear,
  cvv,
}) {
  const errors = {
    nameOnCard: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  };

  let isValid = true;
  const regexCardNumber = /^[0-9]{16}$/;
  const regexCVV = /^[0-9]{3,4}$/;
  const today = new Date();

  if (nameOnCard === "") {
    errors.nameOnCard = "Name on card is required.";
    isValid = false;
  }

  if (!regexCardNumber.test(cardNumber)) {
    errors.cardNumber = "Invalid card number. It must be 16 digits.";
    isValid = false;
  }

  if (expiryMonth === "" || expiryYear === "") {
    errors.expiryDate = "Expiration date is required.";
    isValid = false;
  } else {
    const month = parseInt(expiryMonth, 10);
    const year = parseInt(expiryYear, 10);
    const expiry = new Date(year, month - 1);

    if (expiry <= today) {
      errors.expiryDate = "Expiration date must be in the future.";
      isValid = false;
    }
  }

  if (!regexCVV.test(cvv)) {
    errors.cvv = "Invalid CVV. It must be 3 or 4 digits.";
    isValid = false;
  }

  return { isValid, errors };
}

// Display validation errors to the user
function displayErrors(errors) {
  Object.keys(errors).forEach((field) => {
    document.getElementById(`error-${field}`).textContent = errors[field];
  });
}

// Process the payment by simulating a backend call
function processPayment({
  nameOnCard,
  cardNumber,
  expiryMonth,
  expiryYear,
  cvv,
}) {
  toggleLoader(true);

  const paymentData = {
    nameOnCard,
    cardNumber,
    expiryMonth,
    expiryYear,
    cvv,
  };
  setTimeout(() => {
    fetch("/process-transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    })
      .then((response) => {
        toggleLoader(false);
        if (!response.ok) throw new Error("Payment failed.");

        document.getElementById("success-payment").textContent = "Payment successful!";
        document.getElementById("paymentForm").reset();
        document.getElementById("success-payment").textContent = "";
      })
      .catch((error) => {
        toggleLoader(false);
        document.getElementById(
          "error-payment"
        ).textContent = `Error processing payment with message ${error} Try again.`;
      });
  }, 5000);
}

// Toggle the loader visibility and the submit button state
function toggleLoader(isLoading) {
  const loader = document.getElementById("loader");
  const submitButton = document.getElementById("submitButton");

  if (isLoading) {
    loader.classList.remove("hidden");
    submitButton.classList.add("hidden");
    submitButton.disabled = true;
  } else {
    loader.classList.add("hidden");
    submitButton.classList.remove("hidden");
    submitButton.disabled = false;
  }
}
