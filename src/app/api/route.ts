// app/api/route.ts
import { NextResponse } from 'next/server';
import snowflake from 'snowflake-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

async function getConn(): Promise<snowflake.Connection> {
  if (!connPromise) connPromise = createConn();
  return connPromise;
}

type JsonPrimitive = string | number | boolean | null;

// Deriva o tipo de `binds` diretamente da assinatura do SDK
type ExecuteArg = Parameters<snowflake.Connection['execute']>[0];
type DriverBinds = ExecuteArg extends { binds?: infer T } ? T : never;

// Aceita números com vírgula e retorna número ou null
const toNumber = (v: unknown): number | null => {
  if (v === undefined || v === null || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isNaN(n) ? null : n;
};

const simNaoToBool = (v?: string | null) =>
  v === 'Sim' ? true : v === 'Não' ? false : null;

async function exec(sqlText: string, binds: JsonPrimitive[] = []): Promise<string> {
  const connection = await getConn();

  // Algumas definições do SDK não incluem `null` em `Bind`.
  // O driver aceita `null` em runtime; fazemos um cast para o tipo que o SDK espera.
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

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  try {
    const b = (await req.json()) as Record<string, unknown>;

    const binds: JsonPrimitive[] = [
      toNumber(b.p1_idade),
      (b.p2_sexo as string) ?? null,
      (b.p3_uf as string) ?? null,
      simNaoToBool(b.p4_capital as string | null),
      (b.p5_cor as string) ?? null,
      (b.p6_escolaridade as string) ?? null,
      (b.p7_renda as string) ?? null,
      toNumber(b.p8_moradores),

      simNaoToBool(b.q1_trabalhou as string | null),
      ((b.q2_posicao as string) || null),
      b.q3_procurou === undefined || b.q3_procurou === ''
        ? null
        : simNaoToBool(b.q3_procurou as string | null),

      (b.f1_economia_atual as string) ?? null,
      (b.f2_economia_6m as string) ?? null,
      (b.f3_financas_atual as string) ?? null,
      (b.f4_financas_6m as string) ?? null,
      (b.f4b_gastos_duraveis as string) ?? null,
      toNumber(b.f5_inflacao_12m),
    ];

    const sql = `
      INSERT INTO ${process.env.SNOWFLAKE_DATABASE}.${process.env.SNOWFLAKE_SCHEMA}.${process.env.SNOWFLAKE_TABLE}
      (
        P1_IDADE, P2_SEXO, P3_UF, P4_CAPITAL, P5_COR, P6_ESCOLARIDADE, P7_RENDA, P8_MORADORES,
        Q1_TRABALHOU, Q2_POSICAO, Q3_PROCUROU,
        F1_ECONOMIA_ATUAL, F2_ECONOMIA_6M, F3_FINANCAS_ATUAL, F4_FINANCAS_6M, F4B_GASTOS_DURAVEIS, F5_INFLACAO_12M
      )
      VALUES (${Array(binds.length).fill('?').join(',')})
    `;

    const statementId = await exec(sql, binds);
    return NextResponse.json({ ok: true, statementId });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro desconhecido';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
