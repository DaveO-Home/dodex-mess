/**
 * Add any additional routes here.
 */
const combineRouters = require("koa-combine-routers");

const dodexRouter = require("./dodex");
const testRouter = require("./test");
const rootRouter = require("./root");

const routers = combineRouters(
  dodexRouter.router,
  testRouter,
  rootRouter
);

exports.dodexRouter = dodexRouter;
exports.routers = routers;
