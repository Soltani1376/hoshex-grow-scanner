window.HX = window.HX || {};

(() => {
  const $=HX.$;
  const state=HX.state;
  const screens=[...document.querySelectorAll('.screen')];
  let diagnosisOverride=null;

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
  function save(){HX.saveState();syncResumeButton();}
  function syncResumeButton(){
    const saved=HX.loadSaved();
    const btn=$('resume-btn');
    if(saved?.diagnosis && saved?.task){
      btn.classList.remove('hidden');
      btn.textContent=`ادامه روز ${HX.fa(saved.day||1)} ←`;
    }else btn.classList.add('hidden');
  }

  $('brand-home').addEventListener('click',()=>showScreen('screen-home','شروع'));
  $('start-btn').addEventListener('click',()=>showScreen('screen-goal','انتخاب هدف'));
  $('resume-btn').addEventListener('click',()=>{
    const saved=HX.loadSaved();
    if(!saved?.diagnosis || !saved?.task){toast('مسیر ذخیره‌شده‌ای پیدا نشد');syncResumeButton();return;}
    HX.restoreState(saved);
    renderResult(true);
    showScreen('screen-result',`روز ${HX.fa(state.day)}`);
  });
  $('restart-btn').addEventListener('click',()=>{
    HX.resetState();
    document.querySelectorAll('form').forEach(f=>f.reset());
    syncResumeButton();
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
      name:HX.clean($('business-name').value),
      offer:HX.clean($('business-offer').value),
      audience:HX.clean($('business-audience').value),
      type:$('business-type').value,
      stage:$('business-stage').value,
      channel:$('business-channel').value,
      time:Number($('business-time').value||30),
      budget:$('business-budget').value,
      target:HX.clean($('business-target').value)
    };
    if(!state.profile.offer || !state.profile.audience || !state.profile.type || !state.profile.stage || !state.profile.channel || !state.profile.target) return;
    save();
    if(state.goal==='instagram') showScreen('screen-instagram','شناخت پیج');
    else startAdaptive(state.goal);
  });

  $('instagram-form').addEventListener('submit',e=>{
    e.preventDefault();
    state.instagram={
      handle:HX.clean($('ig-handle').value),
      followers:Number($('ig-followers').value||0),
      posts30:Number($('ig-posts').value||0),
      views:Number($('ig-views').value||0),
      dms30:Number($('ig-dms').value||0),
      sales30:Number($('ig-sales').value||0),
      camera:$('ig-camera').value,
      bestTopic:HX.clean($('ig-best-topic').value),
      bio:HX.clean($('ig-bio').value),
      targetKind:$('ig-target-kind').value,
      targetValue:Number($('ig-target-value').value||0)
    };
    if(!state.instagram.camera || !state.instagram.targetKind || state.instagram.targetValue<1) return;
    processAndRender(()=>HX.diagnoseInstagram());
  });

  function startAdaptive(goal){
    const tree=HX.questionTrees[goal] || HX.questionTrees.unknown;
    state.adaptive={path:[tree.start],answers:{}};
    renderAdaptiveQuestion();
    showScreen('screen-quiz',HX.goalLabels[goal]);
  }
  function renderAdaptiveQuestion(){
    const question=HX.currentQuestion();
    const step=state.adaptive.path.length;
    $('question-step').textContent=`سؤال ${HX.fa(step)}`;
    $('question-title').textContent=question.title;
    $('question-hint').textContent=question.hint;
    $('question-tag').textContent=question.tag;
    $('progress-bar').style.width=`${Math.min(100,step/5*100)}%`;
    $('answers').innerHTML='';
    question.options.forEach((opt,i)=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='answer-btn'+(state.adaptive.answers[question.id]?.value===opt.value?' selected':'');
      btn.innerHTML=`<span class="answer-key">${HX.fa(i+1)}</span><span>${HX.escapeHtml(opt.label)}</span>`;
      btn.addEventListener('click',()=>selectAdaptiveOption(opt));
      $('answers').appendChild(btn);
    });
  }
  function selectAdaptiveOption(opt){
    const question=HX.currentQuestion();
    state.adaptive.answers[question.id]={value:opt.value,score:opt.score,label:opt.label};
    if(opt.next==='END'){
      processAndRender(()=>HX.diagnoseAdaptive());
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
    const question=HX.currentQuestion();
    if(n>=1 && n<=question.options.length) selectAdaptiveOption(question.options[n-1]);
  });

  function processAndRender(builder){
    $('processing-title').textContent=state.goal==='instagram'?'داریم عددهای پیج رو به کار امروز تبدیل می‌کنیم...':'داریم جواب‌ها رو به یک کار واقعی برای امروز تبدیل می‌کنیم...';
    showScreen('screen-processing','در حال تحلیل');
    setTimeout(()=>{
      state.diagnosis=builder();
      state.taskVariant=0;
      state.task=HX.buildTask(state.diagnosis.key,0);
      state.currentStatus=null;
      state.pendingNext=null;
      save();
      renderResult();
      showScreen('screen-result',`روز ${HX.fa(state.day)}`);
    },700);
  }

  function renderResult(restored=false){
    if(!state.diagnosis) return;
    if(!state.task) state.task=HX.buildTask(state.diagnosis.key,state.taskVariant||0);
    $('day-label').textContent=HX.fa(state.day);
    $('diagnosis-title').textContent=state.diagnosis.title;
    $('diagnosis-confidence').textContent=state.diagnosis.confidence;
    $('today-time').textContent=state.task.time;
    $('today-title').textContent=state.task.title;
    $('today-copy').textContent=state.task.copy;
    $('today-why').textContent=state.task.why;
    renderReady($('today-ready'),state.task.ready);
    $('optional-task-body').innerHTML=`<b>${HX.escapeHtml(state.task.optional.title)}</b><p>${HX.escapeHtml(state.task.optional.text)}</p>`;
    $('detail-goal').textContent=goalDetail();
    $('detail-audience').textContent=state.profile.audience;
    $('detail-offer').textContent=state.profile.offer;
    $('detail-reason').textContent=state.diagnosis.reason;
    $('analysis-note').textContent=state.diagnosis.note;
    hideActionPanels();
    renderJourney();
    updateHoshexLink();
    if(restored && state.pendingNext) renderPendingNext();
  }
  function renderReady(host,items){
    host.innerHTML='';
    items.forEach(item=>{
      const card=document.createElement('div');
      card.className='ready-item';
      card.innerHTML=`<div class="ready-item-top"><span>${HX.escapeHtml(item.label)}</span><button class="copy-btn" type="button">کپی</button></div><h4>${HX.escapeHtml(item.title)}</h4><div class="ready-text">${HX.escapeHtml(item.text)}</div>`;
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
    const t=document.createElement('textarea');
    t.value=text;
    t.style.position='fixed';
    t.style.opacity='0';
    document.body.appendChild(t);
    t.select();
    try{document.execCommand('copy');done();}catch{}
    t.remove();
  }
  function goalDetail(){
    if(state.goal!=='instagram') return state.profile.target;
    const labels={reach:'میانگین بازدید',followers:'فالوور',dm:'دایرکت مرتبط',sales:'فروش از پیج'};
    return `${labels[state.instagram.targetKind]}: ${HX.fa(state.instagram.targetValue)} در ۳۰ روز`;
  }
  function hideActionPanels(){
    $('feedback-card').classList.add('hidden');
    $('blocked-card').classList.add('hidden');
    $('next-step-card').classList.add('hidden');
  }

  $('alternative-btn').addEventListener('click',()=>{
    state.taskVariant=(Number(state.taskVariant||0)+1)%3;
    state.task=HX.buildTask(state.diagnosis.key,state.taskVariant);
    state.currentStatus=null;
    state.pendingNext=null;
    save();
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
    const note=HX.clean($('feedback-note').value);
    state.journey.push(makeJourneyEntry(state.currentStatus||'done',data,null,note));
    state.pendingNext=buildNextFromFeedback(data);
    save();
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
      task=HX.buildTask(state.diagnosis.key,(state.taskVariant+1)%3,true);
      state.instagram.camera=previous;
    }else if(obstacle==='fit') task=HX.buildTask(state.diagnosis.key,(state.taskVariant+1)%3,false);
    else task=HX.buildTask(state.diagnosis.key,state.taskVariant,true);

    if(obstacle==='skill') task.ready.push({label:'روش اجرا',title:'فقط همین سه قدم',text:'۱) متن آماده را کپی کن. ۲) فقط جای اسم محصول یا جزئیات خودت را عوض کن. ۳) همان نسخه را بدون کامل‌گرایی ارسال یا منتشر کن.'});
    if(obstacle==='unclear') task.copy='نسخه قبلی را کنار می‌گذاریم. فقط متن آماده اول را بردار و برای یک مخاطب واقعی اجرا کن؛ کار اضافه‌ای لازم نیست.';

    state.pendingNext={task,diagnosis:state.diagnosis,sameDay:true,title:'کار را کوچک‌تر کردیم؛ همین امروز دوباره امتحانش کن.',copy:`مانع ثبت شد: ${labels[obstacle]}. هدف الان فقط اینه که از حالت توقف خارج بشیم.`};
    save();
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
    let title='';
    let copy='';

    if(state.task.feedbackType==='instagram'){
      const baseline=Math.max(state.instagram.views||1,1);
      if(hasSales){
        title='این حرکت سیگنال فروش داده؛ فردا نسخه دوم همین زاویه را تکرار می‌کنیم.';
        copy=`${HX.fa(data.sales)} فروش ثبت شد. فعلاً ایده کاملاً تازه نمی‌سازیم؛ همان مسئله را با نسخه بعدی تست می‌کنیم.`;
      }else if(Number(data.dms||0)>0){
        nextKey='ig-sales';
        title='محتوا مکالمه ساخته؛ فردا تمرکز را از محتوا به دایرکت می‌بریم.';
        copy=`${HX.fa(data.dms)} دایرکت مرتبط ثبت شد ولی فروش نداشتیم. قدم بعدی اصلاح پاسخ و پیگیری فروش است.`;
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
      copy=`${HX.fa(data.sales)} فروش ثبت شده. فعلاً مسیر برنده را عوض نمی‌کنیم؛ فقط نسخه بعدی را تست می‌کنیم.`;
    }else if(interest>0){
      nextKey='sales';
      title='واکنش گرفتی؛ فردا روی تبدیل همین آدم‌ها کار می‌کنیم.';
      copy=`${HX.fa(interest)} واکنش یا فرصت ثبت شد. به‌جای جذب بیشتر، همین مکالمه‌ها را جلو می‌بریم.`;
    }else if(state.task.feedbackType==='content'){
      title='واکنش کافی نگرفتیم؛ فردا همان موضوع را با شروع متفاوت تست می‌کنیم.';
      copy='یک اجرا برای حذف موضوع کافی نیست. فقط شروع و زاویه را عوض می‌کنیم تا بفهمیم مسئله از بسته‌بندی محتواست یا از خود موضوع.';
    }else{
      title='هنوز سیگنال کافی نداریم؛ فردا نسخه کوتاه‌تر و مستقیم‌تر را تست می‌کنیم.';
      copy='فعلاً کانال را عوض نمی‌کنیم. یک نسخه دیگر از همین حرکت اجرا می‌کنیم تا داده بیشتری داشته باشیم.';
    }

    const diagnosis=HX.makeDiagnosis(nextKey,copy,state.diagnosis.confidence,'این تشخیص بعدی از نتیجه اجرای روز قبل ساخته شده است.');
    const task=HX.buildTask(nextKey,(Number(state.taskVariant||0)+1)%3,false);
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
    save();
    renderResult();
    window.scrollTo({top:0,behavior:'smooth'});
  });

  function renderJourney(){
    const host=$('journey-list');
    $('journey-count').textContent=`${HX.fa(state.journey.length)} ثبت`;
    if(!state.journey.length){
      host.innerHTML='<div class="empty-state">اولین نتیجه که ثبت بشه، اینجا مسیر واقعی کسب‌وکارت شکل می‌گیره.</div>';
      return;
    }
    host.innerHTML=state.journey.slice().reverse().map(entry=>{
      const statusLabel={done:'انجام شد',partial:'نیمه‌کاره',blocked:'گیر اجرا'}[entry.status]||entry.status;
      const result=summarizeFeedback(entry.feedback,entry.note);
      return `<div class="journey-row"><div class="journey-day">روز ${HX.fa(entry.day)}</div><div class="journey-main"><div class="journey-top"><b>${HX.escapeHtml(entry.taskTitle)}</b><span class="status-${entry.status}">${statusLabel}</span></div><p>${HX.escapeHtml(result)}</p></div></div>`;
    }).join('');
  }

  function summarizeFeedback(feedback,note){
    const parts=[];
    Object.entries(feedback||{}).forEach(([k,v])=>{if(Number(v)>0) parts.push(`${feedbackLabel(k)}: ${HX.fa(v)}`);});
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

  $('wrong-diagnosis').addEventListener('click',openDiagnosisDialog);
  function openDiagnosisDialog(){
    diagnosisOverride=null;
    const options=state.goal==='instagram'
      ? [['ig-consistency','انتشارم کمه'],['ig-reach','مشکل بازدیده'],['ig-conversion','بازدید دارم ولی دایرکت کمه'],['ig-sales','دایرکت دارم ولی فروش کمه']]
      : [['acquisition','جذب مشتری'],['offer','پیشنهاد فروش'],['content-conversion','محتوا'],['sales','فروش'],['retention','مشتری‌های قبلی']];

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
    const note=HX.clean($('diagnosis-note').value);
    state.diagnosis=HX.makeDiagnosis(diagnosisOverride,note||'این اولویت با نظر خودت اصلاح شد.','طبق نظر تو','هوشکس کار امروز را بر اساس اصلاح تو دوباره ساخته است. نتیجه اجرا کمک می‌کند صحت این انتخاب را بررسی کنیم.');
    state.taskVariant=0;
    state.task=HX.buildTask(diagnosisOverride,0);
    state.pendingNext=null;
    save();
    renderResult();
    const dialog=$('diagnosis-dialog');
    if(dialog.close) dialog.close(); else dialog.removeAttribute('open');
    toast('کار امروز با تشخیص جدید ساخته شد');
  });

  syncResumeButton();
})();
