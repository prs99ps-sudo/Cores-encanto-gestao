const BRL = v => (Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const hoje = () => new Date().toISOString().slice(0,10);
let db = JSON.parse(localStorage.getItem('coresEncantoDB')||'null') || {
  profissionais:[{nome:'Vanuza',comissao:50},{nome:'Kátia',comissao:50},{nome:'Andreia',comissao:50},{nome:'Tarcila',comissao:50},{nome:'Ágata',comissao:50}],
  servicos:[{nome:'Pé e mão',valor:25},{nome:'Manicure',valor:20},{nome:'Pedicure',valor:20},{nome:'Design com henna',valor:35},{nome:'Cílios tufinho',valor:30},{nome:'Esmalte Premium',valor:5},{nome:'Combo completo',valor:50}],
  atendimentos:[], caixa:[]
};
function salvar(){localStorage.setItem('coresEncantoDB',JSON.stringify(db)); atualizarTudo();}
function abrirAba(id){document.querySelectorAll('.aba').forEach(a=>a.classList.remove('ativa'));document.getElementById(id).classList.add('ativa');document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active'));event.target.classList.add('active');}
function popularSelects(){profissional.innerHTML=db.profissionais.map(p=>`<option>${p.nome}</option>`).join(''); servico.innerHTML=db.servicos.map(s=>`<option>${s.nome}</option>`).join('');}
servico.onchange=()=>{let s=db.servicos.find(x=>x.nome==servico.value); if(s) valorServico.value=s.valor;}
formAtendimento.onsubmit=e=>{e.preventDefault();db.atendimentos.push({data:dataAtendimento.value,profissional:profissional.value,servico:servico.value,valor:Number(valorServico.value),pagamento:pagamento.value,obs:obsAtendimento.value}); e.target.reset(); dataAtendimento.value=hoje(); salvar();}
formCaixa.onsubmit=e=>{e.preventDefault();db.caixa.push({data:dataCaixa.value,tipo:tipoCaixa.value,categoria:categoriaCaixa.value,valor:Number(valorCaixa.value),obs:obsCaixa.value}); e.target.reset(); dataCaixa.value=hoje(); salvar();}
formProf.onsubmit=e=>{e.preventDefault();db.profissionais.push({nome:nomeProf.value,comissao:Number(comissaoProf.value)});e.target.reset();comissaoProf.value=50;salvar();}
formServ.onsubmit=e=>{e.preventDefault();db.servicos.push({nome:nomeServ.value,valor:Number(valorServ.value)});e.target.reset();salvar();}
function remover(tipo,i){db[tipo].splice(i,1);salvar();}
function dentro(data,ini,fim){return (!ini||data>=ini)&&(!fim||data<=fim)}
function dadosFiltrados(){let ini=relInicio.value, fim=relFim.value;return {ats:db.atendimentos.filter(a=>dentro(a.data,ini,fim)),cx:db.caixa.filter(c=>dentro(c.data,ini,fim)),ini,fim};}
function gerarRelatorios(){
 const {ats,cx,ini,fim}=dadosFiltrados();
 let por={}; ats.forEach(a=>{let p=db.profissionais.find(x=>x.nome==a.profissional)||{comissao:50};por[a.profissional]??={total:0,comissao:0,itens:0,servicos:[]};por[a.profissional].total+=a.valor;por[a.profissional].comissao+=a.valor*(p.comissao/100);por[a.profissional].itens++;por[a.profissional].servicos.push(a);});
 let html=`<h3>Conferência de Comissões</h3><p>Período: ${ini||'início'} até ${fim||'hoje'}</p>`;
 Object.keys(por).forEach(nome=>{let p=por[nome];html+=`<h3>${nome}</h3>${p.servicos.map(s=>`<div class="linha"><span>${s.data} - ${s.servico}</span><strong>${BRL(s.valor)}</strong></div>`).join('')}<div class="linha"><span>Atendimentos</span><strong>${p.itens}</strong></div><div class="linha"><span>Produção</span><strong>${BRL(p.total)}</strong></div><div class="linha"><span>Comissão</span><strong>${BRL(p.comissao)}</strong></div>`});
 relComissoes.innerHTML=html;
 let prod=ats.reduce((s,a)=>s+a.valor,0), com=Object.values(por).reduce((s,p)=>s+p.comissao,0);
 let entradas=cx.filter(c=>c.tipo=='Entrada').reduce((s,c)=>s+c.valor,0), saidas=cx.filter(c=>c.tipo=='Saída').reduce((s,c)=>s+c.valor,0);
 relProprietario.innerHTML=`<h3>Prestação de Contas</h3><p>Período: ${ini||'início'} até ${fim||'hoje'}</p><div class="linha"><span>Produção bruta</span><strong>${BRL(prod)}</strong></div><div class="linha"><span>Comissões</span><strong>${BRL(com)}</strong></div><div class="linha"><span>Entradas extras</span><strong>${BRL(entradas)}</strong></div><div class="linha"><span>Saídas</span><strong>${BRL(saidas)}</strong></div><div class="linha"><span>Saldo empresa</span><strong>${BRL(prod-com+entradas-saidas)}</strong></div>`;
}
function imprimirRelatorio(){gerarRelatorios();window.print();}
function atualizarTudo(){
 popularSelects();
 listaProf.innerHTML=db.profissionais.map((p,i)=>`<div class="item"><b>${p.nome}</b><br><small>Comissão: ${p.comissao}%</small><br><button onclick="remover('profissionais',${i})">Remover</button></div>`).join('');
 listaServ.innerHTML=db.servicos.map((s,i)=>`<div class="item"><b>${s.nome}</b><br><small>${BRL(s.valor)}</small><br><button onclick="remover('servicos',${i})">Remover</button></div>`).join('');
 listaAtendimentos.innerHTML=db.atendimentos.slice().reverse().map((a,idx)=>`<div class="item"><b>${a.profissional}</b> - ${a.servico}<br><small>${a.data} • ${a.pagamento} • ${BRL(a.valor)}</small><br>${a.obs||''}<br><button onclick="remover('atendimentos',${db.atendimentos.length-1-idx})">Excluir</button></div>`).join('');
 listaCaixa.innerHTML=db.caixa.slice().reverse().map((c,idx)=>`<div class="item"><b>${c.tipo}</b> - ${c.categoria}<br><small>${c.data} • ${BRL(c.valor)}</small><br>${c.obs||''}<br><button onclick="remover('caixa',${db.caixa.length-1-idx})">Excluir</button></div>`).join('');
 const prod=db.atendimentos.reduce((s,a)=>s+a.valor,0);
 const com=db.atendimentos.reduce((s,a)=>{let p=db.profissionais.find(x=>x.nome==a.profissional)||{comissao:50};return s+a.valor*(p.comissao/100)},0);
 const ent=db.caixa.filter(c=>c.tipo=='Entrada').reduce((s,c)=>s+c.valor,0);
 const sai=db.caixa.filter(c=>c.tipo=='Saída').reduce((s,c)=>s+c.valor,0);
 dashProducao.textContent=BRL(prod);dashComissao.textContent=BRL(com);dashEntradas.textContent=BRL(ent);dashSaidas.textContent=BRL(sai);dashSaldo.textContent=BRL(prod-com+ent-sai);
 gerarRelatorios();
}
function limparTudo(){if(confirm('Tem certeza que deseja apagar todos os dados?')){localStorage.removeItem('coresEncantoDB');location.reload();}}
dataAtendimento.value=hoje(); dataCaixa.value=hoje(); relInicio.value=''; relFim.value=hoje(); atualizarTudo();
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').catch(()=>{});}
