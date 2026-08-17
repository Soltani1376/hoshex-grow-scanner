window.HX = window.HX || {};

HX.$ = id => document.getElementById(id);
HX.fa = value => String(value ?? '').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
HX.clean = value => String(value || '').trim();
HX.escapeHtml = value => String(value || '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
HX.STORAGE_KEY = 'hoshexGrowthCompanionV4';

HX.goalLabels = {
  instagram:'رشد پیج اینستاگرام',
  sales:'فروش',
  acquisition:'جذب مشتری',
  content:'محتوا',
  retention:'مشتری‌های قبلی',
  unknown:'تشخیص توسط هوشکس'
};

HX.diagnosisLabels = {
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
  content:'محتوا هنوز موتور نتیجه نیست',
  retention:'پیگیری و فروش دوباره ضعیف است'
};

HX.defaultState = () => ({
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

HX.state = HX.defaultState();

HX.restoreState = saved => {
  const fresh = HX.defaultState();
  Object.assign(HX.state,fresh,saved || {});
  HX.state.profile = {...fresh.profile,...(saved?.profile || {})};
  HX.state.instagram = {...fresh.instagram,...(saved?.instagram || {})};
  HX.state.adaptive = {...fresh.adaptive,...(saved?.adaptive || {})};
  HX.state.journey = Array.isArray(saved?.journey) ? saved.journey : [];
};
HX.loadSaved = () => {
  try{return JSON.parse(localStorage.getItem(HX.STORAGE_KEY) || 'null');}catch{return null;}
};
HX.saveState = () => localStorage.setItem(HX.STORAGE_KEY,JSON.stringify({...HX.state,savedAt:new Date().toISOString()}));
HX.resetState = () => {
  HX.restoreState(HX.defaultState());
  localStorage.removeItem(HX.STORAGE_KEY);
};

const q = (id,tag,title,hint,options) => ({id,tag,title,hint,options});
const o = (label,value,score,next) => ({label,value,score,next});

HX.questionTrees = {
  sales:{
    start:'s1',
    questions:{
      s1:q('s1','ورودی فروش','در ۳۰ روز اخیر چند نفر واقعاً درباره خرید سؤال کرده‌اند؟','اول مشخص می‌کنیم مسئله کمبود علاقه‌مند است یا تبدیل علاقه‌مند به خریدار.',[
        o('تقریباً هیچ‌کس','none',1,'s_source'),o('۱ تا ۵ نفر','low',2,'s_source'),o('۶ تا ۲۰ نفر','mid',3,'s_offer'),o('بیشتر از ۲۰ نفر','high',4,'s_offer')]),
      s_source:q('s_source','ورودی مشتری','همین تعداد کم بیشتر از کجا آمده؟','اگر ورودی ضعیف باشد، فشار آوردن روی متن فروش اولویت اول نیست.',[
        o('تقریباً شانسی','random',1,'s_offer'),o('آشنا و معرفی','referral',2,'s_offer'),o('یک مسیر مشخص','one',3,'s_offer'),o('چند مسیر مشخص','multi',4,'s_offer')]),
      s_offer:q('s_offer','پیشنهاد فروش','اگر مشتری بپرسد «دقیقاً چی می‌گیرم و چرا این گزینه؟» جواب کوتاه داری؟','اینجا وضوح پیشنهاد را می‌سنجیم.',[
        o('نه، توضیح طولانی می‌دم','no',1,'s_follow'),o('تا حدی','some',2,'s_follow'),o('نسبتاً روشنه','clear',3,'s_follow'),o('کاملاً کوتاه و روشنه','very-clear',4,'s_follow')]),
      s_follow:q('s_follow','پیگیری','اگر بعد از قیمت دادن جواب ندهد چه می‌کنی؟','بخشی از فروش‌ها در همین مرحله از دست می‌روند.',[
        o('هیچ کاری','none',1,'s_objection'),o('گاهی یادم باشه پیام می‌دم','random',2,'s_objection'),o('یک بار پیگیری می‌کنم','once',3,'s_objection'),o('زمان و متن مشخص دارم','system',4,'s_objection')]),
      s_objection:q('s_objection','اعتراض مشتری','برای «گرونه»، «فکر می‌کنم» و «بعداً خبر می‌دم» جواب مشخص داری؟','آخرین سؤال برای تشخیص اینکه مشکل اصلی پیشنهاد است یا گفت‌وگوی فروش.',[
        o('نه','no',1,'END'),o('برای بعضی‌ها','some',2,'END'),o('بیشترشان را می‌دانم','most',3,'END'),o('بله، متن و مسیر دارم','yes',4,'END')])
    }
  },
  acquisition:{
    start:'a1',
    questions:{
      a1:q('a1','ورودی مشتری','در ۳۰ روز اخیر چند مشتری یا علاقه‌مند جدید وارد شده؟','از خود جریان ورودی شروع می‌کنیم.',[
        o('تقریباً صفر','none',1,'a_visibility'),o('۱ تا ۵ نفر','low',2,'a_visibility'),o('۶ تا ۲۰ نفر','mid',3,'a_entry'),o('بیشتر از ۲۰ نفر','high',4,'a_entry')]),
      a_visibility:q('a_visibility','دیده‌شدن','در هفته چند بار جلوی مشتری بالقوه قرار می‌گیری؟','پست، استوری، پیام، معرفی، همکاری یا حضور محلی.',[
        o('تقریباً هیچ‌وقت','none',1,'a_entry'),o('۱ بار','one',2,'a_entry'),o('۲ تا ۴ بار','few',3,'a_entry'),o('تقریباً هر روز','often',4,'a_entry')]),
      a_entry:q('a_entry','شروع ارتباط','برای کسی که هنوز آماده خرید نیست، دلیل ساده‌ای برای پیام دادن داری؟','مثل بررسی کوتاه، نمونه، پاسخ به یک سؤال یا پیشنهاد شروع کم‌ریسک.',[
        o('نه','none',1,'a_referral'),o('یک چیز مبهم دارم','weak',2,'a_referral'),o('یک پیشنهاد روشن دارم','clear',3,'a_referral'),o('چند ورودی دارم و نتیجه‌شان را می‌سنجم','system',4,'a_referral')]),
      a_referral:q('a_referral','معرفی و ارتباط مستقیم','از مشتری راضی یا مخاطب گرم فعالانه معرفی یا مکالمه می‌گیری؟','اگر این مسیر استفاده نشده باشد، امروز می‌توانیم با کمترین هزینه از همین‌جا شروع کنیم.',[
        o('هیچ‌وقت','none',1,'END'),o('خیلی کم','low',2,'END'),o('گاهی','some',3,'END'),o('منظم و با متن مشخص','system',4,'END')])
    }
  },
  content:{
    start:'c1',
    questions:{
      c1:q('c1','خروجی','در ۳۰ روز اخیر چند محتوای واقعی منتشر کردی؟','اول فرق بین مشکل «کم منتشر کردن» و «نتیجه نگرفتن» را مشخص می‌کنیم.',[
        o('۰ تا ۲ محتوا','very-low',1,'c_block'),o('۳ تا ۵ محتوا','low',2,'c_block'),o('۶ تا ۱۲ محتوا','mid',3,'c_clarity'),o('بیشتر از ۱۲ محتوا','high',4,'c_clarity')]),
      c_block:q('c_block','گیر تولید','بیشتر چه چیزی جلوی انتشار منظم را می‌گیرد؟','جواب این سؤال روی نوع کار امروز اثر مستقیم دارد.',[
        o('وقت ندارم','time',1,'c_clarity'),o('ایده ندارم','ideas',1,'c_clarity'),o('ساختنش برام سخته','skill',2,'c_clarity'),o('نمی‌دونم چی واقعاً جواب می‌ده','uncertain',2,'c_clarity')]),
      c_clarity:q('c_clarity','مخاطب و موضوع','سه موضوع اصلی که برای مخاطبت می‌سازی مشخص‌اند؟','محتوای پراکنده حتی با انتشار زیاد هم سخت‌تر رشد می‌کند.',[
        o('نه','no',1,'c_action'),o('تقریباً','some',2,'c_action'),o('بله','yes',3,'c_action'),o('بله و براساس نتیجه اصلاحشون می‌کنم','measured',4,'c_action')]),
      c_action:q('c_action','اقدام بعدی','آخر بیشتر محتواها از مخاطب یک کار مشخص می‌خواهی؟','مثلاً پیام، ذخیره، دیدن محصول یا ثبت درخواست.',[
        o('نه','none',1,'c_measure'),o('گاهی','some',2,'c_measure'),o('بیشتر مواقع','often',3,'c_measure'),o('بله و نتیجه‌اش را می‌سنجم','measured',4,'c_measure')]),
      c_measure:q('c_measure','یادگیری از محتوا','می‌دانی کدام ۳ محتوای اخیر بهتر جواب داده و چرا؟','اگر برنده‌ها را نشناسیم، هر هفته دوباره از صفر شروع می‌کنیم.',[
        o('نه','no',1,'END'),o('فقط از روی حس','guess',2,'END'),o('تقریباً می‌دانم','some',3,'END'),o('عددها را مقایسه می‌کنم','yes',4,'END')])
    }
  },
  retention:{
    start:'r1',
    questions:{
      r1:q('r1','مشتری قبلی','در ۳۰ روز اخیر چند مشتری قبلی دوباره خرید کرده؟','می‌خواهیم ببینیم فرصت فروش دوباره چقدر رها شده.',[
        o('تقریباً هیچ‌کس','none',1,'r_follow'),o('خیلی کم','low',2,'r_follow'),o('بخشی از مشتری‌ها','some',3,'r_follow'),o('منظم تکرار خرید دارم','good',4,'r_follow')]),
      r_follow:q('r_follow','پیگیری بعد خرید','بعد از خرید، خودت دوباره سراغ مشتری می‌ری؟','یک پیام ساده می‌تواند هم رضایت را بالا ببرد و هم فرصت بعدی را نشان دهد.',[
        o('نه','none',1,'r_next'),o('خیلی کم','low',2,'r_next'),o('گاهی','some',3,'r_next'),o('روند مشخص دارم','system',4,'r_next')]),
      r_next:q('r_next','قدم بعدی مشتری','برای مشتری قبلی محصول یا خدمت بعدی مشخص داری؟','اگر قدم بعدی مبهم باشد، فروش دوباره اتفاقی می‌شود.',[
        o('نه','none',1,'r_data'),o('برای بعضی‌ها','some',2,'r_data'),o('بله','yes',3,'r_data'),o('بله و زمان پیشنهادش مشخصه','system',4,'r_data')]),
      r_data:q('r_data','ثبت اطلاعات','می‌دانی آخرین خرید هر مشتری چه زمانی بوده؟','بدون این اطلاعات پیگیری معمولاً دیر یا تصادفی انجام می‌شود.',[
        o('نه','none',1,'END'),o('فقط توی پیام‌ها می‌گردم','messages',2,'END'),o('تقریباً ثبت می‌کنم','some',3,'END'),o('لیست و تاریخچه دارم','system',4,'END')])
    }
  },
  unknown:{
    start:'u_acq',
    questions:{
      u_acq:q('u_acq','جذب مشتری','ورودی مشتری جدید در ۳۰ روز اخیر چقدر قابل تکرار بوده؟','اگر خودت نمی‌دونی گره کجاست، پنج بخش اصلی را سریع مقایسه می‌کنیم.',[
        o('تقریباً صفر','v',1,'u_offer'),o('کم و شانسی','v',2,'u_offer'),o('نسبتاً منظم','v',3,'u_offer'),o('کاملاً مشخص و قابل اندازه‌گیری','v',4,'u_offer')]),
      u_offer:q('u_offer','پیشنهاد فروش','مشتری چقدر سریع می‌فهمد دقیقاً چه می‌فروشی و چرا باید انتخابت کند؟','وضوح پیشنهاد را می‌سنجیم.',[
        o('خیلی مبهمه','v',1,'u_content'),o('نیاز به توضیح زیاد داره','v',2,'u_content'),o('نسبتاً روشنه','v',3,'u_content'),o('خیلی روشن و قابل مقایسه‌ست','v',4,'u_content')]),
      u_content:q('u_content','محتوا','محتوا یا ارتباط بازاریابی چقدر منظم و هدفمند است؟','محتوا فقط اینستاگرام نیست؛ هر چیزی که مشتری را با تو آشنا می‌کند.',[
        o('تقریباً ندارم','v',1,'u_sales'),o('نامنظم','v',2,'u_sales'),o('نسبتاً منظم','v',3,'u_sales'),o('منظم و متصل به هدف','v',4,'u_sales')]),
      u_sales:q('u_sales','فروش','علاقه‌مندها چقدر منظم به خرید تبدیل می‌شوند؟','مسیر بین سؤال مشتری و پرداخت را در نظر بگیر.',[
        o('خیلی ضعیف','v',1,'u_ret'),o('ضعیف و نامنظم','v',2,'u_ret'),o('نسبتاً خوب','v',3,'u_ret'),o('قابل اندازه‌گیری و منظم','v',4,'u_ret')]),
      u_ret:q('u_ret','بازگشت مشتری','بعد از خرید، پیگیری و فروش دوباره چقدر منظم است؟','آخرین بخش برای پیدا کردن ضعیف‌ترین حلقه.',[
        o('تقریباً هیچ','v',1,'END'),o('خیلی کم','v',2,'END'),o('نسبتاً منظم','v',3,'END'),o('روند مشخص دارم','v',4,'END')])
    }
  }
};

HX.currentTree = () => HX.questionTrees[HX.state.goal] || HX.questionTrees.unknown;
HX.currentQuestion = () => {
  const tree=HX.currentTree();
  const id=HX.state.adaptive.path[HX.state.adaptive.path.length-1];
  return tree.questions[id];
};
HX.scoreOf = (id,fallback=4) => HX.state.adaptive.answers[id]?.score ?? fallback;
HX.baseType = key => {
  if(String(key).startsWith('ig-')) return key;
  if(String(key).startsWith('content-')) return 'content';
  if(String(key).startsWith('acquisition')) return 'acquisition';
  return key;
};
HX.makeDiagnosis = (key,reason,confidence='متوسط',note='') => ({
  key,
  title:HX.diagnosisLabels[key] || HX.diagnosisLabels[HX.baseType(key)] || 'اولویت رشد',
  reason,
  confidence,
  note,
  createdAt:new Date().toISOString()
});

HX.diagnoseAdaptive = () => {
  let key=HX.state.goal;
  let reason='';
  let confidence='متوسط';

  if(HX.state.goal==='unknown'){
    const dimensions={acquisition:HX.scoreOf('u_acq'),offer:HX.scoreOf('u_offer'),content:HX.scoreOf('u_content'),sales:HX.scoreOf('u_sales'),retention:HX.scoreOf('u_ret')};
    const sorted=Object.entries(dimensions).sort((a,b)=>a[1]-b[1]);
    key=sorted[0][0];
    confidence=(sorted[1][1]-sorted[0][1])>=1?'متوسط':'پایین';
    reason=`از بین پنج بخش، «${HX.diagnosisLabels[key]}» پایین‌ترین وضعیت را در جواب‌ها داشته. اول با یک اقدام کم‌ریسک صحت این تشخیص را امتحان می‌کنیم.`;
  }
  if(HX.state.goal==='sales'){
    const inflow=HX.scoreOf('s1'), source=HX.scoreOf('s_source',4), offerScore=HX.scoreOf('s_offer'), follow=HX.scoreOf('s_follow'), objection=HX.scoreOf('s_objection');
    if(inflow<=2 && source<=2){key='acquisition';reason='علاقه‌مند کافی وارد مسیر فروش نمی‌شود؛ قبل از دستکاری متن فروش، باید تعداد مکالمه‌های واقعی را بالا ببریم.';}
    else if(offerScore<=2){key='offer';reason='ورودی وجود دارد اما پیشنهاد هنوز برای مشتری کوتاه و روشن نیست؛ امروز قبل از پیگیری بیشتر، خود پیشنهاد را ساده می‌کنیم.';}
    else{key='sales';reason=follow<=2 || objection<=2?'ورودی و پیشنهاد تا حدی وجود دارد، اما پیگیری یا پاسخ به تردید مشتری ضعیف‌تر است.':'مسیر فروش بد نیست؛ برای رشد بیشتر باید گفت‌وگوها را منظم‌تر اندازه بگیریم و نسخه برنده را تکرار کنیم.';}
  }
  if(HX.state.goal==='acquisition'){
    const entry=HX.scoreOf('a_entry');
    key=entry<=1?'acquisition-entry':'acquisition';
    reason=entry<=1?'مخاطب دلیل ساده‌ای برای شروع ارتباط با تو ندارد؛ امروز یک ورودی کم‌ریسک می‌سازیم و همان را جلوی مخاطب می‌گذاریم.':'مسئله اصلی هنوز قابل‌تکرار نبودن ورودی است؛ امروز به‌جای پخش شدن در چند کانال، یک حرکت مستقیم و قابل اندازه‌گیری اجرا می‌کنیم.';
  }
  if(HX.state.goal==='content'){
    const output=HX.scoreOf('c1'), clarity=HX.scoreOf('c_clarity'), action=HX.scoreOf('c_action');
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
  if(HX.state.goal==='retention'){
    key='retention';
    const follow=HX.scoreOf('r_follow'), next=HX.scoreOf('r_next');
    reason=follow<=2?'بعد از خرید ارتباط زود قطع می‌شود؛ امروز بدون فشار فروش دوباره، ارتباط با مشتری قبلی را باز می‌کنیم.':next<=2?'پیگیری داری ولی قدم بعدی مشتری روشن نیست؛ امروز پیشنهاد بعدی را مشخص و امتحان می‌کنیم.':'پایه پیگیری وجود دارد؛ امروز یک دور منظم و قابل اندازه‌گیری روی مشتری‌های قبلی اجرا می‌کنیم.';
  }

  return HX.makeDiagnosis(key,reason,confidence,'این تشخیص از جواب‌های خودت ساخته شده و با نتیجه اجرای امروز دوباره بررسی می‌شود.');
};

HX.diagnoseInstagram = () => {
  const ig=HX.state.instagram;
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
    'ig-consistency':`در ۳۰ روز اخیر ${HX.fa(ig.posts30)} محتوا منتشر شده. قبل از تغییر پیچیده در موضوع یا فروش، باید ریتمی بسازیم که واقعاً بتوانی ادامه‌اش بدهی.`,
    'ig-reach':`با ${HX.fa(ig.followers)} فالوور، میانگین بازدید پنج محتوای اخیر ${HX.fa(ig.views)} بوده. این فقط یک نشانه است؛ امروز شروع محتوا و زاویه موضوع را تست می‌کنیم تا ببینیم مشکل واقعاً از دیده‌شدن است یا نه.`,
    'ig-conversion':`در ۳۰ روز اخیر حدود ${HX.fa(ig.dms30)} دایرکت کاری ثبت شده. اولویت امروز این است که مخاطب بعد از دیدن محتوا دقیقاً بداند چه کاری انجام دهد.`,
    'ig-sales':`در ۳۰ روز اخیر ${HX.fa(ig.dms30)} دایرکت کاری و ${HX.fa(ig.sales30)} فروش ثبت شده. یعنی مسئله فقط تولید محتوا نیست؛ باید خود گفت‌وگوی فروش داخل دایرکت را اصلاح کنیم.`
  };
  return HX.makeDiagnosis(key,reasons[key],'متوسط',`این تشخیص بر اساس عددهایی است که خودت وارد کردی. این نسخه پیج را خودکار باز یا مشاهده نمی‌کند. هدف ثبت‌شده: ${targetLabel} = ${HX.fa(ig.targetValue)}.`);
};
