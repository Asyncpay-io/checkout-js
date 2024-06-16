import { Customer } from "../../types";

export const validateEmail = (email: string) => {
  if (
    String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  ) {
    return { customer_email: email };
  } else {
    throw Error("Please enter a valid customer_email");
  }
};

export const validateUUID = (uuid: string) => {
  if (
    String(uuid).match(
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    )
  ) {
    return { customer_uuid: uuid };
  } else {
    throw Error("Please enter a valid customer_uuid");
  }
};
export const validateCustomer = (customer: Customer) => {
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
  validateEmail(email);
  if (firstName && firstName.split(" ").length > 1) {
    throw Error("The first name can only contain one word.");
  }
  if (lastName && lastName.split(" ").length > 1) {
    throw Error("The last name can only contain one word.");
  }
  return {
    customer: {
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
      email,
    },
  };
};

export const validateMetadata = (obj: { [key: string]: string }) => {
  if (typeof obj !== "object" || Array.isArray(obj) || obj === null) {
    throw Error(
      "Please enter valid metadata. It must consist of an object whose the keys and values must be strings."
    );
  }

  for (const key in obj) {
    if (typeof key !== "string" || typeof obj[key] !== "string") {
      throw Error(
        "Please enter valid metadata. It must consist of an object whose the keys and values must be strings."
      );
    }
  }

  return obj;
};
