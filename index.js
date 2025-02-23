const express = require('express');
const cors = require('cors');
const { PORT } = require('./config/env');
const data = require('./data');

// graphql imports
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLList
} = require('graphql');

// apollo imports
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// GraphQL schema definitions

const Todo = new GraphQLObjectType({
    name: 'Todo',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString }
    })
});

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        hello: {
            type: GraphQLString,
            resolve: () => `Hello World!`
        },
        todos: {
            type: new GraphQLList(Todo),
            resolve: () => data
        }
    }
});

const schema = new GraphQLSchema({
    query: Query
});

const apolloServer = new ApolloServer({
    schema,
    introspection: true
});

apolloServer
    .start()
    .then(() => {
        app.use('/graphql', expressMiddleware(apolloServer));

        app.listen(PORT, () => {
            console.log(
                `🚀🚀🚀...GraphQL server is live on port: ${PORT}...🚀🚀🚀`
            );
        });
    })
    .catch(error => {
        console.log(
            `❌❌❌...Apollo server failed to start. Error: ${error.message}...❌❌❌`
        );
    });
