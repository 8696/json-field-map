type JSON_Type = 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object'

type M = {
  /** JSON 六个数据类型 */
  type: JSON_Type
  /** 源数据字段 */
  field: string
  /** 模型 */
  model?: Model
  /** 默认值 */
  default?: any
}
//
type Model = {
  [prop: string]: string | Model | M
  type?: 'array' | 'object',
  model?: Model
}

const valueType = (obj: any): JSON_Type => {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}

const deepClone = (obj: any) => {
  if (['object', 'array'].includes(valueType(obj))) {
    return JSON.parse(JSON.stringify(obj))
  }
  return obj
}

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

const mergeOptions = (options?: Options): Options => {
  return {
    restValue: !!options?.restValue,
    removeMapField: !!options?.removeMapField,
    deepClone: !!options?.deepClone,
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

const isInObject = (obj: object, prop: string): boolean => {
  return obj.hasOwnProperty(prop)
}

export const JSONFieldMap = (origin: any[] | { [prop: string]: any }, models: Model, options?: Options) => {

  options = mergeOptions(options);

  const {defaultValue, restValue, removeMapField, deepClone: isDeepClone} = options

  isDeepClone && (origin = deepClone(origin));

  if (models.type === 'object') {
    const target = {};
    Object.keys(models.model).forEach(prop => {
      const model = <string | M>models.model[prop]
      if (typeof model === 'string') {
        /** model 是一个 string 时直接从源数据取 */
        target[prop] = origin[model]
        return restValue && removeMapField && delete origin[model];
      }
      // 目标字段
      const field: string = model.field
      // 是否存在默认值
      const isHasModelDefaultValue: boolean = isInObject(model, 'default')
      // 默认值
      const modelDefaultValue: any = model.default
      // 是否存在目标字段
      const isHasOriginField: boolean = isInObject(origin, field)
      // 目标数据
      const originFieldValue: any = origin[field]
      // 该 model 下是否存在 model
      const isHasModel = isInObject(model, 'model')
      // 类型
      const type = <JSON_Type>model.type
      switch (type) {
        case 'string':
        case 'number':
        case 'boolean':
        case 'null':
          /** 源数据字段存在 并且 源数据类型和期望类型一致 */
          target[prop] = (isHasOriginField && valueType(originFieldValue) === type)
            ? originFieldValue
            /** 不存在 或者 类型不一致取默认值 或者 返回 预设的默认值 */
            : (isHasModelDefaultValue ? modelDefaultValue : defaultValue[type]);
          restValue && removeMapField && delete origin[field];
          break;
        case 'object':
          /** model 不存在表示只是想取别名 */
          if (!isHasModel) {
            /** 源数据对象字段存在 并且 是对象直接 */
            target[prop] =
              (isHasOriginField && valueType(originFieldValue) === type)
                ? originFieldValue
                : (
                  /** 否则 返回默认值 */
                  isHasModelDefaultValue ? modelDefaultValue : defaultValue[type]
                )
          }
          /** model 存在 但是源数据对象不存在 或者 不是一个对象 */
          else if (valueType(originFieldValue) !== type) {
            /** 存在默认值就取默认值 */
            target[prop] = isHasModelDefaultValue
              ? modelDefaultValue
              /** 否则补充 model 定义的字段 */
              : JSONFieldMap({}, model as Model, options)
          } else {
            target[prop] = JSONFieldMap(originFieldValue, model as Model, options)
          }
          restValue && removeMapField && delete origin[field];
          break;
        case 'array':
          /** model 不存在表示只是想取别名 */
          if (!isHasModel) {
            /** 源数据对象字段存在且是对象直接返回 */
            target[prop] =
              (isHasOriginField && valueType(originFieldValue) === type)
                ? originFieldValue
                : (
                  /** 否则 返回默认值 */
                  isHasModelDefaultValue ? modelDefaultValue : defaultValue[type]
                )
          }
          /** model 存在 但是源数据字段数组不存在 或者不是一个数组 */
          else if (valueType(originFieldValue) !== type) {
            /** 存在默认值就取默认值 */
            target[prop] = isHasModelDefaultValue
              ? modelDefaultValue
              /** 不存在取预设的默认值 */
              : defaultValue[type]
          } else {
            target[prop] = JSONFieldMap(originFieldValue, model as Model, options)
          }
          restValue && removeMapField && delete origin[field];
          break;
      }
    })
    return {...(restValue ? origin : {}), ...target};
  }
  const array = [];
  origin.forEach(originItem => {
    /** 判断子项是否还是数组 */
    const isArray = valueType(originItem) === 'array'
    array.push(JSONFieldMap(originItem, {
      type: isArray ? 'array' : 'object',
      model: isArray ? models.model.model : models.model
    }, options))
  })
  return array
};

