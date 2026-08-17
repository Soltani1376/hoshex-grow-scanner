const $ = id => document.getElementById(id);
const STORAGE_KEY = 'hoshexGrowthCompanionV4';
const fa = value => String(value ?? '').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const clean = value => String(value || '').trim();
const escapeHtml = value => String(value || '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

const goalLabels = {
  instagram:'رشد پیج اینستاگرام',
  sales:'فروش',
  acquisition:'جذب مشتری',
  content:'محتوا',
  retention:'مشتری‌های قبلی',
  unknown:'تشخیص توسط هوشکس'
};

const diagnosisLabels = {
  'ig-consistency':'ریتم انتشار هنوز پایدار نیست',
  'ig-reach':'محتوا به اندازه کافی دیده نمی‌شود',
  'ig-conversion':'بازدید به مکالمه تبدیل نمی‌شود',
  'ig-sales':'دایرکت به خرید تبدیل نمی‌شود',
  'content-consistency':'خروجی محتوا کم یا نامنظم است',
  'content-clarity':'موضوع و مخاطب محتوا هنوز شفاف نیست',
  'content-conversion':'محتوا دیده می‌شود ولی اقدام نمی‌سازد',
  'content-measure':'محتوا منتشر می‌شود ولی از نتیجه‌اش یاد نمی‌گیری',
  acquisition:'ورودی مشتری قابل تکرار نیست',
  'acquisition-entry':'شروع ارتباط با مشتری بالقوه سخت است',
  sales:'در مسیر فروش ریزش داری',
  offer:'پیشنهاد فروش هنوز واضح نیست',
  retention:'پیگیری و فروش دوباره ضعیف است'
};

const defaultState = () => ({
  version:4,
  goal:null,
  day:1,
  profile:{name:'',offer:'',audience:'',type:'',stage:'',channel:'',time:30,budget:'',target:''},
  instagram:{handle:'',followers:0,posts30:0,views:0,dms30:0,sales30:0,camera:'',bestTopic:'',bio:'',targetKind:'',targetValue:0},
  adaptive:{path:[],answers:{}},
  diagnosis:null,
  task:null,
  taskVariant:0,
  currentStatus:null,
  journey:[],
  pendingNext:null
});

const state = defaultState();
const screens = [...document.querySelectorAll('.screen')];
let diagnosisOverride = null;

function restoreState(saved){
  const fresh=defaultState();
  Object.assign(state,fresh,saved || {});
  state.profile={...fresh.profile,...(saved?.profile||{})};
  state.instagram={...fresh.instagram,...(saved?.instagram||{})};
  state.adaptive={...fresh.adaptive,...(saved?.adaptive||{})};
  state.journey=Array.isArray(saved?.journey)?saved.journey:[];
}
function showScreen(id,label){
  screens.forEach(s=>s.classList.toggle('active',s.id===id));
  if(label) $('session-label').textContent=label;
  window.scrollTo({top:0,behavior:'smooth'});
}
function toast(message){
  $('toast').textContent=message;
  $('toast').classList.add('show');
  clearTimeout(toast._t);
  toast._t=setTimeout(()=>$('toast').classList.remove('show'),1800);
}
function saveState(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify({...state,savedAt:new Date().toISOString()}));
  syncResumeButton();
}
function loadSaved(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');}catch{return null;}
}
function resetState(){
  restoreState(defaultState());
  localStorage.removeItem(STORAGE_KEY);
  syncResumeButton();
}
function syncResumeButton(){
  const saved=loadSaved();
  const btn=$('resume-btn');
  if(saved?.diagnosis && saved?.task){
    btn.classList.remove('hidden');
    btn.textContent=`ادامه روز ${fa(saved.day||1)} ←`;
  }else{
    btn.classList.add('hidden');
  }
}

$('brand-home').addEventListener('click',()=>showScreen('screen-home','شروع'));
$('start-btn').addEventListener('click',()=>showScreen('screen-goal','انتخاب هدف'));
$('resume-btn').addEventListener('click',()=>{
  const saved=loadSaved();
  if(!saved?.diagnosis || !saved?.task){toast('مسیر ذخیره‌شده‌ای پیدا نشد');syncResumeButton();return;}
  restoreState(saved);
  renderResult(true);
  showScreen('screen-result',`روز ${fa(state.day)}`);
});
$('restart-btn').addEventListener('click',()=>{
  resetState();
  document.querySelectorAll('form').forEach(f=>f.reset());
  showScreen('screen-home','شروع');
});

[...document.querySelectorAll('.goal-card')].forEach(btn=>btn.addEventListener('click',()=>{
  state.goal=btn.dataset.goal;
  state.day=1;
  state.journey=[];
  state.pendingNext=null;
  showScreen('screen-profile','شناخت کسب‌وکار');
}));

$('profile-form').addEventListener('submit',e=>{
  e.preventDefault();
  state.profile={
    name:clean($('business-name').value),
    offer:clean($('business-offer').value),
    audience:clean($('business-audience').value),
    type:$('business-type').value,
    stage:$('business-stage').value,
    channel:$('business-channel').value,
    time:Number($('business-time').value||30),
    budget:$('business-budget').value,
    target:clean($('business-target').value)
  };
  if(!state.profile.offer || !state.profile.audience || !state.profile.type || !state.profile.stage || !state.profile.channel || !state.profile.target) return;
  saveState();
  if(state.goal==='instagram') showScreen('screen-instagram','شناخت پیج');
  else startAdaptive(state.goal);
});

$('instagram-form').addEventListener('submit',e=>{
  e.preventDefault();
  state.instagram={
    handle:clean($('ig-handle').value),
    followers:Number($('ig-followers').value||0),
    posts30:Number($('ig-posts').value||0),
    views:Number($('ig-views').value||0),
    dms30:Number($('ig-dms').value||0),
    sales30:Number($('ig-sales').value||0),
    camera:$('ig-camera').value,
    bestTopic:clean($('ig-best-topic').value),
    bio:clean($('ig-bio').value),
    targetKind:$('ig-target-kind').value,
    targetValue:Number($('ig-target-value').value||0)
  };
  if(!state.instagram.camera || !state.instagram.targetKind || state.instagram.targetValue<1) return;
  processAndRender(()=>diagnoseInstagram());
});

const q = (id,tag,title,hint,options) => ({id,tag,title,hint,options});
const option = (label,value,score,next) => ({label,value,score,next});

const questionTrees={
  sales:{
    start:'s1',
    questions:{
      s1:q('s1','ورودی فروش','در ۳۰ روز اخیر چند نفر واقعاً درباره خرید سؤال کرده‌اند؟','اول مشخص می‌کنیم مسئله کمبود علاقه‌مند است یا تبدیل علاقه‌مند به خریدار.',[
        option('تقریباً هیچ‌کس','none',1,'s_source'),option('۱ تا ۵ نفر','low',2,'s_source'),option('۶ تا ۲۰ نفر','mid',3,'s_offer'),option('بیشتر از ۲۰ نفر','high',4,'s_offer')]),
      s_source:q('s_source','ورودی مشتری','همین تعداد کم بیشتر از کجا آمده؟','اگر ورودی ضعیف باشد، فشار آوردن روی متن فروش اولویت اول نیست.',[
        option('تقریباً شانسی','random',1,'s_offer'),option('آشنا و معرفی','referral',2,'s_offer'),option('یک مسیر مشخص','one',3,'s_offer'),option('چند مسیر مشخص','multi',4,'s_offer')]),
      s_offer:q('s_offer','پیشنهاد فروش','اگر مشتری بپرسد «دقیقاً چی می‌گیرم و چرا این گزینه؟» جواب کوتاه داری؟','اینجا وضوح پیشنهاد را می‌سنجیم.',[
        option('نه، توضیح طولانی می‌دم','no',1,'s_follow'),option('تا حدی','some',2,'s_follow'),option('نسبتاً روشنه','clear',3,'s_follow'),option('کاملاً کوتاه و روشنه','very-clear',4,'s_follow')]),
      s_follow:q('s_follow','پیگیری','اگر بعد از قیمت دادن جواب ندهد چه می‌کنی؟','بخشی از فروش‌ها در همین مرحله از دست می‌روند.',[
        option('هیچ کاری','none',1,'s_objection'),option('گاهی یادم باشه پیام می‌دم','random',2,'s_objection'),option('یک بار پیگیری می‌کنم','once',3,'s_objection'),option('زمان و متن مشخص دارم','system',4,'s_objection')]),
      s_objection:q('s_objection','اعتراض مشتری','برای «گرونه»، «فکر می‌کنم» و «بعداً خبر می‌دم» جواب مشخص داری؟','آخرین سؤال برای تشخیص اینکه مشکل اصلی پیشنهاد است یا گفت‌وگوی فروش.',[
        option('نه','no',1,'END'),option('برای بعضی‌ها','some',2,'END'),option('بیشترشان را می‌دانم','most',3,'END'),option('بله، متن و مسیر دارم','yes',4,'END')])
    }
  },
  acquisition:{
    start:'a1',questions:{
      a1:q('a1','ورودی مشتری','در ۳۰ روز اخیر چند مشتری یا علاقه‌مند جدید وارد شده؟','از خود جریان ورودی شروع می‌کنیم.',[
        option('تقریباً صفر','none',1,'a_visibility'),option('۱ تا ۵ نفر','low',2,'a_visibility'),option('۶ تا ۲۰ نفر','mid',3,'a_entry'),option('بیشتر از ۲۰ نفر','high',4,'a_entry')]),
      a_visibility:q('a_visibility','دیده‌شدن','در هفته چند بار جلوی مشتری بالقوه قرار می‌گیری؟','پست، استوری، پیام، معرفی، همکاری یا حضور محلی.',[
        option('تقریباً هیچ‌وقت','none',1,'a_entry'),option('۱ بار','one',2,'a_entry'),option('۲ تا ۴ بار','few',3,'a_entry'),option('تقریباً هر روز','often',4,'a_entry')]),
      a_entry:q('a_entry','شروع ارتباط','برای کسی که هنوز آماده خرید نیست، دلیل ساده‌ای برای پیام دادن داری؟','مثل بررسی کوتاه، نمونه، پاسخ به یک سؤال یا پیشنهاد شروع کم‌ریسک.',[
        option('نه','none',1,'a_referral'),option('یک چیز مبهم دارم','weak',2,'a_referral'),option('یک پیشنهاد روشن دارم','clear',3,'a_referral'),option('چند ورودی دارم و نتیجه‌شان را می‌سنجم','system',4,'a_referral')]),
      a_referral:q('a_referral','معرفی و ارتباط مستقیم','از مشتری راضی یا مخاطب گرم فعالانه معرفی یا مکالمه می‌گیری؟','اگر این مسیر استفاده نشده باشد، امروز می‌توانیم با کمترین هزینه از همین‌جا شروع کنیم.',[
        option('هیچ‌وقت','none',1,'END'),option('خیلی کم','low',2,'END'),option('گاهی','some',3,'END'),option('منظم و با متن مشخص','system',4,'END')])
    }
  },
  content:{
    start:'c1',questions:{
      c1:q('c1','خروجی','در ۳۰ روز اخیر چند محتوای واقعی منتشر کردی؟','اول فرق بین مشکل «کم منتشر کردن» و «نتیجه نگرفتن» را مشخص می‌کنیم.',[
        option('۰ تا ۲ محتوا','very-low',1,'c_block'),option('۳ تا ۵ محتوا','low',2,'c_block'),option('۶ تا ۱۲ محتوا','mid',3,'c_clarity'),option('بیشتر از ۱۲ محتوا','high',4,'c_clarity')]),
      c_block:q('c_block','گیر تولید','بیشتر چه چیزی جلوی انتشار منظم را می‌گیرد؟','جواب این سؤال روی نوع کار امروز اثر مستقیم دارد.',[
        option('وقت ندارم','time',1,'c_clarity'),option('ایده ندارم','ideas',1,'c_clarity'),option('ساختنش برام سخته','skill',2,'c_clarity'),option('نمی‌دونم چی واقعاً جواب می‌ده','uncertain',2,'c_clarity')]),
      c_clarity:q('c_clarity','مخاطب و موضوع','سه موضوع اصلی که برای مخاطبت می‌سازی مشخص‌اند؟','محتوای پراکنده حتی با انتشار زیاد هم سخت‌تر رشد می‌کند.',[
        option('نه','no',1,'c_action'),option('تقریباً','some',2,'c_action'),option('بله','yes',3,'c_action'),option('بله و براساس نتیجه اصلاحشون می‌کنم','measured',4,'c_action')]),
      c_action:q('c_action','اقدام بعدی','آخر بیشتر محتواها از مخاطب یک کار مشخص می‌خواهی؟','مثلاً پیام، ذخیره، دیدن محصول یا ثبت درخواست.',[
        option('نه','none',1,'c_measure'),option('گاهی','some',2,'c_measure'),option('بیشتر مواقع','often',3,'c_measure'),option('بله و نتیجه‌اش را می‌سنجم','measured',4,'c_measure')]),
      c_measure:q('c_measure','یادگیری از محتوا','می‌دانی کدام ۳ محتوای اخیر بهتر جواب داده و چرا؟','اگر برنده‌ها را نشناسیم، هر هفته دوباره از صفر شروع می‌کنیم.',[
        option('نه','no',1,'END'),option('فقط از روی حس','guess',2,'END'),option('تقریباً می‌دانم','some',3,'END'),option('عددها را مقایسه می‌کنم','yes',4,'END')])
    }
  },
  retention:{
    start:'r1',questions:{
      r1:q('r1','مشتری قبلی','در ۳۰ روز اخیر چند مشتری قبلی دوباره خرید کرده؟','می‌خواهیم ببینیم فرصت فروش دوباره چقدر رها شده.',[
        option('تقریباً هیچ‌کس','none',1,'r_follow'),option('خیلی کم','low',2,'r_follow'),option('بخشی از مشتری‌ها','some',3,'r_follow'),option('منظم تکرار خرید دارم','good',4,'r_follow')]),
      r_follow:q('r_follow','پیگیری بعد خرید','بعد از خرید، خودت دوباره سراغ مشتری می‌ری؟','یک پیام ساده می‌تواند هم رضایت را بالا ببرد و هم فرصت بعدی را نشان دهد.',[
        option('نه','none',1,'r_next'),option('خیلی کم','low',2,'r_next'),option('گاهی','some',3,'r_next'),option('روند مشخص دارم','system',4,'r_next')]),
      r_next:q('r_next','قدم بعدی مشتری','برای مشتری قبلی محصول یا خدمت بعدی مشخص داری؟','اگر قدم بعدی مبهم باشد، فروش دوباره اتفاقی می‌شود.',[
        option('نه','none',1,'r_data'),option('برای بعضی‌ها','some',2,'r_data'),option('بله','yes',3,'r_data'),option('بله و زمان پیشنهادش مشخصه','system',4,'r_data')]),
      r_data:q('r_data','ثبت اطلاعات','می‌دانی آخرین خرید هر مشتری چه زمانی بوده؟','بدون این اطلاعات پیگیری معمولاً دیر یا تصادفی انجام می‌شود.',[
        option('نه','none',1,'END'),option('فقط توی پیام‌ها می‌گردم','messages',2,'END'),option('تقریباً ثبت می‌کنم','some',3,'END'),option('لیست و تاریخچه دارم','system',4,'END')])
    }
  },
  unknown:{
    start:'u_acq',questions:{
      u_acq:q('u_acq','جذب مشتری','ورودی مشتری جدید در ۳۰ روز اخیر چقدر قابل تکرار بوده؟','اگر خودت نمی‌دونی گره کجاست، پنج بخش اصلی را سریع مقایسه می‌کنیم.',[
        option('تقریباً صفر','v',1,'u_offer'),option('کم و شانسی','v',2,'u_offer'),option('نسبتاً منظم','v',3,'u_offer'),option('کاملاً مشخص و قابل اندازه‌گیری','v',4,'u_offer')]),
      u_offer:q('u_offer','پیشنهاد فروش','مشتری چقدر سریع می‌فهمد دقیقاً چه می‌فروشی و چرا باید انتخابت کند؟','وضوح پیشنهاد را می‌سنجیم.',[
        option('خیلی مبهمه','v',1,'u_content'),option('نیاز به توضیح زیاد داره','v',2,'u_content'),option('نسبتاً روشنه','v',3,'u_content'),option('خیلی روشن و قابل مقایسه‌ست','v',4,'u_content')]),
      u_content:q('u_content','محتوا','محتوا یا ارتباط بازاریابی چقدر منظم و هدفمند است؟','محتوا فقط اینستاگرام نیست؛ هر چیزی که مشتری را با تو آشنا می‌کند.',[
        option('تقریباً ندارم','v',1,'u_sales'),option('نامنظم','v',2,'u_sales'),option('نسبتاً منظم','v',3,'u_sales'),option('منظم و متصل به هدف','v',4,'u_sales')]),
      u_sales:q('u_sales','فروش','علاقه‌مندها چقدر منظم به خرید تبدیل می‌شوند؟','مسیر بین سؤال مشتری و پرداخت را در نظر بگیر.',[
        option('خیلی ضعیف','v',1,'u_ret'),option('ضعیف و نامنظم','v',2,'u_ret'),option('نسبتاً خوب','v',3,'u_ret'),option('قابل اندازه‌گیری و منظم','v',4,'u_ret')]),
      u_ret:q('u_ret','بازگشت مشتری','بعد از خرید، پیگیری و فروش دوباره چقدر منظم است؟','آخرین بخش برای پیدا کردن ضعیف‌ترین حلقه.',[
        option('تقریباً هیچ','v',1,'END'),option('خیلی کم','v',2,'END'),option('نسبتاً منظم','v',3,'END'),option('روند مشخص دارم','v',4,'END')])
    }
  }
};

function startAdaptive(goal){
  const tree=questionTrees[goal] || questionTrees.unknown;
  state.adaptive={path:[tree.start],answers:{}};
  renderAdaptiveQuestion();
  showScreen('screen-quiz',goalLabels[goal]);
}
function currentTree(){return questionTrees[state.goal] || questionTrees.unknown;}
function currentQuestion(){
  const tree=currentTree();
  const id=state.adaptive.path[state.adaptive.path.length-1];
  return tree.questions[id];
}
function renderAdaptiveQuestion(){
  const question=currentQuestion();
  const step=state.adaptive.path.length;
  $('question-step').textContent=`سؤال ${fa(step)}`;
  $('question-title').textContent=question.title;
  $('question-hint').textContent=question.hint;
  $('question-tag').textContent=question.tag;
  $('progress-bar').style.width=`${Math.min(100,step/5*100)}%`;
  $('answers').innerHTML='';
  question.options.forEach((opt,i)=>{
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='answer-btn'+(state.adaptive.answers[question.id]?.value===opt.value?' selected':'');
    btn.innerHTML=`<span class="answer-key">${fa(i+1)}</span><span>${escapeHtml(opt.label)}</span>`;
    btn.addEventListener('click',()=>selectAdaptiveOption(opt));
    $('answers').appendChild(btn);
  });
}
function selectAdaptiveOption(opt){
  const question=currentQuestion();
  state.adaptive.answers[question.id]={value:opt.value,score:opt.score,label:opt.label};
  if(opt.next==='END'){
    processAndRender(()=>diagnoseAdaptive());
    return;
  }
  state.adaptive.path.push(opt.next);
  renderAdaptiveQuestion();
}
$('prev-question').addEventListener('click',()=>{
  if(state.adaptive.path.length>1){
    const removed=state.adaptive.path.pop();
    delete state.adaptive.answers[removed];
    renderAdaptiveQuestion();
  }else showScreen('screen-profile','شناخت کسب‌وکار');
});
$('quiz-back').addEventListener('click',()=>showScreen('screen-goal','انتخاب هدف'));
document.addEventListener('keydown',e=>{
  if(!$('screen-quiz').classList.contains('active')) return;
  const n=Number(e.key);
  const question=currentQuestion();
  if(n>=1 && n<=question.options.length) selectAdaptiveOption(question.options[n-1]);
});

function scoreOf(id,fallback=4){return state.adaptive.answers[id]?.score ?? fallback;}
function diagnoseAdaptive(){
  let key=state.goal;
  let reason='';
  let confidence='متوسط';

  if(state.goal==='unknown'){
    const dimensions={acquisition:scoreOf('u_acq'),offer:scoreOf('u_offer'),content:scoreOf('u_content'),sales:scoreOf('u_sales'),retention:scoreOf('u_ret')};
    const sorted=Object.entries(dimensions).sort((a,b)=>a[1]-b[1]);
    key=sorted[0][0];
    const gap=sorted[1][1]-sorted[0][1];
    confidence=gap>=1?'متوسط':'پایین';
    reason=`از بین پنج بخش، «${diagnosisLabels[key] || goalLabels[key]}» پایین‌ترین وضعیت را در جواب‌ها داشته. چون این بررسی سریع است، اول با یک اقدام کم‌ریسک صحت تشخیص را امتحان می‌کنیم.`;
  }
  if(state.goal==='sales'){
    const inflow=scoreOf('s1');
    const source=scoreOf('s_source',4);
    const offerScore=scoreOf('s_offer');
    const follow=scoreOf('s_follow');
    const objection=scoreOf('s_objection');
    if(inflow<=2 && source<=2){key='acquisition';reason='علاقه‌مند کافی وارد مسیر فروش نمی‌شود؛ قبل از دستکاری متن فروش، باید تعداد مکالمه‌های واقعی را بالا ببریم.';}
    else if(offerScore<=2){key='offer';reason='ورودی وجود دارد اما پیشنهاد هنوز برای مشتری کوتاه و روشن نیست؛ امروز قبل از پیگیری بیشتر، خود پیشنهاد را ساده می‌کنیم.';}
    else{key='sales';reason=follow<=2 || objection<=2?'ورودی و پیشنهاد تا حدی وجود دارد، اما پیگیری یا پاسخ به تردید مشتری ضعیف‌تر است.':'مسیر فروش بد نیست؛ برای رشد بیشتر باید گفت‌وگوها را منظم‌تر اندازه بگیریم و نسخه برنده را تکرار کنیم.';}
  }
  if(state.goal==='acquisition'){
    const entry=scoreOf('a_entry');
    key=entry<=1?'acquisition-entry':'acquisition';
    reason=entry<=1?'مخاطب دلیل ساده‌ای برای شروع ارتباط با تو ندارد؛ امروز یک ورودی کم‌ریسک می‌سازیم و همان را جلوی مخاطب می‌گذاریم.':'مسئله اصلی هنوز قابل‌تکرار نبودن ورودی است؛ امروز به‌جای پخش شدن در چند کانال، یک حرکت مستقیم و قابل اندازه‌گیری اجرا می‌کنیم.';
  }
  if(state.goal==='content'){
    const output=scoreOf('c1');
    const clarity=scoreOf('c_clarity');
    const action=scoreOf('c_action');
    const measure=scoreOf('c_measure');
    if(output<=2) key='content-consistency';
    else if(clarity<=2) key='content-clarity';
    else if(action<=2) key='content-conversion';
    else key='content-measure';
    reason={
      'content-consistency':'قبل از استراتژی پیچیده، باید یک روش تولید قابل ادامه بسازیم که با زمان واقعی تو جور باشد.',
      'content-clarity':'محتوا منتشر می‌شود اما موضوع و مخاطب به اندازه کافی متمرکز نیست؛ امروز یک محتوای دقیق برای یک درد مشخص می‌سازیم.',
      'content-conversion':'خروجی داری اما مخاطب بعدش قدم مشخصی برنمی‌دارد؛ امروز خود محتوا را به یک مکالمه یا اقدام وصل می‌کنیم.',
      'content-measure':'محتوا نسبتاً منظم است؛ مسئله فعلی این است که از برنده‌ها الگو نمی‌گیری و هر بار از صفر شروع می‌کنی.'
    }[key];
  }
  if(state.goal==='retention'){
    key='retention';
    const follow=scoreOf('r_follow');
    const next=scoreOf('r_next');
    reason=follow<=2?'بعد از خرید ارتباط زود قطع می‌شود؛ امروز بدون فشار فروش دوباره، ارتباط با مشتری قبلی را باز می‌کنیم.':next<=2?'پیگیری داری ولی قدم بعدی مشتری روشن نیست؛ امروز پیشنهاد بعدی را مشخص و امتحان می‌کنیم.':'پایه پیگیری وجود دارد؛ امروز یک دور منظم و قابل اندازه‌گیری روی مشتری‌های قبلی اجرا می‌کنیم.';
  }

  return makeDiagnosis(key,reason,confidence,'این تشخیص از جواب‌های خودت ساخته شده و با نتیجه اجرای امروز دوباره بررسی می‌شود.');
}

function diagnoseInstagram(){
  const ig=state.instagram;
  const followers=Math.max(ig.followers,1);
  const viewRatio=ig.views/followers;
  const estimatedExposures=Math.max(ig.views*Math.max(ig.posts30,1),1);
  const dmRate=ig.dms30/estimatedExposures;
  const salesPerDm=ig.dms30>0?ig.sales30/ig.dms30:0;
  let key='ig-conversion';

  if(ig.posts30<4) key='ig-consistency';
  else if((followers>=100 && viewRatio<0.22) || (followers<100 && ig.views<60)) key='ig-reach';
  else if(ig.dms30===0 || dmRate<0.0015) key='ig-conversion';
  else if(ig.dms30>=3 && (ig.sales30===0 || salesPerDm<0.08)) key='ig-sales';
  else if(ig.targetKind==='reach' || ig.targetKind==='followers') key='ig-reach';
  else if(ig.targetKind==='dm') key='ig-conversion';
  else if(ig.targetKind==='sales') key=ig.dms30>0?'ig-sales':'ig-conversion';

  const targetLabel={reach:'میانگین بازدید',followers:'فالوور',dm:'دایرکت مرتبط',sales:'فروش از پیج'}[ig.targetKind];
  const reasons={
    'ig-consistency':`در ۳۰ روز اخیر ${fa(ig.posts30)} محتوا منتشر شده. قبل از تغییر پیچیده در موضوع یا فروش، باید ریتمی بسازیم که واقعاً بتوانی ادامه‌اش بدهی.`,
    'ig-reach':`با ${fa(ig.followers)} فالوور، میانگین بازدید پنج محتوای اخیر ${fa(ig.views)} بوده. این فقط یک نشانه است؛ امروز شروع محتوا و زاویه موضوع را تست می‌کنیم تا ببینیم مشکل واقعاً از دیده‌شدن است یا نه.`,
    'ig-conversion':`در ۳۰ روز اخیر حدود ${fa(ig.dms30)} دایرکت کاری ثبت شده. اولویت امروز این است که مخاطب بعد از دیدن محتوا دقیقاً بداند چه کاری انجام دهد.`,
    'ig-sales':`در ۳۰ روز اخیر ${fa(ig.dms30)} دایرکت کاری و ${fa(ig.sales30)} فروش ثبت شده. یعنی مسئله فقط تولید محتوا نیست؛ باید خود گفت‌وگوی فروش داخل دایرکت را اصلاح کنیم.`
  };
  return makeDiagnosis(key,reasons[key],'متوسط',`این تشخیص بر اساس عددهایی است که خودت وارد کردی. این نسخه پیج را خودکار باز یا مشاهده نمی‌کند. هدف ثبت‌شده: ${targetLabel} = ${fa(ig.targetValue)}.`);
}

function makeDiagnosis(key,reason,confidence,note){
  return {key,title:diagnosisLabels[key] || diagnosisLabels[baseType(key)] || 'اولویت رشد',reason,confidence,note,createdAt:new Date().toISOString()};
}
function baseType(key){
  if(key.startsWith('ig-')) return key;
  if(key.startsWith('content-')) return 'content';
  if(key.startsWith('acquisition')) return 'acquisition';
  return key;
}

function processAndRender(builder){
  $('processing-title').textContent=state.goal==='instagram'?'داریم عددهای پیج رو به کار امروز تبدیل می‌کنیم...':'داریم جواب‌ها رو به یک کار واقعی برای امروز تبدیل می‌کنیم...';
  showScreen('screen-processing','در حال تحلیل');
  setTimeout(()=>{
    state.diagnosis=builder();
    state.taskVariant=0;
    state.task=buildTask(state.diagnosis.key,0);
    state.currentStatus=null;
    state.pendingNext=null;
    saveState();
    renderResult();
    showScreen('screen-result',`روز ${fa(state.day)}`);
  },700);
}

function formatForCamera(){
  if(state.goal!=='instagram') return 'متن یا ویدئوی ساده';
  if(state.instagram.camera==='no') return 'ویدئوی بدون چهره با متن روی تصویر';
  if(state.instagram.camera==='sometimes') return 'ویدئوی کوتاه؛ اگر خواستی بدون چهره هم می‌شود';
  return 'ویدئوی کوتاه رو به دوربین';
}
function contentPackage(angle){
  const offer=state.profile.offer, audience=state.profile.audience;
  const best=state.instagram.bestTopic?` با تکیه روی موضوعی که قبلاً بهتر جواب داده: «${state.instagram.bestTopic}»`:'';
  const camera=formatForCamera();
  const packs=[
    {
      title:`یک محتوای «اشتباه رایج» درباره ${offer}`,
      copy:`امروز فقط یک درد مشخص از ${audience} را بگیر و آن را تا مرحله انتشار آماده کن.${best}`,
      why:'یک درد مشخص، هم شروع محتوا را قوی‌تر می‌کند و هم فهمیدن واکنش مخاطب را ساده‌تر.',
      ready:[
        {label:'قالب اجرا',title:camera,text:`مدت پیشنهادی: ۱۵ تا ۲۵ ثانیه. فقط یک نکته؛ نه آموزش طولانی.`},
        {label:'شروع محتوا',title:'جمله اول',text:`اگه ${audience} هستی و برای «${offer}» هنوز نتیجه‌ای که می‌خوای رو نگرفتی، احتمالاً داری این اشتباه رو تکرار می‌کنی.`},
        {label:'سناریوی آماده',title:'متن اجرا',text:`اشتباه اینه که قبل از مشخص کردن نتیجه، سراغ راه‌حل بعدی می‌ری. اول دقیق بگو از «${offer}» چه نتیجه‌ای می‌خوای، بعد فقط یک تغییر رو برای یک هفته تست کن. اگه نمی‌دونی از کجا شروع کنی، کلمه «شروع» رو بفرست.`},
        {label:'کاور و دعوت به اقدام',title:'برای انتشار',text:`کاور: «این اشتباه نتیجه‌ات رو کند می‌کنه»\nدعوت به اقدام: «کلمه شروع رو دایرکت کن تا بگم اولین قدمت چیه.»`}
      ]
    },
    {
      title:`یک محتوای «قبل از اینکه...» درباره ${offer}`,
      copy:`محتوا را از لحظه تصمیم مخاطب شروع کن؛ درست قبل از خرید، شروع یا انتخاب.${best}`,
      why:'این زاویه روی آدمی کار می‌کند که همین حالا مسئله را حس می‌کند و احتمال اقدامش بیشتر است.',
      ready:[
        {label:'قالب اجرا',title:camera,text:'مدت پیشنهادی: ۱۵ تا ۲۰ ثانیه؛ سه نکته کوتاه.'},
        {label:'شروع محتوا',title:'جمله اول',text:`قبل از اینکه برای «${offer}» دوباره وقت یا پول بذاری، این ۳ چیز رو چک کن.`},
        {label:'سناریوی آماده',title:'متن اجرا',text:`یک: دقیقاً چه نتیجه‌ای می‌خوای؟ دو: الان بزرگ‌ترین مانعت چیه؟ سه: از کجا می‌فهمی این انتخاب جواب داده؟ اگه جواب یکی‌شون مبهمه، هنوز برای انتخاب بعدی زوده.`},
        {label:'کاور و دعوت به اقدام',title:'برای انتشار',text:`کاور: «قبل از انتخاب بعدی، این ۳ سؤال»\nدعوت به اقدام: «اگه خواستی وضعیتت رو بگی، فقط بنویس بررسی.»`}
      ]
    },
    {
      title:`یک محتوای «سؤال پرتکرار» برای ${offer}`,
      copy:'به‌جای پیدا کردن ایده جدید، از سؤالی استفاده کن که یک مشتری واقعی ممکن است قبل از خرید بپرسد.',
      why:'سؤال واقعی هم ایده محتواست، هم اعتراض فروش را قبل از دایرکت پاسخ می‌دهد.',
      ready:[
        {label:'قالب اجرا',title:camera,text:'سؤال را روی تصویر بنویس و در ۲۰ ثانیه جواب بده.'},
        {label:'شروع محتوا',title:'سؤال پیشنهادی',text:`«از کجا بفهمم ${offer} واقعاً برای من مناسبه؟»`},
        {label:'پاسخ آماده',title:'متن اجرا',text:`اگر هدفت روشن نیست، هیچ گزینه‌ای رو فقط از روی قیمت یا ظاهر انتخاب نکن. اول نتیجه‌ای که می‌خوای رو بگو؛ بعد می‌شه فهمید کدوم مسیر واقعاً مناسبته و کدوم فقط هزینه اضافه‌ست.`},
        {label:'دعوت به اقدام',title:'پایان محتوا',text:'«اگه بین چند انتخاب مرددی، هدفت رو دایرکت کن؛ می‌گم اول چی رو مقایسه کنی.»'}
      ]
    }
  ];
  return packs[angle%packs.length];
}
function salesPackage(angle){
  const offer=state.profile.offer;
  const packs=[
    {title:`سه گفت‌وگوی واقعی درباره «${offer}» را با این متن جلو ببر`,copy:'امروز مشتری جدید نمی‌خواهیم؛ همان آدم‌هایی که سؤال کرده‌اند را بهتر جلو می‌بریم.',why:'وقتی علاقه‌مند وجود دارد، افزایش ورودی قبل از اصلاح تبدیل فقط تعداد ریزش را بیشتر می‌کند.',ready:[
      {label:'وقتی می‌گوید گرونه',title:'پاسخ آماده',text:`کاملاً قابل درکه. قبل از اینکه فقط با قیمت تصمیم بگیری، بگو از «${offer}» دقیقاً چه نتیجه‌ای می‌خوای. اگر گزینه ساده‌تر یا کم‌هزینه‌تری واقعاً مناسب تو باشه، همون رو پیشنهاد می‌دم.`},
      {label:'وقتی می‌گوید فکر می‌کنم',title:'پاسخ آماده',text:`حتماً، عجله‌ای نیست. فقط برای اینکه تصمیم‌گیریت راحت‌تر بشه بگو بیشتر روی کدوم بخش مرددی: نتیجه، قیمت، زمان یا اینکه مطمئن نیستی «${offer}» مناسب تو هست یا نه؟`},
      {label:'پیگیری',title:'اگر جواب نداد',text:`سلام، فقط یک پیگیری کوتاه درباره «${offer}». اگر هنوز سؤال یا ابهامی داری بگو تا همون بخش رو روشن کنم. اگر هم فعلاً زمانش نیست، کاملاً اوکیه.`}
    ]},
    {title:`قبل از قیمت دادن برای «${offer}» سه سؤال بپرس`,copy:'امروز قیمت را دیرتر بگو و اول مسئله مشتری را روشن کن.',why:'وقتی مشتری خودش نتیجه و اولویت را بیان می‌کند، پیشنهاد بعدی دقیق‌تر و قابل دفاع‌تر می‌شود.',ready:[
      {label:'متن شروع',title:'قبل از قیمت',text:`حتماً قیمت رو می‌گم. فقط سه مورد رو بگو تا گزینه اشتباه پیشنهاد ندم: ۱) دقیقاً چه نتیجه‌ای می‌خوای؟ ۲) الان مهم‌ترین مشکلت چیه؟ ۳) قیمت، سرعت یا کیفیت نتیجه کدوم برات مهم‌تره؟`},
      {label:'جمع‌بندی',title:'بعد از جواب مشتری',text:`پس چیزی که برات مهم‌تره «[نتیجه مشتری]» هست و محدودیت اصلیت هم «[محدودیت]». بر همین اساس، از بین گزینه‌ها این مسیر منطقی‌تره چون مستقیم‌تر به همون نتیجه وصل می‌شه.`}
    ]},
    {title:'امروز فقط پیگیری‌های نیمه‌کاره را جمع کن',copy:'هیچ پیشنهاد تازه‌ای نساز؛ سه مکالمه نیمه‌کاره را پیدا کن و دوباره بازشان کن.',why:'خیلی وقت‌ها فروش از نبود علاقه‌مند نمی‌ریزد؛ از رها کردن گفت‌وگویی می‌ریزد که هنوز تصمیم نهایی نگرفته.',ready:[
      {label:'پیگیری اول',title:'پیام کوتاه',text:`سلام، پیام قبلی رو فقط برای یک پیگیری کوتاه می‌فرستم. اگر هنوز درباره «${offer}» سؤال یا ابهامی داری، بگو همون بخش رو روشن کنم.`},
      {label:'بستن محترمانه',title:'اگر باز هم جواب نداد',text:`برای اینکه مزاحمت نشم این آخرین پیگیریمه. اگر بعداً دوباره «${offer}» برات جدی شد، همینجا پیام بده تا از همون نقطه ادامه بدیم.`}
    ]}
  ];
  return packs[angle%packs.length];
}
function acquisitionPackage(angle){
  const offer=state.profile.offer,audience=state.profile.audience;
  const packs=[
    {title:`امروز ۵ مکالمه جدید درباره «${offer}» شروع کن`,copy:`فقط با آدم‌هایی شروع کن که احتمال می‌دی جزو ${audience} باشند.`,why:'هدف امروز فروش مستقیم نیست؛ می‌خواهیم بفهمیم چه درد و سؤالی واقعاً مکالمه می‌سازد.',ready:[
      {label:'پیام مستقیم',title:'برای مخاطب گرم',text:`سلام. چون فکر کردم موضوع «${offer}» ممکنه به کارت بخوره، خواستم بدون فروش مستقیم بپرسم: الان مهم‌ترین سؤال یا مشکلت توی این موضوع چیه؟ اگر بتونم، کوتاه راهنماییت می‌کنم.`},
      {label:'استوری',title:'برای باز کردن مکالمه',text:`اگر درباره «${offer}» سؤال داری یا بین چند انتخاب مرددی، همینجا یک پیام بده و فقط بگو مهم‌ترین دغدغه‌ات چیه. می‌گم از کجا شروع کنی.`}
    ]},
    {title:'از مشتری یا آشنای راضی معرفی بگیر',copy:'امروز به‌جای پیدا کردن غریبه‌ها، از اعتماد موجود استفاده کن.',why:'معرفی برای کسب‌وکارهای کوچک معمولاً یک مسیر کم‌هزینه برای پیدا کردن اولین مکالمه‌های باکیفیت است.',ready:[
      {label:'درخواست معرفی',title:'متن آماده',text:`سلام. اگر کسی اطرافت هست که درباره «${offer}» دنبال راهنمایی یا انتخاب مطمئن‌تره، خوشحال می‌شم معرفی‌اش کنی. اول کمک می‌کنم بفهمه اصلاً چه گزینه‌ای مناسبشه؛ لازم نیست از اول تصمیم به خرید داشته باشه.`}
    ]},
    {title:'یک پیشنهاد شروع کم‌ریسک بساز و منتشر کن',copy:'به مخاطب نگو «بخر»؛ یک دلیل ساده برای شروع گفت‌وگو بده.',why:'وقتی اولین قدم کوچک باشد، مخاطبی که هنوز آماده خرید نیست هم می‌تواند وارد مکالمه شود.',ready:[
      {label:'پیشنهاد شروع',title:'متن آماده',text:`این هفته برای «${offer}» یک بررسی کوتاه دارم: وضعیتت رو در دو جمله بگو، من می‌گم اولین چیزی که باید اصلاح کنی چیه. اگر خواستی فقط کلمه «بررسی» رو بفرست.`},
      {label:'استوری دوم',title:'رفع ترس از فروش',text:'«لازم نیست آماده خرید باشی؛ اول فقط می‌خوایم ببینیم اصلاً چه چیزی به درد وضعیت تو می‌خوره.»'}
    ]}
  ];
  return packs[angle%packs.length];
}
function retentionPackage(angle){
  const offer=state.profile.offer;
  const packs=[
    {title:`امروز به ۵ مشتری قبلی «${offer}» پیام بده`,copy:'با رضایت و تجربه شروع کن، نه فروش دوباره.',why:'مشتری قبلی قبلاً به تو اعتماد کرده؛ اول باید بفهمیم نیاز بعدی یا مشکل حل‌نشده‌ای وجود دارد یا نه.',ready:[
      {label:'پیگیری رضایت',title:'متن آماده',text:`سلام، خواستم مطمئن شم تجربه‌ات از «${offer}» خوب بوده. اگر جایی سؤال یا مشکلی داشتی همینجا بگو تا پیگیریش کنم. اگر بخوای فقط یک چیز رو بهتر کنیم، اون چیه؟`},
      {label:'قدم بعدی',title:'اگر پاسخ مثبت بود',text:`خوبه. با توجه به چیزی که گفتی، قدم بعدی منطقی اینه که اول «[نیاز بعدی]» رو بررسی کنیم. اگر خواستی گزینه مناسبش رو برات جمع‌بندی می‌کنم.`}
    ]},
    {title:'سه مشتری قدیمی را برای بازگشت انتخاب کن',copy:'سراغ همه نرو؛ فقط کسانی را انتخاب کن که قبلاً تجربه خوبی داشته‌اند.',why:'یک گروه کوچک کمک می‌کند قبل از ساخت کمپین بزرگ بفهمی کدام پیشنهاد دوباره واقعاً جذاب است.',ready:[
      {label:'بازگشت مشتری',title:'متن آماده',text:`سلام. چون قبلاً «${offer}» رو تجربه کردی، خواستم بپرسم الان نیاز یا مسئله بعدی‌ای هست که بتونیم براش کمک کنیم؟ اگر بگی الان کجای کاری، مناسب‌ترین قدم بعدی رو پیشنهاد می‌دم.`}
    ]},
    {title:'از مشتری راضی یک معرفی واقعی بگیر',copy:'امروز هدف فقط یک معرفی باکیفیت است.',why:'اگر تجربه قبلی خوب بوده، معرفی می‌تواند هم فروش دوباره و هم جذب مشتری جدید را به هم وصل کند.',ready:[
      {label:'درخواست معرفی',title:'متن آماده',text:`اگر تجربه «${offer}» برات مفید بوده و کسی رو می‌شناسی که همین نیاز رو داره، خوشحال می‌شم این پیام رو براش بفرستی. اول راهنماییش می‌کنم ببینه اصلاً این گزینه مناسبش هست یا نه.`}
    ]}
  ];
  return packs[angle%packs.length];
}
function offerPackage(angle){
  const offer=state.profile.offer,audience=state.profile.audience;
  const packs=[
    {title:`پیشنهاد «${offer}» را امروز در یک جمله بازنویسی کن`,copy:'این جمله را در بیو، استوری، پیام اول یا معرفی حضوری تست کن.',why:'اگر مشتری سریع نفهمد برای چه کسی، چه نتیجه‌ای و با چه تفاوتی کار می‌کنی، تبلیغ بیشتر فقط ابهام را بیشتر پخش می‌کند.',ready:[
      {label:'نسخه پیشنهادی',title:'جمله اصلی',text:`«${offer}» برای ${audience} که می‌خواهد بدون سردرگمی بین انتخاب‌های اضافه، به یک مسیر روشن‌تر و نتیجه قابل پیگیری برسد.`},
      {label:'نسخه کوتاه',title:'برای معرفی سریع',text:`کمک به ${audience} برای انتخاب و اجرای بهتر «${offer}»؛ از تشخیص مسئله تا قدم بعدی.`}
    ]},
    {title:'سه سؤال قبل از پیشنهاد قیمت بساز',copy:'امروز پیشنهاد را بر اساس جواب مشتری شخصی‌تر کن.',why:'قیمت وقتی بدون زمینه گفته می‌شود راحت‌تر با گزینه‌های نامرتبط مقایسه می‌شود.',ready:[
      {label:'سه سؤال',title:'قبل از قیمت',text:`۱) دقیقاً چه نتیجه‌ای از «${offer}» می‌خوای؟\n۲) الان مهم‌ترین مانعت چیه؟\n۳) بین قیمت، سرعت و کیفیت نتیجه کدوم برات مهم‌تره؟`},
      {label:'پل به پیشنهاد',title:'بعد از جواب',text:'«با توجه به چیزی که گفتی، این گزینه منطقی‌تره چون مستقیم‌تر روی [نتیجه] اثر می‌ذاره و [محدودیت] رو هم در نظر می‌گیره.»'}
    ]},
    {title:'پیشنهادت را به سه سطح ساده تبدیل کن',copy:'اگر انتخاب‌ها پراکنده‌اند، امروز فقط سه گزینه بساز: شروع، اصلی، کامل.',why:'انتخاب محدود و قابل مقایسه، تصمیم مشتری را ساده‌تر می‌کند.',ready:[
      {label:'ساختار بسته‌ها',title:'قالب آماده',text:`شروع: حداقل چیزی که مشتری برای اولین نتیجه لازم دارد.\nاصلی: گزینه‌ای که برای بیشتر ${audience} مناسب است.\nکامل: برای کسی که سرعت، پشتیبانی یا نتیجه گسترده‌تر می‌خواهد.`},
      {label:'قانون نام‌گذاری',title:'ساده نگهش دار',text:'اسم هر گزینه باید نتیجه یا سطح خدمت را روشن کند؛ نه اسم‌های فانتزی که دوباره نیاز به توضیح دارند.'}
    ]}
  ];
  return packs[angle%packs.length];
}

function buildTask(key,variant=0,simplified=false){
  let pack;
  if(key==='ig-consistency' || key==='ig-reach') pack=contentPackage(variant);
  else if(key==='ig-conversion') pack=contentPackage((variant+1)%3);
  else if(key==='ig-sales') pack=salesPackage(variant);
  else if(key.startsWith('content-')) pack=contentPackage(variant);
  else if(key==='sales') pack=salesPackage(variant);
  else if(key==='offer') pack=offerPackage(variant);
  else if(key.startsWith('acquisition')) pack=acquisitionPackage(variant);
  else if(key==='retention') pack=retentionPackage(variant);
  else pack=contentPackage(variant);

  const baseMinutes=Math.min(Math.max(Number(state.profile.time||30),15),90);
  const time=simplified?Math.min(10,baseMinutes):Math.min(30,baseMinutes);
  const task={...pack,key,variant,time:`حدود ${fa(time)} دقیقه`,feedbackType:feedbackTypeFor(key)};
  task.optional=optionalTaskFor(key);
  if(simplified){
    task.title=`نسخه ساده‌تر: ${pack.title}`;
    task.copy='این بار فقط کوچک‌ترین بخش قابل اجرا را انجام بده؛ هدف شکستن گیر اجراست، نه کامل بودن.';
    task.ready=pack.ready.slice(0,1);
    task.why='وقتی اجرا گیر می‌کند، کار را کوچک می‌کنیم تا دوباره داده واقعی بگیریم.';
  }
  return task;
}
function optionalTaskFor(key){
  if(key.startsWith('ig-') || key.startsWith('content-')) return {title:'۵ دقیقه بعد از انتشار',text:'به اولین پاسخ یا دایرکت سریع جواب بده و سؤال اصلی مخاطب را یادداشت کن؛ همان سؤال می‌تواند ایده محتوای بعدی باشد.'};
  if(key==='sales' || key==='offer') return {title:'ثبت یک عدد',text:'فقط تعداد گفت‌وگوهایی که امروز از این متن استفاده کردی یادداشت کن.'};
  if(key.startsWith('acquisition')) return {title:'ثبت منبع',text:'کنار هر پاسخ بنویس از کدام مسیر آمده تا بفهمیم کدام کانال ارزش ادامه دارد.'};
  if(key==='retention') return {title:'یک یادداشت کوتاه',text:'برای هر مشتری بنویس آخرین خریدش چه بوده و نیاز بعدی‌ای که گفت چه بوده.'};
  return {title:'ثبت نتیجه',text:'یک عدد ساده از نتیجه امروز نگه دار.'};
}
function feedbackTypeFor(key){
  if(key.startsWith('ig-')) return 'instagram';
  if(key.startsWith('content-')) return 'content';
  if(key.startsWith('acquisition')) return 'acquisition';
  return key;
}

function renderResult(restored=false){
  if(!state.diagnosis) return;
  if(!state.task) state.task=buildTask(state.diagnosis.key,state.taskVariant||0);
  $('day-label').textContent=fa(state.day);
  $('diagnosis-title').textContent=state.diagnosis.title;
  $('diagnosis-confidence').textContent=state.diagnosis.confidence;
  $('today-time').textContent=state.task.time;
  $('today-title').textContent=state.task.title;
  $('today-copy').textContent=state.task.copy;
  $('today-why').textContent=state.task.why;
  renderReady($('today-ready'),state.task.ready);
  $('optional-task-body').innerHTML=`<b>${escapeHtml(state.task.optional.title)}</b><p>${escapeHtml(state.task.optional.text)}</p>`;
  $('detail-goal').textContent=goalDetail();
  $('detail-audience').textContent=state.profile.audience;
  $('detail-offer').textContent=state.profile.offer;
  $('detail-reason').textContent=state.diagnosis.reason;
  $('analysis-note').textContent=state.diagnosis.note;
  hideActionPanels();
  renderJourney();
  updateHoshexLink();
  if(restored && state.pendingNext){renderPendingNext();}
}
function renderReady(host,items){
  host.innerHTML='';
  items.forEach(item=>{
    const card=document.createElement('div');
    card.className='ready-item';
    card.innerHTML=`<div class="ready-item-top"><span>${escapeHtml(item.label)}</span><button class="copy-btn" type="button">کپی</button></div><h4>${escapeHtml(item.title)}</h4><div class="ready-text">${escapeHtml(item.text)}</div>`;
    card.querySelector('.copy-btn').addEventListener('click',e=>copyText(item.text,e.currentTarget));
    host.appendChild(card);
  });
}
function copyText(text,button){
  const done=()=>{const old=button.textContent;button.textContent='کپی شد';setTimeout(()=>button.textContent=old,1100);};
  if(navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done).catch(()=>fallbackCopy(text,done));
  else fallbackCopy(text,done);
}
function fallbackCopy(text,done){
  const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy');done();}catch{}t.remove();
}
function goalDetail(){
  if(state.goal!=='instagram') return state.profile.target;
  const labels={reach:'میانگین بازدید',followers:'فالوور',dm:'دایرکت مرتبط',sales:'فروش از پیج'};
  return `${labels[state.instagram.targetKind]}: ${fa(state.instagram.targetValue)} در ۳۰ روز`;
}
function hideActionPanels(){
  $('feedback-card').classList.add('hidden');
  $('blocked-card').classList.add('hidden');
  $('next-step-card').classList.add('hidden');
}

$('alternative-btn').addEventListener('click',()=>{
  state.taskVariant=(Number(state.taskVariant||0)+1)%3;
  state.task=buildTask(state.diagnosis.key,state.taskVariant);
  state.currentStatus=null;
  state.pendingNext=null;
  saveState();
  renderResult();
  toast('نسخه جایگزین آماده شد');
});

$('status-done').addEventListener('click',()=>openFeedback('done'));
$('status-partial').addEventListener('click',()=>openFeedback('partial'));
$('status-blocked').addEventListener('click',()=>{
  state.currentStatus='blocked';
  $('feedback-card').classList.add('hidden');
  $('blocked-card').classList.remove('hidden');
  $('blocked-card').scrollIntoView({behavior:'smooth',block:'start'});
});
function openFeedback(status){
  state.currentStatus=status;
  renderFeedbackFields(state.task.feedbackType);
  $('blocked-card').classList.add('hidden');
  $('feedback-card').classList.remove('hidden');
  $('feedback-card').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderFeedbackFields(type){
  const configs={
    instagram:[['views','بازدید این محتوا'],['follows','فالو جدید'],['dms','دایرکت مرتبط'],['sales','فروش']],
    content:[['views','بازدید یا مشاهده'],['replies','تعامل یا پاسخ'],['dms','دایرکت یا سرنخ'],['sales','فروش']],
    sales:[['sent','گفت‌وگوی استفاده‌شده'],['replies','پاسخ جدی'],['sales','فروش']],
    acquisition:[['sent','پیام / تماس / معرفی'],['replies','پاسخ'],['leads','علاقه‌مند جدید'],['sales','فروش']],
    retention:[['sent','مشتری پیگیری‌شده'],['replies','پاسخ'],['repeat','فرصت خرید دوباره'],['sales','فروش']],
    offer:[['sent','دفعات استفاده از پیشنهاد'],['replies','پاسخ مثبت'],['sales','فروش']]
  };
  const fields=configs[type] || configs.content;
  $('feedback-fields').innerHTML=fields.map(([key,label])=>`<label><span>${label}</span><input type="number" min="0" inputmode="numeric" name="${key}" value="0" required /></label>`).join('');
  $('feedback-note').value='';
}

$('feedback-form').addEventListener('submit',e=>{
  e.preventDefault();
  const data=Object.fromEntries([...new FormData(e.currentTarget).entries()].map(([k,v])=>[k,Number(v||0)]));
  const note=clean($('feedback-note').value);
  const entry=makeJourneyEntry(state.currentStatus||'done',data,null,note);
  state.journey.push(entry);
  const next=buildNextFromFeedback(data);
  state.pendingNext=next;
  saveState();
  renderJourney();
  renderPendingNext();
  $('next-step-card').scrollIntoView({behavior:'smooth',block:'start'});
});

[...document.querySelectorAll('.obstacle-grid button')].forEach(btn=>btn.addEventListener('click',()=>handleObstacle(btn.dataset.obstacle)));
function handleObstacle(obstacle){
  const labels={time:'وقت کم بود',skill:'اجرای کار سخت بود',camera:'جلوی دوربین راحت نبودم',unclear:'کار مبهم بود',fit:'کار مناسب کسب‌وکارم نبود'};
  state.journey.push(makeJourneyEntry('blocked',{},obstacle,labels[obstacle]));
  let task;
  if(obstacle==='camera'){
    const previous=state.instagram.camera;
    state.instagram.camera='no';
    task=buildTask(state.diagnosis.key,(state.taskVariant+1)%3,true);
    state.instagram.camera=previous;
  }else if(obstacle==='fit'){
    task=buildTask(state.diagnosis.key,(state.taskVariant+1)%3,false);
  }else task=buildTask(state.diagnosis.key,state.taskVariant,true);
  if(obstacle==='skill') task.ready.push({label:'روش اجرا',title:'فقط همین سه قدم',text:'۱) متن آماده را کپی کن. ۲) فقط جای اسم محصول یا جزئیات خودت را عوض کن. ۳) همان نسخه را بدون کامل‌گرایی ارسال یا منتشر کن.'});
  if(obstacle==='unclear') task.copy='نسخه قبلی را کنار می‌گذاریم. فقط متن آماده اول را بردار و برای یک مخاطب واقعی اجرا کن؛ کار اضافه‌ای لازم نیست.';
  state.pendingNext={task,diagnosis:state.diagnosis,sameDay:true,title:'کار را کوچک‌تر کردیم؛ همین امروز دوباره امتحانش کن.',copy:`مانع ثبت شد: ${labels[obstacle]}. هدف الان فقط اینه که از حالت توقف خارج بشیم.`};
  saveState();
  renderJourney();
  renderPendingNext();
  $('next-step-card').scrollIntoView({behavior:'smooth',block:'start'});
}
function makeJourneyEntry(status,feedback,obstacle,note){
  return {
    day:state.day,
    date:new Date().toISOString(),
    diagnosisKey:state.diagnosis.key,
    diagnosisTitle:state.diagnosis.title,
    taskTitle:state.task.title,
    status,
    feedback,
    obstacle:obstacle||null,
    note:note||''
  };
}
function buildNextFromFeedback(data){
  const hasSales=Number(data.sales||0)>0;
  const interest=Number(data.dms||0)+Number(data.replies||0)+Number(data.leads||0)+Number(data.repeat||0);
  let nextKey=state.diagnosis.key;
  let title='',copy='';

  if(state.task.feedbackType==='instagram'){
    const baseline=Math.max(state.instagram.views||1,1);
    if(hasSales){
      nextKey=state.diagnosis.key;
      title='این حرکت سیگنال فروش داده؛ فردا نسخه دوم همین زاویه را تکرار می‌کنیم.';
      copy=`${fa(data.sales)} فروش ثبت شد. فعلاً ایده کاملاً تازه نمی‌سازیم؛ همان مسئله را با نسخه بعدی تست می‌کنیم.`;
    }else if(Number(data.dms||0)>0){
      nextKey='ig-sales';
      title='محتوا مکالمه ساخته؛ فردا تمرکز را از محتوا به دایرکت می‌بریم.';
      copy=`${fa(data.dms)} دایرکت مرتبط ثبت شد ولی فروش نداشتیم. قدم بعدی اصلاح پاسخ و پیگیری فروش است.`;
    }else if(Number(data.views||0)>=baseline*.85){
      nextKey='ig-conversion';
      title='دیده شدی ولی اقدام ساخته نشد؛ فردا دعوت به اقدام را عوض می‌کنیم.';
      copy='موضوع را فعلاً حذف نمی‌کنیم. فقط پایان محتوا و استوری بعد از انتشار را تغییر می‌دهیم.';
    }else{
      nextKey='ig-reach';
      title='بازدید هنوز سیگنال کافی نداده؛ فردا شروع محتوا را عوض می‌کنیم.';
      copy='فعلاً فروش و پیشنهاد را دست نمی‌زنیم؛ اول باید نسخه دوم شروع محتوا را تست کنیم.';
    }
  }else if(hasSales){
    title='این حرکت به فروش رسیده؛ فردا نسخه دوم همین مسیر را اجرا کن.';
    copy=`${fa(data.sales)} فروش ثبت شده. فعلاً مسیر برنده را عوض نمی‌کنیم؛ فقط نسخه بعدی را تست می‌کنیم.`;
  }else if(interest>0){
    nextKey='sales';
    title='واکنش گرفتی؛ فردا روی تبدیل همین آدم‌ها کار می‌کنیم.';
    copy=`${fa(interest)} واکنش یا فرصت ثبت شد. به‌جای جذب بیشتر، همین مکالمه‌ها را جلو می‌بریم.`;
  }else if(state.task.feedbackType==='content'){
    nextKey=state.diagnosis.key;
    title='واکنش کافی نگرفتیم؛ فردا همان موضوع را با شروع متفاوت تست می‌کنیم.';
    copy='یک اجرا برای حذف موضوع کافی نیست. فقط شروع و زاویه را عوض می‌کنیم تا بفهمیم مسئله از بسته‌بندی محتواست یا از خود موضوع.';
  }else{
    nextKey=state.diagnosis.key;
    title='هنوز سیگنال کافی نداریم؛ فردا نسخه کوتاه‌تر و مستقیم‌تر را تست می‌کنیم.';
    copy='فعلاً کانال را عوض نمی‌کنیم. یک نسخه دیگر از همین حرکت اجرا می‌کنیم تا داده بیشتری داشته باشیم.';
  }

  const diagnosis=makeDiagnosis(nextKey,copy,state.diagnosis.confidence,'این تشخیص بعدی از نتیجه اجرای روز قبل ساخته شده است.');
  const task=buildTask(nextKey,(Number(state.taskVariant||0)+1)%3,false);
  return {task,diagnosis,sameDay:false,title,copy};
}
function renderPendingNext(){
  if(!state.pendingNext) return;
  $('next-title').textContent=state.pendingNext.title;
  $('next-copy').textContent=state.pendingNext.copy;
  renderReady($('next-ready'),state.pendingNext.task.ready.slice(0,2));
  $('start-next-day').innerHTML=state.pendingNext.sameDay?'امتحان نسخه ساده‌تر <span>←</span>':'شروع روز بعد <span>←</span>';
  $('next-step-card').classList.remove('hidden');
}
$('start-next-day').addEventListener('click',()=>{
  if(!state.pendingNext) return;
  if(!state.pendingNext.sameDay) state.day+=1;
  state.diagnosis=state.pendingNext.diagnosis;
  state.task=state.pendingNext.task;
  state.taskVariant=state.task.variant||0;
  state.currentStatus=null;
  state.pendingNext=null;
  saveState();
  renderResult();
  window.scrollTo({top:0,behavior:'smooth'});
});

function renderJourney(){
  const host=$('journey-list');
  $('journey-count').textContent=`${fa(state.journey.length)} ثبت`;
  if(!state.journey.length){host.innerHTML='<div class="empty-state">اولین نتیجه که ثبت بشه، اینجا مسیر واقعی کسب‌وکارت شکل می‌گیره.</div>';return;}
  host.innerHTML=state.journey.slice().reverse().map(entry=>{
    const statusLabel={done:'انجام شد',partial:'نیمه‌کاره',blocked:'گیر اجرا'}[entry.status]||entry.status;
    const result=summarizeFeedback(entry.feedback,entry.note);
    return `<div class="journey-row"><div class="journey-day">روز ${fa(entry.day)}</div><div class="journey-main"><div class="journey-top"><b>${escapeHtml(entry.taskTitle)}</b><span class="status-${entry.status}">${statusLabel}</span></div><p>${escapeHtml(result)}</p></div></div>`;
  }).join('');
}
function summarizeFeedback(feedback,note){
  const parts=[];
  Object.entries(feedback||{}).forEach(([k,v])=>{if(Number(v)>0) parts.push(`${feedbackLabel(k)}: ${fa(v)}`);});
  if(note) parts.push(note);
  return parts.join(' • ') || 'نتیجه عددی ثبت نشده؛ فقط وضعیت اجرا ثبت شد.';
}
function feedbackLabel(key){
  return {views:'بازدید',follows:'فالو',dms:'دایرکت',sales:'فروش',sent:'اجرا',replies:'پاسخ',leads:'علاقه‌مند',repeat:'فرصت خرید دوباره'}[key]||key;
}

function updateHoshexLink(){
  const last=state.journey[state.journey.length-1];
  const params=new URLSearchParams({
    source:'growth-companion-v4',
    goal:state.goal||'',
    offer:state.profile.offer||'',
    audience:state.profile.audience||'',
    target:goalDetail(),
    diagnosis:state.diagnosis?.key||'',
    day:String(state.day||1),
    last:last?summarizeFeedback(last.feedback,last.note):''
  });
  $('hoshex-cta').href=`https://hoshex.ir/grow/?${params.toString()}`;
}

$('wrong-diagnosis').addEventListener('click',()=>openDiagnosisDialog());
function openDiagnosisDialog(){
  diagnosisOverride=null;
  const options=state.goal==='instagram'[
    ['ig-consistency','انتشارم کمه'],['ig-reach','مشکل بازدیده'],['ig-conversion','بازدید دارم ولی دایرکت کمه'],['ig-sales','دایرکت دارم ولی فروش کمه']
  ]:[
    ['acquisition','جذب مشتری'],['offer','پیشنهاد فروش'],['content-conversion','محتوا'],['sales','فروش'],['retention','مشتری‌های قبلی']
  ];
  $('diagnosis-options').innerHTML=options.map(([key,label])=>`<button type="button" data-key="${key}">${label}</button>`).join('');
  $('diagnosis-options').querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
    $('diagnosis-options').querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');
    diagnosisOverride=btn.dataset.key;
  }));
  $('diagnosis-note').value='';
  const dialog=$('diagnosis-dialog');
  if(dialog.showModal) dialog.showModal(); else dialog.setAttribute('open','');
}
$('apply-diagnosis').addEventListener('click',()=>{
  if(!diagnosisOverride){toast('یک گزینه رو انتخاب کن');return;}
  const note=clean($('diagnosis-note').value);
  state.diagnosis=makeDiagnosis(diagnosisOverride,note||'این اولویت با نظر خودت اصلاح شد.','طبق نظر تو','هوشکس کار امروز را بر اساس اصلاح تو دوباره ساخته است. نتیجه اجرا کمک می‌کند صحت این انتخاب را بررسی کنیم.');
  state.taskVariant=0;
  state.task=buildTask(diagnosisOverride,0);
  state.pendingNext=null;
  saveState();
  renderResult();
  const dialog=$('diagnosis-dialog');
  if(dialog.close) dialog.close(); else dialog.removeAttribute('open');
  toast('کار امروز با تشخیص جدید ساخته شد');
});

syncResumeButton();