export function obj2Str(bodyObj: { [key: string]: string | number }) {
  const bodyStr = Object.keys(bodyObj)
    .map((key) => {
      return `${key}=${bodyObj[key]}`;
    })
    .join('&');
  return bodyStr;
}
export function objToFormData(bodyObj: { [key: string]: string | number }) {
  const formatData = new FormData()
  Object.keys(bodyObj)
    .forEach((key) => {
      formatData.append(key, `${bodyObj[key]}`)
    })
  return formatData;
}

export const delay = (n: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, n);
  });
};

export function uniqBy<T>(itemList: T[], cb: (e: T) => string) {
  return [...new Set(itemList.map(cb)).values()].map((s) => {
    return itemList.find((el) => cb(el) === s) as T;
  });
}
