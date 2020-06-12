import { retrieveDataFromPath } from '../utils/utils';

type IDecoratorReturn = (target: {}, propertyKey?: string) => void;

export enum ConversionType {
  INTEGER,
  DECIMAL
}

interface IMetadata {
  fieldType?: string;
  jsonProperty?: { paths: string[] };
  converter?: <T extends BaseModel>(value: {}) => {};
  toNumber?: { conversionType?: ConversionType };
}
export class BaseModel {

  public constructor(data: {[key: string]: any}) {
    this.handleMetakeys(data);
  }

  private handleMetakeys(data: {[key: string]: any}): void {
    const keys = Reflect.getMetadataKeys(this);

    keys.forEach((key: string) => {
      const metadata: IMetadata = Reflect.getMetadata(key, this);
      this.handleJsonProperty(data, metadata, key);
      this.handleToConvertValue(key, metadata);
      this.handleToNumber(metadata, key);
      // this.handleToNumberValue(key, metadata);
    });
  }

  private handleJsonProperty(data: {[key: string]: any}, metadata: IMetadata, key: string): void {
    if (metadata.jsonProperty) {
      const { paths } = metadata.jsonProperty;
      let currentPath = 0;
      do {
        this[key as keyof this] = retrieveDataFromPath(data, paths[currentPath]);
        currentPath++;
      } while (!this[key as keyof this] && currentPath < paths.length);
    }
  }
  /**
   * Convert the field string into number
   */
  private handleToNumberValue(fieldName: string, metadata: IMetadata): void {
    if (metadata.fieldType === 'Number' && typeof ((this as any)[fieldName]) === 'string') {
      const value: string = (this as any)[fieldName](fieldName);
      (this as any)[fieldName] = Number(value);
    }
  }

  private handleToNumber(metadata: IMetadata, key: string): void {
    if (metadata.toNumber && this[key as keyof this]) {
      // @ts-ignore
      this[key as keyof this] = metadata.toNumber.conversionType === ConversionType.DECIMAL ?
        parseFloat((this[key as keyof this]).toString()) : parseInt((this[key as keyof this]).toString(), 10);
    }
  }


  /**
   * Transforms the data using an function/converter
   */
  private handleToConvertValue(fieldName: string, metadata: IMetadata): void {
    if (metadata.converter !== undefined) {
      (this as any)[fieldName] = metadata.converter((this as any)[fieldName]);
    }
  }
}

export function JsonProperty(paths: string[]): IDecoratorReturn {
    return AddPropertyData({ jsonProperty: { paths } });
}

export function ToConvert(converter: (value: {}, model?: {}) => {}): IDecoratorReturn {
  return AddPropertyData({ converter });
}

export function ToNumber(conversionType?: ConversionType): IDecoratorReturn {
  return AddPropertyData({ toNumber: { conversionType } });
}

/**
 * Adding and merging the property data into the class
 * If there is conditional data we should push new data to decorator
 * For another all cases we should merge metadata
 */
export function AddPropertyData<T extends IMetadata>(metadata: T): IDecoratorReturn {
  return (target, propertyKey= 'classDecorator'): void => {
    const savedMetadata = Reflect.getMetadata(propertyKey, target) || {
      fieldType: (Reflect.getMetadata('design:type', target, propertyKey) || { name: '' }).name,
    };

    Reflect.defineMetadata(propertyKey, { ...savedMetadata, ...metadata as {} }, target);
  };
}
