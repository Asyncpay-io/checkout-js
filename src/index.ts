import { svg } from "./modules/svg-strings";
import {
  validateCustomer,
  validateEmail,
  validateUUID,
} from "./modules/validators";
import { AsyncpayCheckoutInterface, Error } from "../types";

const resolveError = (error: any): Error => {
  if (typeof error === "object") {
    if (error.error && error.error_code && error.error_description) {
      return {
        error: error.error,
        error_code: error.error_code,
        error_description: error.error_description,
      };
    } else {
      return {
        error: "SDK_ERROR",
        error_code: "0003",
        error_description: error,
      };
    }
  } else {
    return {
      error: "SDK_ERROR",
      error_code: "0003",
      error_description: error,
    };
  }
};

export const AsyncpayCheckout = async ({
  publicKey,
  reference,
  amount,
  subscriptionPlanUUID,
  subscriptionPlanLink,
  currency,
  description,
  customerEmail,
  customerUUID,
  customer,
  paymentChannel,
  successURL,
  cancelURL,
  onCancel,
  onClose,
  onError,
  onSuccess,
  logo,
  environment = "prod",
}: AsyncpayCheckoutInterface) => {
  const unsetCheckoutSession = (error: any = null) => {
    sessionStorage.removeItem("asyncpay-checkout-is-in-session");
    const checkoutIframeWrapper = document.getElementById(
      "asyncpay-checkout-sdk-wrapper"
    );
    if (checkoutIframeWrapper && checkoutIframeWrapper.parentNode) {
      checkoutIframeWrapper.parentNode.removeChild(checkoutIframeWrapper);
    }
    if (error) {
      if (typeof onError === "function") {
        if (!(typeof error === "object" && error.doNotThrow)) {
          onError(resolveError(error));
        }
      }
      if (typeof error === "string") {
        throw {
          ...resolveError(error),
          doNotThrow: true,
        };
      } else {
        throw {
          ...error,
          doNotThrow: true,
        };
      }
    }
  };
  window.addEventListener("beforeunload", function () {
    sessionStorage.removeItem("asyncpay-checkout-is-in-session");
  });
  if (document.getElementById("asyncpay-checkout-sdk-wrapper")) {
    unsetCheckoutSession({
      error: "SDK_ERROR_CHECKOUT_IN_SESSION",
      error_code: "00002",
      error_description:
        "A checkout process has already been initiated. You cannot run multiple checkout sessions simultaneously.",
    });
  }
  if (sessionStorage.getItem("asyncpay-checkout-is-in-session")) {
    unsetCheckoutSession({
      error: "SDK_ERROR_CHECKOUT_IN_SESSION",
      error_code: "00002",
      error_description:
        "A checkout process has already been initiated. You cannot run multiple checkout sessions simultaneously.",
    });
  }
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

  try {
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
      unsetCheckoutSession({
        error: "SDK_VALIDATION_ERROR",
        error_code: "00001",
        error_description:
          "Please provide a public key `publicKey` to the AsyncpayCheckout function.",
      });
    }
    if (!subscriptionPlanUUID && !subscriptionPlanLink) {
      if (currency) {
        const pattern = /^[A-Z]{3}$/;

        // Test the string against the pattern.
        if (!pattern.test(currency)) {
          unsetCheckoutSession({
            error: "SDK_VALIDATION_ERROR",
            error_code: "00001",
            error_description:
              "Please provide a valid currency in a valid Alphabetic ISO 4217 e.g NGN.",
          });
        }
      }
      if (!amount) {
        unsetCheckoutSession({
          error: "SDK_VALIDATION_ERROR",
          error_code: "00001",
          error_description: "Please provide a valid amount.",
        });
      } else {
        const pattern = /^\d+(\.\d{1,3})?$/;
        let testAmount = amount;
        if (typeof testAmount === "number") {
          testAmount = testAmount + "";
        }
        // Test the value against the pattern.
        if (!pattern.test(testAmount) && parseFloat(testAmount) >= 0) {
          unsetCheckoutSession({
            error: "SDK_VALIDATION_ERROR",
            error_code: "00001",
            error_description: "Please provide a valid amount.",
          });
        }
      }
    }
  } catch (error) {
    unsetCheckoutSession({
      error: "SDK_VALIDATION_ERROR",
      error_code: "00001",
      error_description: error,
    });
  }

  sessionStorage.setItem("asyncpay-checkout-is-in-session", "true");

  // Validate Amount
  // Validate the description
  // Validate the other potential parameters
  // Figure out if (and how) we should use idempotent-ency

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

  try {
    const response = await fetch(
      `${baseURL}/v1/sdk/initialize-payment-request`,
      {
        method: "POST",
        body: JSON.stringify({
          ...customerOBJ,
          ...(subscriptionPlanUUID || subscriptionPlanLink
            ? subscriptionPlanLink
              ? {
                  subscription_plan_link: subscriptionPlanLink,
                }
              : { subscription_plan_uuid: subscriptionPlanUUID }
            : {
                amount:
                  typeof amount === "number" ? amount : parseFloat(amount),
                ...(currency ? { currency } : {}),
                description,
              }),
          payment_channel: paymentChannel,
          success_redirect_url: successURL,
          cancel_redirect_url: cancelURL,
          ...(description
            ? { description }
            : { description: "Checkout from Asyncpay SDK" }),
          reference,
          logo,
        }),
        headers: {
          Authentication: `Bearer ${publicKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    const body = await response.json();
    if (!response.ok) {
      unsetCheckoutSession(body);
    }
    if (body.data.should_redirect) {
      unsetCheckoutSession();
      location.href = body.data.action;
    } else {
      const checkoutIframeWrapper = document.createElement("div");
      checkoutIframeWrapper.id = "asyncpay-checkout-sdk-wrapper";
      checkoutIframeWrapper.style.position = "fixed";
      checkoutIframeWrapper.style.top = "0";
      checkoutIframeWrapper.style.left = "0";
      checkoutIframeWrapper.style.width = "100%";
      checkoutIframeWrapper.style.height = "100%";
      checkoutIframeWrapper.style.zIndex = "99999999999";
      checkoutIframeWrapper.style.border = "none";
      checkoutIframeWrapper.style.background = "rgba(0,0,0,0.5)";
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
      iframe.src =
        body.data.action +
        (body.data.action.includes("publickey")
          ? ""
          : `?publickey=${publicKey}`);

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
        let eventData = event.data;
        if (typeof eventData === "string") {
          eventData = JSON.parse(eventData);
        }
        switch (eventData.eventType) {
          case "closeIframe":
            unsetCheckoutSession();
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
              unsetCheckoutSession();

              location.href = successURL;
            } else {
              unsetCheckoutSession();

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
  } catch (err) {
    unsetCheckoutSession(err);
  }
};

(window as any).AsyncpayCheckout = AsyncpayCheckout;
