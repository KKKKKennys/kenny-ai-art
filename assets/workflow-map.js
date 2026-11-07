/* A workflow explanation, not a live execution console. */
(() => {
  const root = document.getElementById('ai-workflow');
  if (!root) return;
  const data = JSON.parse(document.getElementById('wf-node-data').textContent);
  const board = root.querySelector('.wf-board');
  const nodes = [...root.querySelectorAll('.wf-node')];
  const detail = root.querySelector('.wf-detail');
  const canvas = root.querySelector('.wf-canvas');
  const paths = root.querySelector('.wf-paths');
  const narrow = matchMedia('(max-width:899px)');
  let selected = 0;
  let expanded = false;
  let frame = 0;
  const svgNS = 'http://www.w3.org/2000/svg';
  function draw() {
    frame = 0;
    const base = board.getBoundingClientRect();
    if (!base.width) return;
    const rects = nodes.map(node => {
      const r = node.getBoundingClientRect();
      return {x:r.left-base.left, y:r.top-base.top, w:r.width, h:r.height};
    });
    paths.replaceChildren();
    const path = (d, cls) => {
      const p = document.createElementNS(svgNS, 'path');
      p.setAttribute('d',d); p.setAttribute('class',cls); paths.append(p);
    };
    rects.slice(0,-1).forEach((a,i) => {
      const b = rects[i+1]; let d;
      if (narrow.matches) {
        const rail = 5, ay=a.y+a.h/2, by=b.y+b.h/2;
        d=`M ${a.x-1} ${ay} H ${rail+6} Q ${rail} ${ay} ${rail} ${ay+6} V ${by-6} Q ${rail} ${by} ${rail+6} ${by} H ${b.x-4}`;
      } else if (i===4) {
        const x=a.x+a.w/2;
        d=`M ${x} ${a.y+a.h+1} V ${b.y-5}`;
      } else {
        const reverse=i>4;
        d=`M ${reverse?a.x-1:a.x+a.w+1} ${a.y+a.h/2} H ${reverse?b.x+b.w+5:b.x-5}`;
      }
      path(d,'wf-wire'+(i===selected||i+1===selected?' wf-wire-active':''));
    });
    if (!narrow.matches) {
      const a=rects[4],b=rects[1],ax=a.x+a.w*.3,bx=b.x+b.w/2,y=a.y+a.h+37;
      path(`M ${ax} ${a.y+a.h+1} V ${y-8} Q ${ax} ${y} ${ax-8} ${y} H ${bx+8} Q ${bx} ${y} ${bx} ${y-8} V ${b.y+b.h+5}`,'wf-return');
    }
  }
  function scheduleDraw() { if (!frame) frame=requestAnimationFrame(draw); }
  function placeDetail() {
    detail.hidden = narrow.matches && !expanded;
    if (narrow.matches) nodes[selected].after(detail);
    else if (detail.parentElement !== canvas) canvas.append(detail);
    scheduleDraw();
  }
  function select(index, userAction=false) {
    const previousTop = nodes[index].getBoundingClientRect().top;
    selected=index;
    if (userAction) expanded=true;
    nodes.forEach((node,i)=>node.setAttribute('aria-pressed',String(i===index)));
    const n=data[index];
    detail.querySelector('.wf-detail-number').textContent=String(index+1).padStart(2,'0')+' / 10';
    detail.querySelector('h3').textContent=n.name+' · '+n.role;
    detail.querySelectorAll('dd').forEach((el,i)=>{el.textContent=n[['input','process','output'][i]];});
    placeDetail();
    if (userAction && narrow.matches) {
      // Keep the clicked node at the same viewport position when the panel moves.
      const delta=nodes[index].getBoundingClientRect().top-previousTop;
      if (Math.abs(delta)>1) window.scrollBy({top:delta,behavior:'instant'});
    }
    scheduleDraw();
  }
  nodes.forEach((node,i)=>{
    node.addEventListener('click',()=>select(i,true));
    node.addEventListener('keydown',event=>{
      const direction=({ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1})[event.key];
      if (!direction) return;
      event.preventDefault();
      const next=(i+direction+nodes.length)%nodes.length;
      select(next,true);nodes[next].focus({preventScroll:true});
      nodes[next].scrollIntoView({block:'nearest',behavior:'instant'});
    });
  });
  narrow.addEventListener('change',placeDetail);
  new ResizeObserver(scheduleDraw).observe(board);
  new IntersectionObserver(entries=>{
    root.classList.toggle('wf-in-view',entries[0].isIntersecting);
  },{rootMargin:'30px'}).observe(board);
  document.fonts.ready.then(scheduleDraw);
  select(0);
})();
