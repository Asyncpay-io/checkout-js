<p align="center">    
   <img title="Asyncpay" height="50" src="https://lh3.googleusercontent.com/drive-viewer/AFGJ81pjQh0DLFoJEg7GGLwQXHmhB0AQio2DtyxpQbzQD5eMX41rJ0de1BVePqbzvmOpJJsFU2ApUlRJdi04MY5bc6cGR8jefQ=s1600" />  
</p>

# Asyncpay Checkout SDK

This SDK allows you to seamlessly connect to multiple payment channels such as Flutterwave, Paystack and Stripe and create a checkout experience with only one integration.

## Demo

You can see a demo of our checkout experience here: [https://checkout.dev.asyncpay.io](https://checkout.dev.asyncpay.io)

## Requirements

1. **An Asyncpay account -** Head to [Asyncpay](https://asyncpay.io) to create an account and gain access to your dashboard.
2. **Connect your payment Channels -** The dashboard provides you a means to connect your multiple payment channels to your business. Create accounts on the payment channels you wish to integrate and provide your keys on the dashboard.
3. **Integrate this SDK -** After connecting the payment channels you can initialize payments with the Asyncpay public key found on your dashboard.

## Steps for Integrating this SDK

1. To install this SDK, run the npm command

```
$ npm install @asyncpay/checkout-js
```

2. The SDK exports a function that can be invoked at anytime to load a checkout experience.

```js
import { AsyncpayCheckout } from "@asyncpay/checkout-js";

AsyncpayCheckout({
  publicKey:
    "async_skt_960e42272225b293eb0ebb2d4d164f12ee12f78d5ed3b2deb75d065a7bef",
  email: "info@asyncpay.io",
  amount: 450,
});
```

You can trigger the function on the click of a button or the submission of a form to initiate the checkout experience.

## Available Checkout Options

Listed below are the available config options for the `AsyncpayCheckout` function exported by the checkout SDK.

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

| Name             | Required                                                 | Description                                                                                                                                                         |
| ---------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `publicKey`      | `true`                                                   | The public key of your business gotten from the [Asyncpay](https://asyncpay.io) dashboard                                                                           |
| `amount`         | `true`                                                   | The amount you want to charge the user                                                                                                                              |
| `description`    | `false`                                                  | The description of the transaction                                                                                                                                  |
| `customerEmail`  | required if `customerUUID` and `customer` is absent      | The email of the customer you want to charge                                                                                                                        |
| `customerUUID`   | required if `customerEmail` and `customer` is absent     | The UUID of the customer you want to charge                                                                                                                         |
| `customer`       | required if `customerEmail` and `customerUUID` is absent | The customer object of the customer. Using this option would create a customer on the user                                                                          |
| `paymentChannel` | `false`                                                  | The payment channel you want to route the payment to. If you set a value here, the checkout goes staright to that payment channel without giving the user a choice. |
| `successURL`     | `false`                                                  | The url to redirect the user to after a successful payment                                                                                                          |
| `cancelURL`      | `false`                                                  | The url to redirect the customer to if the user cancels the checkout page                                                                                           |
| `onCancel`       | `false`                                                  | A javascript function to call after the user cancels the checkout page                                                                                              |
| `onSuccess`      | `false`                                                  | A javascript function to call after the user has successfully completed checkout                                                                                    |
| `logo`           | `false`                                                  | The logo to show up on the payment page if you want to override the logo set on the dashboard                                                                       |

## Support
Feel free to send a message to `info@asyncpay.io` for any support regarding using this SDK or create an issue on [Github](https://github.com/Asyncpay-io/checkout-js/issues)

