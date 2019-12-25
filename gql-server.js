const { ApolloServer, gql } = require("apollo-server");
const intialize = require('./initialize');

let dbUtils;
let usersModal;
let dealsModel;
let customerModel;

const typeDefs = gql`
    enum Brand {
        kitchen
        accessories
        other
    }

    enum ContactType {
        phone
        email
        other
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        isTemp: Boolean!
        deals: [Deal!]!
    }

    type Deal {
        _id: ID!
        userId: ID!
        customerId: ID!
        totalAmount: Int!
        brand: Brand!
        customer: Customer!
    }

    type Customer {
        _id: ID!
        name: String!
        contacts: [Contact!]!
    }

    type Contact {
        type: ContactType
        contact: String
    }

    type Query {
        users(id: ID): [User!]!
        deals(userId: ID): [Deal!]!
    }

    input InputUser {
        firstName: String!
        lastName: String!
        email: String!
        password: String!
        deals: [InputDeal!]
    }

    input InputDeal {
        brand: Brand!
    }

    type Mutation {
        addUser(user: InputUser): User!
        updateUser(id: ID!, data: InputUser): User!
    }

    schema {
        query: Query
        mutation: Mutation
    }
`;
const resolvers = {
    Query: {
      users: (_, { id }, context, info) => usersModal.findAll({ ...( id && { _id: dbUtils.ObjectId(id) } ) }, { _id: 1, name: 1, email: 1 }).map(u => ({
          ...u,
          isTemp: !!u.email.match(/^t\d+\@/),
      })).toArray(),
      deals: (_, { userId }) => dealsModel.findAll({ ...(userId && { userId: String(userId) }) }).toArray(),
    },

    Mutation: {
        addUser: async (_, { user }, context, info) => {
            if (await usersModal.findOne({email: user.email}, {_id: true})) {
                throw new Error('Email already exist!');
            }
            user.name = [user.firstName, user.lastName].join(' ');
            user.password = usersModal.encryptPassword(user.password);
            return usersModal.insert(user);
        },
        updateUser: async (_, { id, data }, context, info) => {
            const objId = dbUtils.ObjectId(id);
            const user = await usersModal.findOne({_id: objId}, {_id: true});
            if (!user) {
                throw new Error('User was not found!');
            }
            data = { ...user, ...data };

            if ('firstName' in data || 'lastName' in data) {
                data.name = [data.firstName, data.lastName].join(' ');
            }
            if ('password' in data) {
                data.password = usersModal.encryptPassword(data.password);
            }
            return usersModal.update(objId, data).then(
                () => usersModal.findOne({_id: objId})
            );
        },
    },

    User: {
        deals: (user) => dealsModel.findAll({ userId: String(user._id) }).toArray(),
        // deals: (user) => { throw new Error('NO DEAL!'); },
    },

    Deal: {
        customer: (deal) => customerModel.findOne({ _id: dbUtils.ObjectId(deal.customerId) }),
    },
};

const server = new ApolloServer({ typeDefs, resolvers });

intialize().then(() => {
    server.listen().then(({ url }) => {
        console.log(`🚀 Server ready at ${url}`);
    });

    dbUtils = require('./db/utils');
    usersModal = require('./models/users.model');
    dealsModel = require('./models/deals.model');
    customerModel = require('./models/customers.model');
});
