import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FolderSearch, LogOut } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { getItems, createItem, updateItem, deleteItem, type ApiItem } from './lib/api';
import AuthPage from './pages/AuthPage';
import FileCard from './components/FileCard';
import FileForm from './components/FileForm';
import SearchFilter from './components/SearchFilter';
import type { FileItem, Filters, SearchType, SortOption } from './types';
import './App.css';

// Convert API item to FileItem type used by components
function apiToFileItem(item: ApiItem): FileItem {
  // Extract just the date part from ISO timestamp for the date picker
  const dateStr = item.dateAdded.split('T')[0];
  return {
    id: item.id,
    type: item.type as FileItem['type'],
    name: item.name,
    location: item.location,
    category: (item.category as FileItem['category']) || '',
    notes: item.notes || '',
    dateAdded: dateStr,
  };
}

function App() {
  const { user, loading, signOut } = useAuth();

  const [items, setItems] = useState<FileItem[]>([]);
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [filters, setFilters] = useState<Filters>({ type: '', category: '' });
  const [sort, setSort] = useState<SortOption>('dateAdded-desc');
  const [editingItem, setEditingItem] = useState<FileItem | null>(null);

  // Fetch items from API whenever the user changes
  useEffect(() => {
    if (!user) return;

    const fetchItems = async () => {
      try {
        const data = await getItems();
        setItems(data.map(apiToFileItem));
      } catch (err) {
        console.error('Failed to fetch items:', err);
      }
    };

    void fetchItems();
  }, [user]);

  // Filtered & sorted items - MOVED BEFORE AUTH GATES
  const processedItems = useMemo<FileItem[]>(() => {
    let result = items.filter(item => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        searchType === 'all'
          ? item.name.toLowerCase().includes(searchLower) ||
            item.location.toLowerCase().includes(searchLower) ||
            (item.notes ?? '').toLowerCase().includes(searchLower)
          : searchType === 'name'
          ? item.name.toLowerCase().includes(searchLower)
          : item.location.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.category && item.category !== filters.category) return false;
      return true;
    });

    const [field, direction] = sort.split('-');
    result = result.sort((a, b) => {
      if (field === 'dateAdded') {
        return direction === 'asc'
          ? new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
          : new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
      if (field === 'name') {
        return direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      return 0;
    });

    return result;
  }, [items, search, searchType, filters, sort]);

  // Auth gates
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'Outfit, sans-serif', color: '#4a6fa5' }}>
        Loading...
      </div>
    );
  }
  if (!user) return <AuthPage />;

  // Handlers
  const handleAddItem = async (newItem: FileItem) => {
    try {
      const created = await createItem({
        name: newItem.name,
        type: newItem.type,
        location: newItem.location,
        category: newItem.category || undefined,
        notes: newItem.notes || undefined,
        dateAdded: newItem.dateAdded ? new Date(newItem.dateAdded).toISOString() : undefined,
      });
      setItems(prev => [apiToFileItem(created), ...prev]);
    } catch (err) {
      console.error('Failed to add item:', err);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleUpdateItem = async (updatedItem: FileItem) => {
    try {
      const updated = await updateItem(updatedItem.id, {
        name: updatedItem.name,
        type: updatedItem.type,
        location: updatedItem.location,
        category: updatedItem.category || undefined,
        notes: updatedItem.notes || undefined,
        dateAdded: updatedItem.dateAdded ? new Date(updatedItem.dateAdded).toISOString() : undefined,
      });
      setItems(prev => prev.map(item => item.id === updatedItem.id ? apiToFileItem(updated) : item));
    } catch (err) {
      console.error('Failed to update item:', err);
      alert('Failed to update item. Please try again.');
    }
    setEditingItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
        setItems(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error('Failed to delete item:', err);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const handleEditItem = (item: FileItem) => {
    setEditingItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      <header>
        <h1>
          <FolderSearch className="w-8 h-8" />
          Physical File Tracker
        </h1>
        <p>Keep track of your physical files and folders</p>
        <button
          onClick={signOut}
          className="btn btn-secondary"
          style={{ marginTop: '1rem' }}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      <div className="search-container">
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          searchType={searchType}
          onSearchTypeChange={setSearchType}
          onClearSearch={() => setSearch('')}
          filters={filters}
          onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
          onClearFilters={() => setFilters({ type: '', category: '' })}
          sort={sort}
          onSortChange={setSort}
        />
      </div>

      <div className="main-content">
        <div className="sidebar">
          <div className="add-file-container">
            <FileForm
              onSubmit={editingItem ? handleUpdateItem : handleAddItem}
              initialData={editingItem}
              onCancel={editingItem ? () => setEditingItem(null) : null}
            />
          </div>
        </div>

        <div className="files-container">
          <div className="files-header">
            <h2>
              Your Files <span id="file-count">({processedItems.length})</span>
            </h2>
          </div>

          <div className="files-list">
            <AnimatePresence mode="popLayout">
              {processedItems.length > 0 ? (
                processedItems.map(item => (
                  <FileCard
                    key={item.id}
                    item={item}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="empty-state"
                >
                  <p>No files found. Add your first file using the form.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile FAB — shown via CSS media query */}
      <button
        className="btn btn-primary fab-mobile"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          borderRadius: '50%',
          width: '3.5rem',
          height: '3.5rem',
          fontSize: '1.75rem',
          boxShadow: '0 4px 12px rgba(74,111,165,0.4)',
          zIndex: 100,
        }}
        aria-label="Add item"
      >
        +
      </button>
    </div>
  );
}

export default App;