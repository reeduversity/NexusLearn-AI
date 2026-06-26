'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import {
  User,
  GraduationCap,
  Briefcase,
  Wrench,
  FolderOpen,
  Plus,
  Trash2,
  Save,
  Eye,
  FileText,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Loader2,
} from 'lucide-react'

interface PersonalInfo {
  full_name: string
  email: string
  phone: string
  location: string
  linkedin: string
  github: string
  portfolio: string
  summary: string
}

interface Education {
  id: string
  institution: string
  degree: string
  field: string
  start_date: string
  end_date: string
  gpa: string
}

interface Experience {
  id: string
  company: string
  role: string
  start_date: string
  end_date: string
  description: string
}

interface Project {
  id: string
  name: string
  description: string
  tech_stack: string
  link: string
}

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

export default function ResumeBuilderPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [personal, setPersonal] = useState<PersonalInfo>({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    summary: '',
  })

  const [education, setEducation] = useState<Education[]>([
    { id: generateId(), institution: '', degree: '', field: '', start_date: '', end_date: '', gpa: '' },
  ])

  const [experience, setExperience] = useState<Experience[]>([
    { id: generateId(), company: '', role: '', start_date: '', end_date: '', description: '' },
  ])

  const [skills, setSkills] = useState<string>('')

  const [projects, setProjects] = useState<Project[]>([
    { id: generateId(), name: '', description: '', tech_stack: '', link: '' },
  ])

  const addEducation = () => {
    setEducation([...education, { id: generateId(), institution: '', degree: '', field: '', start_date: '', end_date: '', gpa: '' }])
  }

  const removeEducation = (id: string) => {
    if (education.length > 1) setEducation(education.filter((e) => e.id !== id))
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map((e) => (e.id === id ? { ...e, [field]: value } : e)))
  }

  const addExperience = () => {
    setExperience([...experience, { id: generateId(), company: '', role: '', start_date: '', end_date: '', description: '' }])
  }

  const removeExperience = (id: string) => {
    if (experience.length > 1) setExperience(experience.filter((e) => e.id !== id))
  }

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperience(experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)))
  }

  const addProject = () => {
    setProjects([...projects, { id: generateId(), name: '', description: '', tech_stack: '', link: '' }])
  }

  const removeProject = (id: string) => {
    if (projects.length > 1) setProjects(projects.filter((p) => p.id !== id))
  }

  const updateProject = (id: string, field: keyof Project, value: string) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const resumeData = {
        user_id: user.id,
        personal_info: personal,
        education,
        experience,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        projects,
      }

      const { error } = await supabase.from('resumes').insert(resumeData)
      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Failed to save resume:', err)
      alert('Failed to save resume. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resume Builder</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Craft a professional resume section-by-section with real-time preview.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setActiveTab('edit')}
            className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'edit'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700'
            }`}
          >
            <FileText className="mr-2 h-4 w-4" />
            Edit
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700'
            }`}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className={`space-y-6 ${activeTab === 'preview' ? 'hidden lg:block' : ''}`}>
          {/* Personal Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-500" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={personal.full_name}
                  onChange={(e) => setPersonal({ ...personal, full_name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={personal.email}
                  onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={personal.phone}
                  onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={personal.location}
                  onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="Mumbai, India"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={personal.linkedin}
                  onChange={(e) => setPersonal({ ...personal, linkedin: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub</label>
                <input
                  type="url"
                  value={personal.github}
                  onChange={(e) => setPersonal({ ...personal, github: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="github.com/johndoe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio</label>
                <input
                  type="url"
                  value={personal.portfolio}
                  onChange={(e) => setPersonal({ ...personal, portfolio: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="johndoe.dev"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Professional Summary</label>
                <textarea
                  value={personal.summary}
                  onChange={(e) => setPersonal({ ...personal, summary: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="A brief professional summary highlighting your key strengths..."
                />
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <GraduationCap className="mr-2 h-5 w-5 text-emerald-500" />
                Education
              </h2>
              <button onClick={addEducation} className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors">
                <Plus className="mr-1 h-3 w-3" /> Add
              </button>
            </div>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div className="flex justify-end mb-2">
                    <button onClick={() => removeEducation(edu.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <input type="text" value={edu.institution} onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Institution Name" />
                    </div>
                    <input type="text" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Degree (e.g., B.Tech)" />
                    <input type="text" value={edu.field} onChange={(e) => updateEducation(edu.id, 'field', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Field of Study" />
                    <input type="text" value={edu.start_date} onChange={(e) => updateEducation(edu.id, 'start_date', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Start (e.g., Aug 2021)" />
                    <input type="text" value={edu.end_date} onChange={(e) => updateEducation(edu.id, 'end_date', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="End (e.g., May 2025)" />
                    <input type="text" value={edu.gpa} onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="GPA / Percentage" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-orange-500" />
                Experience
              </h2>
              <button onClick={addExperience} className="inline-flex items-center rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40 transition-colors">
                <Plus className="mr-1 h-3 w-3" /> Add
              </button>
            </div>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div className="flex justify-end mb-2">
                    <button onClick={() => removeExperience(exp.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Company Name" />
                    <input type="text" value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Role / Title" />
                    <input type="text" value={exp.start_date} onChange={(e) => updateExperience(exp.id, 'start_date', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Start Date" />
                    <input type="text" value={exp.end_date} onChange={(e) => updateExperience(exp.id, 'end_date', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="End Date (or Present)" />
                    <div className="sm:col-span-2">
                      <textarea value={exp.description} onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} rows={3} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Key responsibilities and achievements (use bullet points with •)" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Wrench className="mr-2 h-5 w-5 text-purple-500" />
              Skills
            </h2>
            <textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="Enter skills separated by commas (e.g., React, Node.js, Python, Machine Learning, SQL)"
            />
            {skills && (
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.split(',').map((skill, idx) => skill.trim() && (
                  <span key={idx} className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FolderOpen className="mr-2 h-5 w-5 text-cyan-500" />
                Projects
              </h2>
              <button onClick={addProject} className="inline-flex items-center rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-400 dark:hover:bg-cyan-900/40 transition-colors">
                <Plus className="mr-1 h-3 w-3" /> Add
              </button>
            </div>
            <div className="space-y-4">
              {projects.map((proj) => (
                <div key={proj.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div className="flex justify-end mb-2">
                    <button onClick={() => removeProject(proj.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" value={proj.name} onChange={(e) => updateProject(proj.id, 'name', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Project Name" />
                    <input type="text" value={proj.tech_stack} onChange={(e) => updateProject(proj.id, 'tech_stack', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Tech Stack (e.g., React, Firebase)" />
                    <div className="sm:col-span-2">
                      <textarea value={proj.description} onChange={(e) => updateProject(proj.id, 'description', e.target.value)} rows={2} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Brief description of the project" />
                    </div>
                    <div className="sm:col-span-2">
                      <input type="url" value={proj.link} onChange={(e) => updateProject(proj.id, 'link', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Project URL" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : saved ? (
              <><Save className="mr-2 h-4 w-4" /> Saved Successfully!</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Save Resume</>
            )}
          </button>
        </div>

        {/* Preview Panel */}
        <div className={`${activeTab === 'edit' ? 'hidden lg:block' : ''}`}>
          <div className="sticky top-6 rounded-xl border border-gray-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Eye className="mr-2 h-5 w-5 text-indigo-500" />
              Live Preview
            </h2>

            <div className="space-y-5 text-sm">
              {/* Personal Info Preview */}
              {personal.full_name ? (
                <div className="text-center border-b border-gray-200 dark:border-zinc-700 pb-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{personal.full_name}</h3>
                  <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    {personal.email && <span className="inline-flex items-center"><Mail className="mr-1 h-3 w-3" />{personal.email}</span>}
                    {personal.phone && <span className="inline-flex items-center"><Phone className="mr-1 h-3 w-3" />{personal.phone}</span>}
                    {personal.location && <span className="inline-flex items-center"><MapPin className="mr-1 h-3 w-3" />{personal.location}</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap justify-center gap-3 text-xs text-indigo-500">
                    {personal.linkedin && <span className="inline-flex items-center"><Linkedin className="mr-1 h-3 w-3" />{personal.linkedin}</span>}
                    {personal.github && <span className="inline-flex items-center"><Github className="mr-1 h-3 w-3" />{personal.github}</span>}
                    {personal.portfolio && <span className="inline-flex items-center"><Globe className="mr-1 h-3 w-3" />{personal.portfolio}</span>}
                  </div>
                  {personal.summary && <p className="mt-3 text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{personal.summary}</p>}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-gray-200 dark:border-zinc-700 rounded-lg">
                  <User className="mx-auto h-8 w-8 text-gray-300 dark:text-zinc-600 mb-2" />
                  <p className="text-xs text-gray-400">Start filling in your details to see the preview</p>
                </div>
              )}

              {/* Education Preview */}
              {education.some((e) => e.institution) && (
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-zinc-700 pb-1 mb-2">Education</h4>
                  {education.filter((e) => e.institution).map((edu) => (
                    <div key={edu.id} className="mb-2">
                      <div className="flex justify-between">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{edu.institution}</p>
                        <p className="text-gray-500 text-xs">{edu.start_date} — {edu.end_date}</p>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{edu.degree} {edu.field && `in ${edu.field}`} {edu.gpa && `• GPA: ${edu.gpa}`}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Experience Preview */}
              {experience.some((e) => e.company) && (
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-zinc-700 pb-1 mb-2">Experience</h4>
                  {experience.filter((e) => e.company).map((exp) => (
                    <div key={exp.id} className="mb-2">
                      <div className="flex justify-between">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{exp.role} — {exp.company}</p>
                        <p className="text-gray-500 text-xs">{exp.start_date} — {exp.end_date}</p>
                      </div>
                      {exp.description && <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line text-xs mt-1">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Skills Preview */}
              {skills && (
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-zinc-700 pb-1 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.split(',').map((skill, idx) => skill.trim() && (
                      <span key={idx} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-zinc-800 dark:text-gray-300">{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Preview */}
              {projects.some((p) => p.name) && (
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-zinc-700 pb-1 mb-2">Projects</h4>
                  {projects.filter((p) => p.name).map((proj) => (
                    <div key={proj.id} className="mb-2">
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {proj.name} {proj.tech_stack && <span className="font-normal text-gray-500 text-xs">({proj.tech_stack})</span>}
                      </p>
                      {proj.description && <p className="text-gray-600 dark:text-gray-400 text-xs">{proj.description}</p>}
                      {proj.link && <a href={proj.link} className="text-indigo-500 text-xs hover:underline">{proj.link}</a>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
