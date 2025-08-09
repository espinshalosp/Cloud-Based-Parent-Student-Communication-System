(function(){
  const STORAGE_KEYS = {
    announcements: 'mock_announcements',
    attendance: 'mock_attendance',
    marks: 'mock_marks',
    currentRole: 'mock_current_role',
    parentChildId: 'mock_child_id',
    students: 'mock_students'
  };

  function getNowDate() { const d = new Date(); return d.toISOString().slice(0,10); }
  function getStorage(key, fallback) { try { const val = JSON.parse(localStorage.getItem(key) || ''); return val ?? fallback; } catch { return fallback; } }
  function setStorage(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  function seedIfEmpty() {
    const seeded = getStorage('mock_seeded', false);
    if (seeded) return;
    const announcements = [
      { date: getNowDate(), title: 'Welcome Back!', message: 'School reopens on Monday. Please be on time.' },
      { date: getNowDate(), title: 'PTA Meeting', message: 'PTA meeting scheduled next Friday at 3 PM in the auditorium.' }
    ]; setStorage(STORAGE_KEYS.announcements, announcements);
    const attendance = { 1: [ { date: getNowDate(), status: 'present' }, { date: getNowDate(), status: 'absent' } ], 2: [ { date: getNowDate(), status: 'present' } ] }; setStorage(STORAGE_KEYS.attendance, attendance);
    const marks = { 1: [ { subject: 'Mathematics', marks: 88 }, { subject: 'English', marks: 93 }, { subject: 'Science', marks: 79 } ], 2: [ { subject: 'Science', marks: 76 }, { subject: 'Mathematics', marks: 81 } ] }; setStorage(STORAGE_KEYS.marks, marks);
    const students = { 1: { name: 'Alice Johnson', class: '5A' }, 2: { name: 'Bob Smith', class: '5A' }, 3: { name: 'Carol Diaz', class: '5A' } }; setStorage(STORAGE_KEYS.students, students);
    setStorage('mock_seeded', true);
  }

  function showMessage(elementId, type, text) { const el = document.getElementById(elementId); if (!el) return; el.className = type === 'error' ? 'error mt-16' : 'success mt-16'; el.textContent = text; }
  function togglePasswordVisibilityOnClick() { document.querySelectorAll('.toggle-pass').forEach(btn => { btn.addEventListener('click', () => { const targetId = btn.getAttribute('data-target'); const input = document.getElementById(targetId); if (!input) return; if (input.type === 'password') { input.type = 'text'; btn.textContent = 'Hide'; } else { input.type = 'password'; btn.textContent = 'Show'; } }); }); }

  function renderAnnouncements(tbodySelector, items) { const tbody = document.querySelector(tbodySelector); if (!tbody) return; tbody.innerHTML = ''; if (!items || items.length === 0) { tbody.innerHTML = `<tr><td colspan="3" class="hint">No announcements.</td></tr>`; return; } items.forEach(a => { const tr = document.createElement('tr'); tr.innerHTML = `<td>${a.date}</td><td>${a.title}</td><td>${a.message}</td>`; tbody.appendChild(tr); }); }
  function renderAttendance(items) { const tbody = document.getElementById('attendance-tbody'); if (!tbody) return; tbody.innerHTML = ''; if (!items || items.length === 0) { tbody.innerHTML = `<tr><td colspan="2" class="hint">No attendance records yet.</td></tr>`; return; } items.forEach(r => { const tr = document.createElement('tr'); const badgeClass = r.status === 'present' ? 'badge success' : 'badge danger'; tr.innerHTML = `<td>${r.date}</td><td><span class="${badgeClass}">${r.status}</span></td>`; tbody.appendChild(tr); }); }
  function renderMarks(items) { const tbody = document.getElementById('marks-tbody'); if (!tbody) return; tbody.innerHTML = ''; if (!items || items.length === 0) { tbody.innerHTML = `<tr><td colspan="2" class="hint">No marks yet.</td></tr>`; return; } items.forEach(r => { const tr = document.createElement('tr'); tr.innerHTML = `<td>${r.subject}</td><td>${r.marks}</td>`; tbody.appendChild(tr); }); }

  function uniq(array) { return Array.from(new Set(array)); }
  function computeAttendanceRate(records) { if (!records || records.length === 0) return 0; const present = records.filter(r => r.status === 'present').length; return Math.round((present / records.length) * 100); }
  function computeAverageMarks(records) { if (!records || records.length === 0) return 0; const sum = records.reduce((a,b)=> a + (Number(b.marks)||0), 0); return Math.round(sum / records.length); }

  function renderSparkline(values) { const svg = document.getElementById('marks-sparkline'); if (!svg) return; svg.innerHTML=''; if (!values || values.length === 0) return; const max = Math.max(...values, 100); const min = Math.min(...values, 0); const n = values.length; const points = values.map((v,i)=>{ const x = (i / (n - 1 || 1)) * 100; const y = 30 - ((v - min) / ((max - min) || 1)) * 30; return `${x},${y}`; }).join(' '); const polyline = document.createElementNS('http://www.w3.org/2000/svg','polyline'); polyline.setAttribute('fill','none'); polyline.setAttribute('stroke','#2563eb'); polyline.setAttribute('stroke-width','2'); polyline.setAttribute('points', points); svg.appendChild(polyline); }
  function populateMarksFilter(records) { const select = document.getElementById('marks-filter'); if (!select) return; const subjects = uniq(records.map(r => r.subject)); select.innerHTML = '<option value="">All subjects</option>' + subjects.map(s => `<option value="${s}">${s}</option>`).join(''); select.addEventListener('change', () => { const val = select.value; const filtered = val ? records.filter(r => r.subject === val) : records; renderMarks(filtered); renderSparkline(filtered.map(r => Number(r.marks)||0)); }); }

  function loadAnnouncementsForParent() { const announcements = getStorage(STORAGE_KEYS.announcements, []); renderAnnouncements('#parent-announcements-tbody', announcements); const month = new Date().toISOString().slice(0,7); const countThisMonth = announcements.filter(a => (a.date||'').startsWith(month)).length; const el = document.getElementById('stat-annc-count'); if (el) el.textContent = String(countThisMonth); }

  function loadParentData() {
    const childId = String(getStorage(STORAGE_KEYS.parentChildId, '1'));
    const students = getStorage(STORAGE_KEYS.students, {});
    const student = students[childId] || { name: `Student #${childId}`, class: '—' };
    const avatar = document.getElementById('child-avatar'); const nameEl = document.getElementById('child-name'); const classEl = document.getElementById('child-class'); const idEl = document.getElementById('child-id');
    if (avatar) avatar.textContent = (student.name || 'S').slice(0,1).toUpperCase(); if (nameEl) nameEl.textContent = student.name || `Student #${childId}`; if (classEl) classEl.textContent = student.class || '—'; if (idEl) idEl.textContent = childId;
    const attendanceAll = getStorage(STORAGE_KEYS.attendance, {}); const marksAll = getStorage(STORAGE_KEYS.marks, {}); const att = attendanceAll[childId] || []; const mrk = marksAll[childId] || [];
    const rate = computeAttendanceRate(att); const avg = computeAverageMarks(mrk); const rateEl = document.getElementById('stat-attendance'); const avgEl = document.getElementById('stat-average'); if (rateEl) rateEl.textContent = `${rate}%`; if (avgEl) avgEl.textContent = String(avg);
    renderAttendance(att); renderMarks(mrk); populateMarksFilter(mrk); renderSparkline(mrk.map(r => Number(r.marks)||0));
    loadAnnouncementsForParent(); const refreshBtn = document.getElementById('refresh-announcements'); if (refreshBtn) refreshBtn.addEventListener('click', loadAnnouncementsForParent);
    // Streak and achievements (mock based on attendance)
    const streakContainer = document.getElementById('att-streak'); if (streakContainer) { streakContainer.innerHTML = ''; const last10 = att.slice(0,10); for (let i=0;i<10;i++){ const cell = document.createElement('div'); cell.className = 'cell' + (last10[i] && last10[i].status === 'present' ? ' on' : ''); streakContainer.appendChild(cell); } }
  }

  // Teacher helpers
  function updateTeacherStats() {
    const attendanceAll = getStorage(STORAGE_KEYS.attendance, {});
    const marksAll = getStorage(STORAGE_KEYS.marks, {});
    // Today marked
    const today = getNowDate();
    let countToday = 0; Object.values(attendanceAll).forEach(list => { list.forEach(r => { if (r.date === today) countToday++; }); });
    const todayEl = document.getElementById('stat-today-marked'); if (todayEl) todayEl.textContent = String(countToday);
    // Class average
    const allMarks = Object.values(marksAll).flat();
    const avg = computeAverageMarks(allMarks);
    const avgEl = document.getElementById('stat-class-average'); if (avgEl) avgEl.textContent = String(avg);
    // Announcements count this month
    const announcements = getStorage(STORAGE_KEYS.announcements, []);
    const month = new Date().toISOString().slice(0,7);
    const countThisMonth = announcements.filter(a => (a.date||'').startsWith(month)).length;
    const annEl = document.getElementById('stat-annc-count-teacher'); if (annEl) annEl.textContent = String(countThisMonth);
  }

  function renderAnnouncementsTableTeacher() { const list = getStorage(STORAGE_KEYS.announcements, []); const tbody = document.getElementById('announcements-tbody'); if (!tbody) return; tbody.innerHTML = ''; list.forEach(a => { const tr = document.createElement('tr'); tr.innerHTML = `<td>${a.date}</td><td>${a.title}</td><td>${a.message}</td>`; tbody.appendChild(tr); }); }
  function appendRecentActivity(text) { const list = document.getElementById('recent-activity'); if (!list) return; const item = document.createElement('div'); item.className = 'item'; item.innerHTML = `<div class="icon">📝</div><div><div><strong>${text}</strong></div><div class="meta">${new Date().toLocaleString()}</div></div>`; list.prepend(item); }

  function bindRoster() {
    const rosterTbody = document.getElementById('roster-tbody'); if (!rosterTbody) return;
    const students = getStorage(STORAGE_KEYS.students, {});
    const ids = Object.keys(students);
    rosterTbody.innerHTML = '';
    ids.forEach(id => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${id}</td><td>${students[id].name}</td><td><select class="status-select" data-id="${id}"><option value="present">Present</option><option value="absent">Absent</option></select></td>`;
      rosterTbody.appendChild(tr);
    });
    const dateInput = document.getElementById('roster-date'); if (dateInput) dateInput.value = getNowDate();
    const allPresent = document.getElementById('mark-all-present'); const allAbsent = document.getElementById('mark-all-absent'); const submitBtn = document.getElementById('roster-submit');
    if (allPresent) allPresent.addEventListener('click', () => { rosterTbody.querySelectorAll('select').forEach(sel => sel.value = 'present'); });
    if (allAbsent) allAbsent.addEventListener('click', () => { rosterTbody.querySelectorAll('select').forEach(sel => sel.value = 'absent'); });
    if (submitBtn) submitBtn.addEventListener('click', () => {
      const date = (document.getElementById('roster-date') || {}).value || getNowDate();
      const attendance = getStorage(STORAGE_KEYS.attendance, {});
      rosterTbody.querySelectorAll('select').forEach(sel => {
        const id = String(sel.getAttribute('data-id'));
        const status = sel.value;
        attendance[id] = attendance[id] || [];
        attendance[id].unshift({ date, status });
      });
      setStorage(STORAGE_KEYS.attendance, attendance);
      appendRecentActivity('Bulk attendance saved');
      updateTeacherStats();
    });
  }

  function bindIndividualAttendance() {
    const form = document.getElementById('attendance-form'); if (!form) return;
    const dateInput = document.getElementById('att-date'); if (dateInput) dateInput.value = getNowDate();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const studentId = String(Number(formData.get('student_id')));
      const date = String(formData.get('date')) || getNowDate();
      const status = String(formData.get('status'));
      if (!studentId || !date || (status !== 'present' && status !== 'absent')) { showMessage('attendance-msg', 'error', 'Please provide valid inputs'); return; }
      const attendance = getStorage(STORAGE_KEYS.attendance, {});
      attendance[studentId] = attendance[studentId] || [];
      attendance[studentId].unshift({ date, status });
      setStorage(STORAGE_KEYS.attendance, attendance);
      showMessage('attendance-msg', 'success', 'Attendance saved');
      form.reset(); if (dateInput) dateInput.value = getNowDate();
      appendRecentActivity(`Attendance saved for Student #${studentId}`);
      updateTeacherStats();
    });
  }

  function bindAnnouncementTemplates() {
    document.querySelectorAll('.chips .chip[data-template]').forEach(chip => {
      chip.addEventListener('click', () => {
        const template = chip.getAttribute('data-template') || '';
        const msg = document.getElementById('annc-message'); if (!msg) return;
        msg.value = template;
        const title = document.getElementById('annc-title'); if (title && !title.value) { title.value = 'Announcement'; }
      });
    });
  }

  function bindAnnouncementsForm() {
    const form = document.getElementById('announcement-form'); if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const title = String(formData.get('title') || '').trim();
      const message = String(formData.get('message') || '').trim();
      if (!title || !message) { showMessage('annc-msg', 'error', 'Please provide a title and message'); return; }
      const announcements = getStorage(STORAGE_KEYS.announcements, []);
      announcements.unshift({ date: getNowDate(), title, message });
      setStorage(STORAGE_KEYS.announcements, announcements);
      showMessage('annc-msg', 'success', 'Announcement published');
      form.reset();
      renderAnnouncementsTableTeacher();
      appendRecentActivity('Announcement published');
      updateTeacherStats();
    });
    const refreshBtn = document.getElementById('refresh-announcements'); if (refreshBtn) refreshBtn.addEventListener('click', renderAnnouncementsTableTeacher);
  }

  function bindMarksForm() {
    const form = document.getElementById('marks-form'); if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const studentId = String(Number(formData.get('student_id')));
      const subject = String(formData.get('subject') || '').trim();
      const marksVal = Number(formData.get('marks'));
      if (!studentId || !subject || isNaN(marksVal) || marksVal < 0 || marksVal > 100) { showMessage('marks-msg', 'error', 'Please provide valid inputs'); return; }
      const marks = getStorage(STORAGE_KEYS.marks, {});
      marks[studentId] = marks[studentId] || [];
      marks[studentId].unshift({ subject, marks: marksVal });
      setStorage(STORAGE_KEYS.marks, marks);
      showMessage('marks-msg', 'success', 'Marks saved');
      form.reset();
      appendRecentActivity(`Marks saved for Student #${studentId} (${subject}: ${marksVal})`);
      updateTeacherStats();
      computeNeedsAttention();
    });
  }

  function computeNeedsAttention() {
    const container = document.getElementById('needs-attention'); if (!container) return;
    const attendanceAll = getStorage(STORAGE_KEYS.attendance, {});
    const marksAll = getStorage(STORAGE_KEYS.marks, {});
    const students = getStorage(STORAGE_KEYS.students, {});
    const problems = [];
    Object.keys(students).forEach(id => {
      const att = attendanceAll[id] || [];
      const mrk = marksAll[id] || [];
      const rate = computeAttendanceRate(att);
      const avg = computeAverageMarks(mrk);
      if (rate < 75 || avg < 50) {
        problems.push({ id, name: students[id].name, rate, avg });
      }
    });
    container.innerHTML = '';
    if (problems.length === 0) {
      const div = document.createElement('div'); div.className = 'item'; div.innerHTML = '<div class="icon">✓</div><div><div><strong>All students on track</strong></div><div class="meta">No attention needed right now</div></div>'; container.appendChild(div); return;
    }
    problems.forEach(p => {
      const div = document.createElement('div'); div.className = 'item'; div.innerHTML = `<div class="icon">!</div><div><div><strong>${p.name} (ID ${p.id})</strong></div><div class="meta">Attendance: ${p.rate}% • Average: ${p.avg}</div></div>`; container.appendChild(div);
    });
  }

  function bindExportCSV() {
    const btn = document.getElementById('export-marks'); if (!btn) return;
    btn.addEventListener('click', () => {
      const marksAll = getStorage(STORAGE_KEYS.marks, {});
      const rows = [['student_id','subject','marks']];
      Object.keys(marksAll).forEach(id => { (marksAll[id] || []).forEach(r => rows.push([id, r.subject, r.marks])); });
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'marks_export.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    });
  }

  function bindContactTeacher() {
    const form = document.getElementById('contact-teacher-form'); if (!form) return;
    const msgEl = document.getElementById('ct-msg');
    form.addEventListener('submit', (e) => {
      e.preventDefault(); if (msgEl) msgEl.textContent = 'Message sent (demo)'; setTimeout(()=> { if (msgEl) msgEl.textContent = ''; }, 2000);
    });
  }

  function init() {
    seedIfEmpty();
    togglePasswordVisibilityOnClick();
    const bodyId = document.body.id || '';
    if (bodyId === 'teacher-dashboard') {
      bindIndividualAttendance();
      bindRoster();
      bindAnnouncementTemplates();
      bindAnnouncementsForm();
      bindMarksForm();
      bindExportCSV();
      computeNeedsAttention();
      renderAnnouncementsTableTeacher();
      updateTeacherStats();
    }
    if (bodyId === 'parent-dashboard') {
      loadParentData();
      bindContactTeacher();
    }
    if (bodyId === 'teacher-login') {
      const form = document.getElementById('teacher-login-form'); const demoBtn = document.getElementById('t-use-demo'); if (demoBtn) { demoBtn.addEventListener('click', () => { const email = document.getElementById('t-email'); const pass = document.getElementById('t-password'); if (email) email.value = 'teacher@example.com'; if (pass) pass.value = 'password'; }); } if (form) { form.addEventListener('submit', (e) => { e.preventDefault(); setStorage(STORAGE_KEYS.currentRole, 'teacher'); window.location.href = './teacher-dashboard.html'; }); }
    }
    if (bodyId === 'parent-login') {
      const form = document.getElementById('parent-login-form'); const demoBtn = document.getElementById('p-use-demo'); if (demoBtn) { demoBtn.addEventListener('click', () => { const email = document.getElementById('p-email'); const pass = document.getElementById('p-password'); const child = document.getElementById('p-child'); if (email) email.value = 'parent@example.com'; if (pass) pass.value = 'password'; if (child) child.value = '1'; }); } if (form) { form.addEventListener('submit', (e) => { e.preventDefault(); const child = document.getElementById('p-child'); const childId = child && child.value ? String(Number(child.value)) : '1'; setStorage(STORAGE_KEYS.currentRole, 'parent'); setStorage(STORAGE_KEYS.parentChildId, childId); window.location.href = './parent-dashboard.html'; }); }
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();