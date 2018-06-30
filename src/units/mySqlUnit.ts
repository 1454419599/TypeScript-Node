import mysql, { Pool, PoolConnection } from "mysql";
import { myPromiseCatch } from "./myError";

type conn = PoolConnection;
type myType = string | number | null | undefined;
export namespace oMySQL {
  export interface mysqlConfig {
    host?: string,
    port?: number,
    user?: string,
    password?: string,
    database?: string,
    debug?: boolean,
  }

  export let mysqlOptions: mysqlConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    debug: process.env.ENV !== 'production'
  };

  export class Mysql {
    private config: mysqlConfig = mysqlOptions;
    private pool: Pool;

    constructor(config: mysqlConfig = {}) {
      Object.assign(this.config, config);
      this.pool = mysql.createPool(this.config);
      // console.log(this.config);
    }

    getConnection(): Promise<conn> {
      return myPromiseCatch(async (resolve, reject) => {
        this.pool.getConnection((err, connection) => {
          err ? reject(err) : resolve(connection);
        })
      });
      // return new Promise(((resolve, reject) => {
      //   this.pool.getConnection((err, connection) => {
      //     err ? reject(err) : resolve(connection);
      //   })
      // }));
    }

    query(connection: conn, sql: string, valueArray: myType[] = []) {
      return myPromiseCatch(async (resolve, reject) => {
        connection.query(sql, valueArray, (err, result) => {
          err ? reject(err) : resolve(result);
        })
      });
      // return new Promise((resolve, reject) => {
      //   connection.query(sql, valueArray, (err, result) => {
      //     err ? reject(err) : resolve(result);
      //   })
      // });
    }

    release(connection: conn) {
      return myPromiseCatch(async (resolve, reject) => {
        connection.release();
        resolve();
      });
      // return new Promise((resolve, reject) => {
      //   connection.release();
      //   resolve();
      // });
    }

    result(sql: string, valueArray: myType[] = []) {
      return myPromiseCatch(async (resolve, reject) => {
        let connection: conn = await this.getConnection();
        let result = await this.query(connection, sql, valueArray);
        await this.release(connection);
        resolve(result);
      });
      // return new Promise(async (resolve, reject) => {
      //   let connection: conn = await this.getConnection();
      //   let result = await this.query(connection, sql, valueArray);
      //   await this.release(connection);
      //   resolve(result);
      // });
    }

    begin(connection: conn) {
      return myPromiseCatch((resolve, reject) => {
        connection.beginTransaction(err => {
          err ? reject(err) : resolve();
        })
      });
      // return new Promise((resolve, reject) => {
      //   connection.beginTransaction(err => {
      //     err ? reject(err) : resolve();
      //   })
      // });
    }

    queryTransaction(connection: conn, sql: string, valueArray: myType[] = []) {
      return myPromiseCatch(async (resolve, reject) => {
        connection.query(sql, valueArray, (err, result) => {
          if (err) {
            connection.rollback();
            connection.release();
            reject(err);
          } else {
            resolve(result);
          }
        })
      });

      // return new Promise((resolve, reject) => {
      //   connection.query(sql, valueArray, (err, result) => {
      //     if (err) {
      //       console.log('my Error 0', err);
      //       connection.rollback();
      //       connection.release();
      //       console.log('自动回滚完毕');
      //       reject(err);
      //     } else {
      //       resolve(result);
      //     }
      //   });
      // }).catch(e => {
      //   console.log('my Error 1', e);
      //   throw e;
      // });
    }

    commit(connection: conn) {
      return myPromiseCatch(async (resolve, reject) => {
        connection.commit(err => {
          err ? reject(err) : resolve();
        });
      });
      // return new Promise((resolve, reject) => {
      //   connection.commit(err => {
      //     err ? reject(err) : resolve();
      //   });
      // });
    }

    resultTransaction(sql: string, valueArray: myType[] = []) {
      return myPromiseCatch(async (resolve, reject) => {
        let connection = await this.getConnection();
        await this.begin(connection);
        let result = await this.queryTransaction(connection, sql, valueArray);
        await this.commit(connection);
        await this.release(connection);
        resolve(result);
      });
    }
    // return new Promise(async (resolve, reject) => {
    //   try {
    //     let connection = await this.getConnection();
    //     await this.begin(connection);
    //     console.log(">>>>>>>>")
    //     let result = await this.queryTransaction(connection, sql, valueArray);
    //     await this.commit(connection);
    //     await this.release(connection);
    //     console.log(">>>>>>>>", result)
    //     resolve(result);
    //   } catch (error) {
    //     reject(error);
    //   }
    // }).catch(e => {
    //   console.log('my Error 2', e);
    //   throw e;
    // });
  }
}