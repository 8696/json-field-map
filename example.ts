import { JSONFieldMap } from './main';


/*********** 基础用法 ***************/

console.log('基础用法');
const obj1 = {
  user: 'long'
}

const result1 = JSONFieldMap(obj1, {
  type: 'object',
  model: {
    username: 'user'
  }
})
console.log(result1);
console.log(JSON.stringify(result1, null, '\t'));


/*********** 默认自动去除多余参数 ***************/
console.log('默认自动去除多余参数');
const obj2 = {
  user: 'long',
  age: 2022,
  a: 1,
  b: 2
}

const result2 = JSONFieldMap(obj2, {
  type: 'object',
  model: {
    username: 'user'
  }
})
console.log(result2);
console.log(JSON.stringify(result2, null, '\t'));
/**
 * {
 * 	"username": "long"
 * }
 * */


/*********** 接收剩余参数 ***************/
console.log('接收剩余参数');
const obj3 = {
  user: 'long',
  age: 2022
}

const result3 = JSONFieldMap(obj3, {
  type: 'object',
  model: {
    username: 'user'
  }
}, {
  restValue: true
})
console.log(result3);
console.log(JSON.stringify(result3, null, '\t'));
/**
 * {
 * 	"user": "long",
 * 	"age": 2022,
 * 	"username": "long"
 * }
 * */


/*********** 接收剩余参数 且 移除映射的字段 ***************/
console.log('接收剩余参数 且 移除映射的字段');
const obj4 = {
  user: 'long',
  age: 2022
}

const result4 = JSONFieldMap(obj4, {
  type: 'object',
  model: {
    username: 'user'
  }
}, {
  restValue: true,
  /**
   * @description 通过可选参数配置 restValue 需开启时才能移除映射字段
   * */
  removeMapField: true
})
console.log(result4);
console.log(obj4)
console.log(JSON.stringify(result4, null, '\t'));


/*********** 指定映射数据类型 ***************/
console.log('指定映射数据类型');
const obj5 = {
  user: 'long',
  head: 1
}

const result5 = JSONFieldMap(obj5, {
  type: 'object',
  model: {
    username: 'user',
    age: {
      type: 'number',
      field: 'age'
    },
    head: {
      type: 'string',
      field: 'head'
    }
  }
})
console.log(result5);
console.log(obj5)
console.log(JSON.stringify(result5, null, '\t'));

/*********** 设置默认值 ***************/

console.log('设置默认值');
const obj6 = {}

const result6 = JSONFieldMap(obj6, {
  type: 'object',
  model: {
    username: 'user',
    age: {
      type: 'number',
      field: 'age'
    },
    head: {
      type: 'string',
      field: 'head'
    }
  }
}, {
  defaultValue: {
    number: 2022,
    string: 'string default value'
  }
})
console.log(result6);
console.log(obj6)
console.log(JSON.stringify(result6, null, '\t'));

/*********** 设置指定字段的默认值 ***************/

console.log('设置指定字段的默认值');
const obj7 = {}

const result7 = JSONFieldMap(obj7, {
  type: 'object',
  model: {
    age: {
      type: 'number',
      field: 'age',
      default: 2022
    }
  }
}, {
  defaultValue: {
    number: 1
  }
})
console.log(result7);
console.log(obj7)
console.log(JSON.stringify(result7, null, '\t'));


/*********** 深拷贝 ***************/

console.log('深拷贝');
const obj8 = {
  a: 1,
  b: 2,
  c: 3
}

const result8 = JSONFieldMap(obj8, {
  type: 'object',
  model: {
    a: 'a',
    b: 'b'
  }
}, {
  restValue: true,
  removeMapField: true,
  deepClone: true
})
console.log(result8);
console.log(obj8)
console.log(JSON.stringify(result8, null, '\t'));


/*********** 数组 ***************/

console.log('数组');
const obj9 = [
  {a: 1, b: 2, c: 3},
  {a: 11, b: 22, c: 33}
];

const result9 = JSONFieldMap(obj9, {
  type: 'array',
  model: {
    a: 'a',
    b2: {
      field: 'b',
      type: 'number'
    }
  }
})
console.log(result9);
console.log(obj9)
console.log(JSON.stringify(result9, null, '\t'));


/*********** 更复杂的例子 ***************/


console.log('更复杂的例子');
const obj10 = {
  b_list: [
    [
      {
        b_b_name: 'b_b_name',
        b_b_list: [
          {
            b_b_b_list: [
              [
                [
                  [
                    {
                      b_b_b_b_list_name: 'b_b_b_b_list_name_11',
                      b_b_b_b_list_number: [1, 2, 3, 4]
                    },
                    {
                      b_b_b_b_list_name: 'b_b_b_b_list_name_22',
                      b_b_b_b_list_number: [5, 6, 7, 8]
                    }
                  ]
                ]
              ]
            ]
          }
        ]
      }
    ]
  ]
};

const result10 = JSONFieldMap(obj10, {
  type: 'object',
  model: {
    b_list_as_name: {
      type: 'array',
      field: 'b_list',
      model: {
        type: 'array',
        model: {
          b_b_name: 'b_b_name',
          b_b_list_as_name: {
            type: 'array',
            field: 'b_b_list',
            model: {
              b_b_b_list: {
                type: 'array',
                field: 'b_b_b_list',
                model: {
                  type: 'array',
                  model: {
                    type: 'array',
                    model: {
                      type: 'array',
                      model: {
                        b_b_b_b_list_name_as_name: 'b_b_b_b_list_name'
                      }
                    }
                  }
                }
              }
            }
          },
          b_b_list_as_name_2: {
            type: 'boolean',
            field: ''
          }
        }
      }
    }
  }
},
  {
    restValue: true,
    removeMapField: true,
    deepClone: true
  })
console.log(result10);
console.log(obj10)
console.log(JSON.stringify(result10, null, '\t'));



/*********** 补全对象 ***************/
console.log('补全对象');
const obj11 = {
};

const result11 = JSONFieldMap(obj11, {
    type: 'object',
    model: {
      list: {
        type: 'object',
        field: 'list',
        model: {
          a: {
            type: 'string',
            field: 'a'
          }
        }
      }
    }
  },
  {
    restValue: true,
    removeMapField: true,
    deepClone: true
  })
console.log(result11);
console.log(obj11)
console.log(JSON.stringify(result11, null, '\t'));
