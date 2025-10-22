
// Pilot Tech Prep - exam.js
const DEFAULT_PASSWORD = "pilot2025"; // change this if needed

let questions = [];
let examQs = [];
let answers = [];
let current = 0;

const loginScreen = document.getElementById('login-screen');
const app = document.getElementById('app');
const pwdInput = document.getElementById('password');
const unlockBtn = document.getElementById('unlock');
const loginMessage = document.getElementById('login-message');
const logoutBtn = document.getElementById('logout');
const fileInput = document.getElementById('fileInput');
const startBtn = document.getElementById('startBtn');
const questionCounter = document.getElementById('questionCounter');
const questionBox = document.getElementById('questionBox');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const quizArea = document.getElementById('quizArea');
const resultArea = document.getElementById('resultArea');
const downloadSampleBtn = document.getElementById('downloadSample');

unlockBtn.addEventListener('click', ()=>{
  const val = pwdInput.value || '';
  if(val === DEFAULT_PASSWORD){
    loginScreen.classList.add('hidden');
    app.classList.remove('hidden');
  } else {
    loginMessage.textContent = 'Incorrect password.';
    loginMessage.style.color = 'red';
  }
});
logoutBtn.addEventListener('click', ()=>{
  location.reload();
});

downloadSampleBtn.addEventListener('click', ()=>{
  fetch('pilot_questions_sample.json').then(r=>r.blob()).then(b=>{
    const url = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = url; a.download = 'pilot_questions_sample.json'; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });
});

fileInput.addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ev=>{
    try{
      const parsed = JSON.parse(ev.target.result);
      if(Array.isArray(parsed)) {
        questions = parsed.map(normalizeQuestion);
        alert('Loaded ' + questions.length + ' questions.');
      } else {
        alert('JSON must be an array of questions.');
      }
    } catch(err){ alert('Invalid JSON file: ' + err); }
  };
  reader.readAsText(f);
});

startBtn.addEventListener('click', ()=>{
  if(questions.length === 0){
    fetch('pilot_questions_sample.json').then(r=>r.json()).then(j=>{
      questions = j.map(normalizeQuestion);
      beginExam();
    }).catch(err=>alert('No questions loaded and sample not available. Upload JSON first.'));
  } else {
    beginExam();
  }
});

function normalizeQuestion(q){
  return {
    number: q.number || q.num || '',
    question: q.question || q.q || '',
    options: q.options || q.choices || [],
    answer: q.answer || q.a || null
  };
}

function beginExam(){
  examQs = shuffle(questions).slice(0,50);
  answers = new Array(examQs.length).fill(null);
  current = 0;
  renderQuestion();
  quizArea.classList.remove('hidden');
  resultArea.classList.add('hidden');
}

function renderQuestion(){
  const q = examQs[current];
  questionCounter.textContent = `Question ${current+1} of ${examQs.length}`;
  questionBox.innerHTML = '';
  const qdiv = document.createElement('div');
  qdiv.className='q';
  qdiv.innerHTML = `<div><strong>${q.number} ${escapeHtml(q.question)}</strong></div>`;
  const choicesDiv = document.createElement('div');
  choicesDiv.className = 'choices';
  if(q.options && q.options.length){
    q.options.forEach((opt,i)=>{
      const id = 'opt_' + current + '_' + i;
      const label = document.createElement('label');
      label.innerHTML = `<input type="radio" name="choice" id="${id}" value="${i}" ${answers[current]===i?'checked':''}> ${escapeHtml(opt)}`;
      choicesDiv.appendChild(label);
    });
  } else {
    const input = document.createElement('input');
    input.type = 'text'; input.value = answers[current] || '';
    input.addEventListener('input', e=> answers[current] = e.target.value);
    choicesDiv.appendChild(input);
  }
  qdiv.appendChild(choicesDiv);
  questionBox.appendChild(qdiv);
  questionBox.querySelectorAll('input[type=radio]').forEach(r=> r.addEventListener('change', e=>{
    answers[current] = parseInt(e.target.value,10);
  }));
}

prevBtn.addEventListener('click', ()=>{ if(current>0){ current--; renderQuestion(); }});
nextBtn.addEventListener('click', ()=>{ if(current<examQs.length-1){ current++; renderQuestion(); }});

submitBtn.addEventListener('click', ()=>{
  const total = examQs.length;
  let correct = 0;
  for(let i=0;i<total;i++){
    const q = examQs[i];
    const a = answers[i];
    if(q.options && q.options.length && q.answer !== null){
      if(typeof q.answer === 'number'){ if(a === q.answer) correct++; }
      else if(typeof q.answer === 'string'){ if(a !== null && q.options[a] && q.options[a].toLowerCase().trim() === q.answer.toLowerCase().trim()) correct++; }
    } else if(!q.options.length && q.answer){
      if(a && String(a).toLowerCase().trim() === String(q.answer).toLowerCase().trim()) correct++;
    }
  }
  const percent = Math.round((correct/total)*10000)/100;
  quizArea.classList.add('hidden');
  resultArea.classList.remove('hidden');
  resultArea.innerHTML = `<div class="summary"><h3>Results</h3><p>You scored <strong>${correct}</strong> out of <strong>${total}</strong> (${percent}%).</p></div>`;
});

function shuffle(arr){ let a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
