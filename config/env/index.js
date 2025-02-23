require('dotenv/config');

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const PORT = process.env.PORT ?? 5000;

module.exports = {
    NODE_ENV,
    PORT
};
