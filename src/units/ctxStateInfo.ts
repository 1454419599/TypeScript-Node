import { Context } from "koa";

export interface send {
  file: Function,
  json: Function,
}
export interface log {
  trace: Function,
  debug: Function,
  info: Function,
  warn: Function,
  error: Function,
  fatal: Function,
  mark: Function,
}
export interface reqJson {
  reqJson: any,
}
export default interface stateInfo {
  send: send,
  log: log,
  reqJson: reqJson,
}
export function setState() {
  return async (ctx: Context, next: () => Promise<any>) => {
    ctx.state as stateInfo;
    await next();
  }
}