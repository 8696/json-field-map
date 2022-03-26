type JSON_Type = 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object'

type Model = {
  type: JSON_Type
  field: string
  model?: Models
  default?: any
}
//
type Models = {
  [prop: string]: string | Models | Model
  type?: 'array' | 'object',
  model?: Models
}

const type = (obj: any): JSON_Type => {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
};

const deepClone = (obj: any) => {
  if (['object', 'array'].includes(type(obj))) {
    return JSON.parse(JSON.stringify(obj))
  }
  return obj
}

type Options = {
  /** 默认值 */
  defaultValue?: {
    [key in JSON_Type]?: any;
  }
  /** 接收对象剩余值 */
  restValue?: boolean
}

const mergeOptions = (options?: Options): Options => {
  return {
    restValue: !!options?.restValue,
    defaultValue: {
      null: null,
      string: '',
      number: 0,
      boolean: false,
      array: [],
      object: {},
      ...(options?.defaultValue || {})
    }
  }
}

const isInObject = (obj: object, prop: string) => {
  return obj.hasOwnProperty(prop)
};

const JSONFieldMap = (origin: any[] | { [prop: string]: any }, models: Models, options?: Options) => {

  options = mergeOptions(options);

  const { defaultValue, restValue } = options

  if (models.type === 'object') {
    const target = {};
    Object.keys(models.model).forEach(prop => {
      const model = <string | Model>models.model[prop]
      if (typeof model === 'string') {
        /** model 是一个 string 时直接从源数据取 */
        return target[prop] = deepClone(origin[model])
      }
      // Model
      const field: string = model.field
      switch (model.type) {
        case 'string':
        case 'number':
        case 'boolean':
        case 'null':
          /** 源数据字段存在 并且 源数据类型和期望类型一致 */
          target[prop] = (isInObject(origin, model.field) && type(origin[model.field]) === model.type)
            ? origin[model.field]
            /** 不存在 或者 类型不一致取默认值 或者 返回 预设的默认值 */
            : (isInObject(model, 'default') ? model.default : defaultValue[model.type]);
          break;
        case 'object':
          /** model 不存在表示只是想取别名 */
          if (!model.model) {
            /** 源数据对象字段存在 并且 是对象直接 */
            return target[prop] =
              (isInObject(origin, field) && type(origin[field]) === 'object')
                ? deepClone(origin[field])
                : (
                  /** 否则 返回默认值 */
                  isInObject(model, 'default') ? model.default : defaultValue.object
                )
          }
          /** model 存在 但是源数据对象不存在 或者 不是一个对象 */
          if (type(origin[field]) !== 'object') {
            /** 存在默认值就取默认值 */
            return target[prop] = isInObject(model, 'default')
              ? model.default
              /** 否则补充 model 定义的字段 */
              : JSONFieldMap({}, model as Models, options)
          }
          target[prop] = JSONFieldMap(origin[field], model as Models, options)
          break;
        case 'array':
          /** model 不存在表示只是想取别名 */
          if (!model.model) {
            /** 源数据对象字段存在且是对象直接返回 */
            return target[prop] =
              (isInObject(origin, field) && type(origin[field]) === 'array')
                ? deepClone(origin[field])
                : (
                  /** 否则 返回默认值 */
                  isInObject(model, 'default') ? model.default : defaultValue.array
                )
          }
          /** model 存在 但是源数据字段数组不存在 或者不是一个数组 */
          if (type(origin[field]) !== 'array') {
            /** 存在默认值就取默认值 */
            return target[prop] = isInObject(model, 'default')
              ? model.default
              /** 不存在取预设的默认值 */
              : defaultValue.array
          }
          target[prop] = JSONFieldMap(origin[field], model as Models, options)
          break;
      }
    })
    return {...(restValue ? origin : {}), ...target};
  }
  const array = [];
  origin.forEach(originItem => {
    /** 判断子项是否还是数组 */
    const isArray = type(originItem) === 'array'
    array.push(JSONFieldMap(originItem, {
      type: isArray ? 'array' : 'object',
      model: isArray ? models.model.model : models.model
    }, options))
  })
  return array
};


const data = [
  {
    list: [
      {
        list_list: [
          [
            [
              {
                list_list_a: 'a',
                list_list_b: 'b',
                list_list_c: {
                  a: '1',
                  b: 2,
                  c: true,
                  e: ['e', 'f']
                }
              }
            ]
          ]
        ]
      }
    ]
  }
];

const a = JSONFieldMap(data, {
  type: 'array',
  model: {
    list2: {
      type: 'array',
      field: 'list',
      model: {
        list_list: {
          type: 'array',
          field: 'list_list',
          model: {
            type: 'array',
            model: {
              type: 'array',
              model: {
                list_list_a_a: {
                  type: 'null',
                  field: 'list_list_a'
                },
                list_list_b_b: 'list_list_b',
                list_list_c_c: {
                  field: 'list_list_c',
                  type: 'object',
                  model: {
                    a: {
                      type: 'number',
                      field: 'a'
                    },
                    b: 'b',
                    c: 'c',
                    d: {
                      type: 'array',
                      field: 'e',
                      model: {
                        a: 'a'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}, {
  restValue: false,
  defaultValue: {
    // boolean: 1,
    // null: 'null',
    // array: [1]
  }
});


console.log(a);
console.log(JSON.stringify(a, null, '\t'));

