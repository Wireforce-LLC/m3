export default class Node {
    /**
     * Retrieves the types of the properties in an object.
     *
     * @param obj - The object to get the types from.
     * @returns An object mapping property paths to their respective types.
     */
    static getTypes<T>(obj: T): Record<string, any>|string {
        if (typeof obj !== 'object' || obj === null) return getType(obj);
        if (Array.isArray(obj)) return getArrayType(obj);
        if (obj instanceof Date) return 'Date';
        if (obj instanceof RegExp) return 'RegExp';
        if (obj instanceof Error) return 'Error';
        if (obj === undefined) return 'Undefined';
        if (obj === null) return 'Null';

        const types: Record<string, string> = {};
      
        function mapTypes(innerObj: any, path: string[] = []): void {
          for (const [key, value] of Object.entries(innerObj)) {
            const currentPath = [...path, key].join('.');
      
            if (Array.isArray(value)) {
              types[currentPath] = getArrayType(value);
            } else if (typeof value === 'object' && value !== null) {
              mapTypes(value, [...path, key]);
            } else {
              types[currentPath] = getType(value);
            }
          }
        }
      
        function getType(value: any): string {
          if (typeof value === 'string') return 'String';
          if (typeof value === 'number') return Number.isInteger(value) ? 'Int' : 'Float';
          if (typeof value === 'boolean') return 'Boolean';
          if (value === null) return 'Null';
          if (typeof value === 'object') return 'Object'; // Для объектов, которые не являются массивами
          if (typeof value === 'function') return 'Function';
          return 'Unknown'; // Добавьте для обработки типов, которые не были учтены
        }
      
        function getArrayType(arr: any[]): string {
          if (arr.length === 0) return 'Array<Empty>';
          
          const elementType = getType(arr[0]);
          
          // Проверка, все ли элементы одного типа (упрощенно)
          // Если элементы разных типов, это можно усложнить
          for (const element of arr) {
            if (getType(element) !== elementType) return 'Array<Mixed>';
          }
          
          return `Array<${elementType}>`;
        }
      
        mapTypes(obj);
      
        return types;
      }
      
}