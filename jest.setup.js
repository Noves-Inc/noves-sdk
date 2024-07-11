// jest.setup.js

require('dotenv').config();
const nock = require('nock');

// Optionally configure nock here if you want to set up global mocks
nock.disableNetConnect();