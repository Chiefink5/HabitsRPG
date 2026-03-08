
let data = JSON.parse(localStorage.getItem("skillforge_data")) || {
  coins:0,
  level:1,
  skills:[
    {
      name:"Guitar",
      icon:"🎸",
      level:1,
      xp:0,
      xpReq:50,
      habits:[
        {name:"Practice Bends", icon:"🔥", xp:15, coins:3},
        {name:"Warmups", icon:"🎯", xp:10, coins:2}
      ]
    }
  ],
  rewards:[
    {name:"1 Hour Gaming", icon:"🎮", cost:80},
    {name:"Energy Drink", icon:"🧃", cost:20}
  ],
  quests:[
    {name:"Practice Bends 5 times", progress:0, goal:5, reward:20}
  ]
};

function save(){
  localStorage.setItem("skillforge_data", JSON.stringify(data));
  render();
}

function showTab(id){
  document.querySelectorAll(".tab").forEach(t=>t.style.display="none");
  document.getElementById(id).style.display="block";
}

function render(){

  document.getElementById("coinBadge").textContent = "🪙 " + data.coins;
  document.getElementById("levelBadge").textContent = "Lv " + data.level;

  renderDashboard();
  renderSkills();
  renderRewards();
  renderQuests();

  localStorage.setItem("skillforge_data", JSON.stringify(data));
}

function renderDashboard(){
  const el = document.getElementById("dashboard");
  el.innerHTML = "";

  const card = document.createElement("div");
  card.className="card";
  card.innerHTML = `
  <h3>Character Stats</h3>
  Level: ${data.level}<br>
  Coins: ${data.coins}<br>
  Skills: ${data.skills.length}
  `;
  el.appendChild(card);
}

function renderSkills(){
  const el = document.getElementById("skills");
  el.innerHTML = "";

  data.skills.forEach(skill=>{

    const card = document.createElement("div");
    card.className="card";

    const progress = (skill.xp/skill.xpReq)*100;

    card.innerHTML=`
      <h3>${skill.icon} ${skill.name} (Lv ${skill.level})</h3>
      <div class="progress"><div class="progress-inner" style="width:${progress}%"></div></div>
      XP ${skill.xp}/${skill.xpReq}
    `;

    skill.habits.forEach(h=>{

      const habit = document.createElement("div");

      habit.innerHTML=`
        ${h.icon} ${h.name}
        <button class="action minus" onclick="minusHabit('${skill.name}','${h.name}')">-</button>
        <button class="action" onclick="plusHabit('${skill.name}','${h.name}')">+</button>
      `;

      card.appendChild(habit);
    });

    el.appendChild(card);

  });
}

function plusHabit(skillName, habitName){

  const skill = data.skills.find(s=>s.name===skillName);
  const habit = skill.habits.find(h=>h.name===habitName);

  skill.xp += habit.xp;
  data.coins += habit.coins;

  if(skill.xp >= skill.xpReq){
    skill.xp -= skill.xpReq;
    skill.level++;
    skill.xpReq = Math.floor(skill.xpReq*1.5);
    data.level++;
  }

  data.quests.forEach(q=>{
    if(q.name.includes(habitName)){
      q.progress++;
      if(q.progress>=q.goal){
        data.coins += q.reward;
      }
    }
  });

  save();
}

function minusHabit(skillName, habitName){

  const skill = data.skills.find(s=>s.name===skillName);
  const habit = skill.habits.find(h=>h.name===habitName);

  skill.xp = Math.max(0, skill.xp - habit.xp);
  data.coins = Math.max(0, data.coins - habit.coins);

  save();
}

function renderRewards(){

  const el = document.getElementById("rewards");
  el.innerHTML="";

  data.rewards.forEach(r=>{

    const card = document.createElement("div");
    card.className="card";

    card.innerHTML=`
      ${r.icon} ${r.name}<br>
      Cost: ${r.cost}
      <button class="action" onclick="buyReward('${r.name}')">Redeem</button>
    `;

    el.appendChild(card);

  });

}

function buyReward(name){

  const reward = data.rewards.find(r=>r.name===name);

  if(data.coins>=reward.cost){
    data.coins -= reward.cost;
    alert("Redeemed: "+reward.name);
  }else{
    alert("Not enough coins");
  }

  save();
}

function renderQuests(){

  const el = document.getElementById("quests");
  el.innerHTML="";

  data.quests.forEach(q=>{

    const card = document.createElement("div");
    card.className="card";

    card.innerHTML=`
      ${q.name}<br>
      ${q.progress}/${q.goal}<br>
      Reward: ${q.reward} coins
    `;

    el.appendChild(card);

  });

}

render();
showTab("dashboard");
