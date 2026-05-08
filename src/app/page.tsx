'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import logo from '@/assets/fgv-logo.png';
import funcionarios from '@/assets/funcionarios.png'

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function Page() {
  const [q1, setQ1] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);

  const ocupado = q1 === 'Sim';
  const desocupado = q1 === 'Não';
  const isLoading = status === 'loading';

  const CALL_TITLE = 'Obrigado por participar!';
  const CALL_TEXT = 'Suas respostas ajudam nossos estudos. Quer conhecer mais sobre a pesquisa?';
  const CALL_LINK = 'https://portalibre.fgv.br/';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const resp = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const out = await resp.json();
      if (!resp.ok || !out.ok) throw new Error(out.error || 'Falha ao inserir');

      setStatus('success');
      form.reset();
      setQ1(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setErrorMsg(msg);
      setStatus('error');
    }
  }

  const UFs = useMemo(
    () => ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'],
    []
  );

  return (
    <>
      {consentGiven === null && (
        <div className="consent-overlay" role="dialog" aria-modal="true" aria-labelledby="consent-title">
          <div className="consent-card">
            <h2 id="consent-title">Aviso de Privacidade e Proteção de Dados</h2>
            <p>
              O <strong>FGV IBRE</strong> coleta os dados informados neste formulário com a finalidade
              exclusiva de realizar pesquisas de percepção econômica. As informações são tratadas de
              forma anônima e agregada, em conformidade com a{' '}
              <strong>Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018)</strong>.
            </p>
            <p>
              Dados coletados incluem informações demográficas (idade, gênero, escolaridade, renda,
              raça/cor) e percepções sobre economia e mercado de trabalho. Não coletamos dados de
              identificação pessoal como nome, CPF ou endereço.
            </p>
            <p>
              Para exercer seus direitos de titular (acesso, correção ou exclusão de dados) ou para
              mais informações, entre em contato:{' '}
              <strong>pesquisa.ibre@fgv.br</strong>.
            </p>
            <div className="consent-actions">
              <button className="consent-btn consent-btn--accept" onClick={() => setConsentGiven(true)}>
                Aceitar e continuar
              </button>
              <button className="consent-btn consent-btn--decline" onClick={() => setConsentGiven(false)}>
                Recusar
              </button>
            </div>
          </div>
        </div>
      )}
      {consentGiven === false && (
        <div className="consent-overlay" role="alert">
          <div className="consent-card">
            <h2>Participação não autorizada</h2>
            <p>
              Você optou por não autorizar o uso dos seus dados. Não será possível participar da
              pesquisa sem consentimento, pois os dados são necessários para sua finalidade.
            </p>
            <p>Se mudar de ideia, recarregue a página para tentar novamente.</p>
          </div>
        </div>
      )}
      <main className="container">
      <header className="topbar">
        <Image src={logo} alt="FGV" className="logo" />
        <div className="title">
          <h1>Questionário – PPA (Pessoa Física)</h1>
          <p className="subtitle">FGV IBRE • Pesquisa de Percepção</p>
        </div>
      </header>

      <form id="ppa-form" onSubmit={onSubmit} className="card">
        <h2>Parte 1: Dados cadastrais</h2>
        <fieldset disabled={isLoading}>
          <legend>Todo mundo responde</legend>

          {/* P1 (menor) */}
          <div className="q">
            <label htmlFor="p1">P1 – Idade</label>
            <input id="p1" name="p1_idade" className="input-sm" type="number" min={0} max={120} placeholder="Ex.: 34" required />
          </div>

          {/* P2 */}
          <div className="q">
            <span className="sr" id="p2_lbl">P2 – Sexo</span>
            <label aria-labelledby="p2_lbl">P2 – Sexo</label>
            <div className="radios" role="radiogroup" aria-labelledby="p2_lbl">
              <label><input type="radio" name="p2_sexo" value="Homem" required /> Homem</label>
              <label><input type="radio" name="p2_sexo" value="Mulher" /> Mulher</label>
            </div>
          </div>

          {/* P3 */}
          <div className="q">
            <label htmlFor="p3">P3 – UF</label>
            <select id="p3" name="p3_uf" required defaultValue="">
              <option value="" disabled>Selecione a UF</option>
              {UFs.map(uf => <option key={uf}>{uf}</option>)}
            </select>
          </div>

          {/* P4 */}
          <div className="q">
            <span className="sr" id="p4_lbl">P4 – Reside na capital do estado?</span>
            <label aria-labelledby="p4_lbl">P4 – Você reside na capital do seu estado?</label>
            <div className="radios" role="radiogroup" aria-labelledby="p4_lbl">
              <label><input type="radio" name="p4_capital" value="Sim" required /> Sim</label>
              <label><input type="radio" name="p4_capital" value="Não" /> Não</label>
            </div>
          </div>

          {/* P5 */}
          <div className="q">
            <label htmlFor="p5">P5 – Cor ou raça</label>
            <select id="p5" name="p5_cor" required defaultValue="">
              <option value="" disabled>Selecione</option>
              <option>Amarela</option><option>Branca</option><option>Indígena</option>
              <option>Parda</option><option>Preta</option><option>Prefiro não responder</option>
            </select>
          </div>

          {/* P6 */}
          <div className="q">
            <label htmlFor="p6">P6 – Escolaridade</label>
            <select id="p6" name="p6_escolaridade" required defaultValue="">
              <option value="" disabled>Selecione</option>
              <option>Sem instrução</option><option>Fundamental incompleto</option><option>Fundamental completo</option>
              <option>Médio incompleto</option><option>Médio completo</option>
              <option>Superior incompleto</option><option>Superior completo</option>
            </select>
          </div>

          {/* P7 */}
          <div className="q">
            <label htmlFor="p7">P7 – Atualmente, qual é a renda bruta total do seu domicílio…</label>
            <div className="help">Considerar salário-mínimo 2025: R$ 1.518,00.</div>
            <select id="p7" name="p7_renda" required defaultValue="">
              <option value="" disabled>Selecione a faixa</option>
              <option>Até 1/2 SM (inclusive)</option>
              <option>Entre 1/2 e 1 SM (inclusive)</option>
              <option>Entre 1 e 2 SM (inclusive)</option>
              <option>Entre 2 e 3 SM (inclusive)</option>
              <option>Entre 3 e 5 SM (inclusive)</option>
              <option>Entre 5 e 10 SM (inclusive)</option>
              <option>Entre 10 e 20 SM (inclusive)</option>
              <option>Acima de 20 SM</option>
            </select>
          </div>

          {/* P8 (menor) */}
          <div className="q">
            <label htmlFor="p8">P8 – Quantas pessoas moram no seu domicílio?</label>
            <input id="p8" name="p8_moradores" className="input-sm" type="number" min={1} max={30} placeholder="Ex.: 3" required />
          </div>
        </fieldset>

        {/* ======= Parte 2 ======= */}
        <h2>Parte 2: Conjuntura do Mercado de Trabalho</h2>
        <fieldset disabled={isLoading}>
          <legend>Todo mundo responde</legend>
          <div className="q">
            <span className="sr" id="q1_lbl">Q1 – Trabalhou na última semana?</span>
            <label aria-labelledby="q1_lbl">Q1 – Na última semana, você trabalhou pelo menos 1 hora?</label>
            <div className="help">Considere trabalho com/sem carteira, autônomo, bico, etc.</div>
            <div
              className="radios"
              role="radiogroup"
              aria-labelledby="q1_lbl"
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                if (target?.name === 'q1_trabalhou') setQ1(target.value);
              }}
            >
              <label><input type="radio" name="q1_trabalhou" value="Sim" required /> Sim</label>
              <label><input type="radio" name="q1_trabalhou" value="Não" /> Não</label>
            </div>
          </div>
        </fieldset>

        {/* Ocupados */}
        {ocupado && (
          <fieldset aria-hidden="false" disabled={isLoading}>
            <legend>Parte 2.1 – Conjuntura (somente ocupados)</legend>
            <div className="q">
              <label htmlFor="q2">Q2 – No seu trabalho principal, você é:</label>
              <select id="q2" name="q2_posicao" required defaultValue="">
                <option value="" disabled>Selecione sua posição</option>
                <option>Trabalhador doméstico, com carteira</option>
                <option>Trabalhador doméstico, sem carteira</option>
                <option>Empregado setor privado, com carteira</option>
                <option>Empregado setor privado, sem carteira</option>
                <option>Empregado setor público (não militar/estatutário) com carteira</option>
                <option>Empregado setor público (não militar/estatutário) sem carteira</option>
                <option>Setor público – militar/estatutário</option>
                <option>Empregador com CNPJ</option>
                <option>Empregador sem CNPJ</option>
                <option>Conta própria com CNPJ</option>
                <option>Conta própria sem CNPJ</option>
                <option>Trabalhador familiar auxiliar</option>
              </select>
            </div>
          </fieldset>
        )}

        {/* Não ocupados */}
        {desocupado && (
          <fieldset aria-hidden="false" disabled={isLoading}>
            <legend>Parte 2.2 – Conjuntura (somente não ocupados)</legend>
            <div className="q">
              <span className="sr" id="q3_lbl">Q3 – Procurou trabalho na última semana?</span>
              <label aria-labelledby="q3_lbl">Q3 – Na última semana, você tentou conseguir trabalho?</label>
              <div className="radios" role="radiogroup" aria-labelledby="q3_lbl">
                <label><input type="radio" name="q3_procurou" value="Sim" required /> Sim</label>
                <label><input type="radio" name="q3_procurou" value="Não" /> Não</label>
              </div>
            </div>
          </fieldset>
        )}

        {/* ======= Parte 3 ======= */}
        <h2>Parte 3: Percepções</h2>
        <fieldset disabled={isLoading}>
          <legend>Todo mundo responde</legend>

          <div className="q">
            <span className="sr" id="f1_lbl">F1 – Situação da economia</span>
            <label aria-labelledby="f1_lbl">F1 – Como você percebe a economia da sua cidade?</label>
            <div className="radios" role="radiogroup" aria-labelledby="f1_lbl">
              <label><input type="radio" name="f1_economia_atual" value="Boa" required /> Boa</label>
              <label><input type="radio" name="f1_economia_atual" value="Normal" /> Normal</label>
              <label><input type="radio" name="f1_economia_atual" value="Ruim" /> Ruim</label>
            </div>
          </div>

          <div className="q">
            <span className="sr" id="f2_lbl">F2 – Economia em 6 meses</span>
            <label aria-labelledby="f2_lbl">F2 – Nos próximos seis meses, a economia estará:</label>
            <div className="radios" role="radiogroup" aria-labelledby="f2_lbl">
              <label><input type="radio" name="f2_economia_6m" value="Melhor" required /> Melhor</label>
              <label><input type="radio" name="f2_economia_6m" value="Igual" /> Igual</label>
              <label><input type="radio" name="f2_economia_6m" value="Pior" /> Pior</label>
            </div>
          </div>

          <div className="q">
            <span className="sr" id="f3_lbl">F3 – Finanças atuais</span>
            <label aria-labelledby="f3_lbl">F3 – Situação financeira da sua família está:</label>
            <div className="radios" role="radiogroup" aria-labelledby="f3_lbl">
              <label><input type="radio" name="f3_financas_atual" value="Boa" required /> Boa</label>
              <label><input type="radio" name="f3_financas_atual" value="Normal" /> Normal</label>
              <label><input type="radio" name="f3_financas_atual" value="Ruim" /> Ruim</label>
            </div>
          </div>

          <div className="q">
            <span className="sr" id="f4_lbl">F4 – Finanças em 6 meses</span>
            <label aria-labelledby="f4_lbl">F4 – Em 6 meses, as finanças estarão:</label>
            <div className="radios" role="radiogroup" aria-labelledby="f4_lbl">
              <label><input type="radio" name="f4_financas_6m" value="Melhor" required /> Melhor</label>
              <label><input type="radio" name="f4_financas_6m" value="Igual" /> Igual</label>
              <label><input type="radio" name="f4_financas_6m" value="Pior" /> Pior</label>
            </div>
          </div>

          <div className="q">
            <span className="sr" id="f4b_lbl">F4b – Gastos duráveis</span>
            <label aria-labelledby="f4b_lbl">
              F4b – Nos próximos seis meses, em relação aos últimos seis meses, os seus gastos
              com bens de consumo durável (eletroeletrônicos, utilidades domésticas ou outros) serão:
            </label>
            <div className="radios" role="radiogroup" aria-labelledby="f4b_lbl">
              <label><input type="radio" name="f4b_gastos_duraveis" value="Maiores" required /> Maiores</label>
              <label><input type="radio" name="f4b_gastos_duraveis" value="Iguais" /> Iguais</label>
              <label><input type="radio" name="f4b_gastos_duraveis" value="Menores" /> Menores</label>
            </div>
          </div>

          <div className="q">
            <label htmlFor="f5">F5 – Inflação 12 meses (%)</label>
            <div className="row">
              <input id="f5" name="f5_inflacao_12m" type="number" step={0.1} min={0} max={1000} placeholder="Ex.: 4,5" required />
              <span className="muted">%</span>
            </div>
          </div>
        </fieldset>

        <div className="actions">
          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? (<><span className="spinner" aria-hidden="true" /> Enviando...</>) : 'Enviar respostas'}
          </button>
        </div>

        {/* Status */}
        {status === 'loading' && (
          <div className="status status--loading" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" /> Enviando suas respostas...
          </div>
        )}
        {status === 'success' && (
          <div className="status status--ok" role="status" aria-live="polite">
            ✅ Respostas registradas com sucesso.
          </div>
        )}
        {status === 'error' && (
          <div className="status status--err" role="alert">
            ❌ Não foi possível salvar suas respostas{errorMsg ? `: ${errorMsg}` : '.'}
          </div>
        )}
      </form>

      {/* ===== Bloco final: foto + texto + link ===== */}
      <section className="callout card">
        <Image src={funcionarios} alt="" className="callout-img" />
        <div className="callout-body">
          <h3>{CALL_TITLE}</h3>
          <p>{CALL_TEXT}</p>
          <a className="link" href={CALL_LINK} target="_blank" rel="noreferrer">Saiba mais</a>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-main">
            <h3>Fale conosco</h3>
            <p>
              Em caso de dúvidas, sugestões ou interesse em conhecer mais sobre a pesquisa,
              entre em contato pelos canais abaixo.
            </p>
          </div>

          <ul className="footer-list">
            <li>
              <a className="footer-link">
                📞 (21) 2042-5407
              </a>
            </li>
            <li>
              <a href="mailto:pesquisa.ibre@fgv.br" className="footer-link">
                ✉️ pesquisa.ibre@fgv.br
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </main>
    </>
  );
}
