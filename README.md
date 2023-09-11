### 手把手系列

### 初始化项目

`npm i -g @nestjs/cli`

`nest new process-system`

`npm i --save @nestjs/core @nestjs/common rxjs reflect-metadata`

### 基础配置

#### Fastify

#### 版本控制

#### 全局响应数据统一

`common/interceptors/api-transform.interceptor.ts`

#### 日志

#### 全局异常拦截

`common/filters/business.exception.filter.ts`
`common/exception/business.exception.ts`

#### 环境配置

`npm i @nestjs/config`

添加`ConfigModule`模块

`@nestjs/config` 默认会从项目根目录载入并解析一个 `.env` 文件，从 `.env` 文件和 `process.env` 合并环境变量键值对，并将结果存储到一个可以通过 ConfigService 访问的私有结构。

```
// app.module.ts

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [getConfig],
    }),
    ...
  ]
})
```
#### 使用自定义配置

安装 `cross-env` 指定运行环境来使用对应环境的配置变量。

`pnpm install cross-env`

修改启动命令:

`"start:dev": "cross-env NODE_ENV=development nest start --watch",`

添加 `.config/.development.yaml` 配置

#### 热重载

1. 安装

`pnpm i webpack-node-externals run-script-webpack-plugin webpack -D`

2. 新建 `webpack-hmr.config.js`

3. `main.ts`里开启HMR功能

4. 修改启动脚本命令

  `"start:hotdev": "cross-env NODE_ENV=development nest build --webpack --webpackPath webpack.hmr.config.js --watch","`

#### API文档 swagger

1. 安装 `pnpm i @nestjs/swagger`

2. 创建 `src/doc.ts`

3. 在 `main.ts` 中引入

### 数据库

#### Typeorm

1. 安装 `pnpm i typeorm mysql2 @nestjs/typeorm`

2. 在 `.development.yaml` 添加数据库配置

3. 添加实体 `src/entities/xxx`

4. 初始化数据库 `deploy/sql/init.sql` 和 `docs/权限管理数据库设计文档.md`

5. 连接数据库 `app.module.ts` 配置

### Redis

1. 安装 `pnpm i ioredis`

2. 注册 `shared/shared.module.ts/redis模块`

