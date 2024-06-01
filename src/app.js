const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const cookieParser = require('cookie-parser');
// const fetchAndStoreWantedPerson = require('./routes/v1/wantedperson.route');
const wantedPersonRoute = require('./routes/v1/wantedperson.route');
const app = express();
const { WantedPerson } = require('./models');


// load serial killer load from utils
// const serialKillerload = require('./utils/serialKillerload');

// load cost of living  https://rapidapi.com/ditno-ditno-default/api/cities-cost-of-living1
// const ci = require('./utils/costofliving');
// this is to load serial killer data to mongodb
// const sk = require('./utils/sk');
// ci();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

app.use(cookieParser())

// gzip compression
app.use(compression());
const corsOptions = {
  // origin: 'http://localhost:5000', // or use an array of origins if you have multiple clients
  origin: ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:3001'],
  credentials: true, // to allow cookies and credentials
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
// enable cors
app.use(cors(corsOptions));
// app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

app.get('/get-all-from-mongo', async (req, res) => {
  const data = await WantedPerson.find({});
  res.send(data);
  
});

app.get('/load-from-fbi', async (req, res) => {
  const data = await wantedPersonRoute.fetchAndStoreWantedPerson();
  res.send(data);
});

app.get('/load-fbi', async (req, res) => {
  const data = await wantedPersonRoute.fetchOtherUsingApiKey();
  res.send(data);

});
// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

// load serial killer data
// serialKillerload();

// serialKillerload();
// sk()

module.exports = app;
