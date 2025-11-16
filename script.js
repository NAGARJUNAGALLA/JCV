const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxVFAb2uATkTiLi3PHaUIB_UtQk2urWHpz2oh0-hgIul-nUyYCtF9ux61SvbMjnlj-g7g/exec"; // Replace with your Apps Script URL
const QUIZ_TITLE = "APTET ENGLISH Paper 1 : Model Paper 1";

// Sample Questions (replace with your full array)
const questions = [
  {q:"She got right to the top… Choose synonym of ‘hectic’",options:["curious","sensation","fault","busy"],answerId:3},
  {q:"Brave antonym?",options:["Courageous","Coward","Fearless","Bold"],answerId:1},
  {q:"Dependent clause is…",options:["Compound","Dependent","Independent","Complex"],answerId:1}
];

let current=0,answers=Array(questions.length).fill(null),submitted=false;
let timeLeft=questions.length*60,timerInterval;
let currentUser=""; // store username
let currentFullname=""; // store full name

// ---------------- LOGIN ----------------
async function login(){
  const username=document.getElementById("userName").value.trim();
  const password=document.getElementById("password").value.trim();
  if(!username || !password){ alert("Enter both username and password"); return; }

  try{
    const res = await fetch(GOOGLE_SCRIPT_URL,{
      method:"POST",
      body:JSON.stringify({action:"login", username, password}),
      headers:{"Content-Type":"application/json"}
    });
    const data = await res.json();
    if(data.status==="success"){
      currentUser=username;
      currentFullname=data.fullname;
      document.getElementById("login-form").style.display="none";
      document.getElementById("quiz-area").style.display="block";
      renderNav(); renderQuestion(); startTimer();
    } else {
      alert("Wrong username or password!");
    }
  } catch(e){ console.error(e); alert("Login failed!"); }
}

// ---------------- QUIZ FUNCTIONS ----------------
function toggleNav(){document.getElementById("question-nav").classList.toggle("hidden");}

function renderNav(){
  const nav=document.getElementById("question-nav"); nav.innerHTML="";
  questions.forEach((_,i)=>{
    const b=document.createElement("button");
    b.textContent=i+1;
    b.className=(i===current?"active ":"")+(answers[i]!=null?"answered":"");
    b.onclick=()=>{current=i; renderQuestion();};
    nav.appendChild(b);
  });
  updateStats();
}

function renderQuestion(){
  const q=questions[current];
  const c=document.getElementById("question-container");
  let h=`<h4>Question ${current+1} of ${questions.length}</h4><p>${q.q}</p><div class="options">`;
  q.options.forEach((o,i)=>{
    let cls="";
    if(submitted){
      if(i===q.answerId) cls="correct";
      else if(answers[current]===i && i!==q.answerId) cls="wrong";
    }
    h+=`<label class="${cls}"><input type="radio" name="opt" value="${i}" ${answers[current]===i?'checked':''} ${submitted?'disabled':''} onchange="selectOpt(${i})">${o}</label>`;
  });
  h+="</div>"; c.innerHTML=h; renderNav();
  if(window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([c]);
}

function selectOpt(i){ if(submitted)return; answers[current]=i; renderNav(); }
function nextQuestion(){ if(current<questions.length-1){ current++; renderQuestion(); } }
function prevQuestion(){ if(current>0){ current--; renderQuestion(); } }
function updateStats(){
  const a=answers.filter(x=>x!==null).length;
  document.getElementById("answered").textContent="Answered: "+a;
  document.getElementById("not-answered").textContent="Not answered: "+(questions.length-a);
}
function startTimer(){
  updateTimer(); timerInterval=setInterval(()=>{
    timeLeft--; updateTimer();
    if(timeLeft<=0){ clearInterval(timerInterval); submitQuiz(); }
  },1000);
}
function updateTimer(){
  const m=Math.floor(timeLeft/60),s=timeLeft%60;
  document.getElementById("timer").textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ---------------- SUBMIT ----------------
async function submitQuiz(){
  if(submitted)return; submitted=true; clearInterval(timerInterval);
  let correct=0,wrong=0;
  questions.forEach((q,i)=>{if(answers[i]!=null){if(answers[i]===q.answerId)correct++; else wrong++;}});
  const skipped=questions.length-(correct+wrong); const total=questions.length;
  const score=Math.round((correct/total)*100);

  const payload={ quizTitle:QUIZ_TITLE, username:currentUser, fullname:currentFullname,
    score, correct, wrong, skipped, total };

  // Send to Google Sheets
  try{
    await fetch(GOOGLE_SCRIPT_URL,{
      method:"POST",
      body:JSON.stringify({...payload, action:"submit"}),
      headers:{"Content-Type":"application/json"}
    });
  } catch(e){ console.error(e); }

  const html=`<h3>Result Summary</h3>
    <p><b>Name:</b> ${currentFullname}</p>
    <p><b>Total Questions:</b> ${total}</p>
    <p><b>Correct:</b> ${correct}</p>
    <p><b>Wrong:</b> ${wrong}</p>
    <p><b>Skipped:</b> ${skipped}</p>
    <p><b>Score:</b> ${score}%</p>`;
  document.getElementById("result-section").innerHTML=html;
  document.getElementById("result-section").classList.remove("hidden");
  renderQuestion();
}

// Fullscreen toggle
function toggleFullscreen(){
  if(!document.fullscreenElement){
    document.documentElement.requestFullscreen().catch(err=>alert(err.message));
  } else { document.exitFullscreen(); }
}
