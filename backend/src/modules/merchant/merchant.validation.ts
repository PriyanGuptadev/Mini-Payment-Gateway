import Joi from "joi";

export const createMerchantSchema = Joi.object({
    business_name: Joi.string().min(3).required(),
    webhook_url: Joi.string().uri().optional(),
});

export const updateWebhookSchema = Joi.object({
    webhook_url: Joi.string().uri().required(),
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
