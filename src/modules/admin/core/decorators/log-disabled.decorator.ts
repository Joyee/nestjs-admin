import { SetMetadata } from '@nestjs/common';
import { LOG_DISABLED_KEY_METADATA } from '../../admin.constants';

export const LogDisabled = () => SetMetadata(LOG_DISABLED_KEY_METADATA, true);
