import crypto from "crypto";

class md5  {
  private md5Suffix = '2786shdgfsjh834645dg97%^%$&()jsdbjk7465564654646%……￥%#&……*UJKBJ78';

  async getMd5(this: md5,str: string): Promise<any> {
    let md5 = crypto.createHash('md5');
    md5.update(str + this.md5Suffix);
    return md5.digest('hex');
  }
}

export default new md5();