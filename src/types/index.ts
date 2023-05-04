export type Customer = {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
};

export type AsyncpayCheckoutInterface = {
  publicKey: string;
  reference?: string;
  amount: number | string;
  description?: string;
  customerEmail?: string;
  customerUUID?: string;
  customer: Customer;
  paymentChannel?: "paystack" | "flutterwave" | "stripe";
  successURL?: string;
  cancelURL?: string;
  onClose?: Function;
  onCancel?: Function;
  onSuccess?: Function;
  logo?: string;
  environment?: "dev" | "local" | "prod";
};
