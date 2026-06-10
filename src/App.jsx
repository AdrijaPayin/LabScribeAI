import { useState, useRef } from 'react'
import {
  FlaskConical, FileText, Download, Loader, ChevronRight,
  Plus, Trash2, Sparkles, RotateCcw, Copy, Check,
  BookOpen, Microscope, BarChart3, Lightbulb, AlertCircle,
  Eye, EyeOff, ClipboardList
} from 'lucide-react'
import styles from './App.module.css'

const EXPERIMENT_TYPES = [
  'Electronics & Circuits', 'Thermodynamics', 'Fluid Mechanics',
  'Strength of Materials', 'Chemistry Lab', 'Control Systems',
  'Signal Processing', 'Heat Transfer', 'Machine Design', 'Other'
]

const EXAMPLE_DATA = {
  title: 'Determination of Resistance Using Wheatstone Bridge',
  type: 'Electronics & Circuits',
  objective: 'To determine the unknown resistance of a resistor using the Wheatstone Bridge principle and verify Ohm\'s Law.',
  apparatus: 'Wheatstone Bridge setup, Galvanometer, Battery (6V DC), Known resistors (100Ω, 200Ω, 470Ω), Unknown resistor Rx, Connecting wires, Jockey/sliding key',
  theory: 'The Wheatstone Bridge is a circuit used to find the unknown resistance by balancing two legs of a bridge circuit. At balance condition: P/Q = R/S, where P, Q are known ratio arms, R is a variable resistance, and S is the unknown resistance.',
  observations: `Trial | P (Ω) | Q (Ω) | R (Ω) | Bridge Status
1     | 100   | 100   | 220   | Unbalanced
2     | 100   | 100   | 240   | Unbalanced
3     | 100   | 100   | 258   | Balanced
4     | 100   | 200   | 130   | Unbalanced
5     | 100   | 200   | 129   | Balanced`,
  calculations: 'At balance: S = (Q/P) × R\nTrial 3: S = (100/100) × 258 = 258 Ω\nTrial 5: S = (200/100) × 129 = 258 Ω\nMean S = 258 Ω',
  rawNotes: 'Room temperature: 28°C. Humidity normal. Some galvanometer sensitivity issues at start, resolved by tightening connections. Results were consistent across trials.'
}

const SECTIONS = [
  { key: 'abstract', label: 'Abstract', icon: FileText },
  { key: 'introduction', label: 'Introduction & Theory', icon: BookOpen },
  { key: 'methodology', label: 'Methodology', icon: Microscope },
  { key: 'results', label: 'Results & Analysis', icon: BarChart3 },
  { key: 'discussion', label: 'Discussion', icon: Lightbulb },
  { key: 'conclusion', label: 'Conclusion', icon: ClipboardList },
  { key: 'improvements', label: 'Suggested Improvements', icon: AlertCircle },
]

function Step({ num, label, active, done, onClick }) {
  return (
    <button className={`${styles.step} ${active ? styles.stepActive : ''} ${done ? styles.stepDone : ''}`} onClick={onClick}>
      <div className={styles.stepNum}>{done ? <Check size={12}/> : num}</div>
      <span>{label}</span>
    </button>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {hint && <p className={styles.fieldHint}>{hint}</p>}
      {children}
    </div>
  )
}

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('lr_api_key') || '')
  const [showKey, setShowKey] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingSection, setLoadingSection] = useState('')
  const [generated, setGenerated] = useState({})
  const [copied, setCopied] = useState('')
  const [activeSection, setActiveSection] = useState('abstract')

  // Form state
  const [form, setForm] = useState({
    title: '',
    type: 'Electronics & Circuits',
    studentName: '',
    rollNo: '',
    date: new Date().toISOString().split('T')[0],
    objective: '',
    apparatus: '',
    theory: '',
    observations: '',
    calculations: '',
    rawNotes: ''
  })

  const saveKey = k => { setApiKey(k); localStorage.setItem('lr_api_key', k) }
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const loadExample = () => setForm(f => ({ ...f, ...EXAMPLE_DATA }))

  const isStepComplete = (step) => {
    if (step === 0) return form.title && form.objective
    if (step === 1) return form.apparatus && form.theory
    if (step === 2) return form.observations
    return false
  }

  const generateSection = async (sectionKey) => {
    if (!apiKey) {
      alert('Please enter your Claude API key first!')
      return
    }

    const prompts = {
      abstract: `Write a concise academic abstract (150-200 words) for this lab experiment. Include the purpose, method, key results, and main conclusion.`,
      introduction: `Write a detailed Introduction & Theory section (250-350 words) covering the scientific/engineering principles, relevant equations, and background theory. Use proper academic language.`,
      methodology: `Write a clear Methodology/Procedure section (200-300 words) describing the experimental steps in a numbered, logical sequence based on the apparatus and observations provided.`,
      results: `Write a detailed Results & Analysis section. Interpret the observational data and calculations. Include any error analysis, percentage error calculations, and comparison with theoretical values. Use tables where appropriate (in markdown format).`,
      discussion: `Write an insightful Discussion section (200-300 words) analyzing: what the results mean, sources of error, how results compare to theoretical values, and what was learned.`,
      improvements: `Suggest 5-7 specific, practical improvements to this experiment's methodology, equipment, or analysis that would improve accuracy, safety, or learning outcomes. Be specific and technical.`,
      conclusion: `Write a precise Conclusion (150-200 words) summarizing what was achieved, whether objectives were met, key numerical results, and the significance of the experiment.`,
    }

    const experimentContext = `
Experiment Title: ${form.title}
Type: ${form.type}
Objective: ${form.objective}
Apparatus: ${form.apparatus}
Theory/Background: ${form.theory}
Observations/Data: ${form.observations}
Calculations: ${form.calculations}
Additional Notes: ${form.rawNotes}
`

    setLoadingSection(sectionKey)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are an expert engineering lab report writer and academic editor. 
Write professional, structured content for engineering lab reports.
Use formal academic language. Be precise and technical.
Do NOT add section headers — just write the content directly.
Format any equations clearly. Use markdown for tables if needed.`,
          messages: [{
            role: 'user',
            content: `${prompts[sectionKey]}\n\nExperiment Details:\n${experimentContext}`
          }]
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      setGenerated(g => ({ ...g, [sectionKey]: data.content[0].text }))
      setActiveSection(sectionKey)
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setLoadingSection('')
  }

  const generateAll = async () => {
    for (const s of SECTIONS) {
      await generateSection(s.key)
    }
  }

  const copySection = (key) => {
    navigator.clipboard.writeText(generated[key] || '')
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const exportReport = () => {
    const lines = [
      `${'═'.repeat(60)}`,
      `LABORATORY REPORT`,
      `${'═'.repeat(60)}`,
      ``,
      `Title: ${form.title}`,
      `Experiment Type: ${form.type}`,
      form.studentName ? `Student: ${form.studentName}` : '',
      form.rollNo ? `Roll No: ${form.rollNo}` : '',
      `Date: ${form.date}`,
      ``,
      `${'─'.repeat(60)}`,
      `OBJECTIVE`,
      `${'─'.repeat(60)}`,
      form.objective,
      ``,
      `${'─'.repeat(60)}`,
      `APPARATUS`,
      `${'─'.repeat(60)}`,
      form.apparatus,
      ``,
    ]

    SECTIONS.forEach(s => {
      if (generated[s.key]) {
        lines.push(`${'─'.repeat(60)}`)
        lines.push(s.label.toUpperCase())
        lines.push(`${'─'.repeat(60)}`)
        lines.push(generated[s.key])
        lines.push('')
      }
    })

    if (form.observations) {
      lines.push(`${'─'.repeat(60)}`)
      lines.push('OBSERVATIONS & DATA')
      lines.push(`${'─'.repeat(60)}`)
      lines.push(form.observations)
      lines.push('')
    }
    if (form.calculations) {
      lines.push(`${'─'.repeat(60)}`)
      lines.push('CALCULATIONS')
      lines.push(`${'─'.repeat(60)}`)
      lines.push(form.calculations)
      lines.push('')
    }

    lines.push(`${'═'.repeat(60)}`)
    lines.push(`Generated by LabScribe AI | ${new Date().toLocaleString()}`)

    const blob = new Blob([lines.filter(l => l !== undefined).join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lab-report-${form.title.replace(/\s+/g, '-').toLowerCase() || 'report'}-${Date.now()}.txt`
    a.click()
  }

  const reset = () => {
    setForm({
      title: '', type: 'Electronics & Circuits', studentName: '',
      rollNo: '', date: new Date().toISOString().split('T')[0],
      objective: '', apparatus: '', theory: '', observations: '',
      calculations: '', rawNotes: ''
    })
    setGenerated({})
    setCurrentStep(0)
  }

  const generatedCount = Object.keys(generated).length

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <FlaskConical size={20} color="var(--accent)" />
            <span>LabScribe <em>AI</em></span>
          </div>
          <span className={styles.tagline}>Intelligent Lab Report Assistant</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.keyBox}>
            <span className={styles.keyLabel}>Claude API Key</span>
            <input
              type={showKey ? 'text' : 'password'}
              className={styles.keyInput}
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={e => saveKey(e.target.value)}
            />
            <button className={styles.eyeBtn} onClick={() => setShowKey(v => !v)}>
              {showKey ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
          </div>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Left: Input Form */}
        <div className={styles.inputPanel}>
          {/* Progress Steps */}
          <div className={styles.steps}>
            {['Experiment Info', 'Data & Theory', 'Generate Report'].map((label, i) => (
              <Step key={i} num={i + 1} label={label}
                active={currentStep === i}
                done={currentStep > i}
                onClick={() => setCurrentStep(i)} />
            ))}
          </div>

          <div className={styles.formArea}>
            {currentStep === 0 && (
              <div className={styles.formStep}>
                <div className={styles.stepHeader}>
                  <h2>Experiment Information</h2>
                  <button className={styles.exampleBtn} onClick={loadExample}>
                    <Sparkles size={13}/> Load Example
                  </button>
                </div>

                <Field label="Experiment Title *" hint="Full descriptive title of your experiment">
                  <input className={styles.input} value={form.title}
                    onChange={e => update('title', e.target.value)}
                    placeholder="e.g. Determination of Resistance Using Wheatstone Bridge" />
                </Field>

                <div className={styles.row2}>
                  <Field label="Experiment Type">
                    <select className={styles.input} value={form.type}
                      onChange={e => update('type', e.target.value)}>
                      {EXPERIMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Date">
                    <input type="date" className={styles.input} value={form.date}
                      onChange={e => update('date', e.target.value)} />
                  </Field>
                </div>

                <div className={styles.row2}>
                  <Field label="Student Name">
                    <input className={styles.input} value={form.studentName}
                      onChange={e => update('studentName', e.target.value)}
                      placeholder="Your full name" />
                  </Field>
                  <Field label="Roll No.">
                    <input className={styles.input} value={form.rollNo}
                      onChange={e => update('rollNo', e.target.value)}
                      placeholder="e.g. ECE-2024-045" />
                  </Field>
                </div>

                <Field label="Objective *" hint="What is this experiment trying to determine or prove?">
                  <textarea className={styles.textarea} rows={3} value={form.objective}
                    onChange={e => update('objective', e.target.value)}
                    placeholder="To determine the unknown resistance of a resistor using the Wheatstone Bridge..." />
                </Field>

                <button className={styles.nextBtn}
                  onClick={() => setCurrentStep(1)}
                  disabled={!form.title || !form.objective}>
                  Next: Data & Theory <ChevronRight size={16}/>
                </button>
              </div>
            )}

            {currentStep === 1 && (
              <div className={styles.formStep}>
                <div className={styles.stepHeader}>
                  <h2>Data & Theoretical Background</h2>
                </div>

                <Field label="Apparatus / Materials" hint="List all equipment and materials used">
                  <textarea className={styles.textarea} rows={4} value={form.apparatus}
                    onChange={e => update('apparatus', e.target.value)}
                    placeholder="Wheatstone Bridge setup, Galvanometer, Battery (6V DC), Resistors..." />
                </Field>

                <Field label="Theory / Principles" hint="Key formulas, laws, and principles involved">
                  <textarea className={styles.textarea} rows={4} value={form.theory}
                    onChange={e => update('theory', e.target.value)}
                    placeholder="The Wheatstone Bridge operates on the principle that at balance: P/Q = R/S..." />
                </Field>

                <Field label="Observations / Experimental Data *" hint="Tables, readings, measurements — paste raw data">
                  <textarea className={styles.textarea} rows={6} value={form.observations}
                    onChange={e => update('observations', e.target.value)}
                    placeholder={`Trial | P (Ω) | Q (Ω) | R (Ω) | Status\n1     | 100   | 100   | 258   | Balanced`} />
                </Field>

                <Field label="Calculations" hint="Show your sample calculations here">
                  <textarea className={styles.textarea} rows={4} value={form.calculations}
                    onChange={e => update('calculations', e.target.value)}
                    placeholder="S = (Q/P) × R = (100/100) × 258 = 258 Ω" />
                </Field>

                <Field label="Raw Notes / Additional Observations">
                  <textarea className={styles.textarea} rows={3} value={form.rawNotes}
                    onChange={e => update('rawNotes', e.target.value)}
                    placeholder="Room temperature, any issues encountered, unusual observations..." />
                </Field>

                <div className={styles.btnRow}>
                  <button className={styles.backBtn} onClick={() => setCurrentStep(0)}>← Back</button>
                  <button className={styles.nextBtn}
                    onClick={() => setCurrentStep(2)}
                    disabled={!form.observations}>
                    Next: Generate <ChevronRight size={16}/>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className={styles.formStep}>
                <div className={styles.stepHeader}>
                  <h2>Generate Report Sections</h2>
                </div>

                <div className={styles.genProgress}>
                  <div className={styles.genBar}>
                    <div className={styles.genFill} style={{ width: `${(generatedCount / SECTIONS.length) * 100}%` }}/>
                  </div>
                  <span className={styles.genCount}>{generatedCount}/{SECTIONS.length} sections generated</span>
                </div>

                <button className={styles.generateAllBtn}
                  onClick={generateAll}
                  disabled={!!loadingSection}>
                  {loadingSection ? <Loader size={16} className={styles.spin}/> : <Sparkles size={16}/>}
                  Generate All Sections
                </button>

                <div className={styles.sectionList}>
                  {SECTIONS.map(s => {
                    const Icon = s.icon
                    const isDone = !!generated[s.key]
                    const isLoading = loadingSection === s.key
                    return (
                      <div key={s.key}
                        className={`${styles.sectionItem} ${isDone ? styles.sectionDone : ''} ${activeSection === s.key && isDone ? styles.sectionActive : ''}`}
                        onClick={() => isDone && setActiveSection(s.key)}>
                        <div className={styles.sectionLeft}>
                          <Icon size={14}/>
                          <span>{s.label}</span>
                        </div>
                        <div className={styles.sectionRight}>
                          {isDone && <span className={styles.doneBadge}>✓ Done</span>}
                          {isLoading
                            ? <Loader size={14} className={styles.spin}/>
                            : <button className={styles.genBtn}
                                onClick={e => { e.stopPropagation(); generateSection(s.key) }}
                                disabled={!!loadingSection}>
                                {isDone ? 'Regen' : 'Generate'}
                              </button>
                          }
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className={styles.btnRow}>
                  <button className={styles.backBtn} onClick={() => setCurrentStep(1)}>← Back</button>
                  <button className={styles.exportBtn} onClick={exportReport} disabled={generatedCount === 0}>
                    <Download size={15}/> Export Report
                  </button>
                </div>

                <button className={styles.resetBtn} onClick={reset}>
                  <RotateCcw size={13}/> Start New Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Preview Panel */}
        <div className={styles.previewPanel}>
          <div className={styles.previewHeader}>
            <h3>Report Preview</h3>
            {generatedCount > 0 && (
              <button className={styles.exportBtnSm} onClick={exportReport}>
                <Download size={13}/> Export
              </button>
            )}
          </div>

          <div className={styles.reportDoc}>
            <div className={styles.reportTitle}>
              <h1>{form.title || 'Experiment Title'}</h1>
              <div className={styles.reportMeta}>
                {form.type && <span>{form.type}</span>}
                {form.studentName && <span>By: {form.studentName}</span>}
                {form.rollNo && <span>Roll: {form.rollNo}</span>}
                {form.date && <span>{new Date(form.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
              </div>
            </div>

            {form.objective && (
              <div className={styles.reportSection}>
                <h4>Objective</h4>
                <p>{form.objective}</p>
              </div>
            )}

            {form.apparatus && (
              <div className={styles.reportSection}>
                <h4>Apparatus</h4>
                <p>{form.apparatus}</p>
              </div>
            )}

            {SECTIONS.map(s => generated[s.key] && (
              <div key={s.key}
                className={`${styles.reportSection} ${activeSection === s.key ? styles.reportSectionHighlight : ''}`}>
                <div className={styles.sectionTitleRow}>
                  <h4>{s.label}</h4>
                  <button className={styles.copyBtn} onClick={() => copySection(s.key)}>
                    {copied === s.key ? <Check size={12}/> : <Copy size={12}/>}
                    {copied === s.key ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className={styles.generatedText}
                  dangerouslySetInnerHTML={{ __html: formatText(generated[s.key]) }}
                />
              </div>
            ))}

            {form.observations && (
              <div className={styles.reportSection}>
                <h4>Observations & Data</h4>
                <pre className={styles.dataTable}>{form.observations}</pre>
              </div>
            )}

            {form.calculations && (
              <div className={styles.reportSection}>
                <h4>Calculations</h4>
                <pre className={styles.dataTable}>{form.calculations}</pre>
              </div>
            )}

            {generatedCount === 0 && !form.objective && (
              <div className={styles.emptyState}>
                <FlaskConical size={40} color="var(--border)"/>
                <p>Fill in the experiment details on the left to get started.</p>
                <p>Your generated report will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gm, '<h5>$1</h5>')
    .replace(/^## (.*$)/gm, '<h5>$1</h5>')
    .replace(/^\| (.*)/gm, '<div class="trow">| $1</div>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
}
