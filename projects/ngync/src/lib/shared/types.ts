import { AbstractControlOptions } from "@angular/forms";



export type Subset<K> = {
  [attr in keyof K]?: K[attr] extends object
      ? Subset<K[attr]>
      : K[attr] extends object | null
      ? Subset<K[attr]> | null
      : K[attr] extends object | null | undefined
      ? Subset<K[attr]> | null | undefined
      : K[attr];
};



export type ArrayToObject<T extends any[]> = {
  [key in keyof T as string]?: T[key];
}



export type Extract<T, V> = { [key in keyof T]: T[key] extends V ? key : never }[keyof T]
export type SubType<Base, Condition> = Pick<Base, Extract<Base, Condition>>;



export type ModelOptions<T> = {
  [key in keyof Partial<T>]? : T[key] extends Array<any> ? ArrayToObject<ModelOptions<T[key][number]>[]> : T[key] extends object ? ModelOptions<T[key]> : AbstractControlOptions;
} & {
  ["__group"]?: T extends object ? AbstractControlOptions : never;
};
