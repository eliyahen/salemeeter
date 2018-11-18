
/**
 * Validates a document due to given document of validators.
 * 
 * @param {validatorFn | Object | Array} fieldsValidators The validator document. The value at the end should be a validator function that might return error.
 * @returns {function(data)} a function that validates the given data and returns on error when found.
 */
const createValidator = (docValidator) => (data) => {
    if (typeof(docValidator) === 'function') {
        return docValidator(data);
    } else if (typeof(docValidator) === 'object') {
        if (Array.isArray(docValidator)) {
            if (!Array.isArray(data)) {
                return 'Expected to be an array.';
            }
            const itemValidator = createValidator(docValidator[0]);
            const errors = data.reduce((acc, itemData, idx) => {
                const itemErrors = itemValidator(itemData);
                if (itemErrors) {
                    acc['#' + idx] = itemErrors;
                }
                return acc;
            }, {});
            if (Object.keys(errors).length > 0) {
                return errors;
            }
        } else {
            if (typeof(data) !== 'object') {
                return 'Expected to be an object.';
            }
            const errors = Object.keys(docValidator).reduce((acc, key) => {
                const kErrors = createValidator(docValidator[key])(data[key]);
                if (kErrors) {
                    acc[key] = kErrors;
                }
                return acc;
            }, {});
            if (Object.keys(errors).length > 0) {
                return errors;
            }
        }
    } else {
        throw new Error('validateDocument: expected function or array or object.');
    }
};

/**
 * Combines the given validators to a single validator, aggregating all the errors into an array.
 * 
 * @param  {...function} validators List of validators to combine.
 */
const combineValidators = (...validators) => {
    return (value) => {
        const errors = validators.reduce((acc, validator) => {
            const err = validator(value);
            if (err) {
                acc.push(err);
            }
            return acc;
        }, []);
        if (errors.length > 0) {
            return errors;
        }
    };
};

/**
 * Returns the first validator error that is returned from the list of validators.
 * 
 * @param  {...function} validators List of validators to check.
 */
const firstOfValidators = (...validators) => {
    return (value) => {
        let error;
        validators.some((validator) => {
            error = validator(value);
            return Boolean(error);
        });
        if (error) {
            return error;
        }
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
    const errors = validatorFn(data);
    if (errors) {
        return errors;
    }
}

module.exports = {
    createValidator,
    combineValidators,
    firstOfValidators,
    validate,
};
