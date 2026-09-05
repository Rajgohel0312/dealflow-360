export const validate = (schema) => {
    return (req, res, next) => {

        const errors = {};

        // Validate URL params
        if (schema.params) {
            const { error, value } = schema.params.validate(
                req.params,
                {
                    abortEarly: false,
                    stripUnknown: true,
                }
            );

            if (error) {
                errors.params = error.details.map((detail) => ({
                    field: detail.path.join("."),
                    message: detail.message,
                }));
            } else {
                req.params = value;
            }
        }

        // Validate request body
        if (schema.body) {
            const { error, value } = schema.body.validate(
                req.body,
                {
                    abortEarly: false,
                    stripUnknown: true,
                }
            );

            if (error) {
                errors.body = error.details.map((detail) => ({
                    field: detail.path.join("."),
                    message: detail.message,
                }));
            } else {
                req.body = value;
            }
        }

        // Validation failed
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }

        next();
    };
};