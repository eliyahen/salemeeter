const queryOperatorSeparator = '__';
const queryOperatorDefault = 'eq';

const getQuerySearch = (queryObj) => {
    const search = Object.keys(queryObj || {}).reduce((acc, qKey) => {
        const [sField, qOp = queryOperatorDefault] = qKey.split(queryOperatorSeparator);
        const sOperator = `$${qOp}`;
        acc[sField] = acc[sField] || {};
        acc[sField][sOperator] = queryObj[qKey];
        return acc;
    }, {});
    return search;
};

module.exports = {
    getQuerySearch,
};
