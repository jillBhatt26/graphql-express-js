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
    GraphQLNonNull,
    GraphQLInputObjectType
} = require('graphql');

// apollo imports
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// GraphQL schema definitions

const todoID = new GraphQLNonNull(GraphQLID);

const Todo = new GraphQLObjectType({
    name: 'Todo',
    fields: () => ({
        id: { type: todoID },
        name: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) }
    })
});

const CreateTodoInput = new GraphQLInputObjectType({
    name: 'CreateTodoInput',
    fields: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) }
    }
});

const UpdateTodoInput = new GraphQLInputObjectType({
    name: 'UpdateTodoInput',
    fields: {
        id: { type: todoID },
        name: { type: GraphQLString },
        description: { type: GraphQLString }
    }
});

const Todos = new GraphQLList(Todo);

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        hello: {
            type: GraphQLString,
            resolve: () => `Hello World!`
        },
        todos: {
            type: Todos,
            resolve: () => data
        },
        todo: {
            type: Todo,
            args: {
                id: {
                    type: todoID
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
                createTodoInput: {
                    type: new GraphQLNonNull(CreateTodoInput)
                }
            },
            resolve: (parent, args) => {
                const {
                    createTodoInput: { name, description }
                } = args;

                const newTodo = {
                    id: data.length + 1,
                    name,
                    description
                };

                data = [newTodo, ...data];

                return data;
            }
        },
        deleteTodo: {
            type: Todo,
            args: {
                id: {
                    type: todoID
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
            // args: {
            //     id: { type: todoID },
            //     name: { type: GraphQLString },
            //     description: { type: GraphQLString }
            // },
            args: {
                updateTodoInput: {
                    type: UpdateTodoInput
                }
            },
            resolve: (parents, args) => {
                const {
                    updateTodoInput: { id, name, description }
                } = args;

                const dataIdx = data.findIndex(d => d.id === parseInt(id));

                if (dataIdx < 0) return null;

                const updatedData = data[dataIdx];

                if (name) updatedData.name = name;
                if (description) updatedData.description = description;

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
