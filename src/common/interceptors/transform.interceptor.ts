import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse as IApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<T>> {
    const request = context.switchToHttp().getRequest();

    const getMessageByMethod = (method: string): string => {
      switch (method.toLowerCase()) {
        case 'post':
          return 'Created successfully';
        case 'put':
        case 'patch':
          return 'Updated successfully';
        case 'delete':
          return 'Deleted successfully';
        case 'get':
        default:
          return 'Retrieved successfully';
      }
    };

    const isProvidedDataField = ['get', 'post'].includes(
      request.method.toLowerCase(),
    );

    return next.handle().pipe(
      map((data) => ({
        status: context.switchToHttp().getResponse().statusCode,
        message: getMessageByMethod(request.method),
        ...(isProvidedDataField ? { data } : {}),
      })),
    );
  }
}
