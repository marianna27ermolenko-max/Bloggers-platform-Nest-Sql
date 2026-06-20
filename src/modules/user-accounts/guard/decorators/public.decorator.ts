import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

//"SetMetadata/функция-декоратор - прикрепи к этому endpoint метаданные: isPublic = true"
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
