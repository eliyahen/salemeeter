
/**
 * Applies the given schema to the data.
 * 
 * @param {{schema, isArray}} docSchema schema definition. schema=null means anything. isArray means the schema is for each item in the array.
 * @param {*} data the data to filter according the schema.
 * @returns {object} cleaned data object according to schema.
 */
const applyDocumentSchema = ({schema, isArray = false}, data) => {
    let retData;

    if (!schema || !data) {
        retData = data;
    } else if (isArray) {
        retData = [];
        if (Array.isArray(data)) {
            retData = data.reduce((acc, item) => {
                acc.push(applyDocumentSchema({schema}, item));
                return acc;
            }, retData);
        }
    } else if (Array.isArray(schema)) {
        retData = {};
        if (typeof(data) === 'object') {
            retData = schema.reduce((acc, f) => {
                if (typeof(f) === 'string') {
                    f = [f, {schema: null}];
                }
                const [fname, fschema] = f;
                if (fname in data) {
                    acc[fname] = applyDocumentSchema(fschema, data[fname]);
                }
                return acc;
            }, retData);
        }
    } else {
        throw new Error('applyDocumentSchema: invalid schema supplied.');
    }

    return retData;
};

module.exports = {
    applyDocumentSchema,
};
