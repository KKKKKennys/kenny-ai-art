(() => {
  const prompts = {
    'blender-asset-pipeline': '请安装 Blender Asset Pipeline v2.0.0：\nhttps://github.com/KKKKKennys/blender-asset-pipeline\n先阅读 INSTALL.md，安装到当前 Agent 的用户技能目录；已有同名版本先备份再升级。\n完成后告诉我版本、路径和调用方式，仅安装，不操作工程。',
    'camera-shot-library': '请安装 Camera Shot Library v2.0.0：\nhttps://github.com/KKKKKennys/camera-shot-library\n先阅读 INSTALL.md，安装到当前 Agent 的用户技能目录；已有同名版本先备份再升级。\n完成后告诉我版本、路径和调用方式，仅安装，不渲染或修改工程。'
  };
  let toastTimer;
  const toast = document.createElement('div');
  toast.className = 'copy-toast'; toast.hidden = true; toast.setAttribute('role','status');
  document.body.append(toast);
  function notify(message) { toast.textContent=message; toast.hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>{toast.hidden=true;},4000); }
  let fallback, previousFocus;
  function closeFallback() { fallback.hidden=true; previousFocus?.focus(); }
  function manualCopy(text) {
    previousFocus=document.activeElement;
    if (!fallback) {
      fallback=document.createElement('div');fallback.className='copy-fallback';fallback.setAttribute('role','dialog');fallback.setAttribute('aria-modal','true');fallback.setAttribute('aria-label','手动复制安装内容');
      const box=document.createElement('div');const label=document.createElement('p');label.textContent='浏览器暂不允许自动复制，请复制下面的内容。';
      const field=document.createElement('textarea');field.readOnly=true;field.setAttribute('aria-label','可复制的安装内容');
      const close=document.createElement('button');close.type='button';close.className='btn';close.textContent='关闭';close.addEventListener('click',closeFallback);
      box.append(label,field,close);fallback.append(box);document.body.append(fallback);
      fallback.addEventListener('keydown',e=>{if(e.key==='Escape')closeFallback();if(e.key==='Tab'){e.preventDefault();(document.activeElement===field?close:field).focus();}});
    }
    fallback.hidden=false;const field=fallback.querySelector('textarea');field.value=text;field.focus();field.select();
  }
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-install-copy],[data-copy-target],[data-install-link]');
    if(!button)return;
    const slug=button.dataset.installCopy || button.dataset.installLink;
    let text=button.dataset.installLink ? `https://raw.githubusercontent.com/KKKKKennys/${slug}/main/INSTALL.md` : prompts[slug];
    if(button.dataset.copyTarget)text=document.getElementById(button.dataset.copyTarget)?.textContent.trim();
    if(!text)return;
    try {if(!navigator.clipboard)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(text);notify(button.dataset.installLink?'安装链接已复制，发给 Agent 即可':'已复制，粘贴到 Agent 聊天框即可');}
    catch {manualCopy(text);}
  });
  const tabs=[...document.querySelectorAll('[role=tab]')];
  function activate(tab){tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!selected;});}
  tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const target=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;activate(tabs[target]);tabs[target].focus();});});
  const data=document.getElementById('shot-data');
  if(data){
    const cards=JSON.parse(data.textContent),grid=document.getElementById('shot-grid'),input=document.getElementById('shot-search'),count=document.getElementById('shot-count');let category='all';
    function render(){const words=input.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);const rows=cards.filter(c=>(category==='all'||c.category===category)&&words.every(w=>[c.id,c.title,c.goal,c.category_name].join(' ').toLocaleLowerCase().includes(w)));
      grid.replaceChildren();count.textContent=`${rows.length} / ${cards.length} 张镜头卡`;
      for(const c of rows){const a=document.createElement('a');a.className='shot-card';a.href='https://github.com/KKKKKennys/camera-shot-library/blob/v2.0.0/'+c.path;a.target='_blank';a.rel='noopener noreferrer';const small=document.createElement('small');small.textContent=c.category_name;const title=document.createElement('h3');title.textContent=c.title+' ↗';const p=document.createElement('p');p.textContent=c.goal;const code=document.createElement('code');code.textContent=c.id;a.append(small,title,p,code);grid.append(a);}
      if(!rows.length){const p=document.createElement('p');p.className='empty-results';p.textContent='没有匹配的镜头卡，试试更短的关键词或其他类别。';grid.append(p);}
    }
    input.addEventListener('input',render);document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;document.querySelectorAll('[data-category]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();}));render();
  }
})();
