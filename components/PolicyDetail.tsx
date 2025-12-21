import React, { useState, useEffect } from 'react';
import { type Policy } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { generatePolicyContent } from '../services/geminiService';
import { Callout } from './ui/Callout';
import { StatusBadge } from './ui/StatusBadge';
import { Calendar, User, Clock, ChevronRight, Edit3, Save, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

// Use the global 'marked' object from the script tag in index.html
declare const marked: {
  parse: (markdown: string) => string;
};

interface PolicyDetailProps {
  policy: Policy | null;
  content: string;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  onSave: (policyId: number, newContent: string) => void;
  onUpdateName: (policyId: number, newName: string) => void;
  onDeleteClick: (policy: Policy) => void;
  onPinToTop: (policyId: number) => void;
  onExportSingleJson: (policyId: number) => void;
  isExportingSingleJson: boolean;
  onLogout: () => void;
  onLoginClick: () => void;
  onBackClick: () => void;
}

const PolicyDetail: React.FC<PolicyDetailProps> = ({
  policy,
  content,
  isLoading,
  error,
  isAdmin,
  onSave,
  onUpdateName,
  onDeleteClick,
  onPinToTop,
  onExportSingleJson,
  isExportingSingleJson,
  onLogout,
  onLoginClick,
  onBackClick,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // Extract headings and generate IDs
  useEffect(() => {
    if (!content) {
      setHeadings([]);
      return;
    }

    const newHeadings: { id: string; text: string; level: number }[] = [];
    // Naive regex to extract headings (works for standard markdown)
    const headingRegex = /^(#{2,3})\s+(.*)$/gm;
    let match;
    // Reset regex index
    headingRegex.lastIndex = 0;

    // We iterate over matches
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      newHeadings.push({ id, text, level });
    }

    setHeadings(newHeadings);
  }, [content]);

  // Observer for active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px' }
    );

    const headingElements = document.querySelectorAll('h2, h3');
    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings, content]);

  useEffect(() => {
    setIsEditing(false);
    setIsEditingName(false);
    if (policy) {
      setEditedName(policy.name);
    }
  }, [content, policy]);

  const handleEditClick = () => {
    setEditedContent(content);
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    if (policy) {
      onSave(policy.id, editedContent);
      setIsEditing(false);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedContent('');
  };

  const handleSaveName = () => {
    if (policy && editedName.trim()) {
      onUpdateName(policy.id, editedName.trim());
      setIsEditingName(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!policy) return;
    setIsGenerating(true);
    try {
      const generatedContent = await generatePolicyContent(policy.name);
      setEditedContent(generatedContent);
      setIsEditing(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'An unknown error occurred during AI content generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Improved HTML processing to inject refined classes AND IDs for TOC
  const getProcessedHtml = (markdownContent: string) => {
    // Regex to find blockquotes that start with > [!TYPE]
    const calloutRegex = /^> \[!(NOTE|WARNING|INFO|TIP)\]\s*(.*)$(?:\n(>.*))*$/gm;

    let processedMarkdown = markdownContent.replace(calloutRegex, (match, type, title, contentBlock) => {
      // Remove leading '>' and trim each line of the content block
      const content = contentBlock ? contentBlock.split('\n').map((line: string) => line.replace(/^>\s*/, '')).join('\n') : '';

      const calloutType = type.toLowerCase();
      const calloutTitle = title.trim();
      const calloutContent = marked.parse(content).trim();

      // Manually construct the HTML for the styled Callout
      let iconSvg = '';
      let classes = '';

      switch (calloutType) {
        case 'note':
          // Blue
          iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-blue-500"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>';
          classes = 'bg-blue-50 border-blue-200 text-blue-900';
          break;
        case 'warning':
          // Orange
          iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-orange-500"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.174 3.35 1.94 3.35h14.72c1.766 0 2.806-1.85 1.94-3.35L12 2.25 2.983 16.076zM12 15.75h.007v.008H12v-.008z" /></svg>';
          classes = 'bg-orange-50 border-orange-200 text-orange-900';
          break;
        case 'info':
          // Slate/Indigo
          iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-indigo-500"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
          classes = 'bg-indigo-50 border-indigo-200 text-indigo-900';
          break;
        case 'tip':
          // Emerald
          iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-emerald-500"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
          classes = 'bg-emerald-50 border-emerald-200 text-emerald-900';
          break;
        default:
          iconSvg = '';
          classes = 'bg-slate-50 border-slate-200 text-slate-900';
      }

      return `
  < div class="p-4 rounded-lg border ${classes} my-6 shadow-sm" >
          <div class="flex items-center gap-2 mb-2">
            ${iconSvg}
            <h4 class="font-bold text-sm uppercase tracking-wider opacity-90">${calloutTitle || type}</h4>
          </div>
          <div class="text-sm leading-relaxed opacity-90">${calloutContent}</div>
        </div >
  `;
    });

    // Custom Badges for "Simple:", "Live Example:", "Punishment:"
    // Applied before markdown parsing to capture simple bold syntax
    const simpleRegex = /\*\*Simple:\*\*/g;
    const exampleRegex = /\*\*Live Example:\*\*/g;
    const punishmentRegex = /\*\*Punishment:\*\*/g;

    let preProcessed = processedMarkdown
      .replace(simpleRegex, '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800 mr-2">Simple:</span>')
      .replace(exampleRegex, `
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-800 mr-2 border border-orange-200 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3 mr-1 text-orange-500">
                    <path fill-rule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6 20.25a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zm12 0a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zM6 3a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75A.75.75 0 016 3zm12 0a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75A.75.75 0 0118 3z" clip-rule="evenodd" />
                </svg>
                Live Example:
            </span>`)
      .replace(punishmentRegex, `
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 mr-2 border border-red-200 shadow-sm">
                <span class="relative flex h-2 w-2 mr-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Punishment:
            </span>`);

    let html = marked.parse(preProcessed);

    // Inject IDs into H2 and H3 tags for TOC linkage and style them (purple)
    html = html.replace(/<h([23])>(.*?)<\/h\1>/g, (match, level, text) => {
      // Strip html tags from text for the ID
      const cleanText = text.replace(/<[^>]*>?/gm, '');
      const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return `<h${level} id="${id}" class="text-purple-700">${text}</h${level}>`;
    });

    return html;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
        <LoadingSpinner />
        <p className="mt-4 text-slate-400 text-sm font-medium animate-pulse">Fetching documentation...</p>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[80vh] text-center p-8">
        <div className="bg-slate-50 p-6 rounded-full mb-6">
          <div className="h-16 w-16 bg-gradient-to-tr from-purple-100 to-indigo-50 rounded-2xl flex items-center justify-center shadow-inner">
            <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Select a Policy</h2>
        <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
          Choose a document from the sidebar to view its details, revision history, and compliance requirements.
        </p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Editor</span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-700">{policy.name}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancelClick}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-transparent hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveClick}
              className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-sm transition-all"
            >
              <Save size={14} />
              Save Changes
            </button>
          </div>
        </div>
        <div className="flex-1 p-0 overflow-hidden relative">
          <textarea
            className="w-full h-full p-8 font-mono text-sm bg-slate-900 text-slate-300 resize-none focus:outline-none leading-relaxed"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="# Start writing..."
            spellCheck={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto items-start">

      {/* Main Document Column */}
      <article className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-10 lg:py-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-6">
          <span>Policies</span>
          <ChevronRight size={12} />
          <span>Security</span>
          <ChevronRight size={12} />
          <span className="text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">Active</span>
        </div>

        {/* Title Area */}
        <div className="mb-8 pb-8 border-b border-slate-100">
          {!isEditingName ? (
            <div className="group">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
                {policy.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <User size={14} className="text-slate-400" />
                  <span>Updated by <strong>Admin</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Dec 21, 2025</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  <span>~5 min read</span>
                </div>
                {isAdmin && (
                  <button
                    onClick={handleEditClick}
                    className="ml-auto flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-medium transition-colors bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-md"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-3xl font-bold bg-white border border-slate-300 rounded px-2 w-full"
              />
              <button onClick={handleSaveName} className="bg-purple-600 text-white px-4 rounded">Save</button>
            </div>
          )}
        </div>

        {/* Standard "Important" Disclaimer (Hardcoded example of Callout) */}
        <Callout type="info" title="Policy Scope">
          This policy applies to all employees, contractors, and third-party vendors accessing corporate resources. Please review annually.
        </Callout>

        {/* Content Body */}
        {content ? (
          <div
            className="prose prose-slate prose-lg max-w-none 
                    prose-headings:font-bold prose-headings:text-slate-900 prose-headings:tracking-tight prose-headings:text-purple-700
                    prose-p:text-slate-600 prose-p:leading-8
                    prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-slate-900 prose-strong:font-bold
                    prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-slate-900 prose-pre:rounded-xl prose-pre:shadow-lg
                    prose-img:rounded-xl prose-img:shadow-md 
                    prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:bg-purple-50/30 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:text-slate-700 prose-blockquote:font-medium prose-blockquote:not-italic
                    border-b border-slate-100 pb-12 mb-12"
            dangerouslySetInnerHTML={{ __html: getProcessedHtml(content) }}
          />
        ) : (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-slate-500 mb-4">This document is empty.</p>
            {isAdmin && (
              <button
                onClick={handleGenerateContent}
                disabled={isGenerating}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                {isGenerating ? 'Drafting...' : 'Generate with AI'}
              </button>
            )}
          </div>
        )}

        {/* Revision History Section */}
        <section className="mt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <RotateCcw size={18} className="text-slate-400" />
            Revision History
          </h3>
          <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Version</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Author</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Changes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">v2.1</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Dec 21, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">Admin</td>
                  <td className="px-6 py-4 text-sm text-slate-500">Updated compliance section for 2025 standards.</td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">v2.0</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Oct 10, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">System</td>
                  <td className="px-6 py-4 text-sm text-slate-500">Major overhaul of security protocols.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </article>

      {/* Right Sidebar (Table of Contents) - Hidden on mobile */}
      <aside className="hidden xl:block w-64 sticky top-24 pr-8">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">On this page</h4>
        {headings.length > 0 ? (
          <ul className="space-y-3 text-sm border-l border-slate-200">
            {headings.map(heading => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(heading.id);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                      setActiveId(heading.id);
                    }
                  }}
                  className={cn(
                    "block pl-4 border-l-2 -ml-[2px] transition-all duration-200",
                    activeId === heading.id
                      ? "text-purple-600 border-purple-600 font-medium"
                      : "text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300",
                    heading.level === 3 && "ml-4" // Indent h3 headings
                  )}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-400 italic">No headings found.</p>
        )}

        <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <h5 className="font-semibold text-slate-900 mb-2 text-xs uppercase tracking-wider">Need Help?</h5>
          <p className="text-xs text-slate-500 mb-3">Contact the security team if you have questions about this specific policy.</p>
          <button className="text-xs font-bold text-purple-600 hover:text-purple-700">Contact Security &rarr;</button>
        </div>
      </aside>
    </div>
  );
};

export default PolicyDetail;
