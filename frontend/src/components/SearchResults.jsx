import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFileText, FiBook, FiUsers, FiSearch } from 'react-icons/fi';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);

  // 1. MOCK DATA (Replace this with your API call later)
  const mockDatabase = [
    { id: 1, type: 'exam', title: 'Physics Mid-Term', category: 'Science' },
    { id: 2, type: 'question', title: 'What is Newtons second law?', category: 'Physics' },
    { id: 3, type: 'student', title: 'John Doe', category: 'Class 10-A' },
    { id: 4, type: 'exam', title: 'Mathematics Final', category: 'Math' },
    { id: 5, type: 'question', title: 'Solve for x: 2x + 5 = 15', category: 'Algebra' },
    { id: 6, type: 'course', title: 'Advanced Chemistry', category: 'Science' },
  ];

  // 2. FILTER LOGIC
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const filtered = mockDatabase.filter((item) =>
      item.title.toLowerCase().includes(lowerCaseQuery) ||
      item.category.toLowerCase().includes(lowerCaseQuery)
    );
    setResults(filtered);
  }, [query]);

  const getIcon = (type) => {
    switch (type) {
      case 'exam': return <FiFileText className="text-purple-400" />;
      case 'question': return <FiBook className="text-blue-400" />;
      case 'student': return <FiUsers className="text-green-400" />;
      default: return <FiSearch className="text-gray-400" />;
    }
  };

  return (
    <div className="pt-24 px-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Search Results for "{query}"
        </h1>
        <p className="text-gray-400">
          Found {results.length} result{results.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Loading / Empty State */}
      {!query && (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
          <FiSearch className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Enter a keyword in the top search bar to find content.</p>
        </div>
      )}

      {query && results.length === 0 && (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-gray-400 text-lg">No results found for "{query}".</p>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid gap-4">
        {results.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer group"
          >
            {/* Icon */}
            <div className="p-3 bg-white/5 rounded-lg group-hover:scale-110 transition-transform">
              {getIcon(item.type)}
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
                  {item.type}
                </span>
                <span className="text-xs text-gray-500">• {item.category}</span>
              </div>
              <h3 className="text-lg font-medium text-gray-200 group-hover:text-white transition-colors">
                {item.title}
              </h3>
            </div>

            {/* Action */}
            <div className="text-gray-500 group-hover:text-blue-400">
              &rarr;
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;