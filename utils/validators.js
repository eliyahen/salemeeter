
/**
 * Validates a document due to given document of validators.
 * 
 * @param {validatorFn | Object | Array} fieldsValidators The validator document. The value at the end should be a validator function that might throw error.
 * @returns {function(data)} a function that validates the given data and throws on error.
 */
const createValidator = (docValidator) => (data) => {
    if (typeof(docValidator) === 'function') {
        docValidator(data);
    } else if (typeof(docValidator) === 'object') {
        if (Array.isArray(docValidator)) {
            if (!Array.isArray(data)) {
                throw 'Expected to be an array.';
            }
            const itemValidator = createValidator(docValidator[0]);
            const errors = data.reduce((acc, itemData, idx) => {
                try {
                    itemValidator(itemData);
                } catch (itemErrors) {
                    acc['#' + idx] = itemErrors;
                }
                return acc;
            }, {});
            if (Object.keys(errors).length > 0) {
                throw errors;
            }
        } else {
            if (typeof(data) !== 'object') {
                return 'Expected to be an object.';
            }
            const errors = Object.keys(docValidator).reduce((acc, key) => {
                try {
                    createValidator(docValidator[key])(data[key]);
                } catch (kErrors) {
                    acc[key] = kErrors;
                }
                return acc;
            }, {});
            if (Object.keys(errors).length > 0) {
                throw errors;
            }
        }
    } else {
        throw new Error('validateDocument: expected function or array or object.');
    }
    return null;
};

/**
 * Combines the given validators to a single validator, aggregating all the errors into an array.
 * 
 * @param  {...function} validators List of validators to combine.
 */
const combineValidators = (...validators) => {
    return (value) => {
        const errors = validators.reduce((acc, validator) => {
            try {
                validator(value);
            } catch (err) {
                acc.push(err);
            }
            return acc;
        }, []);
        if (errors.length > 0) {
            throw errors;
        }
    };
};

/**
 * Returns the first validator error that is thrown from the list of validators.
 * 
 * @param  {...function} validators List of validators to check.
 */
const firstErrorValidators = (...validators) => {
    return (value) => {
        validators.forEach((validator) => {
            validator(value);
        });
    };
};

/**
 * Validates the data with the given validator.
 * 
 * @param {function} validatorFn the validator function.
 * @param {any} data the data to validate
 * @returns errors or null.
 */
const validate = (data, validatorFn) => {
    try {
        validatorFn(data);
    } catch (errors) {
        return errors;
    }
    return null;
}

module.exports = {
    createValidator,
    combineValidators,
    firstErrorValidators,
    validate,
};
