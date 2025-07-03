// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function deepClone(obj: any, visited = new WeakMap()) : any {
    if(obj && typeof obj.copy === 'function' && obj.shape) {
        return obj.copy();
    }
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (visited.has(obj)) {
        return visited.get(obj);
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }

    if (Array.isArray(obj)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const arr: any[] = [];
        visited.set(obj, arr);
        obj.forEach((item, i) => {
            arr[i] = deepClone(item, visited);
        });
        return arr;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clonedObj: { [key: string]: any } = {};
    visited.set(obj, clonedObj);
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            clonedObj[key] = deepClone(obj[key], visited);
        }
    }
    return clonedObj;
}