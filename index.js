const validateCustomer = (customer) => {
  if (!customer || (customer && typeof customer !== "object")) {
    throw Error(
      "Please enter the customer information. The function requires either the `customer_email`, `customer_uuid` or a `customer` object containing all the fields of the customer. "
    );
  }
  const clonedCustomer = { ...customer };
  const { email, firstName, lastName, phoneNumber } = clonedCustomer;
  if (!email) {
    throw Error("email is a required field of the customer object");
  }
  if (
    !String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  ) {
    throw Error(
      "Invalid customer email. Please add a valid `email` to the customer object."
    );
  }
  if (firstName && firstName.split(" ") > 1) {
    throw Error("The first name can only contain one word.");
  }
  if (lastName && lastName.split(" ") > 1) {
    throw Error("The last name can only contain one word.");
  }
  return {
    ...(firstName ? { first_name: firstName } : {}),
    ...(lastName ? { last_name: lastName } : {}),
    email,
  };
};

export const AsyncpayCheckout = ({
  publicKey,
  amount,
  description,
  customerEmail,
  customerUUID,
  customer,
  paymentChannel,
  ...args
}) => {
  /**
   * 1. Validate arguments
   * 2. Generate checkout url
   * 3. Create iframe and all necessary elements and render the iframe
   * 4. Listen for all events and fire callbacks when necessary
   * 5. Clean code and check for optimizations
   */

  // Validate arguments
  // 1. Validate the individual parameters if they exist (customer_email and customer_uuid)
  // 2. Validate the whole customer object if it exists. Write a separate function that loops through the object and checks for the properties we expect and ensures that they work how they are supposed to

  let customerOBJ = {};

  if (customerEmail) {
    // Validate email and return an object containing just the customer_email that we'll later spread into send in the URL
    if (
      String(customerEmail)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
    ) {
      customerOBJ = { customer_email: customerEmail };
    } else {
      throw Error("Please enter a valid customer_email");
    }
  } else if (customerUUID) {
    // Validate uuid and return an object containing the UUID that we'll later spread and send into the URL
    if (
      String(customerUUID).match(
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
      )
    ) {
      customerOBJ = { customer_uuid: customerUUID };
    } else {
      throw Error("Please enter a valid customer_uuid");
    }
  } else {
    // Validate the entire customer object and return an object containing the customer object that we'll later spread and send into the URL
    customerOBJ = validateCustomer(customer);
  }
  const checkoutIframeWrapper = document.createElement("div");
  checkoutIframeWrapper.id = "asyncpay-checkout-wrapper";
  checkoutIframeWrapper.style.position = "fixed";
  checkoutIframeWrapper.style.top = "0";
  checkoutIframeWrapper.style.left = "0";
  checkoutIframeWrapper.style.width = "100%";
  checkoutIframeWrapper.style.height = "100%";
  checkoutIframeWrapper.style.zIndex = "99999999999";
  checkoutIframeWrapper.style.border = "none";
  checkoutIframeWrapper.style.background = "transparent";
  const iframe = document.createElement("iframe");
  iframe.src =
    "http://localhost:5173/checkout/6a43116ff59c1065c435c87f10977191298c";
  iframe.width = "100%";
  iframe.height = "100%";
  iframe.style.border = "none";
  iframe.onload = () => {
    alert("Dancing in the sunlight");
  };
  checkoutIframeWrapper.appendChild(iframe);
  document.body.appendChild(checkoutIframeWrapper);

  window.addEventListener("message", function (event) {
    console.log(event);
    switch (event.data) {
      case "closeIframe":
        checkoutIframeWrapper.parentNode.removeChild(checkoutIframeWrapper);
        break;
      default:
        console.log("I shall close the iFrame");
    }
  });
};
