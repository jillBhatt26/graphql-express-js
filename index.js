const express = require('express');
const cors = require('cors');
const { PORT } = require('./config/env');

// apollo imports
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

const apolloServer = new ApolloServer({
    typeDefs: `#graphql
        type Query {
            hello: String!
        }
    `,
    resolvers: {
        Query: {
            hello: () => `Hello World!!`
        }
    },
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
