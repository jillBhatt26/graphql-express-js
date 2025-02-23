const express = require('express');
const cors = require('cors');
const { PORT } = require('./config/env');
let data = require('./data');

// graphql imports
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull
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
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) }
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
        },
        todo: {
            type: Todo,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLID)
                }
            },
            resolve: (parent, args) => {
                const todo = data.find(d => d.id === parseInt(args.id));

                return todo;
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'mutation',
    fields: {
        createTodo: {
            type: new GraphQLNonNull(new GraphQLList(Todo)),
            args: {
                name: {
                    type: GraphQLString
                },
                description: {
                    type: GraphQLString
                }
            },
            resolve: (parent, args) => {
                const newTodo = {
                    id: data.length + 1,
                    name: args.name,
                    description: args.description
                };

                data = [newTodo, ...data];

                return data;
            }
        },
        deleteTodo: {
            type: Todo,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLID)
                }
            },
            resolve: (parent, args) => {
                const dataToDelete = data.find(d => d.id === parseInt(args.id));

                data = data.filter(d => d.id !== parseInt(args.id));

                return dataToDelete;
            }
        },
        updateTodo: {
            type: Todo,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                name: { type: GraphQLString },
                description: { type: GraphQLString }
            },
            resolve: (parents, args) => {
                const dataIdx = data.findIndex(d => d.id === parseInt(args.id));

                if (dataIdx < 0) return null;

                const updatedData = data[dataIdx];

                if (args.name) updatedData.name = args.name;
                if (args.description)
                    updatedData.description = args.description;

                data[dataIdx] = updatedData;

                return updatedData;
            }
        }
    }
});

const schema = new GraphQLSchema({
    query: Query,
    mutation
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
