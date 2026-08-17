const $ = id => document.getElementById(id);
const STORAGE_KEY = 'hoshexGrowthPathV3';
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

const state = {
  goal:null,
  profile:{name:'',offer:'',type:'',audience:''},
  instagram:{handle:'',followers:0,views:0,posts:0,dms:0,sales:0,time:30,target:'',camera:''},
  quiz:{questions:[],answers:[],index:0},
  diagnosis:null,
  feedback:null
};

const screens = [...document.querySelectorAll('.screen')];
function showScreen(id, label){
  screens.forEach(s => s.classList.toggle('active', s.id === id));
  if(label) $('session-label').textContent = label;
  window.scrollTo({top:0,behavior:'smooth'});
}
function toast(message){
  $('toast').textContent = message;
  $('toast').classList.add('show');
  setTimeout(() => $('toast').classList.remove('show'), 1700);
}
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify({...state, savedAt:new Date().toISOString()}));
}
function loadSaved(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');}catch{return null;}
}
function resetState(){
  state.goal=null;
  state.profile={name:'',offer:'',type:'',audience:''};
  state.instagram={handle:'',followers:0,views:0,posts:0,dms:0,sales:0,time:30,target:'',camera:''};
  state.quiz={questions:[],answers:[],index:0};
  state.diagnosis=null;
  state.feedback=null;
  localStorage.removeItem(STORAGE_KEY);
}

function addResumeButton(){
  const saved=loadSaved();
  if(!saved?.diagnosis) return;
  const host=document.querySelector('.hero-meta');
  if(!host || document.getElementById('resume-btn')) return;
  const btn=document.createElement('button');
  btn.id='resume-btn';
  btn.className='ghost-btn';
  btn.type='button';
  btn.textContent='ادامه مسیر قبلی ←';
  btn.addEventListener('click',()=>{
    Object.assign(state, saved);
    renderResult(saved.diagnosis, true);
    showScreen('screen-result','ادامه مسیر');
  });
  host.insertAdjacentElement('afterend',btn);
}

$('brand-home').addEventListener('click',()=>showScreen('screen-home','شروع'));
$('start-btn').addEventListener('click',()=>showScreen('screen-goal','انتخاب هدف'));
$('restart-btn').addEventListener('click',()=>{resetState();showScreen('screen-home','شروع');});

[...document.querySelectorAll('.goal-card')].forEach(btn=>{
  btn.addEventListener('click',()=>{
    state.goal=btn.dataset.goal;
    $('session-label').textContent=goalLabels[state.goal];
    showScreen('screen-profile','شناخت کسب‌وکار');
  });
});

$('profile-form').addEventListener('submit',e=>{
  e.preventDefault();
  state.profile.name=clean($('business-name').value);
  state.profile.offer=clean($('business-offer').value);
  state.profile.type=$('business-type').value;
  state.profile.audience=clean(document.getElementById('business-audience')?.value) || audienceFallback(state.profile.type);
  if(!state.profile.offer || !state.profile.type) return;
  if(state.goal==='instagram') showScreen('screen-instagram','شناخت پیج');
  else startQuiz(state.goal);
});

function audienceFallback(type){
  const map={
    'فروشگاه و خرده‌فروشی':'کسی که دنبال انتخاب بهتر و مطمئن‌تر است',
    'زیبایی و خدمات شخصی':'کسی که نتیجه و کیفیت خدمات برایش مهم است',
    'آموزش، مربی‌گری و مشاوره':'کسی که می‌خواهد سریع‌تر یاد بگیرد و به نتیجه برسد',
    'رستوران، کافه و خوراکی':'مشتری محلی و علاقه‌مند به تجربه بهتر',
    'خدمات حرفه‌ای':'کسی که برای حل یک مسئله مشخص دنبال متخصص است',
    'هنرمند و تولیدکننده محتوا':'مخاطبی که با اثر، آموزش یا تجربه تو ارتباط می‌گیرد',
    'ارائه‌دهنده خدمات مستقل':'مشتری‌ای که برای یک پروژه یا مسئله مشخص کمک می‌خواهد',
    'فروش آنلاین':'خریدار آنلاینی که قبل از خرید نیاز به اعتماد و مقایسه دارد',
    'کسب‌وکار محلی':'مشتری نزدیک و محلی',
    'سایر':'مشتری اصلی تو'
  };
  return map[type] || 'مشتری اصلی تو';
}

function setupSegmented(id, stateKey){
  const host=$(id);
  host.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
    host.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');
    state.instagram[stateKey]=btn.dataset.value;
  }));
}
setupSegmented('ig-goal-options','target');
setupSegmented('ig-camera-options','camera');

$('instagram-form').addEventListener('submit',e=>{
  e.preventDefault();
  if(!state.instagram.target || !state.instagram.camera){toast('هدف پیج و وضعیت جلوی دوربین را هم انتخاب کن');return;}
  state.instagram.handle=clean($('ig-handle').value);
  state.instagram.followers=Number($('ig-followers').value || 0);
  state.instagram.views=Number($('ig-views').value || 0);
  state.instagram.posts=Number($('ig-posts').value || 0);
  state.instagram.dms=Number($('ig-dms').value || 0);
  state.instagram.sales=Number($('ig-sales').value || 0);
  state.instagram.time=Number($('ig-time').value || 30);
  processAndRender(()=>diagnoseInstagram());
});

const questionBanks={
  sales:[
    {tag:'ورودی فروش',title:'در یک هفته معمولاً چند نفر واقعاً درباره خرید سؤال می‌پرسند؟',hint:'می‌خواهیم بفهمیم مشکل کمبود علاقه‌مند است یا تبدیل آن‌ها به خرید.',options:[['تقریباً هیچ‌کس',1],['۱ تا ۳ نفر',2],['۴ تا ۱۰ نفر',3],['بیشتر از ۱۰ نفر',4]]},
    {tag:'پیشنهاد فروش',title:'وقتی مشتری می‌پرسد «دقیقاً چی می‌گیرم؟» جواب کوتاه و مشخص داری؟',hint:'پیشنهاد مبهم، فروش را قبل از بحث قیمت ضعیف می‌کند.',options:[['نه، معمولاً توضیح طولانی می‌دهم',1],['تا حدی',2],['بله، نسبتاً روشن است',3],['بله، خیلی شفاف و کوتاه',4]]},
    {tag:'پیگیری',title:'اگر مشتری بعد از قیمت دادن جواب ندهد چه می‌کنی؟',hint:'خیلی از فروش‌ها در پیگیری از دست می‌روند.',options:[['هیچ کاری',1],['گاهی یادم باشد پیام می‌دهم',2],['یک بار پیگیری می‌کنم',3],['روند و زمان پیگیری مشخص دارم',4]]},
    {tag:'اعتراض مشتری',title:'برای «گرونه»، «فکر می‌کنم» یا «بعداً خبر می‌دم» پاسخ آماده داری؟',hint:'جواب بداهه معمولاً باعث ناهماهنگی فروش می‌شود.',options:[['نه',1],['فقط برای بعضی‌ها',2],['بیشترشان را می‌دانم',3],['بله، متن و مسیر مشخص دارم',4]]},
    {tag:'اندازه‌گیری',title:'می‌دانی از هر ۱۰ علاقه‌مند تقریباً چند نفر خرید می‌کنند؟',hint:'اگر عدد را ندانیم نمی‌فهمیم کدام تغییر واقعاً فروش را بهتر کرده.',options:[['اصلاً',1],['فقط حدس می‌زنم',2],['تقریباً می‌دانم',3],['دقیق ثبت می‌کنم',4]]}
  ],
  acquisition:[
    {tag:'ورودی مشتری',title:'مشتری‌های جدید بیشتر از کجا می‌آیند؟',hint:'اول باید یک مسیر قابل تکرار پیدا کنیم.',options:[['تقریباً ورودی ندارم',1],['بیشتر شانسی یا از آشناها',2],['یک مسیر اصلی دارم',3],['چند مسیر مشخص دارم',4]]},
    {tag:'پیشنهاد شروع',title:'برای کسی که هنوز آماده خرید نیست، دلیل ساده‌ای برای شروع ارتباط داری؟',hint:'مثلاً پاسخ به یک سؤال، نمونه، بررسی کوتاه یا پیشنهاد کم‌ریسک.',options:[['نه',1],['گاهی',2],['یک پیشنهاد دارم',3],['چند ورودی مشخص دارم و می‌سنجم',4]]},
    {tag:'انتشار',title:'در هفته چند بار خودت را جلوی مشتری بالقوه قرار می‌دهی؟',hint:'پست، استوری، پیام، معرفی یا همکاری؛ مهم تکرار تماس است.',options:[['تقریباً صفر',1],['۱ بار',2],['۲ تا ۴ بار',3],['تقریباً هر روز',4]]},
    {tag:'معرفی',title:'از مشتری راضی یا آشناها فعالانه معرفی می‌گیری؟',hint:'معرفی باید درخواست ساده و قابل انجام داشته باشد.',options:[['هیچ‌وقت',1],['خیلی کم',2],['گاهی',3],['منظم و با متن مشخص',4]]},
    {tag:'اندازه‌گیری',title:'منبع هر مشتری جدید را ثبت می‌کنی؟',hint:'بدون این عدد نمی‌فهمیم کدام مسیر جذب ارزش ادامه دادن دارد.',options:[['نه',1],['گاهی',2],['بیشتر مواقع',3],['همیشه',4]]}
  ],
  content:[
    {tag:'نظم',title:'در هفته چند محتوای واقعی منتشر می‌کنی؟',hint:'اول می‌فهمیم مشکل کمبود خروجی است یا کیفیت و جهت محتوا.',options:[['صفر یا خیلی نامنظم',1],['۱ محتوا',2],['۲ تا ۴ محتوا',3],['۵ محتوا یا بیشتر',4]]},
    {tag:'موضوع',title:'می‌دانی سه موضوع اصلی محتوایت چیست؟',hint:'صفحه‌ای که هر روز درباره چیز متفاوت حرف می‌زند سخت‌تر در ذهن می‌ماند.',options:[['نه',1],['تقریباً',2],['بله',3],['بله و براساس نتیجه اصلاحشان می‌کنم',4]]},
    {tag:'شروع محتوا',title:'قبل از ساخت محتوا، «شروع یا هوک» را جداگانه می‌نویسی؟',hint:'چند ثانیه اول تعیین می‌کند محتوا اصلاً دیده شود یا نه.',options:[['نه',1],['خیلی کم',2],['بیشتر مواقع',3],['همیشه چند نسخه می‌نویسم',4]]},
    {tag:'دعوت به اقدام',title:'آخر محتوا مشخص است مخاطب بعدش چه کاری انجام دهد؟',hint:'دیدن محتوا به‌تنهایی هدف کسب‌وکار نیست.',options:[['نه',1],['گاهی',2],['بیشتر مواقع',3],['بله و نتیجه را می‌سنجم',4]]},
    {tag:'داده',title:'می‌دانی کدام سه محتوای اخیرت بهتر از بقیه جواب داده‌اند و چرا؟',hint:'قرار نیست هر بار از صفر ایده بسازیم؛ باید از برنده‌ها یاد بگیریم.',options:[['نه',1],['فقط یادم هست کدام بهتر بود',2],['تا حدی دلیلش را می‌دانم',3],['بله و الگوها را تکرار می‌کنم',4]]}
  ],
  retention:[
    {tag:'بعد از خرید',title:'۲۴ تا ۷۲ ساعت بعد از خرید با مشتری تماس می‌گیری؟',hint:'پیگیری کوتاه هم تجربه را بهتر می‌کند هم مشکل را زود آشکار می‌کند.',options:[['نه',1],['خیلی کم',2],['گاهی',3],['منظم',4]]},
    {tag:'خرید دوباره',title:'برای مشتری فعلی یک «قدم بعدی» مشخص داری؟',hint:'محصول مکمل، تمدید، ارتقا یا خدمت بعدی.',options:[['نه',1],['موردی',2],['برای بعضی مشتری‌ها',3],['بله، کاملاً مشخص',4]]},
    {tag:'اطلاعات مشتری',title:'اطلاعات مشتری‌های قبلی را جایی نگه می‌داری؟',hint:'حتی یک جدول ساده از هیچ بهتر است.',options:[['نه',1],['پراکنده',2],['نسبتاً منظم',3],['بله و قابل پیگیری',4]]},
    {tag:'بازگشت',title:'در ماه گذشته چند بار برای مشتری‌های قدیمی پیشنهاد یا پیام مفید فرستادی؟',hint:'اگر ارتباط کاملاً قطع شود فروش دوباره هم شانسی می‌شود.',options:[['هیچ',1],['یک بار',2],['۲ تا ۳ بار',3],['منظم و هدفمند',4]]},
    {tag:'اندازه‌گیری',title:'می‌دانی چه بخشی از فروش از مشتری قبلی می‌آید؟',hint:'این عدد نشان می‌دهد نگهداشت چقدر در کسب‌وکارت نقش دارد.',options:[['نه',1],['حدسی',2],['تقریبی',3],['دقیق',4]]}
  ]
};

questionBanks.unknown=[
  {category:'acquisition',tag:'جذب مشتری',title:'آیا هر هفته چند مشتری جدید به شکل قابل پیش‌بینی وارد می‌شوند؟',hint:'ورودی مشتری باید قابل تکرار باشد، نه فقط شانسی.',options:[['تقریباً نه',1],['کم و نامنظم',2],['تا حدی',3],['بله',4]]},
  {category:'offer',tag:'پیشنهاد فروش',title:'مشتری سریع می‌فهمد دقیقاً چه می‌فروشی و چرا باید از تو بخرد؟',hint:'وضوح پیشنهاد قبل از تبلیغ بیشتر مهم است.',options:[['نه',1],['تا حد کمی',2],['نسبتاً',3],['کاملاً',4]]},
  {category:'content',tag:'محتوا',title:'محتوا یا ارتباطت با بازار منظم و هدفمند است؟',hint:'منظور فقط اینستاگرام نیست؛ هر جایی که مشتری تو را می‌بیند.',options:[['نه',1],['خیلی کم',2],['نسبتاً',3],['بله',4]]},
  {category:'sales',tag:'فروش',title:'وقتی یک نفر علاقه نشان می‌دهد، مسیر مشخصی تا خرید داری؟',hint:'از پاسخ اولیه تا پیگیری و پرداخت.',options:[['نه',1],['مبهم',2],['نسبتاً',3],['بله',4]]},
  {category:'retention',tag:'مشتری قبلی',title:'بعد از خرید برای برگشت مشتری برنامه مشخص داری؟',hint:'رشد فقط مشتری جدید نیست.',options:[['نه',1],['خیلی کم',2],['تا حدی',3],['بله',4]]},
  {category:'acquisition',tag:'جذب مشتری',title:'می‌دانی کدام مسیر بیشترین مشتری جدید را می‌آورد؟',hint:'اگر منبع ورودی را ندانیم، بودجه و زمان هدر می‌رود.',options:[['نه',1],['حدسی',2],['تقریبی',3],['دقیق',4]]},
  {category:'offer',tag:'پیشنهاد فروش',title:'محصول یا خدمتت بسته و قیمت‌گذاری قابل فهم دارد؟',hint:'مشتری نباید بین گزینه‌های مبهم گم شود.',options:[['نه',1],['کمی مبهم',2],['نسبتاً روشن',3],['کاملاً روشن',4]]},
  {category:'sales',tag:'فروش',title:'تعداد علاقه‌مند و خریدار را ثبت می‌کنی؟',hint:'آخرین سؤال برای پیدا کردن نشتی اصلی.',options:[['نه',1],['گاهی',2],['بیشتر مواقع',3],['همیشه',4]]}
];

function startQuiz(goal){
  state.quiz.questions=questionBanks[goal] || questionBanks.unknown;
  state.quiz.answers=Array(state.quiz.questions.length).fill(null);
  state.quiz.index=0;
  renderQuestion();
  showScreen('screen-quiz',goalLabels[goal]);
}
function renderQuestion(){
  const q=state.quiz.questions[state.quiz.index];
  const total=state.quiz.questions.length;
  $('question-step').textContent=`${fa(state.quiz.index+1)} / ${fa(total)}`;
  $('question-title').textContent=q.title;
  $('question-hint').textContent=q.hint;
  $('question-tag').textContent=q.tag;
  $('progress-bar').style.width=`${((state.quiz.index+1)/total)*100}%`;
  $('answers').innerHTML='';
  q.options.forEach(([text,score],i)=>{
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='answer-btn';
    btn.innerHTML=`<span class="answer-key">${fa(i+1)}</span><span>${escapeHtml(text)}</span>`;
    btn.addEventListener('click',()=>selectAnswer(score));
    $('answers').appendChild(btn);
  });
}
function selectAnswer(score){
  state.quiz.answers[state.quiz.index]=score;
  if(state.quiz.index < state.quiz.questions.length-1){
    state.quiz.index++;
    renderQuestion();
  }else{
    processAndRender(()=>diagnoseQuiz());
  }
}
$('prev-question').addEventListener('click',()=>{
  if(state.quiz.index>0){state.quiz.index--;renderQuestion();}
  else showScreen('screen-profile','شناخت کسب‌وکار');
});
$('quiz-back').addEventListener('click',()=>showScreen('screen-goal','انتخاب هدف'));

document.addEventListener('keydown',e=>{
  if(!$('screen-quiz').classList.contains('active')) return;
  const n=Number(e.key);
  const q=state.quiz.questions[state.quiz.index];
  if(n>=1 && n<=q.options.length) selectAnswer(q.options[n-1][1]);
});

function processAndRender(builder){
  $('processing-title').textContent = state.goal==='instagram' ? 'داریم داده‌های پیج را به کار امروز تبدیل می‌کنیم...' : 'داریم جواب‌ها را به کار امروز تبدیل می‌کنیم...';
  showScreen('screen-processing','در حال تحلیل');
  setTimeout(()=>{
    const diagnosis=builder();
    state.diagnosis=diagnosis;
    state.feedback=null;
    saveState();
    renderResult(diagnosis);
    showScreen('screen-result','کار امروز');
  },900);
}

function diagnoseQuiz(){
  if(state.goal==='unknown'){
    const groups={acquisition:[],offer:[],content:[],sales:[],retention:[]};
    state.quiz.questions.forEach((q,i)=>groups[q.category].push(state.quiz.answers[i] || 1));
    const averages={};
    Object.entries(groups).forEach(([key,values])=>averages[key]=values.length?values.reduce((a,b)=>a+b,0)/values.length:4);
    const weakest=Object.entries(averages).sort((a,b)=>a[1]-b[1])[0][0];
    return buildGenericDiagnosis(weakest,averages[weakest]);
  }
  const avg=state.quiz.answers.reduce((a,b)=>a+(b||1),0)/state.quiz.answers.length;
  return buildGenericDiagnosis(state.goal,avg);
}

function genericReason(key,score){
  const level=score<1.8?'خیلی کم':score<2.7?'نامنظم':score<3.4?'نسبتاً قابل استفاده':'خوب';
  const reasons={
    sales:`نشانه‌ها می‌گویند مسیر تبدیل علاقه‌مند به خریدار هنوز ${level} است. امروز روی متن و پیگیری فروش کار می‌کنیم.`,
    acquisition:`ورودی مشتری هنوز ${level} و کم‌قابل‌پیش‌بینی است. امروز یک حرکت مستقیم برای ایجاد مکالمه می‌سازیم.`,
    content:`سیستم محتوا هنوز ${level} است. امروز به‌جای برنامه‌ریزی طولانی، یک محتوای کامل تا مرحله انتشار می‌سازیم.`,
    retention:`پیگیری و فروش دوباره به مشتری قبلی هنوز ${level} است. امروز ارتباط را با یک پیام مشخص دوباره باز می‌کنیم.`,
    offer:`پیشنهاد فروش هنوز برای مشتری به‌اندازه کافی روشن نیست. امروز نسخه کوتاه و قابل استفاده آن را می‌سازیم.`
  };
  return reasons[key];
}

function buildGenericDiagnosis(key,score=2){
  const offer=state.profile.offer;
  const audience=state.profile.audience;
  const data={key,title:'',reason:genericReason(key,score),target:goalLabels[state.goal] || 'رشد کسب‌وکار',time:'حدود ۲۰ تا ۳۰ دقیقه',ready:[],weekPlan:[],feedbackType:key};
  if(key==='content'){
    data.title=`امروز یک محتوای کامل برای «${offer}» منتشر کن`;
    data.ready=contentPack(offer,audience);
    data.weekPlan=contentWeek(offer);
  }else if(key==='sales'){
    data.title=`امروز ۳ گفت‌وگوی فروش «${offer}» را با متن آماده جلو ببر`;
    data.ready=salesPack(offer,audience);
    data.weekPlan=salesWeek(offer);
  }else if(key==='acquisition'){
    data.title=`امروز برای «${offer}» حداقل ۵ مکالمه جدید شروع کن`;
    data.ready=acquisitionPack(offer,audience);
    data.weekPlan=acquisitionWeek(offer);
  }else if(key==='retention'){
    data.title=`امروز ارتباط با ۵ مشتری قبلی «${offer}» را دوباره باز کن`;
    data.ready=retentionPack(offer,audience);
    data.weekPlan=retentionWeek(offer);
  }else{
    data.title=`امروز پیشنهاد «${offer}» را کوتاه و قابل فهم کن`;
    data.ready=offerPack(offer,audience);
    data.weekPlan=offerWeek(offer);
  }
  return data;
}

function diagnoseInstagram(){
  const ig=state.instagram;
  const followers=Math.max(ig.followers,1);
  const expectedViews=Math.max(180,Math.round(followers*.35));
  const dmRate=ig.views>0?ig.dms/ig.views:0;
  let key;
  if(ig.posts<2) key='ig-consistency';
  else if(ig.views<expectedViews) key='ig-reach';
  else if(ig.dms<1 || dmRate<0.0015) key='ig-conversion';
  else if(ig.sales===0 && ig.dms>=2) key='ig-sales';
  else if(ig.target==='sales') key='ig-sales';
  else if(ig.target==='dm') key='ig-conversion';
  else if(ig.target==='reach' || ig.target==='followers') key='ig-reach';
  else key='ig-conversion';

  const targetMap={reach:'بازدید بیشتر',followers:'فالوور هدفمند',dm:'دایرکت بیشتر',sales:'فروش بیشتر'};
  const reasonMap={
    'ig-consistency':`الان فقط حدود ${fa(ig.posts)} محتوا در هفته منتشر می‌کنی. قبل از تغییر پیچیده، باید یک ریتم ساده و قابل ادامه بسازیم.`,
    'ig-reach':`میانگین بازدیدت حدود ${fa(ig.views)} است و برای اندازه فعلی پیج، جا برای بهتر شدن شروع محتوا و موضوع وجود دارد.`,
    'ig-conversion':`محتوا دیده می‌شود، اما تعداد دایرکت نسبت به بازدید پایین است. امروز روی دعوت به اقدام و تبدیل توجه به مکالمه کار می‌کنیم.`,
    'ig-sales':`مخاطب وارد گفت‌وگو می‌شود، اما فروش پایین است. امروز مشکل اصلی را از متن پاسخ و مسیر فروش داخل دایرکت می‌زنیم.`
  };
  const titleMap={
    'ig-consistency':'امروز اولین قطعه از برنامه ثابت پیجت را منتشر کن',
    'ig-reach':'امروز یک ریلز با شروع قوی‌تر منتشر کن',
    'ig-conversion':'امروز بازدید را به دایرکت تبدیل کن',
    'ig-sales':'امروز دایرکت‌های گرم را به تصمیم خرید نزدیک کن'
  };
  const readyMap={
    'ig-consistency':()=>instagramContentPack('consistency'),
    'ig-reach':()=>instagramContentPack('reach'),
    'ig-conversion':()=>instagramConversionPack(),
    'ig-sales':()=>instagramSalesPack()
  };
  return {
    key,
    title:titleMap[key],
    reason:reasonMap[key],
    target:targetMap[ig.target],
    time:`حدود ${fa(ig.time)} دقیقه`,
    ready:readyMap[key](),
    weekPlan:instagramWeek(key),
    feedbackType:'instagram',
    baseline:{views:ig.views,dms:ig.dms,sales:ig.sales}
  };
}

function contentPack(offer,audience){
  return [
    {label:'هوک آماده',title:'شروع محتوا',text:`اگر ${audience} هستی و درباره «${offer}» هنوز نتیجه‌ای که می‌خوای رو نگرفتی، قبل از اینکه راه جدیدی امتحان کنی این یک اشتباه رو چک کن.`},
    {label:'سناریوی کوتاه',title:'متن ۲۰ ثانیه‌ای',text:`خیلی‌ها برای «${offer}» مستقیم می‌رن سراغ گزینه بعدی، ولی اول باید بفهمی مشکل دقیقاً کجاست.\n۱) نتیجه‌ای که می‌خوای رو یک‌جمله‌ای بنویس.\n۲) ببین الان چه چیزی جلوت رو گرفته.\n۳) فقط یک تغییر رو برای یک هفته تست کن.\nاگر خواستی بگو «بررسی» تا بگم از کجا شروع کنی.`},
    {label:'کاور + کپشن',title:'برای انتشار',text:`کاور: «قبل از اینکه دوباره برای ${offer} هزینه کنی…»\n\nکپشن: اگر حس می‌کنی برای «${offer}» کارهای زیادی کردی ولی نتیجه هنوز مبهمه، این بار فقط یک مسئله رو پیدا کن و همون رو یک هفته اصلاح کن. اگر نمی‌دونی کدوم مسئله، کلمه «بررسی» رو بفرست.`}
  ];
}
function salesPack(offer,audience){
  return [
    {label:'پاسخ قیمت',title:'وقتی می‌گوید «گرونه»',text:`کاملاً قابل درکه. قبل از اینکه فقط با قیمت تصمیم بگیری، بگو از «${offer}» دقیقاً چه نتیجه‌ای می‌خوای. اگر گزینه ساده‌تر یا کم‌هزینه‌تری واقعاً مناسب تو باشه، همون رو پیشنهاد می‌دم.`},
    {label:'رفع ابهام',title:'وقتی می‌گوید «فکر می‌کنم»',text:`حتماً، عجله‌ای نیست. فقط برای اینکه تصمیم‌گیریت راحت‌تر بشه بگو بیشتر روی کدوم بخش مرددی: نتیجه، قیمت، زمان یا اینکه مطمئن نیستی «${offer}» مناسب تو هست یا نه؟`},
    {label:'پیگیری آماده',title:'وقتی جواب نمی‌دهد',text:`سلام، فقط یک پیگیری کوتاه درباره «${offer}». اگر هنوز سؤال یا ابهامی داری بگو تا همون بخش رو روشن کنم. اگر هم فعلاً زمانش نیست، کاملاً اوکیه.`}
  ];
}
function acquisitionPack(offer,audience){
  return [
    {label:'استوری امروز',title:'مکالمه را باز کن',text:`اگه درباره «${offer}» سؤال داری یا بین چند انتخاب مرددی، همینجا یک پیام بده و فقط بگو مهم‌ترین دغدغه‌ات چیه. می‌گم از کجا شروع کنی.`},
    {label:'پیام مستقیم',title:'برای ۵ مخاطب گرم',text:`سلام. چون فکر کردم موضوع «${offer}» ممکنه به کارت بخوره، خواستم اول بدون فروش مستقیم بپرسم: الان مهم‌ترین سؤال یا مشکلت توی این موضوع چیه؟ اگر بتونم، کوتاه راهنماییت می‌کنم.`},
    {label:'درخواست معرفی',title:'برای مشتری یا آشنای راضی',text:`اگر کسی اطرافت هست که درباره «${offer}» دنبال راهنمایی یا انتخاب مطمئن‌تره، خوشحال می‌شم معرفی‌اش کنی. اول کمک می‌کنم بفهمه اصلاً چه گزینه‌ای مناسبشه؛ لازم نیست از اول تصمیم به خرید داشته باشه.`}
  ];
}
function retentionPack(offer,audience){
  return [
    {label:'پیگیری رضایت',title:'برای مشتری اخیر',text:`سلام، خواستم مطمئن شم تجربه‌ات از «${offer}» خوب بوده. اگر جایی سؤال یا مشکلی داشتی همینجا بگو تا پیگیریش کنم. اگر بخوای فقط یک چیز رو بهتر کنیم، اون چیه؟`},
    {label:'بازگشت مشتری',title:'برای مشتری قدیمی',text:`سلام. چون قبلاً «${offer}» رو تجربه کردی، خواستم بپرسم الان نیاز یا مسئله بعدی‌ای هست که بتونیم براش کمک کنیم؟ اگر بگی الان کجای کاری، مناسب‌ترین قدم بعدی رو پیشنهاد می‌دم.`},
    {label:'فروش دوباره',title:'پیشنهاد بدون فشار',text:`برای مشتری‌های قبلی «${offer}» این هفته یک بررسی کوتاه داریم تا ببینیم قدم بعدی واقعاً چی باید باشه. اگر دوست داشتی فقط وضعیت الانت رو بگو؛ اگر چیزی لازم نباشه هم همون رو صادقانه می‌گم.`}
  ];
}
function offerPack(offer,audience){
  return [
    {label:'نسخه اصلی',title:'پیشنهاد یک‌جمله‌ای',text:`«${offer}» برای ${audience} که می‌خواهد بدون سردرگمی بین انتخاب‌های اضافه، به یک مسیر روشن‌تر و نتیجه قابل پیگیری برسد.`},
    {label:'قبل از قیمت',title:'سه سؤال تشخیصی',text:`حتماً قیمت رو می‌گم. فقط قبلش سه مورد رو بگو تا گزینه اشتباه پیشنهاد ندم: ۱) دقیقاً چه نتیجه‌ای می‌خوای؟ ۲) الان مهم‌ترین مشکلت چیه؟ ۳) موقع انتخاب «${offer}» قیمت، سرعت یا کیفیت نتیجه کدوم برات مهم‌تره؟`},
    {label:'نسخه کوتاه',title:'برای بیو یا ابتدای گفت‌وگو',text:`کمک به ${audience} برای انتخاب و اجرای بهتر «${offer}»؛ از تشخیص مسئله تا قدم بعدی.`}
  ];
}

function instagramContentPack(mode){
  const offer=state.profile.offer;
  const audience=state.profile.audience;
  const camera=state.instagram.camera;
  const hook=mode==='reach'
    ? `اگر برای «${offer}» وقت می‌ذاری ولی هنوز نتیجه‌ای که می‌خوای رو نمی‌گیری، احتمالاً مشکل از چیزی نیست که فکر می‌کنی.`
    : `اگر ${audience} هستی و «${offer}» برات مهمه، این اشتباه ساده می‌تونه کلی وقتت رو هدر بده.`;
  const script=camera==='no'
    ? `نمای ۱: متن بزرگ روی تصویر — «این اشتباه رو در ${offer} انجام نده»\nنمای ۲: سه نکته کوتاه روی ویدئوی دست، محصول، محیط کار یا نمونه‌کار\n۱) اول نتیجه‌ای که می‌خوای رو مشخص کن\n۲) فقط یک مشکل اصلی رو پیدا کن\n۳) یک تغییر رو ۷ روز تست کن\nنمای آخر: «اگر نمی‌دونی از کجا شروع کنی، کلمه بررسی رو دایرکت کن»`
    : `${hook}\nبعد بگو: «خیلی‌ها مستقیم دنبال ابزار یا راه جدید می‌رن. من اول سه چیز رو چک می‌کنم: نتیجه‌ای که می‌خوای، چیزی که الان جلوت رو گرفته، و یک تغییر کوچیک که می‌شه این هفته تستش کرد. اگر نمی‌دونی کدوم بخش مشکل داره، کلمه بررسی رو برام بفرست.»`;
  return [
    {label:'ریلز امروز',title:'هوک',text:hook},
    {label:'سناریوی آماده',title:camera==='no'?'بدون نیاز به چهره':'متن اجرا',text:script},
    {label:'انتشار',title:'کاور + کپشن + دعوت',text:`کاور: «مشکل ${offer} شاید این نباشه که فکر می‌کنی»\n\nکپشن: قبل از اینکه کار بیشتری انجام بدی، اول مشخص کن دقیقاً کدوم قسمت نتیجه رو محدود کرده. این هفته فقط یک تغییر رو تست کن.\n\nدعوت به اقدام: «اگه نمی‌دونی از کجا شروع کنی، کلمه بررسی رو دایرکت کن.»`},
    {label:'استوری بعد از انتشار',title:'هل دادن مخاطب به محتوا',text:`استوری ۱: «تو درباره ${offer} بیشتر کجاش گیر کردی؟»\nاستوری ۲: «یه ویدیوی کوتاه گذاشتم که می‌گه قبل از هر تغییر، چی رو باید پیدا کنی.»\nاستوری ۳: «اگر دیدیش و هنوز سؤال داری، فقط بنویس بررسی.»`}
  ];
}
function instagramConversionPack(){
  const offer=state.profile.offer;
  return [
    {label:'دعوت به اقدام ثابت',title:'آخر محتوای این هفته',text:`اگر درباره «${offer}» مرددی یا نمی‌دونی از کجا شروع کنی، کلمه «بررسی» رو دایرکت کن. یک سؤال ازت می‌پرسم و می‌گم قدم اولت چی باشه.`},
    {label:'۳ استوری امروز',title:'بازدید را به مکالمه تبدیل کن',text:`استوری ۱: «بزرگ‌ترین سؤال تو درباره ${offer} چیه؟» [باکس سؤال]\nاستوری ۲: «امروز به ۳ تا از سؤال‌ها جواب کوتاه می‌دم.»\nاستوری ۳: «اگر نمی‌خوای عمومی بپرسی، فقط کلمه بررسی رو دایرکت کن.»`},
    {label:'پاسخ اولین دایرکت',title:'مکالمه را درست شروع کن',text:`حتماً. قبل از اینکه چیزی پیشنهاد بدم فقط این رو بگو: الان درباره «${offer}» دقیقاً می‌خوای به چه نتیجه‌ای برسی و چه چیزی بیشتر از همه جلوت رو گرفته؟`}
  ];
}
function instagramSalesPack(){
  const offer=state.profile.offer;
  return [
    {label:'پیام اول',title:'قبل از قیمت دادن',text:`حتماً قیمت «${offer}» رو می‌گم. فقط اول بگو نتیجه‌ای که می‌خوای دقیقاً چیه و الان مهم‌ترین دغدغه‌ات قیمت، زمان یا کیفیت نتیجه‌ست؟ این کمک می‌کنه گزینه اشتباه پیشنهاد ندم.`},
    {label:'وقتی می‌گوید گرونه',title:'پاسخ آماده',text:`کاملاً قابل درکه. اگر بخوای، به‌جای اینکه فقط روی قیمت تصمیم بگیری، بگو مهم‌ترین نتیجه‌ای که از «${offer}» می‌خوای چیه. اگر گزینه ساده‌تری به کارت بخوره همون رو می‌گم.`},
    {label:'پیگیری فردا',title:'بدون فشار',text:`سلام، فقط برای اینکه مکالمه نیمه‌کاره نمونه پیام می‌دم. اگر هنوز درباره «${offer}» ابهامی داری بگو تا همون رو روشن کنم. اگر هم فعلاً زمانش نیست، اوکیه.`}
  ];
}

function simpleWeek(items){return items.map((x,i)=>({day:`روز ${fa(i+1)}`,title:x[0],copy:x[1]}));}
function contentWeek(offer){return simpleWeek([
  ['انتشار محتوای امروز','همین بسته‌ای که بالا ساختیم را منتشر کن.'],['بررسی ۳ محتوای قبلی','فقط سه برنده یا سه ضعیف را پیدا کن و شروعشان را مقایسه کن.'],['محتوای دوم','همان موضوع را با هوک متفاوت تکرار کن.'],['استوری سؤال','از مخاطب یک سؤال واقعی درباره '+offer+' بگیر.'],['محتوای پاسخ','یکی از همان سؤال‌ها را تبدیل به محتوا کن.'],['دعوت به اقدام ثابت','همه محتواها را به یک پیام یا فرم مشخص وصل کن.'],['مرور عددها','بازدید، دایرکت و فروش را کنار هم ببین و فقط برنده را ادامه بده.']]);}
function salesWeek(offer){return simpleWeek([
  ['۳ گفت‌وگوی واقعی','متن‌های امروز را در سه مکالمه استفاده کن.'],['ثبت اعتراض‌ها','هر اعتراض پرتکرار را دقیقاً با کلمات خود مشتری بنویس.'],['اصلاح پاسخ قیمت','پاسخ را براساس اعتراض واقعی کوتاه‌تر کن.'],['پیگیری مشتری‌های نیمه‌گرم','۵ گفت‌وگوی قدیمی را دوباره باز کن.'],['یک پیشنهاد روشن','یک بسته یا گزینه مشخص برای '+offer+' تعریف کن.'],['اندازه‌گیری','تعداد علاقه‌مند و خریدار را ثبت کن.'],['مرور','متنی را که بیشتر جواب گرفته نگه دار و بقیه را حذف کن.']]);}
function acquisitionWeek(offer){return simpleWeek([
  ['۵ مکالمه جدید','با متن‌های امروز شروع کن.'],['درخواست معرفی','از ۳ مشتری یا آشنای مناسب معرفی بخواه.'],['استوری سؤال','یک سؤال مستقیم درباره '+offer+' منتشر کن.'],['همکاری کوچک','یک پیج یا کسب‌وکار مکمل برای همکاری پیدا کن.'],['پیام دوم','به کسانی که جواب دادند کمک کوتاه بده، نه فروش فوری.'],['ثبت منبع','کنار هر ورودی بنویس از کجا آمده.'],['انتخاب برنده','فقط مسیری را ادامه بده که مکالمه واقعی ساخته.']]);}
function retentionWeek(offer){return simpleWeek([
  ['۵ پیام پیگیری','با مشتری‌های اخیر شروع کن.'],['۵ مشتری قدیمی','نیاز فعلی‌شان را بپرس.'],['پیشنهاد قدم بعدی','برای '+offer+' یک مرحله مکمل تعریف کن.'],['درخواست بازخورد','یک سؤال کوتاه درباره تجربه خرید بفرست.'],['درخواست معرفی','از مشتری‌های راضی معرفی بخواه.'],['ثبت پاسخ‌ها','مشتری‌های فعال و غیرفعال را جدا کن.'],['مرور فروش دوباره','ببین چند پاسخ و چند فروش از مشتری قبلی آمد.']]);}
function offerWeek(offer){return simpleWeek([
  ['نسخه یک‌جمله‌ای','متن امروز را در بیو یا گفت‌وگو تست کن.'],['۵ بازخورد','از ۵ نفر بپرس کدام بخش پیشنهاد مبهم است.'],['سه سؤال تشخیصی','قبل از قیمت دادن از همین سؤال‌ها استفاده کن.'],['بسته‌بندی','گزینه‌های خرید را ساده و قابل مقایسه کن.'],['اعتراض‌ها','سه اعتراض پرتکرار را ثبت کن.'],['نسخه دوم','براساس اعتراض‌ها متن پیشنهاد را اصلاح کن.'],['مرور','نسخه‌ای را نگه دار که توضیح کمتری نیاز داشت.']]);}
function instagramWeek(key){
  const offer=state.profile.offer;
  return simpleWeek([
    ['کار امروز','همین خروجی آماده را اجرا و عددها را ثبت کن.'],
    ['تکرار برنده','همان موضوع را با یک هوک جدید برای '+offer+' بساز.'],
    ['استوری تعاملی','یک سؤال یا نظرسنجی از درد واقعی مخاطب منتشر کن.'],
    ['پاسخ به سؤال','یکی از جواب‌های استوری را تبدیل به محتوای کوتاه کن.'],
    ['دعوت به اقدام','یک CTA ثابت برای دایرکت یا خرید تست کن.'],
    ['پیگیری','دایرکت‌های نیمه‌کاره هفته را با متن کوتاه دوباره باز کن.'],
    ['مرور هفته','بازدید، فالو، دایرکت و فروش را مقایسه کن؛ فقط چیزی را ادامه بده که یک عدد را بهتر کرده.']
  ]);
}

function renderResult(diagnosis, restored=false){
  state.diagnosis=diagnosis;
  $('today-time').textContent=diagnosis.time;
  $('today-title').textContent=diagnosis.title;
  $('today-copy').textContent=diagnosis.reason;
  $('diagnosis-main').textContent=diagnosis.title;
  $('diagnosis-reason').textContent=diagnosis.reason;
  $('diagnosis-goal').textContent=diagnosis.target;
  renderReady($('today-ready'),diagnosis.ready);
  renderWeek(diagnosis.weekPlan);
  renderFeedbackFields(diagnosis.feedbackType);
  $('feedback-card').classList.add('hidden');
  $('next-step-card').classList.add('hidden');
  $('today-done').textContent='انجامش دادم';
  $('today-done').disabled=false;
  if(restored && state.feedback){
    $('feedback-card').classList.remove('hidden');
    if(state.feedback.next){renderNext(state.feedback.next);}
  }
  updateHoshexLink();
}
function renderReady(host,items){
  host.innerHTML='';
  items.forEach(item=>{
    const card=document.createElement('div');
    card.className='ready-item';
    card.innerHTML=`<div class="ready-item-top"><span>${escapeHtml(item.label)}</span><button class="copy-btn" type="button">کپی</button></div><h4>${escapeHtml(item.title)}</h4><div class="ready-text">${escapeHtml(item.text)}</div>${item.note?`<div class="ready-note">${escapeHtml(item.note)}</div>`:''}`;
    card.querySelector('.copy-btn').addEventListener('click',e=>copyText(item.text,e.currentTarget));
    host.appendChild(card);
  });
}
function copyText(text,button){
  const done=()=>{const old=button.textContent;button.textContent='کپی شد';setTimeout(()=>button.textContent=old,1000);};
  if(navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done).catch(()=>fallbackCopy(text,done));
  else fallbackCopy(text,done);
}
function fallbackCopy(text,done){
  const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy');done();}catch{}t.remove();
}
function renderWeek(plan){
  $('week-plan').innerHTML=`<h4>نقشه ۷ روزه</h4>${plan.map(row=>`<div class="week-row"><span>${escapeHtml(row.day)}</span><div><b>${escapeHtml(row.title)}</b><p>${escapeHtml(row.copy)}</p></div></div>`).join('')}`;
}

$('today-done').addEventListener('click',()=>{
  $('feedback-card').classList.remove('hidden');
  $('today-done').textContent='ثبت شد ✓';
  $('today-done').disabled=true;
  $('feedback-card').scrollIntoView({behavior:'smooth',block:'start'});
});

function renderFeedbackFields(type){
  const configs={
    instagram:[['views','بازدید این محتوا'],['follows','فالو جدید'],['dms','دایرکت مرتبط'],['sales','فروش']],
    content:[['views','بازدید'],['replies','تعامل یا پاسخ'],['dms','دایرکت'],['sales','فروش']],
    sales:[['sent','گفت‌وگوی استفاده‌شده'],['replies','پاسخ جدی'],['dms','پیگیری'],['sales','فروش']],
    acquisition:[['sent','پیام یا تماس'],['replies','پاسخ'],['dms','علاقه‌مند جدید'],['sales','فروش']],
    retention:[['sent','مشتری پیگیری‌شده'],['replies','پاسخ'],['dms','فرصت فروش دوباره'],['sales','فروش']],
    offer:[['sent','دفعات استفاده'],['replies','پاسخ مثبت'],['dms','سؤال کمتر/شفاف‌تر'],['sales','فروش']]
  };
  const fields=configs[type] || configs.content;
  $('feedback-fields').innerHTML=fields.map(([key,label])=>`<label><span>${label}</span><input type="number" min="0" inputmode="numeric" name="${key}" value="0" required /></label>`).join('');
}

$('feedback-form').addEventListener('submit',e=>{
  e.preventDefault();
  const data=Object.fromEntries([...new FormData(e.currentTarget).entries()].map(([k,v])=>[k,Number(v||0)]));
  const next=buildNextStep(data);
  state.feedback={data,next,recordedAt:new Date().toISOString()};
  saveState();
  renderNext(next);
  $('next-step-card').scrollIntoView({behavior:'smooth',block:'start'});
});

function buildNextStep(data){
  const offer=state.profile.offer;
  if(state.diagnosis.feedbackType==='instagram'){
    const baseline=Math.max(state.diagnosis.baseline?.views || state.instagram.views || 0,1);
    if(data.sales>0){
      return {title:'این مسیر سیگنال فروش داده؛ فردا تکرارش می‌کنیم، نه اینکه موضوع را عوض کنیم.',copy:`${fa(data.sales)} فروش ثبت کردی. فردا همان مسئله را با زاویه تازه تکرار کن و CTA را ثابت نگه دار.`,ready:[{label:'هوک فردا',title:'همان درد، زاویه جدید',text:`اگه درباره «${offer}» هنوز مرددی، قبل از اینکه تصمیم بگیری این سؤال رو از خودت بپرس: دقیقاً چه نتیجه‌ای می‌خوام و کدوم انتخاب مستقیم‌تر منو به همون می‌رسونه؟`}]};
    }
    if(data.dms>0 && data.sales===0){
      return {title:'محتوا مکالمه ساخته؛ الان مشکل را در فروش داخل دایرکت می‌زنیم.',copy:`${fa(data.dms)} دایرکت گرفتی ولی فروش ثبت نشده. فردا محتوا را زیاد نمی‌کنیم؛ کیفیت پاسخ و پیگیری را اصلاح می‌کنیم.`,ready:instagramSalesPack()};
    }
    if(data.views>=baseline*.8 && data.dms===0){
      return {title:'دیده شدی، اما مخاطب قدم بعدی را برنداشت.',copy:'فردا موضوع را نگه می‌داریم و فقط دعوت به اقدام و استوری بعد از انتشار را تغییر می‌دهیم.',ready:instagramConversionPack()};
    }
    return {title:'بازدید هنوز سیگنال کافی نداده؛ فردا هوک را عوض می‌کنیم.',copy:'فعلاً CTA یا فروش را دست نمی‌زنیم. اول باید تعداد بیشتری از مخاطب مناسب محتوا را ببینند.',ready:instagramContentPack('reach')};
  }
  if(data.sales>0){
    return {title:'این کار به فروش رسیده؛ فردا نسخه دوم همین حرکت را اجرا کن.',copy:`${fa(data.sales)} فروش یعنی فعلاً نباید مسیر برنده را با ایده تازه عوض کنیم. همان مسئله را با متن کوتاه‌تر تکرار کن.`,ready:state.diagnosis.ready.slice(0,2)};
  }
  const interest=(data.replies||0)+(data.dms||0);
  if(interest>0){
    return {title:'واکنش گرفتی؛ فردا روی تبدیل همین آدم‌ها کار می‌کنیم.',copy:`${fa(interest)} واکنش یا فرصت ثبت شده. به‌جای جذب بیشتر، همین مکالمه‌ها را با پیگیری دقیق جلو ببر.`,ready:salesPack(offer,state.profile.audience).slice(0,2)};
  }
  if(state.diagnosis.feedbackType==='content'){
    return {title:'واکنش کافی نگرفتیم؛ فردا موضوع را نگه می‌داریم و شروع محتوا را عوض می‌کنیم.',copy:'یک بار اجرا برای حذف موضوع کافی نیست. نسخه دوم را فقط با هوک تیزتر تست کن.',ready:contentPack(offer,state.profile.audience).slice(0,2)};
  }
  return {title:'هنوز سیگنال کافی نداریم؛ فردا پیام را کوتاه‌تر و مستقیم‌تر تست کن.',copy:'فعلاً کانال را عوض نکن. یک نسخه ساده‌تر اجرا کن تا بفهمیم مسئله از متن است یا از مخاطب.',ready:state.diagnosis.ready.slice(0,2)};
}
function renderNext(next){
  $('next-title').textContent=next.title;
  $('next-copy').textContent=next.copy;
  renderReady($('next-ready'),next.ready || []);
  $('next-step-card').classList.remove('hidden');
}

function updateHoshexLink(){
  const params=new URLSearchParams({
    source:'growth-path',
    goal:state.goal || '',
    offer:state.profile.offer || '',
    diagnosis:state.diagnosis?.key || '',
    business:state.profile.name || ''
  });
  $('hoshex-cta').href=`https://hoshex.ir/grow/?${params.toString()}`;
}

addResumeButton();
