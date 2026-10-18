const fs=require('fs');const f='build/cinematic.css';let css=fs.readFileSync(f,'utf8');
const revision=`
/* Art-direction revision: protected reading areas and material-led exhibits.
   These are compositions within scenes, not a scene-transition system. */
.scene-body { color:#d0c3b4; }
.scene-keys { font-size:1.2cqw; }
.representation-label { font-size:1.05cqw; }
.cover-opening { font-size:6.2cqw; }
.cover-nation { font-size:9.1cqw; }
.cover-subject { font-size:4.7cqw; }
.cover-context { font-size:1.2cqw; max-width:35cqw; }
.cover-copy { bottom:16%; }
.system-copy { top:9%;width:88%;max-width:none; }
.system-copy .display { font-size:4cqw;max-width:76cqw; }
.system-copy .active-thought { position:absolute;top:25cqw;left:0;max-width:24cqw;margin:0;font-size:2cqw;line-height:1.25; }
.system-copy .scene-body:not(.active-thought) { position:absolute;top:31cqw;left:0;max-width:23cqw;font-size:1.45cqw; }
.institution-map { left:30%;top:24%;width:65%;height:62%; }
.institution strong { font-size:1.8cqw; }
.institution-role { font-size:1.0cqw;letter-spacing:.04em;color:#c3a889; }
.party { top:-3%; }
.party strong { font-size:2.1cqw; }
.people { width:23%;left:38.5%;top:32%; }
.people > span { font-size:.95cqw; }
.organisations { bottom:-1%; }
.maze-copy { bottom:13%; }
.maze-copy .display { font-size:4.6cqw; }
.maze-copy .scene-body { font-size:1.6cqw; }
.maze-copy .scene-keys { font-size:1.15cqw; }
.workflow-state { font-size:1.15cqw; }
.history-title { top:9%;font-size:2.5cqw; }
.history-date { left:5.4%;top:20%;font-size:15cqw; }
.history-copy { left:5.7%;top:49%;width:39%; }
.history-kind { font-size:1.1cqw; }
.history-copy h3 { font-size:2.8cqw; }
.history-copy .scene-body { max-width:34cqw;font-size:1.5cqw; }
.history-line { bottom:11%; }
.history-stop > span:last-child { font-size:1.1cqw;color:#c5b4a0; }
.restructure-copy { top:14%; }
.restructure-caption { margin-top:3cqw; }
.restructure-unit { font-size:1.35cqw; }
.restructure-legend { font-size:1.1cqw;top:8%; }
.integrity-title { top:15%; }
.integrity-title .display { font-size:8.1cqw; }
.policy-label { font-size:1.35cqw; }
.integrity-principles { bottom:13%;gap:3cqw; }
.integrity-principle { min-height:7.8cqw; }
.integrity-principle h3 { font-size:2.4cqw; }
.integrity-principle .scene-body { font-size:1.35cqw; }
.principle-mark { font-size:1.05cqw; }
.services-copy { max-width:67%;top:9%; }
.services-copy .display { max-width:67cqw;font-size:4.25cqw; }
.services-copy .scene-body { max-width:48cqw;font-size:1.5cqw; }
.service-station > span { font-size:2cqw; }
.service-help { font-size:1.4cqw; }
.service-evidence { font-size:1.25cqw; }
.student-copy { top:18%;width:46%; }
.student-copy .display { font-size:5.7cqw;line-height:1.08; }
.student-roster { top:27%;left:58%; }
.student { padding:1.45cqw 0; }
.student strong { font-size:2.2cqw; }
.student-order { display:none; }
.commitment-copy { top:18%;max-width:45%; }
.commitment-copy .display { font-size:5.7cqw; }
.commitment-copy .scene-body { max-width:35cqw;font-size:1.6cqw; }
.commitment-sequence { bottom:13%; }
.commitment p { font-size:1.18cqw;color:#c6b6a1; }
.commitment-index { font-size:1.05cqw; }
.vision-title { max-width:80cqw;font-size:3.65cqw; }
.vision-copy .scene-body { font-size:1.55cqw; }
.horizon-stop small { font-size:1.3cqw; }
.quiz { display:block;padding-top:5%;background:linear-gradient(115deg,#24101b,#0b1119 60%); }
.quiz-heading { display:flex;align-items:baseline;gap:1.8cqw;padding:0;margin-bottom:1.8cqw; }
.quiz-number { font-size:3.4cqw; }
.quiz-heading h2 { font-size:2.5cqw;margin:0; }
.quiz-heading p { margin:0 0 0 auto;font-size:1.15cqw; }
.quiz-question { max-width:85cqw;font-size:2cqw;line-height:1.3; }
.quiz-options { margin-top:1.6cqw;gap:.55cqw; }
.quiz-option { font-size:1.45cqw;min-height:4.1cqw;padding:.8cqw 1.25cqw;border-color:#b89c7945;background:#11141c; }
.quiz-option.selected { border-color:var(--gold);background:#39252c; }
.quiz-option.correct { border-color:#9aceac;background:#19352b; }
.quiz-option.incorrect { border-color:#d59a8f;background:#452128; }
.quiz-actions { margin-top:1.1cqw; }
.quiz-submitted .quiz-question { font-size:1.6cqw; }
.quiz-submitted .quiz-option { min-height:3.1cqw;padding:.55cqw 1.15cqw;font-size:1.25cqw; }
.quiz-submitted .quiz-explanation { font-size:1.15cqw;line-height:1.45;max-height:11cqw;overflow:auto;margin-top:1cqw; }
.outro h1 { max-width:75cqw;font-size:7.4cqw;line-height:1.12;text-align:center;letter-spacing:-.035em; }
`;
css=css.replace('/* A portrait device is a reading surface',revision+'\n/* A portrait device is a reading surface');
css+=`\n@media(orientation:portrait){
 .system-copy .active-thought,.system-copy .scene-body:not(.active-thought){position:relative;inset:auto;max-width:none;margin-top:20px;font-size:19px;}
 .institution-map{left:auto;top:auto;width:100%;height:330px;margin-top:30px;}
 .institution-role{font-size:10px;}.people>span{font-size:9px;}.institution strong{font-size:15px;}.party strong{font-size:17px;}
 .history-copy{width:auto;}.history-stop>span:last-child{font-size:12px;}
 .integrity-principles,.commitment-sequence{display:block;}.integrity-principle,.commitment{min-height:0;padding:18px 0;}
 .integrity-principle .scene-body{font-size:17px!important;}.commitment p{font-size:15px;}
 .student-roster{inset:auto;}.student strong{font-size:27px;}.student{padding:22px 0;}
 .quiz-heading{display:grid;grid-template-columns:50px 1fr;gap:10px 15px;}.quiz-number{font-size:46px;}.quiz-heading h2{font-size:25px;}.quiz-heading p{font-size:13px;margin:0;}
 .quiz-submitted .quiz-explanation{max-height:none;font-size:16px;line-height:1.5;overflow:visible;}
 .outro h1{font-size:14vw;max-width:90vw;}
}\n`;
fs.writeFileSync(f,css);
// Editorial changes only: factual assertions, IDs, sources, notes and quiz stay intact.
const p='build/content.json',d=JSON.parse(fs.readFileSync(p));
const edits={2:[['Party leadership',null],['Distinct roles. A shared purpose.',null],['People at the centre',null]],3:[null,null,['Clarify the route','One lead for each task. Coordinated support.'],null,null,null],7:[['Start in the right place',null],['One application. Connected work.',null],['See where your application stands',null],['Receive the result',null]],8:[['Our responsibility starts here','Understand the reform. Take responsibility for our work.']],9:[['Understand. Verify. Explain.',null],['Share the work. Support the team.',null],['Present what the evidence supports.',null]]};
const changes=[];for(const [id,beats]of Object.entries(edits))beats.forEach((edit,i)=>{if(!edit)return;for(const [k,j]of [['heading',0],['body',1]])if(edit[j]!=null){const b=d.scenes.find(s=>s.id===+id).beats[i];changes.push({scene:+id,beat:i,field:k,before:b.audience[k],after:edit[j]});b.audience[k]=edit[j];}});
fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');fs.writeFileSync('work/visual-redesign/copy-changes.json',JSON.stringify(changes,null,2));
