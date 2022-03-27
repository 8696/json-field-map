# json-field-map

JSON转换字段映射，支持字段别名、接收对象剩余参数、默认值、移除映射后字段、类型强校验

## Type

```ts
type JSON_Type = 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object'

/** 映射模型 */
type Model = {
  [prop: string]: string | Model | {
      /** JSON 六个数据类型 */
      type: JSON_Type
      /** 源数据字段 */
      field: string
      /** 模型 */
      model?: Model
      /** 默认值 */
      default?: any
    }
  type?: 'array' | 'object',
  model?: Model
}

/** 可选项 */
type Options = {
  /** 默认值 */
  defaultValue?: {
    [key in JSON_Type]?: any;
  }
  /** 接收对象剩余字段 */
  restValue?: boolean
  /** 映射后删除字段 | restValue 为 true 时生效 | default: false */
  removeMapField?: boolean
  /** 深拷贝：在开启 removeMapField 后如果源数据需要使用建议开启深拷贝，否则对源数据字段进行删除 | default: false */
  deepClone?: boolean
}
```


### 预设默认值

当 `model` 指定目标数据 `类型` 时找不到 **源字段** 、 **数据类型不符合** 或者 **model中没有设置默认值** 时将按照此默认值进行赋值

```ts
const defaultValue = {
  null: null,
  string: '',
  number: 0,
  boolean: false,
  array: [],
  object: {}
}
```


### API

- JSONFieldMap
  - param
    - data: Object | Array
    - model: Model
    - options?: Options


### 基础用法

```ts
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
```
```json
{
  "username": "long"
}
```

### 默认自动去除多余参数

默认只会保留在 `model` 中定义的字段

```ts
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
```
```json
{
    "username": "long"
}
```

### 接收剩余参数

```ts
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
```
```json
{
    "user": "long",
    "age": 2022,
    "username": "long"
}
```

### 接收剩余参数 且 移除映射的字段

通过可选参数配置 `restValue` 需开启时才能移除映射字段

```ts
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
  removeMapField: true,
})
console.log(result4);
```
```json
{
    "age": 2022,
    "username": "long"
}
```

### 指定映射数据类型

```ts
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
```

age 字段在源数据中并不存在，按照可选参数默认值的逻辑，age 设置类型为 number，那么预设的默认值则是 0

而 head 字段中 model 定义的是 string 类型，和源数据的数据类型不符合，所以也是取默认值

```json
{
    "username": "long",
    "age": 0,
    "head": ""
}
```

### 设置默认值

可选项 `defaultValue` 可以设置不同的数据类型的默认值

```ts
const obj6 = {
}
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
```

`username` 字段为 `undefined` 是因为映射关系是一个`快速`的方式

```json
{
    "username": undefined,
    "age": 2022,
    "head": "string default value"
}
```

### 设置指定字段的默认值
```ts
const obj7 = {
}

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
```
```json
{
    "age": 2022
}
```


### 深拷贝
```ts
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
  // 接收剩余参数
  restValue: true,
  // 移除映射后的字段
  removeMapField: true
})
console.log(result8);
console.log(obj8)
```

在开启移除映射后的字段后，执行完后此时 `obj8` 对象。因为`移除映射后的字段`且`接收剩余值时`就必须得将源对象的字段删除，且为了性能考虑默认不开启深拷贝
```json
{
    "c": 3
}
```

开启`深拷贝`即在`可选项`加 `deepClone: true` 即可


### 数组

```ts
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
```
```json
[
  {
    "a": 1,
    "b2": 2
  },
  {
    "a": 11,
    "b2": 22
  }
]
```


### 更复杂的例子
```ts

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
```

```json
{
  "b_list_as_name": [
    [
      {
        "b_b_name": "b_b_name",
        "b_b_list_as_name": [
          {
            "b_b_b_list": [
              [
                [
                  [
                    {
                      "b_b_b_b_list_number": [
                        1,
                        2,
                        3,
                        4
                      ],
                      "b_b_b_b_list_name_as_name": "b_b_b_b_list_name_11"
                    },
                    {
                      "b_b_b_b_list_number": [
                        5,
                        6,
                        7,
                        8
                      ],
                      "b_b_b_b_list_name_as_name": "b_b_b_b_list_name_22"
                    }
                  ]
                ]
              ]
            ]
          }
        ],
        "b_b_list_as_name_2": false
      }
    ]
  ]
}
```

