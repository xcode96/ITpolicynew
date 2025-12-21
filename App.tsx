import React, { useState, useCallback, useEffect } from 'react';
import PolicyDetail from './components/PolicyDetail';
import AddPolicyModal from './components/AddPolicyModal';
import LiveSyncModal from './components/LiveSyncModal';
import LoginModal from './components/LoginModal';
import DeletePolicyModal from './components/DeletePolicyModal';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { type Policy, type SyncStatus, type Category } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import { supabaseService } from './services/supabaseService';

const App: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [editedContentCache, setEditedContentCache] = useState<Map<number, string>>(new Map());

  const [appStatus, setAppStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [appError, setAppError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [policyContent, setPolicyContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAddPolicyModal, setShowAddPolicyModal] = useState<boolean>(false);
  const [showLiveSyncModal, setShowLiveSyncModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
  const [loginError, setLoginError] = useState<string>('');

  const [isExportingJson, setIsExportingJson] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isExportingSingleJson, setIsExportingSingleJson] = useState<number | null>(null);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('not-connected');
  const [syncUrl, setSyncUrl] = useState<string>('');

  // Initial Data Fetch
  useEffect(() => {
    const initData = async () => {
      try {
        setAppStatus('loading');

        // Parallel fetch for speed
        const [cats, pols] = await Promise.all([
          supabaseService.getCategories(),
          supabaseService.getPolicies()
        ]);

        setCategories(cats);
        setPolicies(pols);

        // Populate content cache
        const contentCache = new Map<number, string>();
        pols.forEach(p => {
          if (p.content) contentCache.set(p.id, p.content);
        });
        setEditedContentCache(contentCache);

        // Auto-select first policy if desktop
        if (window.innerWidth >= 768 && pols.length > 0) {
          const firstPolicy = pols[0];
          setSelectedPolicy(firstPolicy);
          setPolicyContent(firstPolicy.content || '');
        }

        setAppStatus('ready');
      } catch (e) {
        console.error("Failed to load initial data:", e);
        setAppError("Failed to connect to Supabase. Check your connection or database schema.");
        setAppStatus('error');
      }
    };

    initData();
  }, []);

  const getPolicyContent = useCallback(async (policy: Policy): Promise<string> => {
    // Check cache first, then logic used to check file, but now everything is in memory or DB
    // If we implemented lazy loading content, we'd fetch here.
    return editedContentCache.get(policy.id) || policy.content || '';
  }, [editedContentCache]);

  const handleSelectPolicy = useCallback(async (policy: Policy) => {
    if (selectedPolicy?.id === policy.id) {
      return;
    }

    setSelectedPolicy(policy);
    setIsLoadingContent(true);
    setPolicyContent('');

    const content = await getPolicyContent(policy);
    setPolicyContent(content);
    setIsLoadingContent(false);
  }, [selectedPolicy, getPolicyContent]);

  const handleMobileBack = () => {
    setSelectedPolicy(null);
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  const handleLogin = (username: string, password: string) => {
    if (username === 'admin' && password === 'password') {
      setIsAdmin(true);
      setShowLoginModal(false);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  const handleAddCategory = async (name: string) => {
    try {
      const newCategory: Category = {
        id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: name,
        icon: 'Folder'
      };
      // Optimistic update
      setCategories(prev => [...prev, newCategory]);
      await supabaseService.createCategory(newCategory);
    } catch (e) {
      alert('Failed to create folder: ' + (e instanceof Error ? e.message : 'Unknown error'));
      // Revert on failure? Ideally yes, but keeping it simple.
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const hasPolicies = policies.some(p => p.categoryId === categoryId);
    if (hasPolicies) {
      alert('Cannot delete folder because it contains policies. Please move or delete them first.');
      return;
    }
    if (confirm('Are you sure you want to delete this folder?')) {
      try {
        setCategories(prev => prev.filter(c => c.id !== categoryId));
        await supabaseService.deleteCategory(categoryId);
      } catch (e) {
        alert('Failed to delete folder.');
      }
    }
  };

  const handleAddNewPolicy = async (policyName: string) => {
    if (!policyName.trim()) return;

    try {
      const tempId = -Date.now(); // Temp ID
      const newPolicyPayload = {
        name: policyName.trim(),
        categoryId: 'general',
        content: '# ' + policyName.trim()
      };

      // Optimistic UI (dangerous with ID dependency, but we'll await)
      // Actually, let's await the ID to avoid issues.
      const created = await supabaseService.createPolicy(newPolicyPayload);

      setPolicies(prev => [created, ...prev]);
      setEditedContentCache(prev => new Map(prev).set(created.id, created.content || ''));

      setShowAddPolicyModal(false);
      handleSelectPolicy(created);
    } catch (e) {
      alert('Failed to create policy.');
    }
  };

  const handleAddPolicy = async (targetCategoryId?: string) => {
    try {
      const catId = targetCategoryId || 'general';
      const folderName = categories.find(c => c.id === catId)?.name || catId;

      const newPolicyPayload = {
        name: 'Untitled Policy',
        categoryId: catId,
        content: `# Untitled Policy\n\nCreated in ${folderName} folder.\nStart writing your policy here...`
      };

      const created = await supabaseService.createPolicy(newPolicyPayload);

      setPolicies(prev => [created, ...prev]);
      setEditedContentCache(prev => new Map(prev).set(created.id, created.content || ''));

      setSelectedPolicy(created);
      setPolicyContent(created.content || '');
    } catch (e) {
      alert('Failed to create policy.');
    }
  };

  const handleUpdatePolicyName = async (policyId: number, newName: string) => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    const oldPolicies = policies;
    // Optimistic
    setPolicies(prev => prev.map(p => p.id === policyId ? { ...p, name: trimmedName } : p));
    if (selectedPolicy?.id === policyId) {
      setSelectedPolicy(prev => prev ? { ...prev, name: trimmedName } : null);
    }

    try {
      await supabaseService.updatePolicy(policyId, { name: trimmedName });
    } catch (e) {
      setPolicies(oldPolicies); // Revert
      alert('Failed to update name.');
    }
  };

  const handleDeletePolicy = async (policyId: number) => {
    if (!policyToDelete || policyToDelete.id !== policyId) return;

    try {
      await supabaseService.deletePolicy(policyId);

      const originalPolicies = [...policies];
      const newPolicies = policies.filter(p => p.id !== policyId);
      setPolicies(newPolicies);

      const newCache = new Map(editedContentCache);
      newCache.delete(policyId);
      setEditedContentCache(newCache);

      if (selectedPolicy?.id === policyId) {
        const currentIndex = originalPolicies.findIndex(p => p.id === policyId);
        if (newPolicies.length === 0) {
          setSelectedPolicy(null);
        } else if (currentIndex >= newPolicies.length) {
          handleSelectPolicy(newPolicies[newPolicies.length - 1]);
        } else {
          handleSelectPolicy(newPolicies[currentIndex]);
        }
      }
      setPolicyToDelete(null);
    } catch (e) {
      alert('Failed to delete policy.');
    }
  };

  const handlePinToTop = (policyId: number) => {
    // Pinning currently just reorders local array. 
    // We don't have a 'pinned' field in DB schema yet. 
    // Implementing purely locally for session or update 'updated_at' to bump?
    // Let's just do local reorder for now as per prior logic
    const index = policies.findIndex(p => p.id === policyId);
    if (index > 0) {
      const newPolicies = [...policies];
      const [movedPolicy] = newPolicies.splice(index, 1);
      newPolicies.unshift(movedPolicy);
      setPolicies(newPolicies);
    }
  };

  const handleSavePolicyContent = async (policyId: number, newContent: string) => {
    // Update Cache
    const newCache = new Map(editedContentCache);
    newCache.set(policyId, newContent);
    setEditedContentCache(newCache);
    setPolicyContent(newContent);

    // Update DB
    try {
      await supabaseService.updatePolicy(policyId, { content: newContent });
    } catch (e) {
      console.error('Failed to save content', e);
      // We might want to alert, but auto-saving/saving failures might be annoying.
      // For now, simple alert.
      alert('Failed to save changes to cloud.');
    }
  };

  const triggerDownload = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // Export/Import handlers kept mostly for file utility
  const handleExportAllJson = async () => {
    setIsExportingJson(true);
    const sortedPolicies = [...policies];
    const exportData = sortedPolicies.map(p => ({
      id: p.id,
      name: p.name,
      content: editedContentCache.get(p.id) || p.content || ''
    }));

    triggerDownload('it_policies_export.json', JSON.stringify(exportData, null, 2), 'application/json');
    setIsExportingJson(false);
  };

  const handleExportSingleJson = async (policyId: number) => {
    const policy = policies.find(p => p.id === policyId);
    if (!policy) return;

    setIsExportingSingleJson(policy.id);
    try {
      const content = await getPolicyContent(policy);
      const exportData = { id: policy.id, name: policy.name, content: content };
      const filename = `${policy.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_policy.json`;
      triggerDownload(filename, JSON.stringify(exportData, null, 2), 'application/json');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'An unknown error occurred during export.');
    } finally {
      setIsExportingSingleJson(null);
    }
  };

  // Import logic is tricky with Supabase IDs. 
  // We'll treat imports as "Create New" policies for simplicity to avoid ID collisions.
  const handleImportJsonFile = (file: File) => {
    // Simplified import: just alert that it's cloud-based now or try to create new policies?
    // Let's implement creating new policies from import.
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error("File is empty.");

        const data = JSON.parse(text);
        if (!Array.isArray(data)) throw new Error('Invalid JSON.');

        let successCount = 0;
        for (const item of data) {
          if (item.name && item.content) {
            await supabaseService.createPolicy({
              name: item.name,
              content: item.content,
              categoryId: 'general' // Default import bucket
            });
            successCount++;
          }
        }

        // Refresh
        const pols = await supabaseService.getPolicies();
        setPolicies(pols);

        alert(`Import successful: ${successCount} policies added to General.`);
      } catch (e) {
        console.error("Import failed:", e);
        alert(`Import failed.`);
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <DashboardLayout
        policies={policies}
        categories={categories}
        selectedPolicyId={selectedPolicy?.id}
        onSelectPolicy={handleSelectPolicy}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onLoginClick={() => setShowLoginModal(true)}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddPolicy={handleAddPolicy}
        onDeletePolicyClick={setPolicyToDelete}
      >
        <PolicyDetail
          policy={selectedPolicy}
          content={policyContent}
          isLoading={isLoadingContent}
          error={null}
          isAdmin={isAdmin}
          onSave={handleSavePolicyContent}
          onUpdateName={handleUpdatePolicyName}
          onDeleteClick={(policy) => setPolicyToDelete(policy)}
          onPinToTop={handlePinToTop}
          onExportSingleJson={handleExportSingleJson}
          isExportingSingleJson={isExportingSingleJson === (selectedPolicy?.id ?? -1)}
          onLogout={handleLogout}
          onLoginClick={() => setShowLoginModal(true)}
          onBackClick={handleMobileBack}
        />
      </DashboardLayout>

      {showAddPolicyModal && <AddPolicyModal onAdd={handleAddNewPolicy} onClose={() => setShowAddPolicyModal(false)} />}

      {showLoginModal && (
        <LoginModal
          onClose={() => { setShowLoginModal(false); setLoginError(''); }}
          onLogin={handleLogin}
          error={loginError}
        />
      )}
      {policyToDelete && (
        <DeletePolicyModal
          policy={policyToDelete}
          onClose={() => setPolicyToDelete(null)}
          onConfirm={() => handleDeletePolicy(policyToDelete.id)}
        />
      )}
    </>
  );
};

export default App;