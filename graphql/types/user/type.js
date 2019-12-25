const type = gql`
    type User {
        _id: ID!
        name: String!
        email: String!
        isTemp: Boolean!
        deals: [Deal!]!
    }

    type Query {
        users(id: ID): [User!]!,
    }

    type Mutation {
        addUser(user: User): User!,
        updateUser(id: ID!, data: Object): User!,
    }
`;

const resolvers = {
    Query: {
        users: (_, { id }, context, info) => usersModal.findAll({ ...( id && { _id: dbUtils.ObjectId(id) } ) }, { _id: 1, name: 1, email: 1 }).map(u => ({
            ...u,
            isTemp: !!u.email.match(/^t\d+\@/),
        })).toArray(),
    },

    Mutation: {
        addUser: (_, { user }, context, info) => usersModal.insert(user),
        updateUser: (_, { id, data }, context, info) => usersModal.update(id, data),
    },

    User: {
        deals: (user) => dealsModel.findAll({ userId: String(user._id) }).toArray(),
    },
}
