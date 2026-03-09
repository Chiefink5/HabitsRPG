
const state={
level:1,
coins:0,
xp:0,
habits:[],
stats:{
totalXP:0,
totalHabits:0,
negativeHits:0
}
}

function render(){

document.getElementById("level").innerText="Lv "+state.level
document.getElementById("coins").innerText="🪙 "+state.coins

renderDashboard()
renderAnalytics()

}

function renderDashboard(){

const el=document.getElementById("dashboard")

el.innerHTML=`
<div class="card">
<h3>Character</h3>
<div class="stat">Level ${state.level}</div>
<div>XP ${state.xp}</div>
</div>

<div class="card">
<button onclick="gainXP()">Complete Habit (+10 XP)</button>
<button onclick="negativeHabit()">Negative Habit (-15 XP)</button>
</div>
`

}

function renderAnalytics(){

const el=document.getElementById("analytics")

el.innerHTML=`
<div class="card">
<h3>Analytics</h3>
<div>Total XP Earned: ${state.stats.totalXP}</div>
<div>Total Habits Completed: ${state.stats.totalHabits}</div>
<div>Negative Habit Hits: ${state.stats.negativeHits}</div>
</div>
`

}

function gainXP(){

state.xp+=10
state.stats.totalXP+=10
state.stats.totalHabits++
state.coins+=2

if(state.xp>=100){
state.level++
state.xp=0
}

render()

}

function negativeHabit(){

state.xp=Math.max(0,state.xp-15)
state.stats.negativeHits++

render()

}

document.querySelectorAll(".tabs button").forEach(btn=>{

btn.onclick=()=>{

document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"))
document.getElementById(btn.dataset.tab).classList.add("active")

}

})

render()
