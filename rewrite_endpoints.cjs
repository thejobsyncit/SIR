const fs = require('fs');

const indexPath = 'c:/Users/Admin/Downloads/SIR-main/SIR-main/server/index.js';
let content = fs.readFileSync(indexPath, 'utf8');

const replacement = `// API Routes - JOBS
app.get('/api/jobs', async (req, res) => {
  try {
    const supabase = await getDb();
    let query = supabase.from('jobs').select('*');

    if (req.query.country && req.query.country !== 'All') {
      query = query.eq('country', req.query.country);
    }
    if (req.query.category && req.query.category !== 'All') {
      query = query.eq('category', req.query.category);
    }
    if (req.query.jobType && req.query.jobType !== 'All') {
      query = query.eq('jobType', req.query.jobType);
    }

    let { data: rows, error } = await query;
    if (error) throw error;

    if (req.query.keyword) {
      const k = req.query.keyword.toLowerCase();
      rows = rows.filter(j => j.title.toLowerCase().includes(k) || j.company.toLowerCase().includes(k));
    }

    // Format arrays
    rows = rows.map(r => ({
      ...r,
      skills: parseArray(r.skills),
      benefits: parseArray(r.benefits),
      featured: r.featured === 1 || r.featured === true
    }));

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const supabase = await getDb();
    const { data: job, error } = await supabase.from('jobs').select('*').eq('id', req.params.id).single();
    if (error || !job) return res.status(404).json({ success: false, message: 'Job not found' });
    
    job.skills = parseArray(job.skills);
    job.benefits = parseArray(job.benefits);
    job.featured = job.featured === 1 || job.featured === true;
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const { id, title, company, country, location, salary, experience, jobType, category, description, vacancies, skills, qualification, benefits } = req.body;
    const jobId = id || \`job-\${Date.now()}\`;
    const skillsStr = JSON.stringify(Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : ['Management']));
    const benefitsStr = JSON.stringify(Array.isArray(benefits) ? benefits : (benefits ? benefits.split(',').map(b => b.trim()) : ['Tax-free salary', 'Visa Sponsorship']));

    const supabase = await getDb();
    const { data: newJob, error } = await supabase.from('jobs').insert([{
      id: jobId,
      title: title || 'Untitled',
      company: company || 'Revival International',
      country: country || 'UAE',
      location: location || '',
      salary: salary || 'Negotiable',
      experience: experience || '2-5 Years',
      jobType: jobType || 'Full-time',
      category: category || 'General',
      description: description || '',
      vacancies: vacancies || '1',
      skills: skillsStr,
      qualification: qualification || 'Degree',
      benefits: benefitsStr,
      postedDate: 'Just now',
      featured: 0
    }]).select().single();

    if (error) throw error;

    newJob.skills = parseArray(newJob.skills);
    newJob.benefits = parseArray(newJob.benefits);
    newJob.featured = newJob.featured === 1 || newJob.featured === true;
    res.json({ success: true, message: 'Job posted successfully', data: newJob });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/jobs/:id', async (req, res) => {
  try {
    const supabase = await getDb();
    const { title, company, country, location, salary, experience, jobType, category, description, vacancies, skills, qualification, benefits } = req.body;
    const skillsStr = JSON.stringify(Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []));
    const benefitsStr = JSON.stringify(Array.isArray(benefits) ? benefits : (benefits ? benefits.split(',').map(b => b.trim()) : []));

    const { error } = await supabase.from('jobs').update({
      title, company, country, location, salary, experience, jobType, category, description, vacancies, skills: skillsStr, qualification, benefits: benefitsStr
    }).eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Job updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const supabase = await getDb();
    const { error } = await supabase.from('jobs').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API Routes - CANDIDATES
app.get('/api/candidates', async (req, res) => {
  try {
    const supabase = await getDb();
    const { data: rows, error } = await supabase.from('candidates').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: rows.map(r => ({ ...r, skills: parseArray(r.skills) })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/candidates', async (req, res) => {
  try {
    const { id, name, email, phone, nationality, currentEmployer, currentRole, currentSalary, expectedSalary, score, stage, skills, source, passport, aiSummary, experience } = req.body;
    const candId = id || \`REV-CAN-\${Math.floor(1000 + Math.random() * 9000)}\`;
    const skillsStr = JSON.stringify(Array.isArray(skills) ? skills : []);
    const supabase = await getDb();
    
    const { data: cand, error } = await supabase.from('candidates').insert([{
      id: candId, name, email, phone, nationality, currentEmployer, currentRole, currentSalary, expectedSalary, 
      score: score || 85, stage: stage || 'new', skills: skillsStr, source: source || 'Website', passport, aiSummary, experience
    }]).select().single();
    
    if (error) throw error;
    res.json({ success: true, data: { ...cand, skills: parseArray(cand.skills) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/candidates/:id', async (req, res) => {
  try {
    const { name, email, phone, stage, score } = req.body;
    const supabase = await getDb();
    const { error } = await supabase.from('candidates').update({
      name, email, phone, stage, score
    }).eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/candidates/:id', async (req, res) => {
  try {
    const supabase = await getDb();
    const { error } = await supabase.from('candidates').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API Routes - CLIENTS
app.get('/api/clients', async (req, res) => {
  try {
    const supabase = await getDb();
    const { data: rows, error } = await supabase.from('clients').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const { id, company, industry, location, contactPerson, email, phone, requirements } = req.body;
    const clientId = id || \`CLIENT-\${Math.floor(1000 + Math.random() * 9000)}\`;
    const supabase = await getDb();
    
    const { data: client, error } = await supabase.from('clients').insert([{
      id: clientId, company, industry, location, contactPerson, email, phone, requirements
    }]).select().single();
    
    if (error) throw error;
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const supabase = await getDb();
    const { error } = await supabase.from('clients').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API Routes - INTERVIEWS
app.get('/api/interviews', async (req, res) => {
  try {
    const supabase = await getDb();
    const { data: rows, error } = await supabase.from('interviews').select('*').order('date', { ascending: true }).order('time', { ascending: true });
    if (error) throw error;
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/interviews', async (req, res) => {
  try {
    const { id, candidateId, candidateName, jobId, jobTitle, company, date, time, platform } = req.body;
    const intId = id || \`INT-\${Math.floor(1000 + Math.random() * 9000)}\`;
    const supabase = await getDb();
    
    const { data: interview, error } = await supabase.from('interviews').insert([{
      id: intId, candidateId, candidateName, jobId, jobTitle, company, date, time, platform
    }]).select().single();
    
    if (error) throw error;
    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/interviews/:id', async (req, res) => {
  try {
    const supabase = await getDb();
    const { error } = await supabase.from('interviews').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API Routes - LEADS (Contact Form)
app.get('/api/leads', async (req, res) => {
  try {
    const supabase = await getDb();
    const { data: rows, error } = await supabase.from('leads').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { id, name, email, company, phone, message } = req.body;
    const leadId = id || \`LEAD-\${Math.floor(1000 + Math.random() * 9000)}\`;
    const supabase = await getDb();
    
    const { data: lead, error } = await supabase.from('leads').insert([{
      id: leadId, name, email, company, phone, message
    }]).select().single();
    
    if (error) throw error;
    res.json({ success: true, data: { ...lead, status: 'New' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
`;

const startMarker = "// API Routes - JOBS";
const endMarker = "// Original app routes below (visa, analysis, etc.)";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) + replacement + '\n' + content.substring(endIndex);
  fs.writeFileSync(indexPath, newContent, 'utf8');
  console.log("Rewrote endpoints successfully");
} else {
  console.log("Could not find markers");
}
