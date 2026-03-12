
const STORAGE_KEY="skillforge_v8_quest_store_pack";
const ICON_SETS={All:["⛏","🪓","🗡","🛡","🧱","💎","🪙","⚒️","💪","💧","🧠","🏃","😴","🧘","❤️","🎸","🎵","🎤","🎨","✍️","💼","📚","🧾","🖥️","🔥","🍔","🧃","🍕","🍜","☕","🍫","🎮","🎬","🎲","🚀","👑","⭐","⚡","🌀","🔒","✅","🎯","📈","🏠","🧼","🧹","🌙","🥤","📦","💰"],Tools:["⛏","🪓","🗡","🛡","🧱","💎","🪙","⚒️","📦"],Health:["💪","💧","🧠","🏃","😴","🧘","❤️","🧼"],Music:["🎸","🎵","🎤","🎨","✍️"],Work:["💼","📚","🧾","🖥️","📈","🏠","🧹"],Food:["🍔","🧃","🍕","🍜","☕","🍫","🥤"],Fun:["🎮","🎬","🎲","🚀","👑","⭐","⚡","🌀"]};
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
let currentIconTarget=null,audioCtx=null,rewardFilter="All",questFilter="Active",searchValue="",sortValue="recent";
const uid=p=>`${p}_${Math.random().toString(36).slice(2,10)}`,todayStr=()=>new Date().toISOString().slice(0,10),nowIso=()=>new Date().toISOString(),escapeHtml=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const xpRequiredForLevel=(b,l)=>Math.round(b*Math.pow(1.5,Math.max(0,l-1)));


function defaultState(){
  const now = nowIso();
  return {
    meta:{lastOpenedDate:todayStr(),questPackSource:"external-pending"},
    wallet:{coins:18,totalCoinsEarned:18,totalCoinsSpent:0},
    stats:{overallLevel:1,habitsCompletedToday:0,xpEarnedToday:0,coinsEarnedToday:0,rewardsRedeemed:0},
    analytics:{positiveHits:0,negativeHits:0,totalXpEarned:0,totalXpLost:0,totalHabitsApplied:0,totalQuestsDone:0},
    permissions:[],
    earnedRewards:[],
    skills:[
      {id:"skill_guitar",name:"Guitar",icon:"🎸",description:"Keep the fingers honest",level:1,xp:0,baseXp:50,xpRequired:50,expanded:true,createdAt:now,lastUsedAt:now},
      {id:"skill_fitness",name:"Fitness",icon:"💪",description:"Body grind",level:1,xp:0,baseXp:50,xpRequired:50,expanded:true,createdAt:now,lastUsedAt:now},
      {id:"skill_learning",name:"Learning",icon:"🧠",description:"Level the brain",level:1,xp:0,baseXp:50,xpRequired:50,expanded:false,createdAt:now,lastUsedAt:now}
    ],
    habits:[
      {id:"habit_bends",skillId:"skill_guitar",name:"Practice Bends",icon:"🔥",description:"Accuracy and pitch",xpReward:15,coinReward:3,dailyCap:3,timesCompletedToday:0,totalCompletions:0,streak:0,bestStreak:0,lastCompletedDate:null,streakEnabled:true,isNegative:false,createdAt:now},
      {id:"habit_warmups",skillId:"skill_guitar",name:"Warmups",icon:"🎯",description:"Loosen up",xpReward:10,coinReward:2,dailyCap:2,timesCompletedToday:0,totalCompletions:0,streak:0,bestStreak:0,lastCompletedDate:null,streakEnabled:true,isNegative:false,createdAt:now},
      {id:"habit_water",skillId:"skill_fitness",name:"Drink Water",icon:"💧",description:"Hydrate",xpReward:8,coinReward:1,dailyCap:5,timesCompletedToday:0,totalCompletions:0,streak:0,bestStreak:0,lastCompletedDate:null,streakEnabled:true,isNegative:false,createdAt:now},
      {id:"habit_reading",skillId:"skill_learning",name:"Read 10 Pages",icon:"📚",description:"Just read the damn thing",xpReward:12,coinReward:2,dailyCap:2,timesCompletedToday:0,totalCompletions:0,streak:0,bestStreak:0,lastCompletedDate:null,streakEnabled:true,isNegative:false,createdAt:now},
      {id:"habit_doomscroll",skillId:"skill_learning",name:"Doom Scroll",icon:"🌀",description:"Negative habit example",xpReward:8,coinReward:1,dailyCap:4,timesCompletedToday:0,totalCompletions:0,streak:0,bestStreak:0,lastCompletedDate:null,streakEnabled:true,isNegative:true,createdAt:now}
    ],
    rewards:[
      {id:"store_game_hour",name:"1 Hour Gaming",icon:"🎮",category:"Fun",type:"time",cost:30,repeatable:true,grantPermission:"",note:"One guilt-free hour",createdAt:now},
      {id:"store_deepwork_unlock",name:"Deep Work Quest Unlock",icon:"🗝️",category:"Custom",type:"permission",cost:40,repeatable:false,grantPermission:"unlock.deepwork",note:"Lets you start deep work quests",createdAt:now},
      {id:"store_movie_night",name:"Movie Night",icon:"🎬",category:"Rest",type:"time",cost:45,repeatable:true,grantPermission:"",note:"Kick back",createdAt:now}
    ],
    quests:[
      {id:"quest_hydration",type:"habit_count",title:"Complete Drink Water 7 times",targetId:"habit_water",targetValue:7,timeLimitHours:0,prerequisiteQuestId:"",requiredPermission:"",rewardCoins:20,rewardTitle:"Hydration Badge",rewardIcon:"💧",startedAt:null,expiresAt:null,completed:false,completedAt:null,createdAt:now},
      {id:"quest_guitar2",type:"skill_level",title:"Reach Guitar level 2",targetId:"skill_guitar",targetValue:2,timeLimitHours:0,prerequisiteQuestId:"quest_hydration",requiredPermission:"",rewardCoins:25,rewardTitle:"String Slinger",rewardIcon:"🎸",startedAt:null,expiresAt:null,completed:false,completedAt:null,createdAt:now},
      {id:"quest_deepwork",type:"habit_count",title:"Complete Read 10 Pages 5 times",targetId:"habit_reading",targetValue:5,timeLimitHours:48,prerequisiteQuestId:"quest_guitar2",requiredPermission:"unlock.deepwork",rewardCoins:45,rewardTitle:"Deep Work Badge",rewardIcon:"🏆",startedAt:null,expiresAt:null,completed:false,completedAt:null,createdAt:now}
    ],
    activityLog:[]
  };
}
let state=loadState();


function loadState(){try{const raw=localStorage.getItem(STORAGE_KEY);const parsed=raw?JSON.parse(raw):defaultState();ensureShape(parsed);ensureV8Shape(parsed);dailyReset(parsed);return parsed}catch(e){return defaultState()}}
function ensureShape(d){
  d.analytics ||= {positiveHits:0,negativeHits:0,totalXpEarned:0,totalXpLost:0,totalHabitsApplied:0,totalQuestsDone:0};
  d.meta ||= {lastOpenedDate:todayStr()}; d.wallet ||= {coins:0,totalCoinsEarned:0,totalCoinsSpent:0}; d.stats ||= {overallLevel:1,habitsCompletedToday:0,xpEarnedToday:0,coinsEarnedToday:0,rewardsRedeemed:0};
  d.skills ||= []; d.habits ||= []; d.rewards ||= []; d.quests ||= []; d.activityLog ||= [];
  d.skills.forEach(s=>{s.baseXp ||= 50; s.level ||= 1; s.xp ||= 0; s.xpRequired ||= xpRequiredForLevel(s.baseXp,s.level); if(s.expanded===undefined)s.expanded=false; s.lastUsedAt ||= s.createdAt || nowIso()});
  d.habits.forEach(h=>{h.description||="";h.timesCompletedToday||=0;h.totalCompletions||=0;h.streak||=0;h.bestStreak||=0;if(h.streakEnabled===undefined)h.streakEnabled=true;if(h.isNegative===undefined)h.isNegative=false});
}

function ensureV8Shape(d){
  d.meta ||= {};
  if(!d.meta.questPackSource) d.meta.questPackSource = "external-pending";
  d.permissions ||= [];
  d.earnedRewards ||= [];
  d.rewards ||= [];
  d.quests ||= [];
  d.rewards.forEach(r=>{ r.type ||= "custom"; r.grantPermission ||= ""; });
  d.quests.forEach(q=>{
    q.timeLimitHours ||= 0;
    q.prerequisiteQuestId ||= "";
    q.requiredPermission ||= "";
    q.rewardTitle ||= "";
    q.rewardIcon ||= "🏆";
    if(q.startedAt===undefined) q.startedAt = null;
    if(q.expiresAt===undefined) q.expiresAt = null;
  });
}

function dailyReset(d){const t=todayStr();if(d.meta.lastOpenedDate!==t){d.habits.forEach(h=>h.timesCompletedToday=0);d.stats.habitsCompletedToday=0;d.stats.xpEarnedToday=0;d.stats.coinsEarnedToday=0;d.meta.lastOpenedDate=t;saveState()}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
const getSkill=id=>state.skills.find(s=>s.id===id), getHabit=id=>state.habits.find(h=>h.id===id), getReward=id=>state.rewards.find(r=>r.id===id);

function addLog(text){state.activityLog.unshift({id:uid("log"),text,createdAt:nowIso()});state.activityLog=state.activityLog.slice(0,30)}
function recomputeOverallLevel(){const total=state.skills.reduce((sum,s)=>sum+(s.level||1),0);state.stats.overallLevel=Math.max(1,Math.floor(total/Math.max(1,state.skills.length))||1)}
const rankLabel=l=>l>=10?"Legend":l>=7?"Overboss":l>=5?"Veteran":l>=3?"Runner":"Fresh Spawn",characterEmoji=l=>l>=10?"🦾":l>=7?"🧙":l>=5?"⚔️":l>=3?"🧢":"🙂";

function showToast(message,kind="good"){const wrap=$("#toastStack"),el=document.createElement("div");el.className=`toast ${kind}`;el.innerHTML=message;wrap.appendChild(el);setTimeout(()=>{el.style.opacity="0";el.style.transform="translateY(8px)";setTimeout(()=>el.remove(),180)},2400)}
function spawnFloatingText(targetEl,text,kind="good"){if(!targetEl)return;const rect=targetEl.getBoundingClientRect(),float=document.createElement("div");float.className=`floating-text floating-${kind}`;float.textContent=text;float.style.left=`${rect.left+rect.width/2}px`;float.style.top=`${rect.top-4}px`;$("#floatLayer").appendChild(float);setTimeout(()=>float.remove(),920)}
function playTone(freq=440,duration=.08,type="sine",volume=.03){try{audioCtx||=new(window.AudioContext||window.webkitAudioContext)();const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.frequency.value=freq;osc.type=type;gain.gain.value=volume;osc.connect(gain);gain.connect(audioCtx.destination);osc.start();gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+duration);osc.stop(audioCtx.currentTime+duration)}catch(e){}}
const playLevelUpSound=()=>[440,660,880].forEach((f,i)=>setTimeout(()=>playTone(f,.12,"triangle",.04),i*90)),playClickGood=()=>playTone(560,.06,"square",.02),playClickBad=()=>playTone(220,.08,"sawtooth",.018),playQuestSound=()=>[530,700].forEach((f,i)=>setTimeout(()=>playTone(f,.09,"triangle",.035),i*70));

function openModal(id){$("#modalBackdrop").classList.remove("hidden");$(`#${id}`).classList.remove("hidden")}
function closeAllModals(){$("#modalBackdrop").classList.add("hidden");$$(".modal").forEach(m=>m.classList.add("hidden"))}
function scrollActiveTabIntoView(){
  const activeBtn = document.querySelector('.tabs .tab-btn.active');
  if(activeBtn){
    activeBtn.scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'});
  }
}
function setActiveTab(tab){
  const validTabs = ["dashboard","skills","rewards","quests","analytics"];
  const target = validTabs.includes(tab) ? tab : "dashboard";
  $$(".tab-btn").forEach(btn=>btn.classList.toggle("active", btn.dataset.tab===target));
  $$(".tab-panel").forEach(p=>{
    const isMatch = p.id === `${target}Tab`;
    p.classList.toggle("active", isMatch);
    p.style.display = isMatch ? "block" : "none";
  });
  if(target==="rewards") $("#quickAddMenu").classList.add("hidden");
  requestAnimationFrame(scrollActiveTabIntoView);
}

function render(){
  saveState(); recomputeOverallLevel();
  $("#overallLevelBtn").textContent=`Lv ${state.stats.overallLevel}`; $("#walletBtn").textContent=`🪙 ${state.wallet.coins}`;
  renderDashboard(); renderSkills(); renderRewards(); renderQuests(); renderAnalytics(); populateSelects();
}

function renderDashboard(){
  const active=state.quests.filter(q=>!q.completed).length,top=[...state.skills].sort((a,b)=>(b.level-a.level)||(b.xp-a.xp)).slice(0,4),recent=state.activityLog.slice(0,6);
  $("#dashboardTab").innerHTML=`<div class="panel hero-card"><div class="character-box"><div><div class="mini-character">${characterEmoji(state.stats.overallLevel)}</div><div class="character-rank">${rankLabel(state.stats.overallLevel)}</div></div></div><div><div class="panel-header"><div><h3>Character Panel</h3><div class="muted">Analytics patch intact. Nothing stripped out.</div></div><button class="secondary-btn" data-open-modal="habitModal">+ Habit</button></div><div class="hero-stats"><div class="stat-card"><div class="stat-value">${state.stats.overallLevel}</div><div class="stat-label">Overall Level</div></div><div class="stat-card"><div class="stat-value">${state.wallet.coins}</div><div class="stat-label">Coins</div></div><div class="stat-card"><div class="stat-value">${state.stats.habitsCompletedToday}</div><div class="stat-label">Habits Today</div></div><div class="stat-card"><div class="stat-value">${active}</div><div class="stat-label">Active Quests</div></div><div class="stat-card"><div class="stat-value">${state.stats.xpEarnedToday}</div><div class="stat-label">XP Today</div></div><div class="stat-card"><div class="stat-value">${state.stats.rewardsRedeemed}</div><div class="stat-label">Rewards Redeemed</div></div></div></div></div>
  <div style="height:8px"></div>
  <div class="grid-2"><div class="panel"><div class="panel-header"><h3>Top Skills</h3><button class="secondary-btn" data-go-tab="skills">Open Skills</button></div><div class="list-stack">${top.length?top.map(s=>`<div class="mini-row"><div><strong>${s.icon} ${escapeHtml(s.name)}</strong><div class="muted">Lv ${s.level} · ${s.xp}/${s.xpRequired} XP</div></div><button class="ghost-btn" data-skill-focus="${s.id}">View</button></div>`).join(""):`<div class="empty-state">No skills yet.</div>`}</div></div>
  <div class="panel"><div class="panel-header"><h3>Recent Activity</h3><button class="secondary-btn" data-go-tab="analytics">Analytics</button></div><div class="list-stack">${recent.length?recent.map(log=>`<div class="mini-row"><span>${log.text}</span></div>`).join(""):`<div class="empty-state">Do something. Then the feed wakes up.</div>`}</div></div></div>`;
}

function renderSkills(){
  const filtered=[...state.skills].sort(skillSorter).filter(skill=>`${skill.name} ${skill.description} ${state.habits.filter(h=>h.skillId===skill.id).map(h=>`${h.name} ${h.description}`).join(" ")}`.toLowerCase().includes(searchValue.toLowerCase()));
  $("#skillsTab").innerHTML=`<div class="panel"><div class="panel-header"><div><h3>Skills</h3><div class="muted">Expandable trees, negative habits, same working system</div></div><button class="primary-btn" data-open-modal="skillModal">+ Skill</button></div><div class="search-row"><input id="skillSearchInput" placeholder="Search skills or habits..." value="${escapeHtml(searchValue)}" /><select id="skillSortSelect"><option value="recent" ${sortValue==="recent"?"selected":""}>Sort: Recent</option><option value="level" ${sortValue==="level"?"selected":""}>Sort: Level</option><option value="name" ${sortValue==="name"?"selected":""}>Sort: Name</option><option value="progress" ${sortValue==="progress"?"selected":""}>Sort: Progress</option></select></div>${filtered.length?filtered.map(renderSkillCard).join(""):`<div class="empty-state">No matching skills.</div>`}</div>`;
}

function renderSkillCard(skill){
  const habits=state.habits.filter(h=>h.skillId===skill.id),pct=Math.min(100,Math.round(skill.xp/skill.xpRequired*100));
  return `<div class="skill-card" id="skill-${skill.id}"><div class="skill-head"><div class="skill-title-wrap"><div class="skill-icon">${skill.icon}</div><div><h4>${escapeHtml(skill.name)}</h4><div class="muted">${escapeHtml(skill.description||"No description")}</div></div></div><div class="inline-actions"><span class="level-pill">Lv ${skill.level}</span><button class="edit-icon-btn" data-edit-skill="${skill.id}">✏️</button><button class="edit-icon-btn" data-toggle-skill="${skill.id}">${skill.expanded?"▾":"▸"}</button></div></div><div class="progress" style="margin-top:12px"><div class="progress-inner" style="width:${pct}%"></div></div><div class="progress-label"><span>${skill.xp}/${skill.xpRequired} XP</span><span>${habits.length} habits</span></div><div class="skill-actions" style="margin-top:12px"><button class="secondary-btn" data-add-habit-under="${skill.id}">+ Habit</button><button class="ghost-btn" data-toggle-skill="${skill.id}">${skill.expanded?"Collapse Tree":"Open Tree"}</button></div>${skill.expanded?`<div class="tree">${habits.length?habits.map(h=>renderHabitCard(h)).join(""):`<div class="empty-state">No habits in this skill yet.</div>`}</div>`:""}</div>`;
}
function renderHabitCard(h){
  const skill=getSkill(h.skillId),streak=h.streakEnabled?h.streak:"off";
  return `<div class="habit-card"><div class="habit-top"><div class="habit-title"><div class="skill-icon" style="width:40px;height:40px;font-size:20px">${h.icon}</div><div><strong>${escapeHtml(h.name)}</strong><div class="muted">${escapeHtml(h.description||"No description")}</div></div></div><div class="item-actions"><button class="edit-icon-btn" data-edit-habit="${h.id}">✏️</button></div></div><div class="habit-meta"><span class="tag">${h.isNegative?`-${Math.ceil(h.xpReward*1.5)} XP`:`+${h.xpReward} XP`}</span><span class="tag">${h.isNegative?`-${Math.ceil(h.coinReward*1.5)} Coins`:`+${h.coinReward} Coins`}</span><span class="tag">Today ${h.timesCompletedToday}/${h.dailyCap}</span><span class="tag">Streak ${streak}</span>${h.isNegative?`<span class="tag tag-negative">Negative Habit</span>`:""}</div><div class="habit-bottom"><div class="muted">${skill?skill.icon+" "+escapeHtml(skill.name):""}</div><div class="action-cluster"><button class="minus-btn" data-undo-habit="${h.id}">−</button><button class="plus-btn" data-hit-habit="${h.id}">${h.isNegative?"!":"+"}</button></div></div></div>`;
}


function renderRewards(){
  const filtered=state.rewards.filter(r=>rewardFilter==="All"||r.category===rewardFilter),cats=["All",...new Set(state.rewards.map(r=>r.category))];
  const earned = state.earnedRewards.slice(0,9);
  $("#rewardsTab").innerHTML=`<div class="panel"><div class="panel-header"><div><h3>Store</h3><div class="muted">Rewards are earned. Store buys fun time, unlocks, and utility.</div></div><button class="primary-btn" data-open-modal="rewardModal">+ Store Item</button></div><div class="store-subgrid"><div class="mini-row"><div><strong>Wallet</strong><div class="muted">Spend coins on store items</div></div><div class="reward-price">🪙 ${state.wallet.coins}</div></div><div class="mini-row"><div><strong>Permissions</strong><div class="muted">Quest unlocks bought in store</div></div><div class="permission-row">${state.permissions.length?state.permissions.map(p=>`<span class="permission-chip">${escapeHtml(p)}</span>`).join(""):'<span class="muted">None yet</span>'}</div></div></div><div class="panel-header" style="margin-top:10px"><div><h4>Earned Rewards</h4><div class="muted">Quest and level rewards</div></div></div>${earned.length?`<div class="inventory-grid-lite">${earned.map(item=>`<div class="inventory-item"><div class="reward-icon-box">${item.icon||"🏆"}</div><strong>${escapeHtml(item.name)}</strong><div class="muted" style="margin-top:4px">${escapeHtml(item.source||"Reward")}</div></div>`).join("")}</div>`:`<div class="empty-state">No earned rewards yet.</div>`}<div class="panel-header" style="margin-top:16px"><div><h4>Store Items</h4><div class="muted">Buy access, time, and utility</div></div></div><div class="filters">${cats.map(cat=>`<button class="filter-pill ${rewardFilter===cat?"active":""}" data-reward-filter="${cat}">${cat}</button>`).join("")}</div>${filtered.length?`<div class="inventory-grid">${filtered.map(renderRewardCard).join("")}</div>`:`<div class="empty-state">No store items in this filter.</div>`}</div>`;
}


function renderRewardCard(r){
  const aff=state.wallet.coins>=r.cost;
  const permLine = r.grantPermission ? `<div class="muted" style="margin-top:4px">Unlocks <code>${escapeHtml(r.grantPermission)}</code></div>` : "";
  return `<div class="reward-card ${!aff?"reward-disabled":""}"><div class="reward-icon-box">${r.icon}</div><strong>${escapeHtml(r.name)}</strong><div class="muted" style="margin-top:4px">${escapeHtml(r.category)} · ${escapeHtml(r.type||"custom")}</div>${permLine}<div class="muted" style="margin-top:4px; min-height:36px">${escapeHtml(r.note||"No note")}</div><div class="panel-header" style="margin-top:10px;margin-bottom:0"><span class="reward-price">🪙 ${r.cost}</span><span class="tag">${r.repeatable?"Repeatable":"One-time"}</span></div><div class="item-actions" style="margin-top:10px"><button class="primary-btn" ${aff?"":"disabled"} data-buy-reward="${r.id}">Buy</button><button class="secondary-btn" data-edit-reward="${r.id}">Edit</button></div></div>`;
}



function renderQuests(){
  const quests=state.quests.filter(q=>{
    if(questFilter==="All") return true;
    if(questFilter==="Completed") return q.completed;
    return !q.completed;
  });
  $("#questsTab").innerHTML=`<div class="panel"><div class="panel-header"><div><h3>Quests</h3><div class="muted">Start timers, prerequisites, and permission locks.</div></div><button class="primary-btn" data-open-modal="questModal">+ Quest</button></div><div class="filters">${["Active","Completed","All"].map(type=>`<button class="filter-pill ${questFilter===type?"active":""}" data-quest-filter="${type}">${type}</button>`).join("")}</div><div class="list-stack">${quests.length?quests.map(renderQuestCard).join(""):`<div class="empty-state">No quests in this view.</div>`}</div></div>`;
}


function renderQuestCard(q){
  const p=getQuestProgress(q),pct=Math.min(100,Math.round(p.current/Math.max(1,p.target)*100));
  const status=getQuestStatus(q);
  const prereqLine=q.prerequisiteQuestId?`<div class="muted">Requires: ${escapeHtml(getQuestName(q.prerequisiteQuestId))}</div>`:"";
  const permLine=q.requiredPermission?`<div class="muted">Permission: <code>${escapeHtml(q.requiredPermission)}</code></div>`:"";
  const timerLine=q.timeLimitHours>0?`<div class="muted">Timer: ${q.timeLimitHours}h${q.startedAt?` · ${escapeHtml(getTimeRemainingLabel(q))}`:" after start"}</div>`:"";
  return `<div class="quest-card ${q.completed?"quest-complete":""}"><div class="panel-header"><div><strong>${questIcon(q)} ${escapeHtml(q.title)}</strong><div class="muted">${questTypeLabel(q.type)}</div></div><div class="item-actions">${getQuestStatusChip(q)}<button class="secondary-btn" data-edit-quest="${q.id}">Edit</button></div></div><div class="progress"><div class="progress-inner" style="width:${pct}%"></div></div><div class="quest-progress"><span>${p.current}/${p.target}</span><span>Reward 🪙 ${q.rewardCoins}</span></div><div class="quest-meta">${q.rewardTitle?`<div class="quest-reward-line">Earned reward: ${escapeHtml(q.rewardIcon||"🏆")} ${escapeHtml(q.rewardTitle)}</div>`:""}${timerLine}${prereqLine}${permLine}</div><div class="quest-actions">${status==="ready"?`<button class="primary-btn" data-start-quest="${q.id}">Start Quest</button>`:""}${status==="locked"?`<button class="secondary-btn" disabled>Locked</button>`:""}${status==="active"?`<button class="secondary-btn" disabled>In Progress</button>`:""}${status==="expired"?`<button class="danger-btn" data-restart-quest="${q.id}">Restart Quest</button>`:""}</div>${q.completed?`<div class="tiny-note" style="margin-top:8px">Completed ${new Date(q.completedAt).toLocaleDateString()}</div>`:""}</div>`;
}

const questTypeLabel=t=>({habit_count:"Habit Count",skill_level:"Skill Level",streak_goal:"Streak Goal",coin_goal:"Coin Goal"})[t]||t, questIcon=q=>({habit_count:"📜",skill_level:"⭐",streak_goal:"🔥",coin_goal:"🪙"})[q.type]||"📜";

function renderAnalytics(){
  const topHabits=[...state.habits].sort((a,b)=>b.totalCompletions-a.totalCompletions).slice(0,5);
  const topNegative=state.habits.filter(h=>h.isNegative).sort((a,b)=>b.totalCompletions-a.totalCompletions).slice(0,5);
  const topSkills=[...state.skills].sort((a,b)=>b.level-a.level || b.xp-a.xp).slice(0,5);
  $("#analyticsTab").innerHTML=`<div class="grid-3">
    <div class="panel"><h3>Totals</h3><div class="list-stack">
      <div class="mini-row"><span>Total habits applied</span><strong>${state.analytics.totalHabitsApplied}</strong></div>
      <div class="mini-row"><span>Positive hits</span><strong>${state.analytics.positiveHits}</strong></div>
      <div class="mini-row"><span>Negative hits</span><strong>${state.analytics.negativeHits}</strong></div>
      <div class="mini-row"><span>Total XP earned</span><strong>${state.analytics.totalXpEarned}</strong></div>
      <div class="mini-row"><span>Total XP lost</span><strong>${state.analytics.totalXpLost}</strong></div>
      <div class="mini-row"><span>Quests completed</span><strong>${state.analytics.totalQuestsDone}</strong></div>
    </div></div>
    <div class="panel"><h3>Top Skills</h3><div class="list-stack">${topSkills.length?topSkills.map(s=>`<div class="mini-row"><span>${s.icon} ${escapeHtml(s.name)}</span><strong>Lv ${s.level}</strong></div>`).join(""):`<div class="empty-state">No skills.</div>`}</div></div>
    <div class="panel"><h3>Top Habits</h3><div class="list-stack">${topHabits.length?topHabits.map(h=>`<div class="mini-row"><span>${h.icon} ${escapeHtml(h.name)}</span><strong>${h.totalCompletions}</strong></div>`).join(""):`<div class="empty-state">No habits.</div>`}</div></div>
  </div>
  <div style="height:14px"></div>
  <div class="grid-2">
    <div class="panel"><h3>Negative Habit Damage</h3><div class="list-stack">${topNegative.length?topNegative.map(h=>`<div class="mini-row"><span>${h.icon} ${escapeHtml(h.name)}</span><strong>${h.totalCompletions} hits</strong></div>`).join(""):`<div class="empty-state">No negative habits tracked.</div>`}</div></div>
    <div class="panel"><h3>Economy</h3><div class="list-stack">
      <div class="mini-row"><span>Current coins</span><strong>${state.wallet.coins}</strong></div>
      <div class="mini-row"><span>Total coins earned</span><strong>${state.wallet.totalCoinsEarned}</strong></div>
      <div class="mini-row"><span>Total coins spent</span><strong>${state.wallet.totalCoinsSpent}</strong></div>
      <div class="mini-row"><span>Rewards redeemed</span><strong>${state.stats.rewardsRedeemed}</strong></div>
    </div></div>
  </div>`;
}


function getQuestProgress(q){
  if(q.type==="habit_count"){const h=getHabit(q.targetId);return{current:h?h.totalCompletions:0,target:q.targetValue}}
  if(q.type==="skill_level"){const s=getSkill(q.targetId);return{current:s?s.level:0,target:q.targetValue}}
  if(q.type==="streak_goal"){const h=getHabit(q.targetId);return{current:h?h.streak:0,target:q.targetValue}}
  if(q.type==="coin_goal")return{current:state.wallet.totalCoinsEarned,target:q.targetValue}
  return{current:0,target:q.targetValue||1}
}


function checkQuestCompletion(){
  let any=false;
  state.quests.forEach(q=>{
    if(getQuestStatus(q)==="expired"){ any=true; return; }
    if(q.completed || !q.startedAt) return;
    const p=getQuestProgress(q);
    if(p.current>=p.target){
      q.completed=true; q.completedAt=nowIso();
      state.wallet.coins+=q.rewardCoins; state.wallet.totalCoinsEarned+=q.rewardCoins;
      state.analytics.totalQuestsDone++;
      if(q.rewardTitle) addEarnedReward(q.rewardTitle, q.rewardIcon, q.title);
      addLog(`Quest complete — ${q.title} (+${q.rewardCoins} coins)`);
      showToast(`Quest complete<br><strong>${escapeHtml(q.title)}</strong><br>+${q.rewardCoins} coins`,"good");
      playQuestSound();
      any=true;
    }
  });
  if(any) saveState();
}

function applyHabit(id,btn){
  const h=getHabit(id); if(!h)return; const s=getSkill(h.skillId); if(!s)return;
  if(h.timesCompletedToday>=h.dailyCap){showToast(`Cap reached for <strong>${escapeHtml(h.name)}</strong>`,"bad");playClickBad();spawnFloatingText(btn,"CAP","bad");return}
  const neg=h.isNegative,xp=neg?Math.ceil(h.xpReward*1.5):h.xpReward,coin=neg?Math.ceil(h.coinReward*1.5):h.coinReward;
  h.timesCompletedToday++; h.totalCompletions++; state.analytics.totalHabitsApplied++;
  const last=h.lastCompletedDate;
  if(h.streakEnabled&&last!==todayStr()){ if(last){const diff=Math.floor((new Date(todayStr())-new Date(last))/(1000*60*60*24)); h.streak=diff===1?h.streak+1:1}else h.streak=1; h.bestStreak=Math.max(h.bestStreak,h.streak) }
  h.lastCompletedDate=todayStr(); s.lastUsedAt=nowIso();
  if(neg){
    s.xp=Math.max(0,s.xp-xp); state.wallet.coins=Math.max(0,state.wallet.coins-coin);
    state.analytics.negativeHits++; state.analytics.totalXpLost += xp;
    addLog(`Negative habit — ${h.name} (-${xp} XP / -${coin} coins)`); showToast(`Negative habit hit<br><strong>${escapeHtml(h.name)}</strong><br>-${xp} XP / -${coin} coins`,"bad"); playClickBad(); spawnFloatingText(btn,`-${xp} XP`,"bad");
  }else{
    s.xp+=xp; state.wallet.coins+=coin; state.wallet.totalCoinsEarned+=coin; state.stats.habitsCompletedToday++; state.stats.xpEarnedToday+=xp; state.stats.coinsEarnedToday+=coin;
    state.analytics.positiveHits++; state.analytics.totalXpEarned += xp;
    addLog(`+${xp} XP / +${coin} coins — ${h.name}`); showToast(`+${xp} XP / +${coin} coins<br><strong>${escapeHtml(h.name)}</strong>`,"good"); playClickGood(); spawnFloatingText(btn,`+${xp} XP`,"good"); spawnFloatingText(btn,`+${coin} 🪙`,"gold");
  }
  while(s.xp>=s.xpRequired){ s.xp-=s.xpRequired; s.level++; s.xpRequired=xpRequiredForLevel(s.baseXp,s.level); addEarnedReward(`${s.name} Lv ${s.level}`, s.icon, "Level Up"); addLog(`Level up — ${s.name} Lv ${s.level}`); showToast(`Level up!<br><strong>${escapeHtml(s.name)}</strong> is now Lv ${s.level}`,"good"); playLevelUpSound() }
  recomputeOverallLevel(); checkQuestCompletion(); saveState(); render();
}
function undoHabit(id,btn){
  const h=getHabit(id); if(!h)return; const s=getSkill(h.skillId); if(!s)return;
  if(h.timesCompletedToday<=0){showToast(`Nothing to undo for <strong>${escapeHtml(h.name)}</strong>`,"bad");return}
  const neg=h.isNegative,xp=neg?Math.ceil(h.xpReward*1.5):h.xpReward,coin=neg?Math.ceil(h.coinReward*1.5):h.coinReward;
  h.timesCompletedToday=Math.max(0,h.timesCompletedToday-1); h.totalCompletions=Math.max(0,h.totalCompletions-1);
  if(neg){ s.xp+=xp; state.wallet.coins+=coin; state.analytics.negativeHits=Math.max(0,state.analytics.negativeHits-1); state.analytics.totalXpLost=Math.max(0,state.analytics.totalXpLost-xp); addLog(`Undo negative habit — ${h.name}`); spawnFloatingText(btn,`+${xp} XP`,"good")}
  else{ s.xp=Math.max(0,s.xp-xp); state.wallet.coins=Math.max(0,state.wallet.coins-coin); state.stats.habitsCompletedToday=Math.max(0,state.stats.habitsCompletedToday-1); state.stats.xpEarnedToday=Math.max(0,state.stats.xpEarnedToday-xp); state.stats.coinsEarnedToday=Math.max(0,state.stats.coinsEarnedToday-coin); state.analytics.positiveHits=Math.max(0,state.analytics.positiveHits-1); state.analytics.totalXpEarned=Math.max(0,state.analytics.totalXpEarned-xp); addLog(`Undo habit — ${h.name}`); spawnFloatingText(btn,`-${xp} XP`,"bad")}
  state.analytics.totalHabitsApplied=Math.max(0,state.analytics.totalHabitsApplied-1); playClickGood(); saveState(); render();
}

function buyReward(id){
  const r=getReward(id); if(!r) return;
  if(state.wallet.coins<r.cost){showToast(`Need ${r.cost-state.wallet.coins} more coins for <strong>${escapeHtml(r.name)}</strong>`,"bad");playClickBad();return}
  if(r.grantPermission && state.permissions.includes(r.grantPermission) && !r.repeatable){showToast(`Already unlocked.<br><strong>${escapeHtml(r.name)}</strong>`,"bad");return}
  state.wallet.coins-=r.cost; state.wallet.totalCoinsSpent+=r.cost; state.stats.rewardsRedeemed++;
  if(r.grantPermission && !state.permissions.includes(r.grantPermission)) state.permissions.push(r.grantPermission);
  addLog(`Bought store item — ${r.name} (-${r.cost} coins)`);
  showToast(`Bought<br><strong>${escapeHtml(r.name)}</strong><br>-${r.cost} coins`,"good");
  playQuestSound();
  if(!r.repeatable) state.rewards=state.rewards.filter(x=>x.id!==id);
  saveState(); render();
}



function populateSelects(){
  const skillOpts=state.skills.map(s=>`<option value="${s.id}">${escapeHtml(s.icon)} ${escapeHtml(s.name)}</option>`).join("");
  $("#habitSkillId").innerHTML=skillOpts||""; $("#questTargetSkill").innerHTML=skillOpts||"";
  const habitOpts=state.habits.map(h=>`<option value="${h.id}">${escapeHtml(h.icon)} ${escapeHtml(h.name)}</option>`).join("");
  $("#questTargetHabit").innerHTML=habitOpts||"";
  refreshQuestPrerequisiteOptions($("#questId")?.value||"");
}


function getQuest(id){return state.quests.find(q=>q.id===id)}
function hasPermission(key){return !key || state.permissions.includes(key)}
function getQuestName(id){const q=getQuest(id);return q?q.title:"None"}
function normalizeQuest(q){
  return {
    id:q.id||uid("quest"),
    type:q.type||"habit_count",
    title:q.title||"Quest",
    targetId:q.targetId||"",
    targetValue:Number(q.targetValue||1),
    timeLimitHours:Number(q.timeLimitHours||0),
    prerequisiteQuestId:q.prerequisiteQuestId||"",
    requiredPermission:q.requiredPermission||"",
    rewardCoins:Number(q.rewardCoins||0),
    rewardTitle:q.rewardTitle||"",
    rewardIcon:q.rewardIcon||"🏆",
    startedAt:q.startedAt||null,
    expiresAt:q.expiresAt||null,
    completed:!!q.completed,
    completedAt:q.completedAt||null,
    createdAt:q.createdAt||nowIso()
  };
}
function isQuestExpired(q){return !!(q.startedAt && q.expiresAt && !q.completed && new Date(q.expiresAt).getTime() < Date.now())}
function getQuestStatus(q){
  if(q.completed) return "completed";
  if(isQuestExpired(q)) return "expired";
  if(q.prerequisiteQuestId){const p=getQuest(q.prerequisiteQuestId); if(p && !p.completed) return "locked";}
  if(q.requiredPermission && !hasPermission(q.requiredPermission)) return "locked";
  if(q.startedAt) return "active";
  return "ready";
}
function getQuestStatusChip(q){
  const st=getQuestStatus(q);
  if(st==="completed") return '<span class="status-chip status-ready">Completed</span>';
  if(st==="active") return '<span class="status-chip status-active">Active</span>';
  if(st==="expired") return '<span class="status-chip status-expired">Expired</span>';
  if(st==="locked") return '<span class="status-chip status-locked">Locked</span>';
  return '<span class="status-chip status-ready">Ready</span>';
}
function getTimeRemainingLabel(q){
  if(!q.startedAt || !q.expiresAt || q.completed) return "";
  const diff = new Date(q.expiresAt).getTime() - Date.now();
  if(diff <= 0) return "Expired";
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return hrs>0 ? `${hrs}h ${mins}m left` : `${mins}m left`;
}
function addEarnedReward(name, icon, source){
  if(!name) return;
  state.earnedRewards.unshift({id:uid("earned"),name,icon:icon||"🏆",source:source||"Quest",earnedAt:nowIso()});
  state.earnedRewards = state.earnedRewards.slice(0, 60);
}
function startQuest(id){
  const q=getQuest(id); if(!q) return;
  if(getQuestStatus(q)!=="ready"){showToast(`Quest cannot start yet.<br><strong>${escapeHtml(q.title)}</strong>`,"bad"); return;}
  q.startedAt = nowIso();
  q.expiresAt = q.timeLimitHours>0 ? new Date(Date.now()+q.timeLimitHours*3600000).toISOString() : null;
  addLog(`Started quest — ${q.title}`);
  showToast(`Quest started<br><strong>${escapeHtml(q.title)}</strong>`,"good");
  saveState(); render();
}
async function loadQuestPackFile(force=false){
  try{
    const res = await fetch('quests.json?ts=' + Date.now());
    if(!res.ok) return;
    const data = await res.json();
    const pack = Array.isArray(data) ? data : (data.quests || []);
    if(!Array.isArray(pack) || !pack.length) return;
    if(force || state.meta.questPackSource === "external-pending"){
      state.quests = pack.map(normalizeQuest);
      state.meta.questPackSource = force ? "external-reloaded" : "external-file";
      saveState(); render();
      if(force) showToast("Reloaded quests.json.","good");
    }
  }catch(e){}
}
function exportQuestPack(){
  const payload = {quests: state.quests.map(q=>normalizeQuest(q))};
  const blob = new Blob([JSON.stringify(payload,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download="quests.json"; a.click();
  URL.revokeObjectURL(url);
}
function importQuestPack(file){
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const data = JSON.parse(reader.result);
      const pack = Array.isArray(data) ? data : (data.quests || []);
      state.quests = pack.map(normalizeQuest);
      state.meta.questPackSource = "local";
      saveState(); render();
      showToast("Quest pack imported.","good");
    }catch(e){ showToast("Quest pack import failed.","bad"); }
  };
  reader.readAsText(file);
}
function refreshQuestPrerequisiteOptions(currentId=""){
  const options = ['<option value="">None</option>'].concat(
    state.quests.filter(q=>q.id!==currentId).map(q=>`<option value="${q.id}">${escapeHtml(q.title)}</option>`)
  ).join("");
  const el=$("#questPrerequisite"); if(el) el.innerHTML=options;
}

function openSkillModal(id=null){const e=!!id,s=e?getSkill(id):null;$("#skillModalTitle").textContent=e?"Edit Skill":"Add Skill";$("#skillId").value=s?.id||"";$("#skillName").value=s?.name||"";$("#skillBaseXp").value=s?.baseXp||50;$("#skillDescription").value=s?.description||"";$("#skillIcon").value=s?.icon||"🎸";$("#skillIconPreview").textContent=s?.icon||"🎸";$("#deleteSkillBtn").classList.toggle("hidden",!e);openModal("skillModal")}
function openHabitModal(id=null,skillPrefill=null){populateSelects();const e=!!id,h=e?getHabit(id):null;$("#habitModalTitle").textContent=e?"Edit Habit":"Add Habit";$("#habitId").value=h?.id||"";$("#habitName").value=h?.name||"";$("#habitSkillId").value=h?.skillId||skillPrefill||state.skills[0]?.id||"";$("#habitXpReward").value=h?.xpReward||10;$("#habitCoinReward").value=h?.coinReward||2;$("#habitDailyCap").value=h?.dailyCap||1;$("#habitDescription").value=h?.description||"";$("#habitNegative").checked=!!h?.isNegative;$("#habitIcon").value=h?.icon||"🔥";$("#habitIconPreview").textContent=h?.icon||"🔥";$("#deleteHabitBtn").classList.toggle("hidden",!e);openModal("habitModal")}

function openRewardModal(id=null){
  const e=!!id,r=getReward(id);
  $("#rewardModalTitle").textContent=e?"Edit Store Item":"Add Store Item";
  $("#rewardId").value=r?.id||"";
  $("#rewardName").value=r?.name||"";
  $("#rewardCost").value=r?.cost||25;
  $("#rewardType").value=r?.type||"time";
  $("#rewardCategory").value=r?.category||"Fun";
  $("#rewardPermissionKey").value=r?.grantPermission||"";
  $("#rewardNote").value=r?.note||"";
  $("#rewardRepeatable").checked=r?.repeatable!==false;
  $("#rewardIcon").value=r?.icon||"🎮";
  $("#rewardIconPreview").textContent=r?.icon||"🎮";
  $("#deleteRewardBtn").classList.toggle("hidden",!e);
  openModal("rewardModal");
}
);
document.addEventListener("input",e=>{if(e.target.id==="skillSearchInput"){searchValue=e.target.value; renderSkills();} if(e.target.id==="skillSortSelect"){sortValue=e.target.value; renderSkills();}});
$("#questType").addEventListener("change",updateQuestTargetVisibility);
$("#skillForm").addEventListener("submit",submitSkillForm); $("#habitForm").addEventListener("submit",submitHabitForm); $("#rewardForm").addEventListener("submit",submitRewardForm); $("#questForm").addEventListener("submit",submitQuestForm);
$("#importInput").addEventListener("change",e=>{const file=e.target.files?.[0]; if(file)importSave(file);});
$("#questPackInput").addEventListener("change",e=>{const file=e.target.files?.[0]; if(file)importQuestPack(file);});

ensureV8Shape(state); render(); setActiveTab("dashboard"); loadQuestPackFile(false);


/* ===== V7 Stable Tab Rebuild ===== */
(function(){
  const __originalRender = render;
  render = function(){
    __originalRender();
    const activeBtn = document.querySelector('.tabs .tab-btn.active');
    const activeTab = activeBtn ? activeBtn.dataset.tab : 'dashboard';
    setActiveTab(activeTab);
  };

  window.addEventListener('resize', () => {
    clearTimeout(window.__sf7ResizeTimer);
    window.__sf7ResizeTimer = setTimeout(() => {
      const activeBtn = document.querySelector('.tabs .tab-btn.active');
      const activeTab = activeBtn ? activeBtn.dataset.tab : 'dashboard';
      setActiveTab(activeTab);
    }, 80);
  });
})();
