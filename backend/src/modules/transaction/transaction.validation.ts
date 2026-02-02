import Joi from "joi";

export const checkoutSchema = Joi.object({
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).uppercase().default("USD"),
    customer_email: Joi.string().email().required(),
    metadata: Joi.object().optional(),
});

export const paySchema = Joi.object({
    transaction_id: Joi.string().required(),
});
