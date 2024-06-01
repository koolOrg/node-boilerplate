const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const contentRoute = require('./content.route');
const conversionRoute = require('./conversion.route');
const contentHistoryRoute = require('./contenthistory.route');
const serialKillerRoute = require('./serialkiller.route');
// const openaiRoute = require('./openai.route');
const openaiRoute = require('./openai.route');
const config = require('../../config/config');
const otherRoute = require('./other.route');
const costOfLivingRoute = require('./costofliving.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/content',
    route: contentRoute
  },
  {
    path: '/conversion',
    route: conversionRoute 
  },
  {
    path: '/openai',
    route: openaiRoute
  },
  {
    path: '/contenthistory',
    route: contentHistoryRoute
  },
  {
    path: '/serialkiller',
    route: serialKillerRoute
  },
  {
    path: '/other',
    route: otherRoute
  },
  {
    path: '/costofliving',
    route: costOfLivingRoute
  }
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/content',
    route: contentRoute
  },
  {
    path: '/conversion',
    route: conversionRoute 
  }
,
  {
    path: '/openai',
    route: openaiRoute
  },
  {
    path: '/contenthistory',
    route: contentHistoryRoute},
    {
      path: '/serialkiller',
      route: serialKillerRoute
    
    },
    {
      path: '/other',
      route: otherRoute
    },
    {
      path: '/costofliving',
      route: costOfLivingRoute
    }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
