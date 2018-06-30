let api = [
  {
    "login": {
      "title": "用户登录",
      "url": "http://172.17.203.113/admin/login",
      "method": "post",
      "para": {
        "user": "",
        "password": "",
        "affiliatedUnit": "",
      },
      "return": [{
        "code": "true, false",
        "message": "xxx",
      }],
      "description": "失败返回，成功跳转",
    }
  },
]
export { api };