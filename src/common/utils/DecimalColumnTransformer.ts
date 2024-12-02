export class DecimalColumnTransformer {
  to(value: number) {
    return value.toFixed(2);
  }
  from(value: string) {
    return Number(parseFloat(value).toFixed(2));
  }
}
