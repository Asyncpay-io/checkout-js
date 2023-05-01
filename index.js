const svg = `<svg width="80px" height="80px" display="block" shape-rendering="auto" style="margin:auto" preserveAspectRatio="xMidYMid" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<g transform="rotate(0 50 50)">
<rect x="47" y="24" width="6" height="12" rx="3" ry="6" fill="#1059bc">
<animate attributeName="opacity" begin="-0.9166666666666666s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
</rect>
</g>
<g transform="rotate(30 50 50)">
<rect x="47" y="24" width="6" height="12" rx="3" ry="6" fill="#1059bc">
<animate attributeName="opacity" begin="-0.8333333333333334s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
</rect>
</g>
<g transform="rotate(60 50 50)">
<rect x="47" y="24" width="6" height="12" rx="3" ry="6" fill="#1059bc">
<animate attributeName="opacity" begin="-0.75s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
</rect>
</g>
<g transform="rotate(90 50 50)">
<rect x="47" y="24" width="6" height="12" rx="3" ry="6" fill="#1059bc">
<animate attributeName="opacity" begin="-0.6666666666666666s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
</rect>
</g>
<g transform="rotate(120 50 50)">
<rect x="47" y="24" width="6" height="12" rx="3" ry="6" fill="#1059bc">
<animate attributeName="opacity" begin="-0.5833333333333334s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
</rect>
</g>
<g transform="rotate(150 50 50)">
<rect x="47" y="24" width="6" height="12" rx="3" ry="6" fill="#1059bc">
<animate attributeName="opacity" begin="-0.5s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
</rect>
</g>
<g transform="rotate(180 50 50)">
<rect x="47" y="24" width="6" height="12" rx="3" ry="6" fill="#1059bc">
<animate attributeName="opacity" begin="-0.4166666666666667s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
</rect>
</g>
<g transform="rotate(210 50 50)">
<rect x="47" y="24" width="6" height="12" rx="3" ry="6" fill="#1059bc">
<animate attributeName="opacity" begin="-0.3333333333333333s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
</rect>
</g>
<g transform="rotate(240 50 50)">
<rect x="47" y="24" width="6" height="12" rx="3" ry="6" fill="#1059bc">
<animate attributeName="opacity" begin="-0.25s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
</rect>
</g>
<g transform="rotate(270 50 50)">
<rect x="47" y="24" width="6" height="12" rx="3" ry="6" fill="#1059bc">
<animate attributeName="opacity" begin="-0.16666666666666666s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
</rect>
</g>
<g transform="rotate(300 50 50)">
<rect x="47" y="24" width="6" height="12" rx="3" ry="6" fill="#1059bc">
<animate attributeName="opacity" begin="-0.08333333333333333s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
</rect>
</g>
<g transform="rotate(330 50 50)">
<rect x="47" y="24" width="6" height="12" rx="3" ry="6" fill="#1059bc">
<animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
</rect>
</g>
</svg>`;

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

export const AsyncpayCheckout = async ({
  publicKey,
  amount,
  description,
  customerEmail,
  customerUUID,
  customer,
  paymentChannel,
  successURL,
  cancelURL,
  onCancel,
  onSuccess,
  logo,
  environment = "dev",
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

  let baseURL;

  switch (environment) {
    case "local":
      baseURL = "http://localhost";
      break;
    case "prod":
      baseURL = "https://api.asyncpay.io";
      break;
    case "dev":
    default:
      baseURL = "https://api.dev.asyncpay.io";
  }

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
  if (!publicKey) {
    throw Error(
      "Please provide a public key `publicKey` to the AsyncpayCheckout function."
    );
  }

  // Validate Amount
  // Validate the description
  // Validate the other potential parameters
  // Figure out if (and how) we should use idempotentency

  const response = await fetch(`${baseURL}/v1/sdk/initialize-payment-request`, {
    method: "POST",
    body: JSON.stringify({
      ...customerOBJ,
      amount: parseFloat(amount),
      description,
      payment_channel: paymentChannel,
      success_redirect_url: successURL,
      cancel_redirect_url: cancelURL,
    }),
    headers: {
      Authentication: `Bearer ${publicKey}`,
      "Content-Type": "application/json",
    },
  });
  const body = await response.json();
  if (!response.ok) {
    throw Error(`Error-Code: ${body.error_code} - ` + body.error_description);
  }
  if (body.data.should_redirect) {
    location.href = body.data.action;
  } else {
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
    const loader = document.createElement("div");
    loader.style.display = "flex";
    loader.style.alignItems = "center";
    loader.style.justifyContent = "center";
    loader.style.position = "fixed";
    loader.style.top = "0";
    loader.style.left = "0";
    loader.style.zIndex = "99999";
    loader.style.height = "100%";
    loader.style.width = "100%";
    loader.innerHTML = svg;
    checkoutIframeWrapper.appendChild(loader);
    const iframe = document.createElement("iframe");
    iframe.style.opacity = "0";
    iframe.style.transition = ".8s";
    iframe.src = body.data.action + `?publickey=${publicKey}`;
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.style.border = "none";
    iframe.onload = () => {
      loader.style.display = "none";
      iframe.style.opacity = "1";
    };
    checkoutIframeWrapper.appendChild(iframe);
    document.body.appendChild(checkoutIframeWrapper);

    window.addEventListener("message", function (event) {
      console.debug("RECEIVED DATA IS", event.data);
      let eventData = event.data;
      if (typeof eventData === "string") {
        eventData = JSON.parse(eventData);
      }
      switch (eventData.eventType) {
        case "closeIframe":
          checkoutIframeWrapper.parentNode.removeChild(checkoutIframeWrapper);
          if (cancelURL) {
            location.href = cancelURL;
          } else {
            if (onCancel && typeof onCancel === "function") {
              onCancel();
            }
          }
          break;
        case "showLoader":
          iframe.style.opacity = "0";
          loader.style.display = "flex";
          break;
        case "paymentSuccessful":
          if (successURL) {
            location.href = successURL;
          } else {
            if (onSuccess && typeof onSuccess === "function") {
              onSuccess();
            }
          }
          break;
        case "redirect":
          location.href = eventData.url;
          break;
        default:
      }
    });
  }
};
