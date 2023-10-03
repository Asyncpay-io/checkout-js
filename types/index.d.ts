export type Customer = {
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
};

export type AsyncpayCheckoutInterface = {
    publicKey: string;
    reference?: string;
    subscriptionPlanUUID?: string;
    subscriptionPlanLink?: string;
    currency: ?string;
    amount: number | string;
    description?: string;
    customerEmail?: string;
    customerUUID?: string;
    customer: Customer;
    paymentChannel?: string;
    successURL?: string;
    cancelURL?: string;
    onClose?: Function;
    onCancel?: Function;
    onSuccess?: Function;
    logo?: string;
    environment?: "dev" | "local" | "prod";
};
