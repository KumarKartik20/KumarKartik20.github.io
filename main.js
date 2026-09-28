/* ===== Kumar Kartik - portfolio interactions ===== */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s); const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesk = () => matchMedia('(min-width:901px)').matches;
const VIEWS = ['overview','education','experience','projects','certs','terminal'];

/* -------- navigation: sliding indicator, scroll-spy, mobile pages -------- */
const topbar = $('#topbar'), ind = $('#navInd'), drawer = $('#drawer'), modal = $('#contactModal');
const lock = on => { document.body.style.overflow = on ? 'hidden' : ''; };

function moveInd() {
    const el = $('.topnav-item.active');
    if (!el || !ind) return;
    ind.style.width = el.offsetWidth + 'px';
    ind.style.transform = `translateX(${el.offsetLeft}px)`;
}
function setActive(v) {
    $$('.topnav-item,.drawer-item').forEach(b => b.classList.toggle('active', b.dataset.go === v));
    moveInd();
}
function closeDrawer() { drawer.classList.remove('open'); lock(false); }
let curView = 'overview';
function remember(v) {
    if (isDesk()) return;
    try { sessionStorage.setItem('kk-view', v); } catch (e) {}
}
function showMobile(v) {
    const el = $('#view-' + v);
    if (!el) return;
    $$('.view').forEach(x => x.classList.remove('active'));
    el.classList.add('active');
    setActive(v);
    curView = v;
}
function go(v) {
    closeDrawer();
    const el = $('#view-' + v);
    if (!el) return;
    setActive(v);
    curView = v;
    if (isDesk()) {
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    } else {
        showMobile(v);
        remember(v);
        scrollTo(0, 0);
    }
}
if (!isDesk()) {
    let saved = null;
    try { saved = sessionStorage.getItem('kk-view'); } catch (e) {}
    if (saved && VIEWS.includes(saved) && saved !== 'overview') showMobile(saved);
}
function spy() {
    if (!isDesk()) return;
    const y = scrollY + innerHeight * 0.4;
    let cur = 'overview';
    $$('.view').forEach(v => { if (v.offsetTop <= y) cur = v.id.slice(5); });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = 'terminal';
    if (cur !== curView) { curView = cur; setActive(cur); }
}

$$('[data-go]').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
$('#menuBtn').addEventListener('click', () => { drawer.classList.add('open'); lock(true); });
$('#drawerClose').addEventListener('click', closeDrawer);
drawer.addEventListener('click', e => { if (e.target === drawer) closeDrawer(); });

/* -------- contact modal -------- */
const openModal = () => { modal.classList.add('open'); lock(true); };
const closeModal = () => { modal.classList.remove('open'); lock(false); };
$('#btnConnect').addEventListener('click', openModal);
$('#modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeDrawer(); } });

/* -------- resume download -------- */
function downloadResume() {
    const a = document.createElement('a');
    a.href = 'KUMAR_KARTIK_DATAENGINEER.pdf'; a.download = 'KUMAR_KARTIK_DATAENGINEER.pdf';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
$('#btnResume').addEventListener('click', e => { e.preventDefault(); downloadResume(); });

/* -------- scroll: progress runner, pipeline line, topbar -------- */
const fill = $('#runnerFill'), runner = $('#runner'), wrap = $('#crewWrap');
const dag = $('#dag'), dagNodes = $$('.dag-node');
let lastY = scrollY, ticking = false;

function dagProgress() {
    const r = dag.getBoundingClientRect();
    if (!r.height) return;
    const mid = innerHeight * 0.62;
    dag.style.setProperty('--p', Math.min(Math.max((mid - r.top) / r.height, 0), 1));
    dagNodes.forEach(n => n.classList.toggle('active', n.getBoundingClientRect().top + 24 < mid));
}
function onScroll() {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    const pct = h > 0 ? (y / h) * 100 : 0;
    topbar.classList.toggle('scrolled', y > 10);
    fill.style.width = pct + '%';
    runner.style.left = Math.min(Math.max(pct, 2), 98) + '%';
    if (y > lastY) wrap.style.transform = 'scaleX(1)'; else if (y < lastY) wrap.style.transform = 'scaleX(-1)';
    lastY = y <= 0 ? 0 : y;
    spy(); dagProgress();
}
addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); }
}, { passive: true });
addEventListener('resize', () => { moveInd(); onScroll(); });

/* -------- reveal on scroll (staggered) -------- */
const revealEls = $$('.reveal');
if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('in'));
} else {
    const io = new IntersectionObserver(entries => {
        let i = 0;
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.style.setProperty('--d', (i++ * 90) + 'ms');
            e.target.classList.add('in');
            io.unobserve(e.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => io.observe(el));
}

/* -------- count-up numbers -------- */
function countUp(el) {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = to.toFixed(dec) + suf; return; }
    const t0 = performance.now(), dur = 1400;
    (function f(t) {
        const p = Math.min((t - t0) / dur, 1), v = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * v).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(f);
    })(t0);
}
if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { cio.unobserve(e.target); countUp(e.target); }
    }), { threshold: 0.4 });
    $$('[data-count]').forEach(el => { el.textContent = '0' + (el.dataset.suffix || ''); cio.observe(el); });
}

/* -------- typed name with blinking cursor -------- */
function typeName() {
    const el = $('#typeName'); if (!el || reduce) return;
    const txt = el.dataset.text; let i = 0;
    el.textContent = '';
    (function step() {
        el.textContent = txt.slice(0, ++i);
        if (i < txt.length) setTimeout(step, 90 + Math.random() * 80);
    })();
}

/* -------- terminal (same commands & wording as before) -------- */
const tb = $('#termBody'), ti = $('#termInput'), tp = $('#termPrompt');
let tState = 'NORMAL'; const draft = { name: '', contact: '', note: '' };
const hist = []; let hi = 0;
const CMDS = ['help', 'whoami', 'cat experience.txt', 'cat skills.json', 'cat projects.txt', 'connect', './download_resume.sh', 'clear'];
const Y = '#ECD06F', R = '#E8604C';
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function tPrint(html) {
    const d = document.createElement('div'); d.className = 'term-line';
    html.split('<br>').forEach((seg, i) => {
        const s = document.createElement('div'); s.className = 'tl';
        s.style.animationDelay = Math.min(i * 20, 420) + 'ms'; s.innerHTML = seg || '&nbsp;'; d.appendChild(s);
    });
    tb.appendChild(d); tb.scrollTop = tb.scrollHeight;
}

const tEcho = (cmd, label) => tPrint(`<span style="color:${Y};font-weight:600;">${label}</span> <span style="color:#F5F1E4;">${esc(cmd)}</span>`);
const WHOAMI = 
    `<span style="color:${R};font-weight:bold;">Kumar Kartik</span> - Data Engineer, Amdocs, Pune<br><br>` +
    `I design and keep production data pipelines running. That means batch ingestion into Snowflake, overnight orchestration on IBM TWS, an encrypted handoff from the on-prem Linux grid into Azure Blob, and the checks that prove Snowflake and Vertica still agree after a transform.<br><br>` +
    `Two years in that role, after a B.Tech in Electronics &amp; Communication at Bharati Vidyapeeth College of Engineering (GPA 9.5 / 10). The degree is where the working rule came from: trace a system from the raw feed to the table someone queries, and if a step has to happen twice, automate it.<br><br>` +
    `Read <b style="color:${Y};">cat experience.txt</b> to see how a pipeline day actually breaks down, <b style="color:${Y};">cat projects.txt</b> for the warehouse, simulation, and API work, or <b style="color:${Y};">connect</b> to write to me.`;

function handleCmd(raw) {
    if (!raw && tState === 'NORMAL') return;
    if (tState === 'WAITING_NAME') {
        tEcho(raw, 'Name:'); draft.name = raw || 'Anonymous Colleague'; tState = 'WAITING_EMAIL'; tp.textContent = 'Email (Optional):';
        tPrint('Good to meet you, ' + esc(draft.name) + '.<br><br>Nothing you type is stored on this site. The last step only opens a draft in your mail client. Next, enter an email address so I know where to reply - or press Enter to skip.'); return;
    }
    if (tState === 'WAITING_EMAIL') {
        tEcho(raw, 'Email:'); draft.contact = raw || 'Not provided'; tState = 'WAITING_NOTE'; tp.textContent = 'Type a message:';
        tPrint('Contact noted as <b style="color:' + Y + ';">' + esc(draft.contact) + '</b>.<br><br>Write the message itself. A role, a question about a pipeline, or what you want to talk through is enough. Press Enter when it is ready.'); return;
    }
    if (tState === 'WAITING_NOTE') {
        tEcho(raw, 'Message:'); draft.note = raw || 'No message provided.'; tState = 'NORMAL'; tp.textContent = '$';
        const subject = encodeURIComponent('Portfolio Connect: Message from ' + draft.name);
        const body = encodeURIComponent('Name: ' + draft.name + '\nEmail: ' + draft.contact + '\n\nMessage:\n' + draft.note);
        tPrint(`<span style="color:${Y};font-weight:700;">[STATUS 200: OK] Message compiled.</span><br>` +
            `<br>` +
            `Sender   : ` + esc(draft.name) + `<br>Contact  : ` + esc(draft.contact) + `<br>Message  : ` + esc(draft.note) +
            `<br><br><span style="color:${Y};">This page has no backend, so the note is not saved here. Your mail client should open a draft to kumarkartik1920@gmail.com with the block above already filled in. Send it from there. If no client opened, copy the block into a new message to that address.</span>`);
        location.href = `mailto:kumarkartik1920@gmail.com?subject=` + subject + `&body=` + body; return;
    }

    const c = raw.toLowerCase();
    hist.push(raw); hi = hist.length;
    if (c === './download_resume.sh' || c === 'download_resume.sh' || c === 'download_resume' || c === 'resume') {
        tEcho(raw, '$');
        tPrint(`<span style="color:${Y};">[+] Executing ./download_resume.sh...</span><br><br>` +
            `Resolving <b style="color:${R};">KUMAR_KARTIK_DATAENGINEER.pdf</b> from the same folder as this page. GitHub Pages serves that file statically - the resume is not generated by a server when you run this command.<br><br>` +
            `If the browser asks for permission, allow the download for this site. The file is the PDF linked from the overview.`);
        downloadResume();
        tPrint(`<span style="color:${R};font-weight:bold;">[SUCCESS]</span> The browser download was triggered. If nothing saved, check the downloads bar or this site's download permission, then run the command again.`);
        return;
    }
    tEcho(raw, '$');
    switch (c) {
        case 'help':
            tPrint(`<span style="color:${R};font-weight:bold;">- Interactive Terminal Help -</span><br><br>` +
                `These are the same facts as the rest of the page, written out as files. The <b style="color:` + Y + `">cat</b> commands are long-form, not one-line summaries. Scroll the panel if a reply runs past the fold. Up and down walk the history, and Tab completes a command.<br><br>` +
                `<b style="color:${Y};">whoami</b>Who I am, where I work, and the rule I actually build by.<br><br>` +
                `<b style="color:${Y};">cat experience.txt</b>The Amdocs role, stage by stage: ingest, schedule, transfer, validate, monitor, and the Informatica harvest. What each stage is for, what I change, and what "done" looks like.<br><br>` +
                `<b style="color:${Y};">cat skills.json</b>The stack as JSON, with a note on how each group is used in production rather than a bare list of names.<br><br>` +
                `<b style="color:${Y};">cat projects.txt</b>Three builds outside the day job: the dbt sales warehouse, the edge-network simulation, and the Spring Boot course API. Each one says what the layers are and why they are split that way.<br><br>` +
                `<b style="color:${Y};">connect</b>A short contact sheet. Name and email can be skipped. It opens a mail draft to me; this page does not keep the message.<br><br>` +
                `<b style="color:${Y};">./download_resume.sh</b>Downloads KUMAR_KARTIK_DATAENGINEER.pdf from this site.<br><br>` +
                `<b style="color:${Y};">clear</b>Wipes the panel.`);
            break;
        case 'whoami': tPrint(WHOAMI); break;
        case 'cat experience.txt':
            tPrint(`<span style="color:${R};font-weight:bold;">AMDOCS - DATA ENGINEER (FULL-TIME)</span><br>` +
                `Sep 2024 - Present · Pune, India<br>` +
                `Production pipelines: ingestion, orchestration, transfer, validation, monitoring, migration.<br>` +
                `--------------------------------------------------------------------------------<br><br>` +
                `<b style="color:${Y};">1. ETL PIPELINES</b> - SnowSQL, Snowflake CTL, staging -> intermediate<br>` +
                `Raw batch does not go straight into a table someone is already querying. Flat files and Oracle extracts land through SnowSQL and custom CTL files into a governed staging layer. From there, SnowSQL transforms build the intermediate models the rest of the stream reads.<br>` +
                `Staging is the quarantine. A late file, a short file, or a layout change fails there, where the batch can be reloaded without rewriting serving history. The CTL file is the contract for what a good file looks like. The transform is versioned work, not a one-off fix applied in the middle of the night.<br><br>` +
                `<b style="color:${Y};">2. ENTERPRISE SCHEDULING</b> - IBM TWS<br>` +
                `TWS owns the order of the night. I author the streams, the dependencies between ingest, transform, transfer, and publish, and the calendars those jobs follow. I watch that cycle for abends, long runners, and missed dependencies, and I update the stream when a new feed is added.<br>` +
                `A stalled job used to wait until someone noticed it in the morning. Fallback and recovery paths now restart or reroute that work so the stream does not sit idle for a manual restart. On-time delivery on this schedule is 99.8%.<br><br>` +
                `<b style="color:${Y};">3. AUTOMATION SCRIPTING</b> - ksh and Python<br>` +
                `The scripts are the glue between the scheduler, the Linux grid, and the warehouses. ksh covers the host-level work: reading Conman, moving files, and emitting the morning status. Python covers the work that needs a real comparison, especially Snowflake against Vertica.<br>` +
                `Both exist to delete a recurring manual step. If a transfer, a check, or a status mail has to happen every day, it is a script with a log, not a reminder in someone's inbox. That is the same rule as the rest of the role: a process that runs more than once gets automated.<br><br>` +
                `<b style="color:${Y};">4. CLOUD HANDOFF</b> - encrypted SFTP, Linux grid -> Azure Blob<br>` +
                `Downstream processing cannot treat the on-prem Linux grid as local disk. The wrappers I built pick up a finished extract, send it over encrypted SFTP into an Azure Blob Container, and refuse to call the transfer done on a partial object. Credentials are rotated, not baked into a script that gets copied from host to host.<br>` +
                `A dropped connection is retried. The result this path is run for is zero data loss: the blob is trusted only after the transfer has actually completed, and only then does the downstream cloud step see the file.<br><br>` +
                `<b style="color:${Y};">5. DATA QUALITY</b> - Python, Snowflake and Vertica, 75,000+ rows<br>` +
                `Two platforms can both report a successful job and still disagree. The validation framework pulls comparable data from Snowflake and Vertica and diffs it at column level, not as a row count. A run covers 75,000+ records and writes a column-wise audit: the keys that differ, the columns that moved, and the size of the gap.<br>` +
                `That report is the start of the investigation. A bad cast, a filter that dropped the wrong slice, or an update that landed on only one side does not show up in a row count. It shows up here, before the batch is treated as final and handed to the serving layer.<br><br>` +
                `<b style="color:${Y};">6. INFORMATICA XML HARVESTER</b> - PowerCenter<br>` +
                `Coming off Informatica PowerCenter required every mapping and session definition, not the subset someone remembered to export from the client. The engine reads those objects out as XML, in parallel, bundles them, and sends a status so it is obvious what was harvested and whether the run finished.<br>` +
                `The manual extraction step is gone - 100% of that effort. What is left is a run you can repeat and a bundle you can review, instead of a folder that depended on a person clicking through the repository and saving a current copy of each session.<br><br>` +
                `Next: <b style="color:${Y};">cat skills.json</b> for how the tools map to this work, or <b style="color:${Y};">cat projects.txt</b> for the builds outside Amdocs.`);
            break;
        case 'cat skills.json':
            tPrint(`{<br>` +
                `&nbsp;&nbsp;<span style="color:${R};">"languages"</span>: ["Python", "SQL (SnowSQL / ANSI)", "Java", "Linux Shell (ksh / bash)"],<br>` +
                `&nbsp;&nbsp;<span style="color:${R};">"languages_note"</span>: "Python is the reconciliation suite and the column-level variance reports. SnowSQL is the daily language for CTL loads and the staging-to-intermediate transforms. Java is the Course Management API, with the HTTP contract kept out of the database layer. ksh and bash are the grid jobs: SFTP wrappers, the Conman monitor, and the morning summary.",<br>` +
                `&nbsp;&nbsp;<span style="color:${R};">"data_engineering_tools"</span>: ["Snowflake", "PySpark", "dbt (Data Build Tool)", "TWS Scheduler (IBM Conman)", "Git"],<br>` +
                `&nbsp;&nbsp;<span style="color:${R};">"data_engineering_note"</span>: "Snowflake is where batch is staged, modeled, and served. IBM TWS schedules the streams; Conman is where job state and runtime are read from. dbt is the layering on the sales warehouse - staging, intermediate, marts, snapshots, and tests. PySpark is the batch and streaming side of the Databricks work. Git is how a pipeline change is reviewed instead of edited live on the host.",<br>` +
                `&nbsp;&nbsp;<span style="color:${R};">"cloud_and_platforms"</span>: ["Azure Databricks", "Azure Blob Storage", "Linux Grid Systems", "HP Vertica"],<br>` +
                `&nbsp;&nbsp;<span style="color:${R};">"cloud_note"</span>: "The Linux grid is where a lot of batch still finishes. Azure Blob is the container those finished extracts are handed to, over encrypted SFTP. HP Vertica is the second store the reconciliation has to agree with. Azure Databricks is the lakehouse platform behind the associate certifications: workflows, Delta, and the Azure services around the workspace.",<br>` +
                `&nbsp;&nbsp;<span style="color:${R};">"soft_skills"</span>: ["Leadership", "Event Management", "Cross-functional Collaboration", "Pipeline Reliability Engineering"],<br>` +
                `&nbsp;&nbsp;<span style="color:${R};">"soft_skills_note"</span>: "Leadership and event management are from a year as secretary of the Rotaract Club at Bharati Vidyapeeth COEP - sessions and social events for the student community, not a title on its own. The engineering version is the work with operations: read the failed run together, name the step that broke, and leave a check so the same miss is loud the next morning."<br>}`);
            break;
        case 'cat projects.txt':
            tPrint(`<span style="color:${R};font-weight:bold;">KEY ENGINEERING PROJECTS</span><br>` +
                `Personal builds, outside day-to-day Amdocs work. Each one is finished.<br>` +
                `--------------------------------------------------------------------------------<br><br>` +
                `<b style="color:${Y};">1. Enterprise Sales Data Warehouse</b><br>` +
                `Stack: Snowflake, dbt Core, SQL, Jinja<br>` +
                `An end-to-end ELT warehouse, built as layers rather than a pile of SQL files that all query the raw feed. Sources land in staging models that stay close to the extract and do almost no business logic, so a source change is visible in one place.<br>` +
                `Intermediate models hold the joins and the rules. The marts stay readable because of that split: they are a star schema, dimension and fact tables, which is the shape the questions are actually asked against. Incremental models keep a daily run from rebuilding history. Snapshots keep the previous version of a changed dimension row. Freshness tests fail the run when a source stops arriving, instead of quietly serving yesterday as if it were current.<br><br>` +
                `<b style="color:${Y};">2. Edge Computing Network Simulation</b><br>` +
                `Stack: Python, Salabim, SimPy<br>` +
                `A load-balancing simulation for distributed edge nodes, built to watch the system fail in a controlled way. The model is discrete events: arrivals, service time, queues filling, and a node dropping out. Salabim and SimPy run the event model. Python drives the experiment. An interactive view shows packet queues and failover while the run is under stress.<br>` +
                `The useful output is the behavior, not the picture. Where the queue grows, when a failover actually helps, and when it only moves the overload onto the next node. That is the same question a pipeline schedule asks - a retry that hides a stuck dependency is not a fix - just asked against a simulated network instead of a TWS stream.<br><br>` +
                `<b style="color:${Y};">3. Course Management REST API</b><br>` +
                `Stack: Java, Spring Boot, MySQL, React.js<br>` +
                `A RESTful backend with the layers kept strict. The controller owns the HTTP contract. The service owns the rules. The DAO is the only layer that talks to MySQL. A query change does not leak into the shape of the API, and a change to the payload does not turn into SQL string-building in the controller.<br>` +
                `A React.js frontend sits on that API. The project is small on purpose: it is there to show the boundary between interface, rules, and storage, which is the same boundary I want in a pipeline - staging, transform, and serving each have one job.`);
            break;
        case 'connect':
            tState = 'WAITING_NAME'; tp.textContent = 'Name (Optional):';
            tPrint(`<span style="color:${Y};">Opening a contact sheet.</span><br><br>` +
                `Three fields: name, email, message. Name and email can be skipped with Enter. When you submit the message, this page opens a draft in your mail client addressed to kumarkartik1920@gmail.com. There is no inbox on the site itself, and the text is not saved here.<br><br>` +
                `Enter your name, or press Enter to skip:`);
            break;
        case 'clear': tb.innerHTML = ''; break;
        default:
            tPrint(`bash: ` + esc(raw) + `: command not found. Type <b style="color:${Y};">help</b> to inspect valid commands.`);
    }
}
function submitTerm() { const v = ti.value.trim(); ti.value = ''; handleCmd(v); ti.focus({ preventScroll: true }); }
$('#termSend').addEventListener('click', submitTerm);
ti.addEventListener('keydown', e => {
    if (e.key === 'Enter') submitTerm();
    else if (e.key === 'ArrowUp' && hist.length) { e.preventDefault(); hi = Math.max(hi - 1, 0); ti.value = hist[hi]; }
    else if (e.key === 'ArrowDown' && hist.length) { e.preventDefault(); hi = Math.min(hi + 1, hist.length); ti.value = hist[hi] || ''; }
    else if (e.key === 'Tab' && tState === 'NORMAL' && ti.value) {
        const m = CMDS.filter(c => c.startsWith(ti.value.toLowerCase()));
        if (m.length) { e.preventDefault(); ti.value = m[0]; }
    }
});
$$('.hint').forEach(h => h.addEventListener('click', () => {
    ti.value = h.dataset.cmd; handleCmd(h.dataset.cmd); ti.value = ''; ti.focus({ preventScroll: true });
}));

/* auto "whoami" the first time the terminal is seen */
if ('IntersectionObserver' in window) {
    const tio = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { tio.disconnect(); setTimeout(() => { tEcho('whoami', '$'); tPrint(WHOAMI); }, 500); }
    }), { threshold: 0.5 });
    tio.observe($('.term'));
}

/* Tab icons ignore SVG animation, so the dot is two still icons swapped in place. */
(function blinkFavicon() {
    const icon = (dot) => 
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
        `<text x="1.5" y="23.5" font-family="Arial,Helvetica,sans-serif" font-size="17" font-weight="700" fill="#F5F5A5A">KK</text>` +
        (dot ? `<circle cx="28.4" cy="21.5" r="2.7" fill="#EF4444"/>` : ``) +
        `</svg>`;
    
    const href = (dot) => `data:image/svg+xml,` + encodeURIComponent(icon(dot));
    let on = false;
    const tick = () => {
        on = !on;
        const prev = document.getElementById('favicon') || document.querySelector('link[rel="icon"]');
        const link = document.createElement('link');
        link.id = 'favicon';
        link.rel = 'icon';
        link.type = 'image/svg+xml';
        link.href = href(on);
        if (prev) prev.replaceWith(link);
        else document.head.appendChild(link);
    };
    tick();
    if (!reduce) setInterval(tick, 700);
})();

/* -------- init -------- */
const start = () => { moveInd(); onScroll(); setTimeout(typeName, 250); };
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
})();
