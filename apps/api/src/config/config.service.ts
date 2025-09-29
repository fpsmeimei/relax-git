import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { ProxyConfigDto } from './dto/proxy-config.dto';
import { UpdateProxyConfigDto } from './dto/update-proxy-config.dto';

@Injectable()
export class ConfigService {
  private readonly PROXY_CONFIG_KEY = 'relax-git:config:proxy';

  constructor(
    private readonly nestConfigService: NestConfigService,
    private readonly redisService: RedisService
  ) {}

  /**
   * 获取代理配置
   */
  async getProxyConfig(): Promise<ProxyConfigDto> {
    try {
      const redisConfig = await this.redisService.get(this.PROXY_CONFIG_KEY);

      if (redisConfig) {
        // 如果已经是对象，直接返回
        if (typeof redisConfig === 'object') {
          return redisConfig as ProxyConfigDto;
        }
        // 如果是字符串，尝试解析
        return JSON.parse(redisConfig as string);
      }
    } catch (error) {
      console.warn('Failed to get proxy config from Redis:', error);
    }

    // 返回默认配置
    return {
      httpProxy: '',
      httpsProxy: '',
      enabled: false,
    };
  }

  /**
   * 更新代理配置
   */
  async updateProxyConfig(
    updateDto: UpdateProxyConfigDto
  ): Promise<ProxyConfigDto> {
    const config: ProxyConfigDto = {
      httpProxy: updateDto.httpProxy || '',
      httpsProxy: updateDto.httpsProxy || '',
      enabled: updateDto.enabled ?? false,
    };

    // 保存到Redis
    await this.redisService.set(
      this.PROXY_CONFIG_KEY,
      config,
      60 * 60 * 24 * 30 // 30天过期
    );

    return config;
  }

  /**
   * 获取Worker使用的代理配置
   */
  async getWorkerProxyConfig(): Promise<{
    httpProxy?: string;
    httpsProxy?: string;
  }> {
    const config = await this.getProxyConfig();

    if (!config.enabled) {
      return {};
    }

    return {
      httpProxy: config.httpProxy || undefined,
      httpsProxy: config.httpsProxy || undefined,
    };
  }
}
