const { API_PREFIX } = require('config');
const { StatusRoutes } = require('@modules/status');
const { AuthRoutes } = require('@modules/auth');
const { BudgetRoutes } = require('@modules/budget');
const { SalesDataRoutes } = require('@modules/sales-data');
const { EmployeesRoutes } = require('@modules/employees');
const { IncentiveRoutes } = require('@modules/incentive');
const { RetailPhotoMetadataRoutes } = require('@modules/retail-photo-metadata');
const { ClausesRoutes } = require('@modules/clauses');
const { DistPhotographyRoutes } = require('@modules/dist-photography');

const apiRoutes = [
  { path: '/auth', routes: AuthRoutes },
  { path: '/budget', routes: BudgetRoutes },
  { path: '/sale', routes: SalesDataRoutes },
  { path: '/employee', routes: EmployeesRoutes },
  { path: '/incentive', routes: IncentiveRoutes },
  { path: '/retail-photo-metadata', routes: RetailPhotoMetadataRoutes },
  { path: '/clauses', routes: ClausesRoutes },
  { path: '/dist-photography', routes: DistPhotographyRoutes },
];

module.exports = (app) => {
  // main routes
  app.use('/', StatusRoutes);
  apiRoutes.forEach((api) => {
    app.use(API_PREFIX + api.path, api.routes);
  });
};
