const express = require('express');
const cors = require('cors');
const { PORT } = require('./config/env');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.listen(PORT, () => {
    console.log(`🚀🚀🚀...GraphQL server is live on port: ${PORT}...🚀🚀🚀`);
});
