window.HX = window.HX || {};

(() => {
  const $ = HX.$;
  const state = HX.state;

  // --- Smarter Instagram diagnosis: diagnose the real bottleneck, not just the chosen goal.
  HX.diagnoseInstagram = () => {
    const ig = state.instagram;
    const followers = Math.max(ig.followers, 1);
    const posts = Math.max(ig.posts30, 0);
    const viewRatio = ig.views / followers;
    const estimatedExposures = Math.max(ig.views * Math.max(posts, 1), 1);
    const dmRate = ig.dms30 / estimatedExposures;
    const salesPerDm = ig.dms30 > 0 ? ig.sales30 / ig.dms30 : 0;

    const reachWeak = (followers >= 100 && viewRatio < 0.22) || (followers < 100 && ig.views < 60);
    const conversionWeak = !reachWeak && (ig.dms30 === 0 || dmRate < 0.0015);
    const salesWeak = ig.dms30 >= 3 && (ig.sales30 === 0 || salesPerDm < 0.08);
    const consistencyWeak = posts < 4;

    let key;
    if (salesWeak) key = 'ig-sales';
    else if (conversionWeak) key = 'ig-conversion';
    else if (consistencyWeak) key = 'ig-consistency';
    else if (reachWeak) key = 'ig-reach';
    else if (ig.targetKind === 'dm') key = 'ig-conversion';
    else if (ig.targetKind === 'reach' || ig.targetKind === 'followers') key = 'ig-reach';
    else if (ig.targetKind === 'sales') {
      const enoughConversations = ig.dms30 >= Math.max(3, Math.ceil(posts * 0.75));
      key = enoughConversations ? 'ig-reach' : 'ig-conversion';
    } else key = 'ig-conversion';

    let confidence = 'پایین';
    if (key === 'ig-sales' && ig.dms30 >= 8) confidence = 'متوسط';
    else if (key === 'ig-conversion' && estimatedExposures >= 2000) confidence = 'متوسط';
    else if (key === 'ig-reach' && posts >= 6) confidence = 'متوسط';
    else if (key === 'ig-consistency' && posts <= 2) confidence = 'متوسط';

    const targetLabel = {reach:'میانگین بازدید',followers:'فالوور',dm:'دایرکت مرتبط',sales:'فروش از پیج'}[ig.targetKind] || 'هدف';
    const reasons = {
      'ig-consistency':`در ۳۰ روز اخیر ${HX.fa(posts)} محتوا منتشر شده. هنوز داده کافی برای قضاوت جدی درباره بازدید یا فروش نداریم؛ اول یک ریتم کوچک و قابل ادامه می‌سازیم.`,
      'ig-reach':`پایین‌دستِ قیف فعلاً نشانه بحرانی ندارد، اما برای رشد بیشتر باید افراد بیشتری محتوای مناسب را ببینند. میانگین بازدید فعلی ${HX.fa(ig.views)} با ${HX.fa(ig.followers)} فالوور ثبت شده.`,
      'ig-conversion':`محتوا به اندازه‌ای دیده می‌شود که بتوانیم مرحله بعد را بسنجیم، اما در ۳۰ روز اخیر فقط ${HX.fa(ig.dms30)} دایرکت کاری ثبت شده. اول دعوت به اقدام و دلیل پیام‌دادن را اصلاح می‌کنیم.`,
      'ig-sales':`در ۳۰ روز اخیر ${HX.fa(ig.dms30)} دایرکت کاری و ${HX.fa(ig.sales30)} فروش ثبت شده. چون مکالمه وجود دارد، اولویت فوری‌تر اصلاح پاسخ و پیگیری داخل دایرکت است؛ نه تولید محتوای بیشتر.`
    };

    return HX.makeDiagnosis(
      key,
      reasons[key],
      confidence,
      `این تشخیص از عددهای خوداظهاری ساخته شده و خود پیج را مشاهده نمی‌کند. هدف ثبت‌شده: ${targetLabel} = ${HX.fa(ig.targetValue)}. نتیجه اجرای امروز دوباره این تشخیص را محک می‌زند.`
    );
  };

  // Instagram sales is a sales task, so its feedback must measure conversations and sales, not post views.
  const baseFeedbackTypeFor = HX.feedbackTypeFor;
  HX.feedbackTypeFor = key => key === 'ig-sales' ? 'sales' : baseFeedbackTypeFor(key);

  // Make content outputs use the user's own best-performing topic and sales channel when available.
  const baseContentPackage = HX.contentPackage;
  HX.contentPackage = angle => {
    const pack = baseContentPackage(angle);
    const topic = HX.clean(state.instagram.bestTopic);
    const offer = state.profile.offer;
    const audience = state.profile.audience;
    const channel = state.profile.channel;

    if (state.goal === 'instagram' && topic) {
      const topicLabel = `«${topic}»`;
      pack.copy = `این بار از موضوعی شروع می‌کنیم که قبلاً برای پیجت بهتر جواب داده: ${topicLabel}. هدف اینه که یک زاویه تازه از همون برنده بسازیم، نه اینکه دوباره از صفر ایده پیدا کنیم.`;
      if (pack.ready[1]) {
        pack.ready[1] = {
          ...pack.ready[1],
          text:`اگه ${audience} هستی و موضوع ${topicLabel} برات مهمه، قبل از اینکه سراغ راه بعدی برای «${offer}» بری این نکته رو از دست نده.`
        };
      }
      if (pack.ready[2]) {
        pack.ready[2] = {
          ...pack.ready[2],
          text:`درباره ${topicLabel} فقط یک نکته کاربردی بگو: مشکل رایج چیه، چه تغییر کوچیکی باید امتحان بشه و از کجا بفهمیم بهتر شده. آخرش مخاطب رو به یک قدم مشخص برای «${offer}» دعوت کن.`
        };
      }
    }

    if (channel && channel !== 'instagram') {
      const replacement = channel === 'local' ? 'پیام یا تماس' : 'پیام';
      pack.ready = pack.ready.map(item => ({
        ...item,
        text:String(item.text)
          .replaceAll('دایرکت کن', `${replacement} بده`)
          .replaceAll('دایرکت بده', `${replacement} بده`)
          .replaceAll('دایرکت', replacement)
      }));
    }
    return pack;
  };

  // Sanity check impossible/contradictory stages and use fields we ask from the user.
  const baseDiagnoseAdaptive = HX.diagnoseAdaptive;
  HX.diagnoseAdaptive = () => {
    const diagnosis = baseDiagnoseAdaptive();
    if (state.profile.stage === 'idea' && diagnosis.key === 'retention') {
      return HX.makeDiagnosis(
        'acquisition-entry',
        'هنوز مشتری قبلی‌ای وجود ندارد که روی بازگشتش کار کنیم. اول باید یک دلیل ساده برای شروع ارتباط و گرفتن اولین مشتری بسازیم.',
        'بالا',
        'مرحله فعلی کسب‌وکار روی اولویت اثر داده است.'
      );
    }
    return diagnosis;
  };

  const baseBuildTask = HX.buildTask;
  HX.buildTask = (key, variant=0, simplified=false) => {
    const task = baseBuildTask(key, variant, simplified);
    const budget = state.profile.budget;
    const target = HX.clean(state.profile.target);

    if (budget === 'none') task.why += ' چون فعلاً بودجه‌ای برای رشد نداری، این حرکت طوری انتخاب شده که بدون هزینه تبلیغاتی قابل اجرا باشد.';
    if (budget === 'ready') task.why += ' قبل از خرج بودجه، این نسخه را در مقیاس کوچک امتحان می‌کنیم تا چیزی برای تقویت داشته باشیم.';
    if (target && state.goal !== 'instagram') task.copy += ` معیار ۳۰ روزه‌ای که خودت گفتی: «${target}».`;

    if (key === 'ig-conversion' && HX.clean(state.instagram.bio)) {
      task.ready = task.ready.slice(0,3);
      task.ready.push({
        label:'بیو پیشنهادی',
        title:'یک مسیر روشن برای پیام دادن',
        text:`${state.profile.offer}\nبرای ${state.profile.audience}\nبرای اینکه بگم از کجا شروع کنی، کلمه «شروع» رو دایرکت کن.`
      });
    }
    return task;
  };

  // --- UI guards discovered during the first real-user walkthrough.
  function showToast(message){
    const toast = $('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 1600);
  }

  function resetOldResultBeforeNewGoal(goal){
    state.goal = goal;
    state.day = 1;
    state.adaptive = {path:[],answers:{}};
    state.diagnosis = null;
    state.task = null;
    state.taskVariant = 0;
    state.currentStatus = null;
    state.pendingNext = null;
    state.journey = [];
    HX.saveState();
  }

  document.querySelectorAll('.goal-card').forEach(btn => {
    btn.addEventListener('click', () => resetOldResultBeforeNewGoal(btn.dataset.goal), true);
  });

  function isLocked(){ return Boolean(state.pendingNext); }
  function lockControls(){
    const locked = isLocked();
    ['alternative-btn','status-done','status-partial','status-blocked'].forEach(id => {
      const el=$(id); if(el) el.disabled=locked;
    });
    const submit=$('feedback-form')?.querySelector('button[type="submit"]');
    if(submit) submit.disabled=locked;
    document.querySelectorAll('.obstacle-grid button').forEach(btn=>btn.disabled=locked);
  }

  ['alternative-btn','status-done','status-partial','status-blocked'].forEach(id => {
    const el=$(id);
    if(!el) return;
    el.addEventListener('click',e=>{
      if(!isLocked()) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      showToast('اول قدم بعدی ساخته‌شده رو شروع کن');
    },true);
  });

  const feedbackForm=$('feedback-form');
  if(feedbackForm){
    feedbackForm.addEventListener('submit',e=>{
      if(!isLocked()) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      showToast('این نتیجه قبلاً ثبت شده');
    },true);
    feedbackForm.addEventListener('submit',()=>setTimeout(()=>{lockControls();refreshHoshexLink();},0));
  }

  document.querySelectorAll('.obstacle-grid button').forEach(btn=>{
    btn.addEventListener('click',()=>setTimeout(()=>{lockControls();refreshHoshexLink();},0));
  });

  $('start-next-day')?.addEventListener('click',()=>setTimeout(lockControls,0));
  $('resume-btn')?.addEventListener('click',()=>setTimeout(lockControls,0));

  function feedbackLabel(key){
    return {views:'بازدید',follows:'فالو',dms:'دایرکت',sales:'فروش',sent:'اجرا',replies:'پاسخ',leads:'علاقه‌مند',repeat:'فرصت خرید دوباره'}[key] || key;
  }
  function compactResult(entry){
    if(!entry) return '';
    const parts=[];
    Object.entries(entry.feedback || {}).forEach(([key,value])=>{
      if(Number(value)>0) parts.push(`${feedbackLabel(key)}: ${HX.fa(value)}`);
    });
    if(entry.note) parts.push(entry.note);
    return parts.join(' • ');
  }
  function targetDetail(){
    if(state.goal !== 'instagram') return state.profile.target || '';
    const labels={reach:'میانگین بازدید',followers:'فالوور',dm:'دایرکت مرتبط',sales:'فروش از پیج'};
    return `${labels[state.instagram.targetKind] || 'هدف'}: ${HX.fa(state.instagram.targetValue)} در ۳۰ روز`;
  }
  function refreshHoshexLink(){
    const link=$('hoshex-cta');
    if(!link) return;
    const last=state.journey[state.journey.length-1];
    const params=new URLSearchParams({
      source:'growth-companion-v4-1',
      goal:state.goal || '',
      offer:state.profile.offer || '',
      audience:state.profile.audience || '',
      target:targetDetail(),
      diagnosis:state.diagnosis?.key || '',
      day:String(state.day || 1),
      last:compactResult(last)
    });
    link.href=`https://hoshex.ir/grow/?${params.toString()}`;
  }

  function adjustProgress(){
    const quiz=$('screen-quiz');
    if(!quiz?.classList.contains('active')) return;
    const question=HX.currentQuestion?.();
    if(!question) return;
    const step=state.adaptive.path.length;
    const finalQuestion=question.options.every(opt=>opt.next==='END');
    const pct=finalQuestion ? 100 : Math.min(90, Math.max(18, step*22));
    const bar=$('progress-bar');
    if(bar) bar.style.width=`${pct}%`;
  }

  $('profile-form')?.addEventListener('submit',()=>setTimeout(adjustProgress,0));
  $('answers')?.addEventListener('click',()=>setTimeout(adjustProgress,0));
  $('prev-question')?.addEventListener('click',()=>setTimeout(adjustProgress,0));

  lockControls();
})();