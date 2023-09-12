import { Injectable } from '@nestjs/common';
import { nanoid, customAlphabet } from 'nanoid';
import AES from 'crypto-js/aes';
import MD5 from 'crypto-js/md5';

@Injectable()
export class UtilService {
  public generateUUID(): string {
    return nanoid();
  }

  /**
   * 生成一个随机值
   * @param length
   * @param placeholder
   */
  public generateRandomValue(
    length: number,
    placeholder = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM',
  ): string {
    return customAlphabet(placeholder, length)();
  }

  /**
   * AES加密
   */
  public aesEncrypt(msg: string, secret: string): string {
    return AES.encrypt(msg, secret).toString();
  }

  /**
   * AES解密
   * @param encrypted
   * @param secret
   */
  public aesDecrypt(encrypted: string, secret: string): string {
    return AES.decrypt(encrypted, secret).toString();
  }

  /**
   * MD5加密
   * @param msg
   */
  public md5(msg: string): string {
    return MD5(msg).toString();
  }
}
