import { svg } from "./modules/svg-strings";
import {
  validateCustomer,
  validateEmail,
  validateUUID,
} from "./modules/validators";
import { Customer, AsyncpayCheckoutInterface } from "../types";

export const AsyncpayCheckout = async ({
  publicKey,
  reference,
  amount,
  description,
  customerEmail,
  customerUUID,
  customer,
  paymentChannel,
  successURL,
  cancelURL,
  onCancel,
  onClose,
  onSuccess,
  logo,
  environment = "dev",
  ...args
}: AsyncpayCheckoutInterface) => {
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
    customerOBJ = validateEmail(customerEmail);
  } else if (customerUUID) {
    // Validate uuid and return an object containing the UUID that we'll later spread and send into the URL
    customerOBJ = validateUUID(customerUUID);
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

  const response = await fetch(`${baseURL}/v1/sdk/initialize-payment-request`, {
    method: "POST",
    body: JSON.stringify({
      ...customerOBJ,
      amount: typeof amount === "number" ? amount : parseFloat(amount),
      description,
      payment_channel: paymentChannel,
      success_redirect_url: successURL,
      cancel_redirect_url: cancelURL,
      reference,
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
          if (checkoutIframeWrapper && checkoutIframeWrapper.parentNode) {
            checkoutIframeWrapper.parentNode.removeChild(checkoutIframeWrapper);
          }
          if (eventData.intent === "cancel") {
            if (cancelURL) {
              location.href = cancelURL;
            } else {
              if (onCancel && typeof onCancel === "function") {
                onCancel();
              }
            }
          }
          if (onClose && typeof onClose === "function") {
            onClose();
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
              onSuccess(eventData.paymentRequest);
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
