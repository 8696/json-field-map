var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.JSONFieldMap = void 0;
    var valueType = function (obj) {
        return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    };
    var deepClone = function (obj) {
        if (['object', 'array'].includes(valueType(obj))) {
            return JSON.parse(JSON.stringify(obj));
        }
        return obj;
    };
    var mergeOptions = function (options) {
        return {
            restValue: !!(options === null || options === void 0 ? void 0 : options.restValue),
            removeMapField: !!(options === null || options === void 0 ? void 0 : options.removeMapField),
            deepClone: !!(options === null || options === void 0 ? void 0 : options.deepClone),
            defaultValue: __assign({ null: null, string: '', number: 0, boolean: false, array: [], object: {} }, ((options === null || options === void 0 ? void 0 : options.defaultValue) || {}))
        };
    };
    var isInObject = function (obj, prop) {
        return obj.hasOwnProperty(prop);
    };
    var JSONFieldMap = function (origin, models, options) {
        options = mergeOptions(options);
        var defaultValue = options.defaultValue, restValue = options.restValue, removeMapField = options.removeMapField, isDeepClone = options.deepClone;
        isDeepClone && (origin = deepClone(origin));
        if (models.type === 'object') {
            var target_1 = {};
            Object.keys(models.model).forEach(function (prop) {
                var model = models.model[prop];
                if (typeof model === 'string') {
                    /** model 是一个 string 时直接从源数据取 */
                    target_1[prop] = origin[model];
                    return restValue && removeMapField && delete origin[model];
                }
                // 目标字段
                var field = model.field;
                // 是否存在默认值
                var isHasModelDefaultValue = isInObject(model, 'default');
                // 默认值
                var modelDefaultValue = model.default;
                // 是否存在目标字段
                var isHasOriginField = isInObject(origin, field);
                // 目标数据
                var originFieldValue = origin[field];
                // 该 model 下是否存在 model
                var isHasModel = isInObject(model, 'model');
                // 类型
                var type = model.type;
                switch (type) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                    case 'null':
                        /** 源数据字段存在 并且 源数据类型和期望类型一致 */
                        target_1[prop] = (isHasOriginField && valueType(originFieldValue) === type)
                            ? originFieldValue
                            /** 不存在 或者 类型不一致取默认值 或者 返回 预设的默认值 */
                            : (isHasModelDefaultValue ? modelDefaultValue : defaultValue[type]);
                        restValue && removeMapField && delete origin[field];
                        break;
                    case 'object':
                        /** model 不存在表示只是想取别名 */
                        if (!isHasModel) {
                            /** 源数据对象字段存在 并且 是对象直接 */
                            target_1[prop] =
                                (isHasOriginField && valueType(originFieldValue) === type)
                                    ? originFieldValue
                                    : (
                                    /** 否则 返回默认值 */
                                    isHasModelDefaultValue ? modelDefaultValue : defaultValue[type]);
                        }
                        /** model 存在 但是源数据对象不存在 或者 不是一个对象 */
                        else if (valueType(originFieldValue) !== type) {
                            /** 存在默认值就取默认值 */
                            target_1[prop] = isHasModelDefaultValue
                                ? modelDefaultValue
                                /** 否则补充 model 定义的字段 */
                                : (0, exports.JSONFieldMap)({}, model, options);
                        }
                        else {
                            target_1[prop] = (0, exports.JSONFieldMap)(originFieldValue, model, options);
                        }
                        restValue && removeMapField && delete origin[field];
                        break;
                    case 'array':
                        /** model 不存在表示只是想取别名 */
                        if (!isHasModel) {
                            /** 源数据对象字段存在且是对象直接返回 */
                            target_1[prop] =
                                (isHasOriginField && valueType(originFieldValue) === type)
                                    ? originFieldValue
                                    : (
                                    /** 否则 返回默认值 */
                                    isHasModelDefaultValue ? modelDefaultValue : defaultValue[type]);
                        }
                        /** model 存在 但是源数据字段数组不存在 或者不是一个数组 */
                        else if (valueType(originFieldValue) !== type) {
                            /** 存在默认值就取默认值 */
                            target_1[prop] = isHasModelDefaultValue
                                ? modelDefaultValue
                                /** 不存在取预设的默认值 */
                                : defaultValue[type];
                        }
                        else {
                            target_1[prop] = (0, exports.JSONFieldMap)(originFieldValue, model, options);
                        }
                        restValue && removeMapField && delete origin[field];
                        break;
                }
            });
            return __assign(__assign({}, (restValue ? origin : {})), target_1);
        }
        var array = [];
        origin.forEach(function (originItem) {
            /** 判断子项是否还是数组 */
            var isArray = valueType(originItem) === 'array';
            array.push((0, exports.JSONFieldMap)(originItem, {
                type: isArray ? 'array' : 'object',
                model: isArray ? models.model.model : models.model
            }, options));
        });
        return array;
    };
    exports.JSONFieldMap = JSONFieldMap;
});
//# sourceMappingURL=main.js.map