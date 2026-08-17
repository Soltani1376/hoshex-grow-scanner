(() => {
  const fa = n => String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
  const escapeHtml = value => String(value || '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  const typeFallback = {
    'فروشگاه / خرده‌فروشی':'محصولت',
    'زیبایی و خدمات شخصی':'خدمتت',
    'آموزش / مدرس / کوچ':'آموزشت',
    'رستوران / کافه / خوراکی':'محصول یا منویت',
    'خدمات حرفه‌ای':'خدمتت',
    'تولید محتوا / هنرمند':'خدمت یا اثرت',
    'فریلنسر':'خدمتت',
    'فروش آنلاین':'محصولت',
    'کسب‌وکار محلی':'خدمت یا محصولت',
    'سایر':'پیشنهادت'
  };

  function getOffer(){
    const entered = document.getElementById('business-offer')?.value.trim();
    return entered || typeFallback[profile.type] || 'محصول یا خدمتت';
  }

  const typeHooks = {
    'فروشگاه / خرده‌فروشی': offer => [
      `قبل از اینکه برای ${offer} فقط قیمت را مقایسه کنی، این ۳ نکته را چک کن.`,
      `اگر بین چند مدل ${offer} مرددی، این مقایسه کوتاه انتخابت را راحت‌تر می‌کند.`,
      `این اشتباه موقع خرید ${offer} باعث می‌شود بیشتر پول بدهی ولی انتخاب بهتری نکنی.`
    ],
    'زیبایی و خدمات شخصی': offer => [
      `قبل از رزرو ${offer} این ۳ سؤال را حتماً بپرس.`,
      `اگر برای ${offer} فقط عکس نتیجه را می‌بینی، یک نکته مهم را داری نادیده می‌گیری.`,
      `برای اینکه نتیجه ${offer} بیشتر به چیزی که می‌خواهی نزدیک شود، قبلش این را مشخص کن.`
    ],
    'آموزش / مدرس / کوچ': offer => [
      `اگر ${offer} را شروع کردی ولی هنوز به نتیجه نرسیدی، احتمالاً مشکل از اینجاست.`,
      `قبل از اینکه یک دوره دیگر برای ${offer} بخری، این ۳ چیز را بررسی کن.`,
      `بزرگ‌ترین اشتباه در یادگیری ${offer} این است که فقط یاد بگیری و چیزی اجرا نکنی.`
    ],
    'رستوران / کافه / خوراکی': offer => [
      `اگر همیشه برای سفارش ${offer} بین چند گزینه مرددی، این انتخاب را امتحان کن.`,
      `این ترکیب ساده می‌تواند تجربه ${offer} را کاملاً عوض کند.`,
      `قبل از سفارش بعدی ${offer} فقط یک بار این نکته را امتحان کن.`
    ],
    'خدمات حرفه‌ای': offer => [
      `قبل از اینکه برای ${offer} هزینه کنی، اول این ۳ سؤال را از ارائه‌دهنده بپرس.`,
      `اگر نمی‌دانی واقعاً به ${offer} نیاز داری یا نه، این نشانه‌ها را بررسی کن.`,
      `بیشتر مشتری‌ها موقع انتخاب ${offer} روی چیز اشتباهی تمرکز می‌کنند.`
    ],
    'تولید محتوا / هنرمند': offer => [
      `اگر برای ${offer} ایده زیاد داری ولی خروجی کم، این روش را امتحان کن.`,
      `برای بهتر دیده شدن ${offer} لازم نیست هر روز چیز جدید بسازی؛ این کار مهم‌تر است.`,
      `اگر مخاطب ${offer} را می‌بیند ولی واکنش نمی‌دهد، شروع محتوا را این‌طور عوض کن.`
    ],
    'فریلنسر': offer => [
      `اگر مشتری برای ${offer} فقط قیمت می‌پرسد، احتمالاً این بخش پیشنهادت مبهم است.`,
      `قبل از قبول پروژه ${offer} این ۳ سؤال را بپرس تا وسط کار به مشکل نخوری.`,
      `برای فروش بهتر ${offer} نمونه‌کار کافی نیست؛ مشتری باید این را هم بفهمد.`
    ],
    'فروش آنلاین': offer => [
      `قبل از خرید آنلاین ${offer} این ۳ نکته را چک کن.`,
      `اگر برای انتخاب ${offer} بین چند صفحه مرددی، این معیار تصمیم را ساده می‌کند.`,
      `این اشتباه در معرفی ${offer} باعث می‌شود مشتری صفحه را ببیند ولی خرید نکند.`
    ],
    'کسب‌وکار محلی': offer => [
      `اگر برای ${offer} دنبال یک گزینه مطمئن نزدیک خودت هستی، این ۳ نکته را چک کن.`,
      `قبل از انتخاب ${offer} فقط به نزدیک بودن یا قیمت نگاه نکن؛ این مورد مهم‌تر است.`,
      `مشتری‌های محلی موقع انتخاب ${offer} معمولاً این سؤال را دیر می‌پرسند.`
    ],
    'سایر': offer => [
      `قبل از اینکه برای ${offer} تصمیم بگیری، این ۳ نکته را بررسی کن.`,
      `اگر درباره ${offer} مرددی، این مقایسه کوتاه کمکت می‌کند سریع‌تر تصمیم بگیری.`,
      `بیشتر آدم‌ها موقع انتخاب ${offer} یک نکته مهم را نادیده می‌گیرند.`
    ]
  };

  function acquisitionPieces(offer){
    return [
      {
        label:'متن استوری امروز',
        title:'مکالمه را با سؤال شروع کن',
        text:`اگر درباره «${offer}» سؤال داری یا بین چند انتخاب مرددی، همینجا یک پیام بده و فقط بگو مهم‌ترین دغدغه‌ات چیه. خودم می‌گم از کجا شروع کنی.`
      },
      {
        label:'پیام برای مشتری‌های قبلی',
        title:'از آدم‌هایی که قبلاً به تو اعتماد کرده‌اند شروع کن',
        text:`سلام. این هفته دارم روی بهتر کردن تجربه «${offer}» کار می‌کنم. اگر یک سؤال، ایراد یا چیزی بوده که موقع انتخابش برات مبهم بوده، برام بنویس. جواب‌هات مستقیم روی چیزی که بهترش می‌کنم اثر می‌ذاره.`
      },
      {
        label:'متن معرفی دهان‌به‌دهان',
        title:'معرفی گرفتن را راحت کن',
        text:`اگر کسی اطرافت درباره «${offer}» دنبال راهنمایی یا انتخاب مطمئن‌تره، این پیام رو براش بفرست. اول کمک می‌کنم بفهمه چه گزینه‌ای به دردش می‌خوره؛ لازم نیست از همون اول تصمیم به خرید داشته باشه.`
      }
    ];
  }

  function offerPieces(offer){
    return [
      {
        label:'متن پیشنهادی آماده',
        title:'به‌جای توضیح طولانی، این را تست کن',
        text:`برای «${offer}» قرار نیست فقط یک گزینه جلوت بذاریم. اول می‌فهمیم دقیقاً چه نتیجه‌ای می‌خوای، بعد مناسب‌ترین مسیر رو پیشنهاد می‌دیم تا بین انتخاب‌های اضافه و هزینه بی‌دلیل گیر نکنی.`
      },
      {
        label:'نسخه کوتاه برای معرفی',
        title:'برای بیو، استوری یا ابتدای گفت‌وگو',
        text:`«${offer}» برای کسی که می‌خواد سریع‌تر به انتخاب درست برسه، بدون سردرگمی بین گزینه‌های اضافه.`
      },
      {
        label:'پیام قبل از قیمت دادن',
        title:'اول مسئله مشتری را روشن کن',
        text:`حتماً قیمت رو می‌گم. فقط قبلش سه مورد رو بگو تا گزینه اشتباه پیشنهاد ندم: دقیقاً چه نتیجه‌ای می‌خوای؟ الان مهم‌ترین مشکلت چیه؟ و موقع انتخاب «${offer}» چه چیزی برات مهم‌تره؛ قیمت، سرعت یا کیفیت نتیجه؟`
      }
    ];
  }

  function contentPieces(offer){
    const maker = typeHooks[profile.type] || typeHooks['سایر'];
    return maker(offer).map((text,i)=>({
      label:`شروع محتوای ${fa(i+1)}`,
      title:i===0?'برای محتوای آموزشی':i===1?'برای محتوای اعتمادساز':'برای محتوای فروش نرم',
      text
    }));
  }

  function salesPieces(offer){
    return [
      {
        label:'پاسخ آماده به «گرونه»',
        title:'بحث قیمت را به انتخاب برگردان',
        text:`کاملاً قابل درکه. قبل از اینکه فقط روی قیمت «${offer}» تصمیم بگیری، بگو مهم‌ترین نتیجه‌ای که ازش می‌خوای چیه. اگر گزینه ساده‌تر یا کم‌هزینه‌تری واقعاً به کارت بخوره، همون رو پیشنهاد می‌دم.`
      },
      {
        label:'پاسخ آماده به «فکر می‌کنم»',
        title:'فشار نده؛ ابهام را پیدا کن',
        text:`حتماً، عجله‌ای نیست. فقط برای اینکه تصمیم‌گیریت راحت‌تر بشه، الان بیشتر روی کدوم بخش مرددی: نتیجه‌ای که می‌گیری، قیمت، زمان یا اینکه مطمئن نیستی «${offer}» مناسب تو هست یا نه؟`
      },
      {
        label:'پیگیری بعد از بی‌جواب ماندن',
        title:'یک پیگیری کوتاه و محترمانه',
        text:`سلام، پیام قبلی رو فقط برای یک پیگیری کوتاه می‌فرستم. اگر هنوز درباره «${offer}» سؤال یا ابهامی داری بگو تا همون بخش رو روشن کنم. اگر هم فعلاً زمانش نیست، کاملاً اوکیه.`
      }
    ];
  }

  function retentionPieces(offer){
    return [
      {
        label:'پیام ۲۴ تا ۷۲ ساعت بعد',
        title:'بعد از خرید ناپدید نشو',
        text:`سلام، خواستم مطمئن شم تجربه‌ات از «${offer}» خوب بوده. اگر جایی سؤال، ابهام یا مشکلی داشتی همینجا بگو تا پیگیریش کنم. یک نکته هم خیلی کمکم می‌کنه: اگر بخوای فقط یک چیز رو بهتر کنیم، اون چیه؟`
      },
      {
        label:'پیام بازگشت مشتری',
        title:'فروش دوباره را با فشار شروع نکن',
        text:`سلام. چون قبلاً «${offer}» رو از ما تجربه کردی، خواستم قبل از بقیه ازت بپرسم الان نیاز بعدی یا مشکلی هست که بتونیم براش کمک کنیم؟ اگر بگی الان کجای کاری، مناسب‌ترین قدم بعدی رو پیشنهاد می‌دم.`
      },
      {
        label:'درخواست معرفی',
        title:'مشتری راضی را به مسیر جذب وصل کن',
        text:`اگر تجربه «${offer}» برات مفید بوده و کسی رو می‌شناسی که همین نیاز رو داره، خوشحال می‌شم این پیام رو براش بفرستی. اول راهنماییش می‌کنم ببینه اصلاً این گزینه مناسبش هست یا نه.`
      }
    ];
  }

  const builders = {
    acquisition: acquisitionPieces,
    offer: offerPieces,
    content: contentPieces,
    sales: salesPieces,
    retention: retentionPieces
  };

  function copyText(text, button){
    const done = () => {
      const old = button.textContent;
      button.textContent = 'کپی شد';
      button.classList.add('copied');
      setTimeout(()=>{button.textContent=old;button.classList.remove('copied');},1400);
    };
    if(navigator.clipboard?.writeText){
      navigator.clipboard.writeText(text).then(done).catch(()=>fallbackCopy(text,done));
    }else fallbackCopy(text,done);
  }

  function fallbackCopy(text, done){
    const t=document.createElement('textarea');
    t.value=text;
    t.style.position='fixed';
    t.style.opacity='0';
    document.body.appendChild(t);
    t.select();
    try{document.execCommand('copy');done();}catch{}
    t.remove();
  }

  function mountPracticalKit(result){
    const actionCard = document.querySelector('.actions-card');
    if(!actionCard) return;

    let section = document.getElementById('practical-workbench');
    if(!section){
      section=document.createElement('article');
      section.id='practical-workbench';
      section.className='practical-workbench glass-card';
      actionCard.insertAdjacentElement('afterend',section);
    }

    const offer = getOffer();
    const pieces = (builders[result.weakest] || contentPieces)(offer);
    const storageKey = `hoshex-practical-${result.weakest}-${profile.type}-${offer}`;
    let doneState = [];
    try{doneState=JSON.parse(localStorage.getItem(storageKey)||'[]');}catch{doneState=[];}

    const titleMap = {
      acquisition:'هوشکس همین الان مسیر جذب را شروع کرده',
      offer:'هوشکس همین الان پیشنهاد فروشت را نوشته',
      content:'هوشکس همین الان سه محتوای اولت را شروع کرده',
      sales:'هوشکس همین الان متن‌های فروش را آماده کرده',
      retention:'هوشکس همین الان پیگیری مشتری را آماده کرده'
    };

    section.innerHTML=`
      <div class="practical-head">
        <div>
          <span class="section-label">از تشخیص تا اجرا</span>
          <h3>${titleMap[result.weakest]}</h3>
          <p>این بخش توصیه نیست؛ خروجی اولیه‌ایه که می‌تونی همین امروز برداری، ویرایش کنی و اجراش کنی.</p>
        </div>
        <div class="practical-progress"><strong id="practical-done-count">۰</strong><span>از ۳ اجرا شد</span></div>
      </div>
      <div class="practical-context">برای: <b>${escapeHtml(profile.name || profile.type)}</b><span>•</span> موضوع اصلی: <b>${escapeHtml(offer)}</b></div>
      <div class="practical-grid" id="practical-grid"></div>
      <div class="practical-next">
        <span>کار امروز</span>
        <p>فقط یکی از متن‌های بالا را بردار و اجرا کن. بعد نتیجه‌اش را ثبت کن؛ تعداد پیام، پاسخ یا فروش. قدم بعدی باید بر اساس همان عدد باشد.</p>
      </div>`;

    const grid=section.querySelector('#practical-grid');
    pieces.forEach((piece,i)=>{
      const card=document.createElement('div');
      card.className='practical-piece'+(doneState.includes(i)?' is-done':'');
      card.innerHTML=`
        <div class="piece-top"><span>${piece.label}</span><span class="piece-index">۰${fa(i+1)}</span></div>
        <h4>${piece.title}</h4>
        <div class="ready-text">${escapeHtml(piece.text)}</div>
        <div class="piece-actions">
          <button type="button" class="copy-ready">کپی متن</button>
          <button type="button" class="mark-done">${doneState.includes(i)?'انجام شد ✓':'اجرا کردم'}</button>
        </div>`;
      card.querySelector('.copy-ready').addEventListener('click',e=>copyText(piece.text,e.currentTarget));
      card.querySelector('.mark-done').addEventListener('click',e=>{
        if(doneState.includes(i)) doneState=doneState.filter(x=>x!==i); else doneState.push(i);
        localStorage.setItem(storageKey,JSON.stringify(doneState));
        card.classList.toggle('is-done',doneState.includes(i));
        e.currentTarget.textContent=doneState.includes(i)?'انجام شد ✓':'اجرا کردم';
        updateCount();
      });
      grid.appendChild(card);
    });

    function updateCount(){
      const el=section.querySelector('#practical-done-count');
      if(el) el.textContent=fa(doneState.length);
    }
    updateCount();
  }

  const originalRenderResult = renderResult;
  renderResult = function(result){
    originalRenderResult(result);
    mountPracticalKit(result);
  };
})();