import { Context } from "koa";
import path from "path";

import viewinit from "../static/viewinit";

export interface lext {
  (): Promise<any>
}

export default {
  all: async (ctx: Context, next: lext) => {
    ctx.state.send.json({"code": 0, "message": "hello TypeScript-node!"})
    await next();
  },

  getView: async (ctx: Context, next: lext) => {
    let views = (ctx.state.staticFiles.exts as string[]).map(value => path.parse(value).name);
    let viewName = path.parse(ctx.params.viewName).name;
    let isExist = views.find((value) => value === viewName);
    if (isExist) {
      await ctx.render(isExist, (viewinit as any)[viewName]);
    } else {
      await ctx.render("404", {});
    }
  }
}