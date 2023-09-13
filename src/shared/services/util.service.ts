import { Injectable } from '@nestjs/common';
import { nanoid, customAlphabet } from 'nanoid';
import AES from 'crypto-js/aes';
import MD5 from 'crypto-js/md5';
import { FastifyRequest } from 'fastify';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class UtilService {
  constructor(private readonly httpService: HttpService) {}
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

  /**
   * 获取请求IP
   */
  getReqIP(req: FastifyRequest): string {
    return (
      // 判断是否有反向代理 IP
      (
        (req.headers['x-forwarded-for'] as string) ||
        // 判断后端的 socket 的 IP
        req.socket.remoteAddress
      ).replace('::ffff:', '')
    );
  }

  /* 判断IP是不是内网 */
  IsLAN(ip: string) {
    ip.toLowerCase();
    if (ip == 'localhost') return true;
    let a_ip = 0;
    if (ip == '') return false;
    const aNum = ip.split('.');
    if (aNum.length != 4) return false;
    a_ip += parseInt(aNum[0]) << 24;
    a_ip += parseInt(aNum[1]) << 16;
    a_ip += parseInt(aNum[2]) << 8;
    a_ip += parseInt(aNum[3]) << 0;
    a_ip = (a_ip >> 16) & 0xffff;
    return (
      a_ip >> 8 == 0x7f ||
      a_ip >> 8 == 0xa ||
      a_ip == 0xc0a8 ||
      (a_ip >= 0xac10 && a_ip <= 0xac1f)
    );
  }

  async getLocation(ip: string) {
    if (this.IsLAN(ip)) return '内网IP';
    let { data } = await this.httpService.axiosRef.get(
      `http://whois.pconline.com.cn/ipJson.jsp?ip=${ip}&json=true`,
      { responseType: 'arraybuffer' },
    );
    data = new TextDecoder('gbk').decode(data);
    data = JSON.parse(data);
    return data.addr.trim().split(' ').at(0);
  }
}
