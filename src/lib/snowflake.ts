import 'server-only';
import snowflake from 'snowflake-sdk';

// Singleton da conexão
let connPromise: Promise<snowflake.Connection> | null = null;

function createConn(): Promise<snowflake.Connection> {
  const conn = snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT!,
    username: process.env.SNOWFLAKE_USER!,
    password: process.env.SNOWFLAKE_PASSWORD!,
    role: process.env.SNOWFLAKE_ROLE!,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE!,
    database: process.env.SNOWFLAKE_DATABASE!,
    schema: process.env.SNOWFLAKE_SCHEMA!,
    clientSessionKeepAlive: true,
    application: 'suep-form-react',
  });

  return new Promise((resolve, reject) => {
    conn.connect((err) => (err ? reject(err) : resolve(conn)));
  });
}

export async function getConn(): Promise<snowflake.Connection> {
  if (!connPromise) connPromise = createConn();
  return connPromise;
}

type JsonPrimitive = string | number | boolean | null;

// Deriva o tipo aceito por `binds` a partir do SDK (evita `any`)
type ExecuteArg = Parameters<snowflake.Connection['execute']>[0];
type DriverBinds = ExecuteArg extends { binds?: infer T } ? T : never;

/** Converte número com vírgula para número JS */
export const toNumber = (v: unknown): number | null => {
  if (v === undefined || v === null || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isNaN(n) ? null : n;
};

export const simNaoToBool = (v?: string | null) =>
  v === 'Sim' ? true : v === 'Não' ? false : null;

/** Executa um INSERT/UPDATE/DELETE e retorna o statementId */
export async function exec(sqlText: string, binds: JsonPrimitive[] = []): Promise<string> {
  const connection = await getConn();
  const sfBinds = binds as unknown as DriverBinds;

  return new Promise<string>((resolve, reject) => {
    connection.execute({
      sqlText,
      binds: sfBinds,
      complete: (err, stmt) => {
        if (err) return reject(err);
        resolve(stmt.getStatementId());
      },
    });
  });
}

/** Executa um SELECT e retorna linhas tipadas */
export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  sqlText: string,
  binds: JsonPrimitive[] = [],
): Promise<T[]> {
  const connection = await getConn();
  const sfBinds = binds as unknown as DriverBinds;

  return new Promise<T[]>((resolve, reject) => {
    connection.execute({
      sqlText,
      binds: sfBinds,
      complete: (err, _stmt, rows?: unknown[]) => {
        if (err) return reject(err);
        resolve((rows ?? []) as T[]);
      },
    });
  });
}
