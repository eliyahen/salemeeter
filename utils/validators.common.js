const validators = require('./validators');

const isRequired = (errorMsg = 'This field is required.') => (value) => {
    if (value === undefined) {
        return errorMsg;
    }
}

const notEmpty = (errorMsg = 'This field must not be empty.') => (value) => {
    if (!value) {
        return errorMsg;
    }
}

const requiredNotEmpty = (errorMsgs = {required: undefined, empty: undefined}) => validators.firstOfValidators(
    isRequired(errorMsgs.required),
    notEmpty(errorMsgs.empty)
);

const validateIfExists = (validatorFn) => (value) => {
    if (value !== undefined) {
        return validatorFn(value);
    }
};

const oneOf = (values, error='This field should be one of: %values%') => (value) => {
    if (values.indexOf(value) === -1) {
        return error.replace('%values%', values.map(v => `'${String(v)}'`).join(', '));
    }
};

const isArray = (errorMsg = 'This field should be an array.') => (value) => {
    if (!Array.isArray(value)) {
        return errorMsg;
    }
};

const notEmptyArray = (errorMsg = 'Array should not be empty') => validators.firstOfValidators(
    isArray,
    (value) => {
        if (value.length === 0) {
            return errorMsg;
        }
    }
);

module.exports = {
    isRequired,
    notEmpty,
    requiredNotEmpty,
    validateIfExists,
    oneOf,
    isArray,
    notEmptyArray,
};
