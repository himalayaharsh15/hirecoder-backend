import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsPasswordMatching(property:string, validationOptions: ValidationOptions) {
    return function (object:Object, propertyName:string) {
        registerDecorator({
            name: "isPasswordMatching", target: object.constructor, propertyName, constraints: [property], options: validationOptions, validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = (args.object as any)[relatedPropertyName]
                    return value === relatedValue
            }
        } })
    }
}