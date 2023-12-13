import express from 'express';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import passport from 'passport';
import { NOT_FOUND } from 'http-status';
import { env } from './config/config';
import morgan from './config/morgan';
import jwtStrategy from './config/passport';
import authLimiter from './middlewares/rateLimiter';
import routes from './routes/v1';
import errorMiddleware from './middlewares/error';
import ApiError from './utils/ApiError';

const app = express();

if (env !== 'test') {
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

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorMiddleware.errorConverter);

// handle error
app.use(errorMiddleware.errorHandler);

export default app;
