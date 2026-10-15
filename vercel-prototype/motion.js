'use strict';

window.marketMotion = (() => {
  let media;
  let feedbackTweens = [];
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function cleanup() {
    media?.revert();
    media = undefined;
    feedbackTweens.forEach(tween => tween.revert());
    feedbackTweens = [];
  }
  function targets(group) {
    if(group.matches('.category-grid,.product-grid,.metric-grid,.how-grid,.trust-grid'))return [...group.children];
    return [group];
  }
  function mount(animatePage=false) {
    if(!window.gsap || !animatePage)return;
    const main=document.getElementById('main');
    if(!main)return;
    media=gsap.matchMedia();
    media.add({desktop:'(min-width: 761px)',mobile:'(max-width: 760px)',reduceMotion:'(prefers-reduced-motion: reduce)'},context=>{
      if(context.conditions.reduceMotion)return;
      const distance=context.conditions.desktop?24:14;
      const defaults={duration:.58,ease:'power3.out',clearProps:'transform,opacity,visibility'};
      const hero=main.querySelector('.hero');
      if(hero){
        gsap.from(hero.querySelectorAll('.hero-copy > *'),{...defaults,y:distance,autoAlpha:0,stagger:.075,duration:.72});
        gsap.from(hero.querySelector('.hero-visual > img'),{...defaults,x:distance,scale:1.025,autoAlpha:0,duration:.95});
        gsap.from(hero.querySelector('.price-float'),{...defaults,y:22,scale:.97,autoAlpha:0,duration:.85});
        gsap.from(hero.querySelector('.hero-stamp'),{...defaults,y:10,autoAlpha:0,duration:.8});
      }else{
        const heading=main.querySelector('.dashboard-heading,.catalog-head,.page-title,.success-page h1,.help-page h1,.apply-copy h1,.detail-body h1,.empty-state h2');
        if(heading)gsap.from(heading,{...defaults,y:distance,autoAlpha:0});
        const photo=main.querySelector('.detail-photo');
        if(photo)gsap.from(photo,{...defaults,y:distance,autoAlpha:0,duration:.75});
      }
      const candidates=[...main.querySelectorAll('.trust-grid,.section-head,.category-grid,.product-grid,.how-grid,.vendor-banner,.metric-grid,.dashboard-main > .panel,.dashboard-row > .panel,.growth-goal,.form-panel,.apply-card,.account-panel,.success-icon,.cart-items,.summary')];
      const groups=candidates.filter(group=>!candidates.some(parent=>parent!==group&&parent.contains(group)));
      let observer;
      context.add('reveal',group=>{
        gsap.to(targets(group),{...defaults,y:0,autoAlpha:1,stagger:{each:.055,amount:.32},overwrite:'auto'});
        const bars=group.querySelectorAll('.chart-bar');
        if(bars.length)gsap.from(bars,{scaleY:0,transformOrigin:'center bottom',duration:.8,stagger:.055,ease:'power3.out',clearProps:'transform,transformOrigin'});
        const tracks=group.querySelectorAll('.progress-track > span');
        if(tracks.length)gsap.from(tracks,{scaleX:0,transformOrigin:'left center',duration:.9,stagger:.07,ease:'power3.out',clearProps:'transform,transformOrigin'});
      });
      if('IntersectionObserver' in window){
        observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){observer.unobserve(entry.target);context.reveal(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -25px 0px'});
        const positions=groups.map(group=>({group,top:group.getBoundingClientRect().top}));
        positions.forEach(({group,top})=>{
          gsap.set(targets(group),{y:distance,autoAlpha:0});
          if(top<window.innerHeight-25)context.reveal(group);
          else observer.observe(group);
        });
      }else groups.forEach(group=>context.reveal(group));
      return ()=>observer?.disconnect();
    },main);
  }
  function feedback(kind,id) {
    if(!window.gsap||reduce())return;
    const target=kind==='cart'?document.querySelector('.cart-count'):document.querySelector(`.heart[data-id="${CSS.escape(id)}"]`);
    if(!target)return;
    feedbackTweens.push(gsap.fromTo(target,{scale:.65},{scale:1,duration:.45,ease:'back.out(2.5)',overwrite:'auto',clearProps:'transform'}));
  }
  function dialog() {
    if(!window.gsap||reduce())return;
    const element=document.getElementById('modal');
    gsap.killTweensOf(element);
    feedbackTweens.push(gsap.fromTo(element,{y:10,scale:.975,opacity:0},{y:0,scale:1,opacity:1,duration:.24,ease:'power3.out',clearProps:'transform,opacity'}));
  }
  window.addEventListener('pagehide',cleanup);
  return {cleanup,mount,feedback,dialog};
})();
