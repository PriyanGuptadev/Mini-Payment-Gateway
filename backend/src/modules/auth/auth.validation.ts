import Joi from "joi";

export const registerSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.email": "Invalid email format",
            "any.required": "Email is required",
        }),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .required()
        .messages({
            "string.pattern.base":
                "Password must contain uppercase, lowercase, number, and special character",
            "string.min": "Password must be at least 8 characters",
            "any.required": "Password is required",
        }),
    business_name: Joi.string().min(3).optional(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const createTransactionSchema = Joi.object({
    amount: Joi.number()
        .positive()
        .required()
        .messages({
            "number.positive": "Amount must be positive",
            "any.required": "Amount is required",
        }),
    currency: Joi.string().length(3).uppercase().default("USD"),
    customer_email: Joi.string().email().required(),
    metadata: Joi.object().optional(),
});

export const createMerchantSchema = Joi.object({
    business_name: Joi.string().min(3).required(),
});

export const validateRequest = (schema: Joi.Schema) => {
    return (req: any, res: any, next: any) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const messages = error.details.map((d) => ({
                field: d.path.join("."),
                message: d.message,
            }));
            return res.status(400).json({ errors: messages });
        }

        req.body = value;
        next();
    };
};