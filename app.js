const questions = [
  {
    category:'acquisition', tag:'جذب مشتری',
    title:'مشتری‌های جدید معمولاً از کجا پیدات می‌کنن؟',
    hint:'می‌خوایم بفهمیم جریان جذب مشتریت چقدر قابل پیش‌بینیه.',
    options:[
      ['تقریباً هیچ جریان ثابتی ندارم',2],['بیشتر شانسی، معرفی یا آشناها',4],['از اینستاگرام یا یک کانال مشخص',6],['چند کانال فعال دارم ولی نامنظمه',8],['سیستم مشخص و قابل اندازه‌گیری دارم',10]
    ]
  },
  {
    category:'acquisition', tag:'جذب مشتری',
    title:'اگر امروز تبلیغ و تولید محتوا رو قطع کنی، باز هم مشتری میاد؟',
    hint:'این سؤال وابستگی رشدت به فعالیت روزانه رو می‌سنجه.',
    options:[['تقریباً نه',2],['خیلی کم',4],['تا حدی',6],['بله، از چند مسیر',8],['بله، سیستم ورودی پایدار دارم',10]]
  },
  {
    category:'offer', tag:'پیشنهاد فروش',
    title:'مشتری چقدر سریع می‌فهمه چرا باید از تو بخره؟',
    hint:'یک آفر خوب باید ارزش، تفاوت و دلیل اقدام رو واضح کنه.',
    options:[['خودمم دقیق نمی‌دونم چی بگم',2],['نیاز به توضیح زیاد دارم',4],['معمولاً متوجه میشه',6],['ارزش پیشنهادم واضحه',8],['آفرم واضح، متفاوت و سخت‌ردکردنیه',10]]
  },
  {
    category:'offer', tag:'پیشنهاد فروش',
    title:'محصول یا خدمتت پکیج و ساختار فروش مشخص داره؟',
    hint:'ببینیم مشتری با یک انتخاب روشن روبه‌روست یا با لیست پراکنده خدمات.',
    options:[['نه، موردی قیمت میدم',2],['یه لیست خدمات دارم',4],['چند گزینه دارم ولی گیج‌کننده‌ست',6],['پکیج‌های مشخص دارم',8],['پکیج، مزیت و پلن ارتقا کاملاً مشخصه',10]]
  },
  {
    category:'content', tag:'محتوا و برند',
    title:'محتوات چقدر منظم و هدفمند منتشر میشه؟',
    hint:'منظم بودن کافی نیست؛ محتوا باید به یک هدف رشد وصل باشه.',
    options:[['تقریباً محتوا ندارم',2],['خیلی نامنظم',4],['منظم ولی بدون استراتژی روشن',6],['تقویم و چند ستون محتوایی دارم',8],['منظم، داده‌محور و متصل به فروشه',10]]
  },
  {
    category:'content', tag:'محتوا و برند',
    title:'آیا مخاطب با دیدن محتوات سریع می‌فهمه برندت برای چه کسیه؟',
    hint:'اینجا وضوح جایگاه برند و پیام اصلی رو بررسی می‌کنیم.',
    options:[['نه، خیلی پراکنده‌ست',2],['تا حد کمی',4],['نسبتاً مشخصه',6],['واضحه که برای چه کسی هستم',8],['هویت، لحن و جایگاهم کاملاً متمایزه',10]]
  },
  {
    category:'sales', tag:'فروش و تبدیل',
    title:'وقتی یک نفر علاقه نشون میده، مسیر تبدیلش به مشتری چقدره؟',
    hint:'از دایرکت و تماس تا پرداخت؛ آیا مسیر مشخصی داری؟',
    options:[['هیچ مسیر مشخصی ندارم',2],['هر بار یه جور پیش میره',4],['یه روند تقریبی دارم',6],['اسکریپت و مراحل مشخص دارم',8],['مسیر فروش استاندارد و قابل سنجشه',10]]
  },
  {
    category:'sales', tag:'فروش و تبدیل',
    title:'می‌دونی چند درصد علاقه‌مندها در نهایت خرید می‌کنن؟',
    hint:'اعداد ساده فروش، تصمیم‌گیریت رو چند برابر دقیق‌تر می‌کنن.',
    options:[['اصلاً اندازه نمی‌گیرم',2],['فقط حدس می‌زنم',4],['گاهی بررسی می‌کنم',6],['نرخ تبدیل تقریبی دارم',8],['دقیق اندازه می‌گیرم و بهینه می‌کنم',10]]
  },
  {
    category:'retention', tag:'بازگشت مشتری',
    title:'بعد از اولین خرید، برای برگردوندن مشتری چه سیستمی داری؟',
    hint:'رشد فقط مشتری جدید نیست؛ مشتری قبلی معمولاً ارزان‌ترین فرصت رشده.',
    options:[['هیچی',2],['فقط اگر خودش برگرده',4],['گاهی پیگیری یا پیام میدم',6],['برنامه پیگیری و پیشنهاد مجدد دارم',8],['سیستم وفاداری/تکرار خرید منظم دارم',10]]
  },
  {
    category:'retention', tag:'بازگشت مشتری',
    title:'تصمیم‌های رشدت بیشتر بر اساس داده‌ست یا حس؟',
    hint:'آخرین سؤال؛ می‌خوایم بلوغ مدیریتی و یادگیری از عملکرد رو بسنجیم.',
    options:[['تقریباً کاملاً حسی',2],['بیشتر حسی',4],['ترکیبی',6],['بیشتر داده‌محور',8],['شاخص‌ها رو منظم ثبت و مرور می‌کنم',10]]
  }
];

const categoryMeta = {
  acquisition:{name:'جذب مشتری', weak:'ورودی مشتری قابل پیش‌بینی نیست', copy:'مشکل اصلی تو کمبود محتوا نیست؛ اول باید یک مسیر ثابت برای ورود مشتری بسازی و اندازه بگیری.', strength:'جریان جذب مشتریت نسبتاً سالمه؛ می‌تونی از این ورودی برای تست آفر و فروش بیشتر استفاده کنی.'},
  offer:{name:'پیشنهاد فروش', weak:'آفرت هنوز به‌اندازه کافی واضح و قوی نیست', copy:'احتمالاً بخشی از تقاضا وجود داره، اما مشتری دلیل کافی برای انتخاب سریع تو پیدا نمی‌کنه.', strength:'آفرت یکی از اهرم‌های رشدته؛ از همین وضوح برای کمپین‌ها و قیمت‌گذاری بهتر استفاده کن.'},
  content:{name:'محتوا و برند', weak:'پیام و محتوای برند هنوز موتور رشد نیست', copy:'محتوا یا نامنظمه یا به یک پیام و هدف مشخص وصل نیست. این باعث میشه دیده بشی ولی لزوماً انتخاب نشی.', strength:'محتوا و جایگاه برندت از نقاط قوتته؛ حالا باید این توجه رو بهتر به فروش وصل کنی.'},
  sales:{name:'فروش و تبدیل', weak:'علاقه هست، اما تبدیل به خرید نشت داره', copy:'ممکنه مشتری بالقوه داشته باشی اما مسیر فروش، پیگیری یا اندازه‌گیری تبدیل به‌اندازه کافی سیستماتیک نیست.', strength:'فرآیند فروشت نسبتاً منظم و قابل اتکاست؛ با افزایش ورودی می‌تونی رشد سریع‌تری بگیری.'},
  retention:{name:'بازگشت مشتری و داده', weak:'رشدت بیش از حد به مشتری جدید وابسته است', copy:'بعد از خرید، ارزش زیادی رها میشه. پیگیری، خرید مجدد و استفاده از داده می‌تونه رشد کم‌هزینه‌تری بسازه.', strength:'در نگهداشت مشتری و تصمیم‌گیری داده‌محور وضعیت خوبی داری؛ این مزیت رو برای رشد پایدار حفظ کن.'}
};

const actionBank = {
  acquisition:[
    ['یک کانال جذب اصلی انتخاب کن','فقط یک مسیر مثل اینستاگرام، معرفی یا تبلیغ محلی رو برای ۷ روز متمرکز تست کن.','روز ۱'],
    ['یک پیشنهاد ورودی بساز','یک دلیل ساده و کم‌ریسک برای اولین تماس مشتری تعریف کن؛ مثل مشاوره کوتاه یا نمونه.','روز ۲–۳'],
    ['ورودی‌ها رو ثبت کن','هر مشتری جدید رو با منبع ورودش ثبت کن تا آخر هفته بدونی کدوم کانال واقعاً جواب داده.','روز ۱–۷']
  ],
  offer:[
    ['آفر رو در یک جمله بازنویسی کن','بگو برای چه کسی، چه نتیجه‌ای و با چه تفاوتی ایجاد می‌کنی؛ بدون توضیح اضافه.','روز ۱'],
    ['۳ پکیج روشن بساز','به‌جای لیست پراکنده، گزینه پایه، اصلی و پریمیوم با تفاوت مشخص طراحی کن.','روز ۲–۴'],
    ['آفر رو با ۵ مشتری تست کن','جمله و پکیج جدید رو به مشتری واقعی نشون بده و دقیقاً اعتراض‌هاشون رو ثبت کن.','روز ۵–۷']
  ],
  content:[
    ['۳ ستون محتوا تعیین کن','آموزش، اثبات/اعتماد و فروش را برای برندت شخصی‌سازی کن.','روز ۱'],
    ['۵ هوک از درد مشتری بساز','به‌جای معرفی خودت، محتوای این هفته رو از سؤال‌ها و ترس‌های مشتری شروع کن.','روز ۲–۳'],
    ['یک CTA ثابت تست کن','همه محتوا رو به یک اقدام مشخص مثل دایرکت، فرم یا محصول هدایت کن.','روز ۴–۷']
  ],
  sales:[
    ['مسیر فروش رو روی کاغذ بکش','از اولین پیام تا پرداخت، مراحل و نقاط ریزش رو مشخص کن.','روز ۱'],
    ['۳ اعتراض پرتکرار رو جواب‌سازی کن','برای «گرونه»، «فکر می‌کنم» و اعتراض خاص بازار خودت پاسخ کوتاه آماده کن.','روز ۲–۳'],
    ['نرخ تبدیل رو اندازه بگیر','تعداد علاقه‌مندها و تعداد خریدها رو ۷ روز ثبت کن؛ بدون عدد، بهینه‌سازی ممکن نیست.','روز ۱–۷']
  ],
  retention:[
    ['یک پیام پیگیری بعد خرید بساز','۲۴ تا ۷۲ ساعت بعد خرید، تجربه مشتری رو بپرس و ارتباط رو زنده نگه دار.','روز ۱–۲'],
    ['یک پیشنهاد خرید مجدد طراحی کن','برای مشتری فعلی یک قدم بعدی منطقی، مکمل یا ارتقا تعریف کن.','روز ۳–۴'],
    ['داشبورد هفتگی ساده بساز','فروش، مشتری جدید، مشتری تکراری و نرخ تبدیل رو هر هفته ثبت کن.','روز ۱–۷']
  ]
};

let current = 0;
let answers = Array(questions.length).fill(null);
let profile = {name:'', type:''};
let lastResult = null;

const $ = id => document.getElementById(id);
const screens = [...document.querySelectorAll('.screen')];
function showScreen(id){screens.forEach(s=>s.classList.toggle('active',s.id===id));window.scrollTo({top:0,behavior:'smooth'});}

$('start-btn').addEventListener('click',()=>showScreen('screen-profile'));
$('profile-form').addEventListener('submit',e=>{
  e.preventDefault();
  profile.name=$('business-name').value.trim();
  profile.type=$('business-type').value;
  if(!profile.type) return;
  current=0; renderQuestion(); showScreen('screen-quiz');
});
$('close-quiz').addEventListener('click',()=>showScreen('screen-home'));
$('prev-btn').addEventListener('click',()=>{if(current>0){current--;renderQuestion();}else{showScreen('screen-profile');}});
$('restart-btn').addEventListener('click',()=>{answers=Array(questions.length).fill(null);current=0;showScreen('screen-home');});

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
  [...document.querySelectorAll('.answer-btn')].forEach((b,i)=>b.classList.toggle('selected',questions[current].options[i][1]===score));
  setTimeout(()=>{
    if(current<questions.length-1){current++;renderQuestion();}
    else{finishQuiz();}
  },180);
}

function finishQuiz(){
  showScreen('screen-processing');
  setTimeout(()=>{lastResult=calculateResult();renderResult(lastResult);showScreen('screen-result');},1450);
}

function calculateResult(){
  const groups={acquisition:[],offer:[],content:[],sales:[],retention:[]};
  questions.forEach((q,i)=>groups[q.category].push(answers[i]||0));
  const categoryScores={};
  Object.entries(groups).forEach(([k,v])=>categoryScores[k]=Math.round(v.reduce((a,b)=>a+b,0)/v.length*10));
  const score=Math.round(Object.values(categoryScores).reduce((a,b)=>a+b,0)/Object.keys(categoryScores).length);
  const sorted=Object.entries(categoryScores).sort((a,b)=>a[1]-b[1]);
  const weakest=sorted[0][0], strongest=sorted[sorted.length-1][0];
  let level,summary;
  if(score<35){level='حالت بقا';summary='پایه‌های رشد هنوز ناپایدارن. خبر خوب اینه که با تمرکز روی یک گلوگاه، پیشرفت سریع کاملاً ممکنه.';}
  else if(score<50){level='شروعِ رشد';summary='چند قطعه مهم سر جاشه، اما هنوز یک یا دو نشتی اصلی جلوی شتاب گرفتن رشد رو می‌گیره.';}
  else if(score<70){level='در حال رشد';summary='بیزنس تو ظرفیت رشد خوبی داره. الان زمان سیستم‌سازی و حذف گلوگاه‌های مشخصه.';}
  else if(score<85){level='آماده مقیاس';summary='بخش بزرگی از موتور رشد کار می‌کنه. با داده و تمرکز روی ضعیف‌ترین محور، می‌تونی سریع‌تر مقیاس بگیری.';}
  else{level='ماشین رشد';summary='سیستم رشدت بالغ و متوازن به نظر می‌رسه. تمرکز بعدی باید روی آزمایش‌های دقیق و مقیاس سودآور باشه.';}
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
  $('bottleneck-title').textContent=weak.weak;
  $('bottleneck-copy').textContent=weak.copy;
  $('strength-title').textContent=strong.name;
  $('strength-copy').textContent=strong.strength;

  $('metrics-list').innerHTML='';
  Object.entries(r.categoryScores).forEach(([key,score])=>{
    const row=document.createElement('div');row.className='metric-row';
    row.innerHTML=`<span class="metric-name">${categoryMeta[key].name}</span><div class="metric-track"><div class="metric-fill" data-width="${score}%"></div></div><span class="metric-score">${score}</span>`;
    $('metrics-list').appendChild(row);
  });
  requestAnimationFrame(()=>setTimeout(()=>document.querySelectorAll('.metric-fill').forEach(el=>el.style.width=el.dataset.width),100));

  $('actions-list').innerHTML='';
  actionBank[r.weakest].forEach(([title,copy,day],i)=>{
    const row=document.createElement('div');row.className='action-row';
    row.innerHTML=`<span class="action-num">0${i+1}</span><div><h4>${title}</h4><p>${copy}</p></div><span class="action-day">${day}</span>`;
    $('actions-list').appendChild(row);
  });
  localStorage.setItem('hoshexGrowLastResult',JSON.stringify({profile,result:r,date:new Date().toISOString()}));
}

function resultText(){
  if(!lastResult) return '';
  const w=categoryMeta[lastResult.weakest];
  return `نتیجه Grow Scanner${profile.name?` برای ${profile.name}`:''}\nامتیاز رشد: ${lastResult.score}/100 — ${lastResult.level}\nگلوگاه اصلی: ${w.name}\n${w.weak}\n\nنسخه رشد ۷ روزه:\n${actionBank[lastResult.weakest].map((a,i)=>`${i+1}. ${a[0]}`).join('\n')}\n\nHoshex Grow`;
}

$('copy-btn').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(resultText());toast('خلاصه نتیجه کپی شد ⚡');}catch{toast('کپی خودکار در این مرورگر فعال نیست');}
});
$('share-btn').addEventListener('click',async()=>{
  const text=resultText();
  if(navigator.share){try{await navigator.share({title:'Hoshex Grow Scanner',text});}catch{} }
  else{try{await navigator.clipboard.writeText(text);toast('نتیجه کپی شد؛ حالا می‌تونی به اشتراک بذاری');}catch{toast('اشتراک‌گذاری در این مرورگر پشتیبانی نمی‌شود');}}
});
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2200);}

document.addEventListener('keydown',e=>{
  if(!$('screen-quiz').classList.contains('active')) return;
  const n=Number(e.key);
  if(n>=1&&n<=5){const opt=questions[current].options[n-1];if(opt)selectAnswer(opt[1]);}
  if(e.key==='ArrowRight'&&current>0){current--;renderQuestion();}
});
