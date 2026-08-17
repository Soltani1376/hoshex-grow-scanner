const questions = [
  {
    category:'acquisition', tag:'جذب مشتری',
    title:'مشتری‌های جدید معمولاً از کجا پیدات می‌کنن؟',
    hint:'می‌خواهیم ببینیم ورود مشتری چقدر قابل پیش‌بینی و قابل تکرار است.',
    options:[
      ['تقریباً هیچ مسیر ثابتی ندارم',2],
      ['بیشتر از معرفی و آشناها می‌آیند',4],
      ['از اینستاگرام یا یک مسیر مشخص می‌آیند',6],
      ['چند مسیر دارم ولی منظم نیست',8],
      ['مسیرهای مشخص دارم و نتیجه‌شان را اندازه می‌گیرم',10]
    ]
  },
  {
    category:'acquisition', tag:'جذب مشتری',
    title:'اگر امروز تبلیغ و تولید محتوا را متوقف کنی، باز هم مشتری می‌آید؟',
    hint:'این سؤال نشان می‌دهد ورود مشتری چقدر به فعالیت روزانه وابسته است.',
    options:[['تقریباً نه',2],['خیلی کم',4],['تا حدی',6],['بله، از چند مسیر',8],['بله، ورودی نسبتاً پایدار دارم',10]]
  },
  {
    category:'offer', tag:'پیشنهاد فروش',
    title:'مشتری چقدر سریع می‌فهمد چرا باید از تو بخرد؟',
    hint:'پیشنهاد فروش باید نتیجه، تفاوت و دلیل اقدام را روشن کند.',
    options:[['خودم هم دقیق نمی‌دانم چه بگویم',2],['نیاز به توضیح زیاد دارم',4],['معمولاً متوجه می‌شود',6],['ارزش پیشنهادم روشن است',8],['پیشنهاد فروش من روشن، متفاوت و قابل مقایسه است',10]]
  },
  {
    category:'offer', tag:'پیشنهاد فروش',
    title:'محصول یا خدمتت بسته و ساختار فروش مشخص دارد؟',
    hint:'بررسی می‌کنیم مشتری با انتخاب روشن روبه‌رو است یا با فهرست پراکنده خدمات.',
    options:[['نه، موردی قیمت می‌دهم',2],['فقط فهرست خدمات دارم',4],['چند گزینه دارم ولی کمی گیج‌کننده است',6],['بسته‌های مشخص دارم',8],['بسته‌ها، مزایا و مرحله بعدی خرید کاملاً روشن است',10]]
  },
  {
    category:'content', tag:'محتوا و هویت',
    title:'محتوات چقدر منظم و هدفمند منتشر می‌شود؟',
    hint:'منظم بودن کافی نیست؛ محتوا باید به یک هدف مشخص مثل جذب یا فروش وصل باشد.',
    options:[['تقریباً محتوا ندارم',2],['خیلی نامنظم منتشر می‌کنم',4],['منظم هستم ولی هدف روشنی ندارم',6],['برنامه و چند موضوع ثابت دارم',8],['منظم، قابل اندازه‌گیری و متصل به فروش است',10]]
  },
  {
    category:'content', tag:'محتوا و هویت',
    title:'مخاطب با دیدن محتوات سریع می‌فهمد برای چه کسی کار می‌کنی؟',
    hint:'اینجا وضوح مخاطب، پیام اصلی و تفاوت کسب‌وکارت را بررسی می‌کنیم.',
    options:[['نه، خیلی پراکنده است',2],['تا حد کمی',4],['نسبتاً مشخص است',6],['واضح است برای چه کسی کار می‌کنم',8],['مخاطب، لحن و تفاوت من کاملاً مشخص است',10]]
  },
  {
    category:'sales', tag:'فروش و تبدیل',
    title:'وقتی کسی علاقه نشان می‌دهد، مسیر رسیدنش تا خرید چقدر مشخص است؟',
    hint:'از اولین پیام یا تماس تا پرداخت؛ آیا مراحل مشخصی داری؟',
    options:[['هیچ مسیر مشخصی ندارم',2],['هر بار یک شکل پیش می‌رود',4],['یک روند تقریبی دارم',6],['مراحل و متن‌های پاسخ مشخص دارم',8],['مسیر فروش مشخص و قابل اندازه‌گیری دارم',10]]
  },
  {
    category:'sales', tag:'فروش و تبدیل',
    title:'می‌دانی چند درصد علاقه‌مندها در نهایت خرید می‌کنند؟',
    hint:'حتی یک عدد ساده برای نرخ تبدیل، تصمیم‌های فروش را دقیق‌تر می‌کند.',
    options:[['اصلاً اندازه نمی‌گیرم',2],['فقط حدس می‌زنم',4],['گاهی بررسی می‌کنم',6],['نرخ تبدیل تقریبی دارم',8],['دقیق ثبت می‌کنم و براساس آن اصلاح می‌کنم',10]]
  },
  {
    category:'retention', tag:'بازگشت مشتری',
    title:'بعد از اولین خرید، برای برگرداندن مشتری چه کاری انجام می‌دهی؟',
    hint:'مشتری قبلی یکی از کم‌هزینه‌ترین مسیرهای فروش دوباره است.',
    options:[['هیچ کاری',2],['فقط اگر خودش برگردد',4],['گاهی پیگیری می‌کنم',6],['برنامه پیگیری و پیشنهاد دوباره دارم',8],['پیگیری و خرید دوباره را منظم ثبت و اجرا می‌کنم',10]]
  },
  {
    category:'retention', tag:'داده و پیگیری',
    title:'تصمیم‌های رشدت بیشتر بر اساس عدد است یا حدس؟',
    hint:'آخرین سؤال؛ می‌خواهیم ببینیم فروش و نتیجه کارها چقدر ثبت و مرور می‌شود.',
    options:[['تقریباً کاملاً بر اساس حدس',2],['بیشتر حدسی',4],['ترکیبی',6],['بیشتر بر اساس عدد',8],['شاخص‌ها را منظم ثبت و مرور می‌کنم',10]]
  }
];

const categoryMeta = {
  acquisition:{
    name:'جذب مشتری',
    weak:'ورودی مشتری هنوز قابل پیش‌بینی نیست',
    copy:'قبل از افزایش تولید محتوا یا هزینه تبلیغ، یک مسیر جذب مشخص انتخاب کن و برای یک هفته فقط همان مسیر را اندازه بگیر.',
    strength:'ورودی مشتری نسبتاً منظم است. از همین مزیت برای آزمایش پیشنهاد فروش و افزایش تبدیل استفاده کن.'
  },
  offer:{
    name:'پیشنهاد فروش',
    weak:'پیشنهاد فروش هنوز به‌اندازه کافی روشن نیست',
    copy:'مشتری باید سریع بفهمد برای چه مشکلی، چه نتیجه‌ای و با چه تفاوتی از تو خرید می‌کند. اول این بخش را ساده و روشن کن.',
    strength:'پیشنهاد فروشت نسبتاً روشن است. حالا می‌توانی آن را در محتوا، صفحه فروش و گفت‌وگوی فروش یکدست‌تر کنی.'
  },
  content:{
    name:'محتوا و هویت',
    weak:'محتوا هنوز به جذب یا فروش وصل نشده',
    copy:'به‌جای انتشار پراکنده، سه موضوع ثابت تعریف کن و هر محتوا را به یک اقدام مشخص مثل پیام، فرم یا خرید وصل کن.',
    strength:'محتوا و پیام کسب‌وکارت نسبتاً منظم است. مرحله بعد، تبدیل این توجه به ورودی و فروش قابل اندازه‌گیری است.'
  },
  sales:{
    name:'فروش و تبدیل',
    weak:'بخشی از علاقه‌مندها در مسیر خرید از دست می‌روند',
    copy:'مراحل بین اولین تماس تا پرداخت را روی کاغذ بنویس، پاسخ اعتراض‌های پرتکرار را آماده کن و تعداد علاقه‌مند و خریدار را ثبت کن.',
    strength:'مسیر فروش نسبتاً منظم است. با افزایش ورودی و ثبت دقیق‌تر نرخ تبدیل، می‌توانی فروش را بهتر بهینه کنی.'
  },
  retention:{
    name:'بازگشت مشتری و داده',
    weak:'بعد از خرید، پیگیری کافی انجام نمی‌شود',
    copy:'برای مشتری قبلی یک پیام پیگیری، یک پیشنهاد خرید دوباره و یک جدول ساده هفتگی برای ثبت فروش و بازگشت مشتری بساز.',
    strength:'در پیگیری مشتری و ثبت داده وضعیت خوبی داری. این بخش می‌تواند پایه تصمیم‌های بعدی برای رشد پایدار باشد.'
  }
};

const actionBank = {
  acquisition:[
    ['یک مسیر جذب انتخاب کن','برای ۷ روز فقط یک مسیر مثل اینستاگرام، معرفی مشتری یا تبلیغ محلی را جدی اجرا کن.','روز ۱'],
    ['یک پیشنهاد ساده برای شروع ارتباط بساز','مثلاً بررسی کوتاه، نمونه کار، پاسخ به یک سؤال یا پیشنهاد اولیه کم‌ریسک.','روز ۲ تا ۳'],
    ['منبع هر مشتری را ثبت کن','کنار نام هر ورودی بنویس از کجا آمده تا آخر هفته بفهمی کدام مسیر واقعاً کار کرده است.','روز ۱ تا ۷']
  ],
  offer:[
    ['پیشنهاد فروشت را در یک جمله بنویس','مشخص کن برای چه کسی، چه نتیجه‌ای و با چه تفاوتی ایجاد می‌کنی.','روز ۱'],
    ['سه بسته فروش روشن بساز','یک گزینه شروع، یک گزینه اصلی و یک گزینه کامل با تفاوت واضح تعریف کن.','روز ۲ تا ۴'],
    ['پیشنهاد را با ۵ مشتری واقعی بررسی کن','متن و بسته‌ها را نشان بده و سؤال‌ها یا مخالفت‌هایشان را دقیق ثبت کن.','روز ۵ تا ۷']
  ],
  content:[
    ['سه موضوع ثابت برای محتوا تعیین کن','یک موضوع برای آموزش، یک موضوع برای اعتمادسازی و یک موضوع برای معرفی پیشنهاد فروش.','روز ۱'],
    ['پنج شروع جذاب از درد مشتری بنویس','محتوا را با سؤال، مشکل یا موقعیت واقعی مشتری شروع کن؛ نه با معرفی خودت.','روز ۲ تا ۳'],
    ['یک دعوت به اقدام ثابت انتخاب کن','برای این هفته همه محتواها را به یک کار مشخص مثل ارسال پیام، پر کردن فرم یا دیدن محصول وصل کن.','روز ۴ تا ۷']
  ],
  sales:[
    ['مسیر فروش را مرحله‌به‌مرحله بنویس','از اولین پیام تا پرداخت، همه مراحل و جاهایی که مشتری ممکن است منصرف شود را مشخص کن.','روز ۱'],
    ['برای سه مخالفت پرتکرار پاسخ آماده کن','مثل قیمت، زمان تصمیم‌گیری یا مقایسه با رقیب؛ پاسخ‌ها کوتاه و روشن باشند.','روز ۲ تا ۳'],
    ['تعداد علاقه‌مند و خریدار را ثبت کن','برای ۷ روز فقط دو عدد بنویس: چند نفر علاقه نشان دادند و چند نفر خرید کردند.','روز ۱ تا ۷']
  ],
  retention:[
    ['یک پیام پیگیری بعد از خرید آماده کن','۲۴ تا ۷۲ ساعت بعد از خرید، تجربه مشتری را بپرس و مشکل احتمالی را پیگیری کن.','روز ۱ تا ۲'],
    ['یک پیشنهاد خرید دوباره تعریف کن','برای مشتری فعلی یک محصول مکمل، خدمت بعدی یا مرحله بعدی منطقی پیشنهاد بده.','روز ۳ تا ۴'],
    ['یک جدول هفتگی ساده بساز','فروش، مشتری جدید، مشتری تکراری و تعداد علاقه‌مندها را هر هفته ثبت کن.','روز ۱ تا ۷']
  ]
};

const hoshexHelpBank = {
  acquisition:{
    title:'هوشکس می‌تواند مسیر جذب مشتری را برایت مشخص کند',
    copy:'اگر مشکل اصلی تو جذب مشتری باشد، به‌جای معرفی ابزارهای مختلف، روی یک مسیر مشخص کار می‌کنیم و خروجی قابل اجرا می‌سازیم.',
    items:[
      ['۱','انتخاب مسیر جذب','بررسی می‌کنیم برای حوزه تو اینستاگرام، معرفی، همکاری یا تبلیغ کدام اولویت بالاتری دارد.'],
      ['۲','پیشنهاد ورود مشتری','یک پیشنهاد ساده برای شروع ارتباط با مشتری طراحی می‌کنیم.'],
      ['۳','برنامه آزمایش ۷ روزه','کارهای روزانه و عددهایی که باید ثبت کنی مشخص می‌شود.']
    ]
  },
  offer:{
    title:'هوشکس می‌تواند پیشنهاد فروشت را بازطراحی کند',
    copy:'اگر مشتری دیر متوجه ارزش کارت می‌شود، مسئله را از متن و ساختار پیشنهاد فروش شروع می‌کنیم؛ نه از تبلیغ بیشتر.',
    items:[
      ['۱','بازنویسی پیشنهاد','نتیجه، مخاطب و تفاوت کارت را در یک جمله روشن می‌کنیم.'],
      ['۲','ساخت بسته‌های فروش','گزینه‌های خرید را ساده و قابل مقایسه می‌کنیم.'],
      ['۳','آماده‌سازی پاسخ مشتری','سؤال‌ها و مخالفت‌های پرتکرار را به پاسخ‌های کوتاه تبدیل می‌کنیم.']
    ]
  },
  content:{
    title:'هوشکس می‌تواند محتوا را به هدف فروش وصل کند',
    copy:'اگر انتشار داری اما نتیجه‌اش معلوم نیست، ابتدا موضوع‌ها، مخاطب و اقدام نهایی هر محتوا را مشخص می‌کنیم.',
    items:[
      ['۱','نقشه موضوع‌های محتوا','سه تا پنج موضوع ثابت متناسب با مشتری و محصولت مشخص می‌کنیم.'],
      ['۲','ایده و شروع محتوا','از سؤال‌ها و دردهای واقعی مشتری، ایده و شروع جذاب می‌سازیم.'],
      ['۳','اتصال به فروش','برای هر نوع محتوا یک اقدام بعدی مشخص تعریف می‌کنیم.']
    ]
  },
  sales:{
    title:'هوشکس می‌تواند مسیر فروش را ساده و قابل پیگیری کند',
    copy:'اگر علاقه‌مند داری اما خرید کم است، مسیر بین اولین تماس و پرداخت را بررسی و نقاط ریزش را مشخص می‌کنیم.',
    items:[
      ['۱','ترسیم مراحل فروش','مراحل پیام، تماس، ارائه پیشنهاد، پیگیری و پرداخت را مشخص می‌کنیم.'],
      ['۲','متن پاسخ و پیگیری','برای سؤال‌ها و مخالفت‌های پرتکرار متن آماده می‌سازیم.'],
      ['۳','جدول اندازه‌گیری','یک روش ساده برای ثبت علاقه‌مند، پیگیری و خرید ایجاد می‌کنیم.']
    ]
  },
  retention:{
    title:'هوشکس می‌تواند فروش دوباره و پیگیری مشتری را منظم کند',
    copy:'اگر بعد از خرید ارتباط قطع می‌شود، روی پیگیری، پیشنهاد بعدی و ثبت اطلاعات مشتری کار می‌کنیم.',
    items:[
      ['۱','پیام بعد از خرید','متن پیگیری رضایت و تجربه مشتری را آماده می‌کنیم.'],
      ['۲','پیشنهاد خرید دوباره','محصول یا خدمت بعدی مناسب مشتری فعلی را تعریف می‌کنیم.'],
      ['۳','جدول پیگیری هفتگی','اطلاعات اصلی فروش و بازگشت مشتری را در یک ساختار ساده جمع می‌کنیم.']
    ]
  }
};

let current = 0;
let answers = Array(questions.length).fill(null);
let profile = {name:'', type:''};
let lastResult = null;

const $ = id => document.getElementById(id);
const screens = [...document.querySelectorAll('.screen')];
function showScreen(id){
  screens.forEach(s=>s.classList.toggle('active',s.id===id));
  window.scrollTo({top:0,behavior:'smooth'});
}

$('start-btn').addEventListener('click',()=>showScreen('screen-profile'));
$('profile-form').addEventListener('submit',e=>{
  e.preventDefault();
  profile.name=$('business-name').value.trim();
  profile.type=$('business-type').value;
  if(!profile.type) return;
  current=0;
  renderQuestion();
  showScreen('screen-quiz');
});
$('close-quiz').addEventListener('click',()=>showScreen('screen-home'));
$('prev-btn').addEventListener('click',()=>{
  if(current>0){current--;renderQuestion();}
  else{showScreen('screen-profile');}
});
$('restart-btn').addEventListener('click',()=>{
  answers=Array(questions.length).fill(null);
  current=0;
  showScreen('screen-home');
});

function renderQuestion(){
  const q=questions[current];
  $('question-step').textContent=`${String(current+1).padStart(2,'0')} / ${String(questions.length).padStart(2,'0')}`;
  $('question-title').textContent=q.title;
  $('question-hint').textContent=q.hint;
  $('category-tag').textContent=q.tag;
  $('progress-bar').style.width=`${((current+1)/questions.length)*100}%`;
  $('answers').innerHTML='';

  q.options.forEach(([label,score],i)=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='answer-btn'+(answers[current]===score?' selected':'');
    b.innerHTML=`<span class="answer-key">${i+1}</span><span>${label}</span>`;
    b.addEventListener('click',()=>selectAnswer(score));
    $('answers').appendChild(b);
  });
}

function selectAnswer(score){
  answers[current]=score;
  [...document.querySelectorAll('.answer-btn')].forEach((b,i)=>{
    b.classList.toggle('selected',questions[current].options[i][1]===score);
  });
  setTimeout(()=>{
    if(current<questions.length-1){
      current++;
      renderQuestion();
    }else{
      finishQuiz();
    }
  },180);
}

function finishQuiz(){
  showScreen('screen-processing');
  setTimeout(()=>{
    lastResult=calculateResult();
    renderResult(lastResult);
    showScreen('screen-result');
  },1300);
}

function calculateResult(){
  const groups={acquisition:[],offer:[],content:[],sales:[],retention:[]};
  questions.forEach((q,i)=>groups[q.category].push(answers[i]||0));
  const categoryScores={};
  Object.entries(groups).forEach(([k,v])=>{
    categoryScores[k]=Math.round(v.reduce((a,b)=>a+b,0)/v.length*10);
  });
  const score=Math.round(Object.values(categoryScores).reduce((a,b)=>a+b,0)/Object.keys(categoryScores).length);
  const sorted=Object.entries(categoryScores).sort((a,b)=>a[1]-b[1]);
  const weakest=sorted[0][0];
  const strongest=sorted[sorted.length-1][0];

  let level,summary;
  if(score<35){
    level='نیازمند تثبیت پایه‌ها';
    summary='چند بخش اصلی هنوز نامنظم است. بهتر است فعلاً فقط ضعیف‌ترین محور را اصلاح کنی و بعد دوباره ارزیابی بگیری.';
  }else if(score<50){
    level='پایه‌ها در حال شکل‌گیری';
    summary='بخشی از کار جلو رفته، اما یک یا دو مشکل اصلی هنوز نتیجه را محدود می‌کند. اولویت پایین صفحه را اجرا کن.';
  }else if(score<70){
    level='قابل توسعه';
    summary='ساختار اولیه وجود دارد. بیشترین بازده فعلی از اصلاح ضعیف‌ترین محور و ثبت نتیجه همان تغییر به دست می‌آید.';
  }else if(score<85){
    level='آماده توسعه منظم';
    summary='بیشتر بخش‌ها وضعیت مناسبی دارند. تمرکز بعدی باید روی اندازه‌گیری، بهبود تبدیل و تکرار کارهای مؤثر باشد.';
  }else{
    level='ساختار نسبتاً منظم';
    summary='پاسخ‌ها نشان می‌دهد پنج محور اصلی نسبتاً متعادل‌اند. مرحله بعد، بررسی داده واقعی فروش و آزمایش‌های دقیق‌تر است.';
  }

  return {score,categoryScores,weakest,strongest,level,summary};
}

function renderResult(r){
  const name=profile.name ? ` «${profile.name}»` : '';
  $('score-number').textContent=r.score;
  $('score-level').textContent=r.level;
  $('score-summary').textContent=`برای${name} ${r.summary}`;
  $('score-ring').style.setProperty('--score',r.score);

  const weak=categoryMeta[r.weakest];
  const strong=categoryMeta[r.strongest];
  const help=hoshexHelpBank[r.weakest];

  $('bottleneck-title').textContent=weak.weak;
  $('bottleneck-copy').textContent=weak.copy;
  $('strength-title').textContent=strong.name;
  $('strength-copy').textContent=strong.strength;

  $('metrics-list').innerHTML='';
  Object.entries(r.categoryScores).forEach(([key,score])=>{
    const row=document.createElement('div');
    row.className='metric-row';
    row.innerHTML=`<span class="metric-name">${categoryMeta[key].name}</span><div class="metric-track"><div class="metric-fill" data-width="${score}%"></div></div><span class="metric-score">${score}</span>`;
    $('metrics-list').appendChild(row);
  });
  requestAnimationFrame(()=>setTimeout(()=>{
    document.querySelectorAll('.metric-fill').forEach(el=>el.style.width=el.dataset.width);
  },100));

  $('actions-list').innerHTML='';
  actionBank[r.weakest].forEach(([title,copy,day],i)=>{
    const row=document.createElement('div');
    row.className='action-row';
    row.innerHTML=`<span class="action-num">۰${i+1}</span><div><h4>${title}</h4><p>${copy}</p></div><span class="action-day">${day}</span>`;
    $('actions-list').appendChild(row);
  });

  $('hoshex-help-title').textContent=help.title;
  $('hoshex-help-copy').textContent=help.copy;
  $('hoshex-help-list').innerHTML='';
  help.items.forEach(([num,title,copy])=>{
    const item=document.createElement('div');
    item.className='hoshex-help-item';
    item.innerHTML=`<span>مرحله ${num}</span><b>${title}</b><p>${copy}</p>`;
    $('hoshex-help-list').appendChild(item);
  });

  localStorage.setItem('hoshexGrowthAssessment',JSON.stringify({profile,result:r,date:new Date().toISOString()}));
}

function resultText(){
  if(!lastResult) return '';
  const weak=categoryMeta[lastResult.weakest];
  const help=hoshexHelpBank[lastResult.weakest];
  return `نتیجه ارزیابی رشد هوشکس${profile.name?` برای ${profile.name}`:''}\nامتیاز کلی: ${lastResult.score} از ۱۰۰ — ${lastResult.level}\nاولویت اول: ${weak.name}\n${weak.weak}\n\nسه کار برای ۷ روز بعد:\n${actionBank[lastResult.weakest].map((a,i)=>`${i+1}. ${a[0]}`).join('\n')}\n\nهوشکس کجا می‌تواند کمک کند؟\n${help.title}`;
}

$('copy-btn').addEventListener('click',async()=>{
  try{
    await navigator.clipboard.writeText(resultText());
    toast('خلاصه نتیجه کپی شد');
  }catch{
    toast('کپی خودکار در این مرورگر فعال نیست');
  }
});

$('share-btn').addEventListener('click',async()=>{
  const text=resultText();
  if(navigator.share){
    try{await navigator.share({title:'ارزیابی رشد هوشکس',text});}catch{}
  }else{
    try{
      await navigator.clipboard.writeText(text);
      toast('نتیجه کپی شد؛ حالا می‌توانی آن را بفرستی');
    }catch{
      toast('اشتراک‌گذاری در این مرورگر پشتیبانی نمی‌شود');
    }
  }
});

function toast(msg){
  $('toast').textContent=msg;
  $('toast').classList.add('show');
  setTimeout(()=>$('toast').classList.remove('show'),2200);
}

document.addEventListener('keydown',e=>{
  if(!$('screen-quiz').classList.contains('active')) return;
  const n=Number(e.key);
  if(n>=1&&n<=5){
    const opt=questions[current].options[n-1];
    if(opt) selectAnswer(opt[1]);
  }
  if(e.key==='ArrowRight'&&current>0){
    current--;
    renderQuestion();
  }
});
