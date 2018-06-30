import Router from "koa-router";

import adminController from "../controller/adminController";

let adminRouter: Router = new Router();

adminRouter.get(':viewName', adminController.getView);

adminRouter.all('*', adminController.all);

export default adminRouter;