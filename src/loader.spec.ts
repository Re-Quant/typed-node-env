import { Env, loadConfig } from '.';

export class Config {
  @Env({ required: true })
  public readonly NODE_ENV!: string

  @Env('NODE_ENV')
  public readonly ENV!: string

  @Env(['FOO', 'NODE_ENV'])
  public readonly APP_ENV!: string

  @Env('DEBUG')
  public readonly DEBUG: boolean = true
}

describe('env-decorator', () => {
  let config: Config;

  beforeAll(() => {
    config = loadConfig<Config>(Config);
  });

  it('check config', () => {
    expect(config).toEqual({
      NODE_ENV: 'test',
      ENV: 'test',
      APP_ENV: 'test',
      DEBUG: true,
    });
  });
});
