import { oMySQL } from "./mySqlUnit";
import { myDb } from "../units/dbInfo";
import { myPromiseCatch } from "./myError";
type myType = string | number | null | undefined;
export type myDbFeild = myDb.userinfoField | myDb.deviceListField;

let db: oMySQL.mysqlConfig = {
  database: 'electricity'
};

interface oLimit {
  start: number;
  length: number;
}

interface oORDER {
  feild: string[];
  DESC?: boolean;
}

export interface insertOptions<T extends myDbFeild> {
  table: string,
  kv: T,
}

export interface deleteOptions<T extends myDbFeild> {
  table: string,
  wherekv?: T,
  where?: string,
  BINARY?: boolean,
}

export interface updateOptions<T extends myDbFeild> extends insertOptions<T>, deleteOptions<T> { }

export interface selectOptions<T extends myDbFeild> extends deleteOptions<T> {
  feildkv?: string[];
  feild?: string;
  LIMIT?: oLimit;
  ORDER?: string;
  ORDERarr?: oORDER[];
}

function matching<T>(wherekv?: T, where?: string, BINARY?: boolean) {
  let values: any = [];
  let limit: string = '';
  if (wherekv) {
    let keyValue = Object.entries(wherekv).map(([key, value]) => {
      values.push(value);
      return `\`${key}\` = ? `;
    });
    limit = `WHERE ${BINARY ? ' BINARY' : ''} (${keyValue.join(' AND ')})`;
  } else if (where) {
    limit = `WHERE ${BINARY ? ' BINARY' : ''} (${where})`;
  } else {
    limit = '';
  }

  return { limit, values };
}

function jsonParser(strArr: string[]): oORDER[] {
  console.log(strArr);
  let str = strArr.join();
  let arr = str.match(/\{[^\}]+\}/g);
  console.log("arr >>>", arr);
  let oArr = arr ? arr.map(value => {
    let a = JSON.parse(value);
    a.feild = a.feild.split(',');
    return a;
  }) : [];
  console.log(oArr);
  return oArr;
}
export class mysql<T extends myDbFeild> {
  private mySQL: oMySQL.Mysql;

  private INSERT: string = '';

  private DELETE: string = '';

  private UPDATE: string = '';

  private SELECT: string = '';

  constructor(mySQL?: oMySQL.mysqlConfig) {
    mySQL = Object.assign(oMySQL.mysqlOptions, db, mySQL);
    this.mySQL = new oMySQL.Mysql(mySQL);
  }

  insert(options: insertOptions<T>) {
    return myPromiseCatch(async (resolve, reject) => {
      let { table, kv } = options;
      let keys: string[] = [];
      let values: myType[] = [];
      for (let [key, value] of Object.entries(kv)) {
        keys.push(`\`${key}\``);
        values.push(value);
      }
      this.INSERT = `INSERT INTO \`${table}\` (${keys.join(',')}) VALUES (${keys.fill('?').join(',')})`;
      console.log(this.INSERT);
      console.log(values);
      let result = await this.mySQL.resultTransaction(this.INSERT, values);
      console.log('insert <><><><><><>');
      resolve(result);
    });
  }

  delete(options: deleteOptions<T>) {
    return myPromiseCatch(async (resolve, reject) => {
      let { table, where, wherekv, BINARY = false } = options;
      let { limit, values } = matching<T>(wherekv, where, BINARY);

      this.DELETE = `DELETE FROM \`${table}\` ${limit}`;
      console.log(this.DELETE);
      let result = await this.mySQL.resultTransaction(this.DELETE, values);
      resolve(result);
    });
  }

  update(options: updateOptions<T>) {
    return myPromiseCatch(async (resolve, reject) => {
      let { table, kv, where, wherekv, BINARY = false } = options;
      let { limit, values } = matching<T>(wherekv, where, BINARY);

      let keys = Object.keys(kv).map(key => `\`${key}\` = ?`);
      values = [...Object.values(kv).map(value => value), ...values];

      this.UPDATE = `UPDATE \`${table}\` SET ${keys} ${limit}`
      console.log(this.UPDATE, values);

      let result = await this.mySQL.resultTransaction(this.UPDATE, values);

      resolve(result);
    });
  }

  select(options: selectOptions<T>) {
    return myPromiseCatch(async (resolve, reject) => {
      let { table, feildkv = [], feild, where, wherekv, BINARY = false, LIMIT, ORDERarr = [], ORDER } = options;
      let { limit, values } = matching<T>(wherekv, where, BINARY);
      let ORDERFeilds: string;
      let columnName: string;
      let oLIMIT: string;

      console.log(ORDERarr, ORDERarr.length);
      columnName = feild ? feild : feildkv.length === 0 ? '*' : feildkv.map(value => `\`${value}\``).join(', ');

      oLIMIT = LIMIT ? `LIMIT ${LIMIT.start}, ${LIMIT.length}` : '';

      ORDERFeilds = ORDER ? `ORDER BY ${ORDER}` : ORDERarr.length > 0 ? `ORDER BY ${jsonParser([ORDERarr.join()]).map(obj => {
        let { feild, DESC } = obj;
        console.log(feild,DESC);
        return DESC ? feild.map(value => `\`${value}\` DESC`).join(', ') : feild.map(value => `\`${value}\` ASC`).join(', ');
      }).join(', ')}` : '';

      this.SELECT = `SELECT ${columnName} FROM \`${table}\` ${limit} ${ORDERFeilds} ${oLIMIT}`;
      console.log(this.SELECT, values);
      let result = await this.mySQL.resultTransaction(this.SELECT, values);
      resolve(result);
    });

  }
}