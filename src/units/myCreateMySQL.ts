import fs from "fs";
import { oMySQL } from "../units/mySqlUnit";
import getSqlContentMap from "./readSqlFile/get_sql_content_map";

const eventLog = (err: any, sqlFile: any, index: any) => {
  if (err) {
    console.log(`[ERROR] sql脚本文件: ${sqlFile} 第${index + 1}条脚本 执行失败 o(╯□╰)o ！`);
  } else {
    console.log(`[SUCCESS] sql脚本文件: ${sqlFile} 第${index + 1}条脚本 执行成功 O(∩_∩)O !`);
  }
}

const createAllTables = async () => {
  let sqlContentMap = getSqlContentMap();
  for (let key in sqlContentMap) {
    let mysql;
    if (key === 'createDatabase.sql') {
      console.log('database');
      mysql = new oMySQL.Mysql({ debug: false });
    } else {
      mysql = new oMySQL.Mysql({
        database: "electricity",
        debug: false,
      });
    }
    let sqlShell = sqlContentMap[key];
    let sqlShellList = sqlShell.split(';');
    for (let [i, shell] of sqlShellList.entries()) {
      if (shell.trim()) {
        let result: any = await mysql.resultTransaction(shell.trim());
        if (result.serverStatus * 1 === 2 || result.serverStatus * 1 === 3) {
          eventLog(null, key, i);
        } else {
          eventLog(true, key, i);
        }
      }
    }
  }
}
console.log('sql ok!!');
// createAllTables();
export default createAllTables;

