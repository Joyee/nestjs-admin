import { SetMetadata } from '@nestjs/common';
import { TRANSFORM_KEEP_KEY_METADATA } from '../constants/decorator.constants';

/**
 * 当拦截器（ApiTransformInterceptor）检测到方法上存在这个元数据并且值为 true 时，它将绕过对响应数据的处理，直接返回原始数据，以保持数据的原样性。
 */
export const Keep = () => SetMetadata(TRANSFORM_KEEP_KEY_METADATA, true);
