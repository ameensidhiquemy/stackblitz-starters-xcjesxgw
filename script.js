// Stars
(function(){
  const layer=document.getElementById('starsLayer');
  if(!layer)return;
  const count=40;
  const classes=['star--twinkle','star--twinkle2','star--twinkle3'];
  for(let i=0;i<count;i++){
    const s=document.createElement('div');
    s.className='star '+classes[Math.floor(Math.random()*classes.length)];
    const size=Math.random()*2.5+.5;
    s.style.cssText=`width:${size}px;height:${size}px;top:${Math.random()*85}%;left:${Math.random()*100}%;opacity:${Math.random()*.6+.3};animation-delay:${Math.random()*3}s;`;
    layer.appendChild(s);
  }
})();

// Scroll progress bar
const bar=document.getElementById('scrollProgress');
window.addEventListener('scroll',()=>{
  const h=document.documentElement.scrollHeight-window.innerHeight;
  if(h>0)bar.style.width=(window.scrollY/h*100)+'%';
},{passive:true});

// Intersection Observer for scroll animations (replays on every re-entry)
const revealTimers=new WeakMap();
const animatedSelector='[data-animate], .tl-item, .quote-float, .river-divider';
const observer=new IntersectionObserver((entries)=>{
  entries.forEach((entry)=>{
    const el=entry.target;
    const existingTimer=revealTimers.get(el);
    if(existingTimer){
      clearTimeout(existingTimer);
      revealTimers.delete(el);
    }

    if(entry.isIntersecting){
      let delay=0;
      if(el.matches('[data-animate]')){
        const parent=el.parentElement;
        const siblings=parent?[...parent.querySelectorAll('[data-animate]')]:[];
        const idx=siblings.indexOf(el);
        if(idx>=0){
          const isTimelineItem=el.classList.contains('tl-item');
          delay=isTimelineItem?Math.min(idx*35,140):Math.min(idx*90,360);
        }
      }
      const timer=setTimeout(()=>{
        el.classList.add('visible');
        revealTimers.delete(el);
      },delay);
      revealTimers.set(el,timer);
    }else{
      el.classList.remove('visible');
    }
  });
},{threshold:.06,rootMargin:'0px 0px 8% 0px'});

document.querySelectorAll(animatedSelector).forEach(el=>observer.observe(el));

// Global text reveal: fade in on enter, fade out on exit
const textSelector=[
  'h1','h2','h3','h4','h5','h6','p','li','small','blockquote',
  'a','.section-label','.section-title','.section-body','.l-cell',
  '.hero-badge','.hero-meta span','.time-badge','.footer-logo',
  '.impact-num','.impact-label','.pc-number','.pc-question','.pc-team','.pc-desc','.pc-expand-hint',
  '.proto-number','.proto-question','.proto-team','.proto-desc',
  '.tl-time','.tl-content h3','.tl-content p','.tl-tag','.quote-text','.quote-attr'
].join(',');

const textObserver=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    entry.target.classList.toggle('visible',entry.isIntersecting);
  });
},{threshold:.18,rootMargin:'0px 0px -10% 0px'});

document.querySelectorAll(textSelector).forEach(el=>{
  if(el.closest('script,style,nav,.nav-mobile-menu,.hero,.footer'))return;
  el.classList.add('reveal-text');
  textObserver.observe(el);
});

// Counter animation
const numObserver=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const numEl=entry.target.querySelector('.impact-num');
      if(numEl&&!numEl.dataset.counted){
        numEl.dataset.counted='true';
        const target=parseInt(numEl.textContent,10);
        let current=0;
        const duration=1200;
        const step=target/(duration/16);
        const counter=setInterval(()=>{
          current+=step;
          if(current>=target){numEl.textContent=String(target);clearInterval(counter);}else{numEl.textContent=String(Math.floor(current));}
        },16);
      }
    }
  });
},{threshold:.5});

document.querySelectorAll('.impact-item').forEach(el=>numObserver.observe(el));

// Navbar controls
const hamburger=document.getElementById('hamburger');
const mobileMenu=document.getElementById('mobileMenu');
if(hamburger&&mobileMenu){
  hamburger.addEventListener('click',()=>{
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('show');
  });
}

// Smooth anchors (custom eased scroll)
const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function easeInOutCubic(t){
  return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
}
function smoothScrollToTarget(target,duration=900){
  const navHeight=(mainNav?mainNav.getBoundingClientRect().height:0)+12;
  const startY=window.scrollY;
  const targetY=Math.max(0,startY+target.getBoundingClientRect().top-navHeight);
  if(prefersReducedMotion){
    window.scrollTo(0,targetY);
    return;
  }
  const start=performance.now();
  function step(now){
    const elapsed=now-start;
    const progress=Math.min(elapsed/duration,1);
    const eased=easeInOutCubic(progress);
    window.scrollTo(0,startY+(targetY-startY)*eased);
    if(progress<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const href=a.getAttribute('href');
    if(!href||href==='#')return;
    const target=document.querySelector(href);
    if(!target)return;
    e.preventDefault();
    smoothScrollToTarget(target);
    if(mobileMenu)mobileMenu.classList.remove('show');
    if(hamburger)hamburger.classList.remove('open');
  });
});

const mainNav=document.getElementById('mainNav');
const sections=document.querySelectorAll('[id]');
const navLinks=document.querySelectorAll('.nav-links a[data-section]');
const lightSections=document.querySelectorAll('.bg-morning,.bg-cream');
let navIsScrolled=false;
function updateNav(){
  const sy=window.scrollY;
  if(mainNav){
    if(!navIsScrolled&&sy>24)navIsScrolled=true;
    else if(navIsScrolled&&sy<8)navIsScrolled=false;
    mainNav.classList.toggle('scrolled',navIsScrolled);
  }
  let inLight=false;
  lightSections.forEach(s=>{
    const r=s.getBoundingClientRect();
    if(r.top<80&&r.bottom>80)inLight=true;
  });
  if(mainNav)mainNav.classList.toggle('nav-light',inLight);
  if(mobileMenu)mobileMenu.classList.toggle('nav-light',inLight);
  let cur='';
  sections.forEach(s=>{const r=s.getBoundingClientRect();if(r.top<200&&r.bottom>200)cur=s.id;});
  navLinks.forEach(l=>l.classList.toggle('active',l.dataset.section===cur));
}
window.addEventListener('scroll',updateNav,{passive:true});
updateNav();

// Desktop-only effects
if(window.matchMedia('(min-width:769px)').matches){

  // Hero parallax fade
  const heroEl=document.querySelector('.hero');
  const heroContent=document.querySelector('.hero-content');
  const heroScrollHint=document.querySelector('.hero-scroll');
  window.addEventListener('scroll',()=>{
    const s=window.scrollY;
    const h=heroEl?heroEl.offsetHeight:window.innerHeight;
    if(s<h){
      const frac=s/(h*0.55);
      const op=Math.max(0,1-frac);
      const ty=s*0.14;
      if(heroContent){heroContent.style.opacity=op;heroContent.style.transform=`translateY(${ty}px)`;}
      if(heroScrollHint)heroScrollHint.style.opacity=Math.max(0,1-frac*4);
    }
  },{passive:true});

  // 3D card tilt on impact items and feedback cards
  document.querySelectorAll('.impact-item,.feedback-card').forEach(el=>{
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-0.5;
      const y=(e.clientY-r.top)/r.height-0.5;
      const lift=el.classList.contains('feedback-card')?'-8px':'-6px';
      el.style.transform=`translateY(${lift}) perspective(700px) rotateX(${-y*7}deg) rotateY(${x*7}deg)`;
    });
    el.addEventListener('mouseleave',()=>{el.style.transform='';});
  });

}

// Photo gallery lightbox
(function(){
  const photos=[...document.querySelectorAll('.photo-item')];
  const lb=document.getElementById('lightbox');
  if(!photos.length||!lb)return;
  const lbImg=document.getElementById('lbImg');
  const lbCaption=document.getElementById('lbCaption');
  const lbCounter=document.getElementById('lbCounter');
  let cur=0,touchStartX=0;

  // One-time staggered reveal (stays visible once shown)
  const photoObs=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const idx=photos.indexOf(entry.target);
        setTimeout(()=>entry.target.classList.add('visible'),(idx%3)*90);
        photoObs.unobserve(entry.target);
      }
    });
  },{threshold:.1,rootMargin:'0px 0px -6% 0px'});
  photos.forEach(el=>photoObs.observe(el));

  function show(idx){
    cur=(idx+photos.length)%photos.length;
    const img=photos[cur].querySelector('img');
    lbImg.src=img.src;lbImg.alt=img.alt;
    lbCaption.textContent=photos[cur].querySelector('.photo-overlay span')?.textContent||'';
    lbCounter.textContent=(cur+1)+'\u2009/\u2009'+photos.length;
  }
  function open(idx){show(idx);lb.classList.add('open');document.body.style.overflow='hidden';}
  function close(){lb.classList.remove('open');document.body.style.overflow='';}

  photos.forEach((el,i)=>el.addEventListener('click',()=>open(i)));
  document.getElementById('lbClose').addEventListener('click',close);
  document.getElementById('lbBackdrop').addEventListener('click',close);
  document.getElementById('lbPrev').addEventListener('click',e=>{e.stopPropagation();show(cur-1);});
  document.getElementById('lbNext').addEventListener('click',e=>{e.stopPropagation();show(cur+1);});

  document.addEventListener('keydown',e=>{
    if(!lb.classList.contains('open'))return;
    if(e.key==='Escape')close();
    if(e.key==='ArrowLeft')show(cur-1);
    if(e.key==='ArrowRight')show(cur+1);
  });

  // Touch swipe
  lb.addEventListener('touchstart',e=>{touchStartX=e.touches[0].clientX;},{passive:true});
  lb.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-touchStartX;
    if(Math.abs(dx)>50){dx<0?show(cur+1):show(cur-1);}
  },{passive:true});
})();
