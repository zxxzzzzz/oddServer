export function obj2Str(bodyObj) {
    const bodyStr = Object.keys(bodyObj)
        .map((key) => {
        return `${key}=${bodyObj[key]}`;
    })
        .join('&');
    return bodyStr;
}
export function objToFormData(bodyObj) {
    const formatData = new FormData();
    Object.keys(bodyObj)
        .forEach((key) => {
        formatData.append(key, `${bodyObj[key]}`);
    });
    return formatData;
}
export const delay = (n) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, n);
    });
};
export function uniqBy(itemList, cb) {
    return [...new Set(itemList.map(cb)).values()].map((s) => {
        return itemList.find((el) => cb(el) === s);
    });
}
