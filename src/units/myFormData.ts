import { Context } from "koa"
import formidable from "formidable";
import util from "util";

import staticValue from "../static/staticValue";
async function post(ctx: Context, next: () => Promise<any>) {
  let post: any = {};
  let files: any = {};
  let form: formidable.IncomingForm;

  await new Promise((resolve, reject) => {
    form = new formidable.IncomingForm();
    form.uploadDir = staticValue.tmp;
    form.on('field', (field, value) => {
      if (form.type === 'multipart') {
        if (field in post) {
          if (util.isArray(post[field]) === false) {
            post[field] = [post[field]]
          }
          post[field].push(value);
          return false;
        }
      }
      post[field] = value;
    }).on('file', (field, file) => {
      files[field] = file;
    }).on('end', async () => {
      ctx.state.reqJson = post;
      ctx.state.files = files;
      resolve();
    }).on('error', err => {
      console.log("我是内置ERROR", err);
      reject();
      throw Error(err);
    });
    form.parse(ctx.req);
  });
}

async function get(ctx: Context, next: () => Promise<any>) {
  ctx.state.reqJson = ctx.query;
  return ;
}


export default function myFormData() {
  return async (ctx: Context, next: () => Promise<any>) => {
    let method = ctx.method.toLocaleUpperCase();
    switch (method) {
      case 'GET':
        await get(ctx, next);
        break;
      case 'POST':
        await post(ctx, next);
        break;
      default:
        console.log("未知 method", method);
    }
    await next();
  }
}
