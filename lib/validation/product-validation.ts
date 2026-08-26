// الحقلين اختياريين، لكن إذا المستخدم عبّى واحد منهم لازم يعبّي ترجمته كمان
  export function validateTranslatedFields(
  valueEn: string | undefined,
  valueAr: string | undefined,
  fieldEn: string,
  fieldAr: string,
  messageEn: string,
  messageAr: string,
) {
  const errors: Record<string, string> = {};

  if (valueEn && !valueAr) {
    errors[fieldAr] = messageAr;
  }

  if (valueAr && !valueEn) {
    errors[fieldEn] = messageEn;
  }

  return errors;
}
