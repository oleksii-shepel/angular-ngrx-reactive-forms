import { AbstractControl, AbstractControlOptions, FormArray, FormBuilder, FormGroup } from '@angular/forms';


export type ArrayToObject<T extends any[]> = {
  [key in keyof T as string]: T[key];
}

export type Extract<T, V> = { [key in keyof T]: T[key] extends V ? key : never }[keyof T]
export type SubType<Base, Condition> = Pick<Base, Extract<Base, Condition>>;

export type ModelOptions<T> = {
  [key in keyof Partial<T>]? : T[key] extends Array<any> ? ModelOptions<T[key]> : T[key] extends object ? ModelOptions<T[key]> : AbstractControlOptions;
} & {
  ["__group"]?: T extends object ? AbstractControlOptions : never;
} & {
  [key in keyof SubType<T, Array<any>> as key extends string ? `__array_${key}` : never]?: AbstractControlOptions;
};

const formBuilder = new FormBuilder();

export function buildFormArray(model: any, options: any = {}, groupOptions: AbstractControlOptions): AbstractControl {
  if(Array.isArray(model)) {
    let formControls: AbstractControl[] = [];
    model.forEach((item, index) => {
      if(typeof item !== 'object') {
        formControls.push(formBuilder.control(item, (options[index] || {}) as AbstractControlOptions))
      } else if (typeof item === 'object' && !Array.isArray(item)) {
        formControls.push(buildFormGroup(item, options[index] || {}, options[index] ? options[index]["__group"] : {}))
      } else if(Array.isArray(item)) {
        throw new Error("Nested arrays are not supported");
      }
    });

    return formBuilder.array(formControls, groupOptions)
  }
  else {
    return formBuilder.control("", []);
  }
}

export function buildFormGroup(model: any, options: any = {}, groupOptions: AbstractControlOptions = {}): AbstractControl {
  if(Array.isArray(model)) {
    return buildFormArray(model, options, groupOptions)
  } else if(model !== null && typeof model === 'object') {
    let formGroup = formBuilder.group({}, (options["__group"] || groupOptions) as AbstractControlOptions);

    for (let [key, value] of Object.entries(model)) {
      if(typeof value !== 'object') {
        formGroup.addControl(key, formBuilder.control(value, (options[key] || {}) as AbstractControlOptions));
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        formGroup.addControl(key, buildFormGroup(value, options[key] || {}, options[key]? options[key]["__group"] : {}));
      } else if(Array.isArray(value)) {
        let formArray = buildFormArray(value, options[key] || {}, options[`__array_${key}`] ? options[`__array_${key}`] : {}) as FormArray
        formGroup.addControl(key, formArray)
      }
    }
    return formGroup;
  } else if(typeof model === 'string' || typeof model === 'number' || typeof model === 'boolean') {
    return formBuilder.control(model, options as AbstractControlOptions);
  }

  return formBuilder.control("", options as AbstractControlOptions);
}

export function checkFormArray(form: FormArray, model: Array<any>): boolean {
  if(!form || !form.controls) {
    return false;
  } else {
    return model.every((item, index) => {
      let ready = false;
      if(typeof item !== 'object' && form.controls[index]) {
        ready = true;
      } else if (typeof item === 'object' && !Array.isArray(item)) {
        ready = !!form.controls[index] ? checkFormGroup(form.controls[index] as FormGroup, item) : false;
      } else if(Array.isArray(item)) {
        throw new Error("Nested arrays are not supported");
      }
      return ready;
    });
  }
}

export function checkFormGroup(form: FormGroup, model: any): boolean {
  if(!form) {
    return false;
  }

  let ready = true;

  if(Array.isArray(model)) {
    ready = checkFormArray(form as any, model);
  } else if(model !== null && typeof model === 'object') {

    for (let [key, value] of Object.entries(model)) {
      if(typeof value !== 'object' && !form.controls[key]) {
        ready = false;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        ready = !!form.controls[key] ? checkFormGroup(form.controls[key] as FormGroup, key) : false;
      } else if(Array.isArray(value)) {
        ready = checkFormArray(form.controls[key] as FormArray, value);
      }
      if(ready === false) {
        break;
      }
    }
  }
  return ready;
}
