export function retrieveDataFromPath(data: {[key: string]: any}, path: string): any {
  const pathParts = path.split(/\.|\[(\d+)\]/i).filter((v) => !!v);
  return retrieveDataFromPathInner(data, pathParts);
}

function retrieveDataFromPathInner(data: {[key: string]: any}, pathParts: string[]): any {
  if (pathParts.length && !!data) {
    data = data[pathParts.shift()];
    return retrieveDataFromPathInner(data, pathParts);
  }
  return data;
}
