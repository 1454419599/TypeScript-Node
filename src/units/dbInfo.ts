export namespace myDb {
  // export interface userinfoRole {
  //   role: enum; 
  // }
  export interface userinfoField {
    ID?: number,
    icon?: string,
    user?: string,
    password?: string,
    role?: string,
    affiliatedUnit?: string,
    extNumber?: string,
    sex?: string,
    realName?: string,
    creationTime?: string,
    lastLoginTime?: string,
    lastChangeTime?: string,
  }

  export interface deviceListField {
    ID?: number,
    status?: string,
    site?: string,
    owner?: string,
    deviceId?: string,
    deviceType?: string,
    devicesite?: string,
    affiliation?: string,
    creationTime?: string,
    lastChangeTime?: string,
  }
}