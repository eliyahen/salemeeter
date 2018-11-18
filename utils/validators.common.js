const validatorsUtils = require('./validators');

const isRequired = (error = 'This field is required.') => (value) => {
    if (value === undefined) {
        throw error;
    }
}

const validateIfExists = (validatorFn) => (value) => {
    if (value !== undefined) {
        validatorFn(value);
    }
};

const oneOf = (values, error='This field should be one of: %values%') => (value) => {
    if (values.indexOf(value) === -1) {
        throw error.replace('%values%', values.map(v => `'${String(v)}'`).join(', '));
    }
};

const isArray = (error = 'This field should be an array.') => (value) => {
    if (!Array.isArray(value)) {
        throw error;
    }
};

const notEmptyArray = (error = 'Array should not be empty') => validatorsUtils.firstErrorValidators(
    isArray,
    (value) => {
        if (value.length === 0) {
            throw error;
        }
    }
);

module.exports = {
    isRequired,
    validateIfExists,
    oneOf,
    isArray,
    notEmptyArray,
};
