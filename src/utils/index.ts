import { readFileSync } from 'fs';
import * as path from 'path';
import { parse } from 'yaml';

export const getEnv = () => process.env.NODE_ENV;

export const getConfig = (type?: string) => {
  const env = getEnv();
  const yamlpath = path.join(process.cwd(), `./.config/.${env}.yaml`);
  const file = readFileSync(yamlpath, 'utf8');
  const config = parse(file);
  if (type) {
    return config[type];
  }
  return config;
};
