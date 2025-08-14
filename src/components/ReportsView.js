import React, { useState, useEffect, useCallback } from 'react';
import './ReportsView.css';

const ReportsView = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('Basic Guide');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showSearch, setShowSearch] = useState(false);

  // Sample education articles - English content
  const sampleArticles = useCallback(() => [
    {
      id: 1,
      title: 'Complete Interview Guide for Beginners - Everything You Need to Know',
      category: 'Basic Guide',
      content: `# Complete Interview Guide for Beginners

## Pre-Interview Preparation
- Review your resume and cover letter thoroughly
- Research the company and its culture
- Prepare answers for common questions
- Practice your responses with a friend or mentor

## During the Interview
- Maintain confident body language
- Provide specific examples from your experience
- Show enthusiasm and genuine interest
- Ask thoughtful questions about the role

## Post-Interview Follow-up
- Send a thank-you email within 24 hours
- Follow up on your application status
- Reflect on your performance and areas for improvement
- Continue networking and applying to other positions`,
      author: 'Interview Expert',
      createdAt: '2025-01-15',
      updatedAt: '2025-01-15',
      views: 156,
      comments: 8,
      tags: ['Basic Guide', 'Interview Process', 'Beginners'],
      lastActivity: '24 minutes ago',
      lastUser: 'MindBlown'
    },
    {
      id: 2,
      title: 'Technical Interview Questions Collection - JavaScript, React, Database',
      category: 'Technical Interview',
      content: `# Technical Interview Questions Collection

## JavaScript Fundamentals
- What is closure and how does it work?
- Explain the difference between Promise and async/await
- How does the event loop work in JavaScript?
- What is hoisting and how does it affect your code?

## React Concepts
- What are the advantages of Virtual DOM?
- How do you use useEffect hook effectively?
- Explain different state management approaches
- What is the difference between controlled and uncontrolled components?

## Database Design
- What are the pros and cons of indexing?
- Explain ACID properties in database transactions
- When should you normalize vs denormalize data?
- How do you handle database performance issues?`,
      author: 'Tech Lead',
      createdAt: '2025-01-16',
      updatedAt: '2025-01-16',
      views: 89,
      comments: 12,
      tags: ['Technical Interview', 'Programming', 'Database'],
      lastActivity: '1 hour ago',
      lastUser: 'TechGuru'
    },
    {
      id: 3,
      title: 'Behavioral Interview STAR Method - Complete Guide with Examples',
      category: 'Behavioral Interview',
      content: `# Behavioral Interview STAR Method

## What is STAR?
- **Situation**: Describe the specific situation or context
- **Task**: Explain the task or challenge you were given
- **Action**: Detail the actions you took to address the situation
- **Result**: Share the outcomes and what you learned

## Common Behavioral Questions
- "Tell me about a time you had a conflict with a team member"
- "Describe a situation where you had to solve a difficult problem"
- "Give me an example of when you demonstrated leadership"
- "How do you handle failure or setbacks?"

## Answer Tips
- Use specific numbers and facts when possible
- Provide clear timeframes and context
- Focus on what you learned and how you grew
- Connect your experience to the job requirements`,
      author: 'Senior HR Manager',
      createdAt: '2025-01-17',
      updatedAt: '2025-01-17',
      views: 203,
      comments: 15,
      tags: ['Behavioral Interview', 'STAR Method', 'Leadership'],
      lastActivity: '2 hours ago',
      lastUser: 'HRMaster'
    },
    {
      id: 4,
      title: 'System Design Interview Preparation - Architecture Patterns and Best Practices',
      category: 'System Design',
      content: `# System Design Interview Preparation

## Key Concepts to Master
- Scalability and performance optimization
- Load balancing and caching strategies
- Database design and data modeling
- Microservices vs monolithic architecture

## Common System Design Questions
- Design a URL shortening service
- Create a chat application architecture
- Design a recommendation system
- Plan a social media feed system

## Best Practices
- Start with requirements clarification
- Consider trade-offs between different approaches
- Think about scalability from the beginning
- Always discuss monitoring and error handling`,
      author: 'System Architect',
      createdAt: '2025-01-18',
      updatedAt: '2025-01-18',
      views: 167,
      comments: 23,
      tags: ['System Design', 'Architecture', 'Scalability'],
      lastActivity: '3 hours ago',
      lastUser: 'ArchitectPro'
    }
  ], []);

  useEffect(() => {
    // Load articles from localStorage or use sample data
    const savedArticles = localStorage.getItem('interview_articles');
    
    if (savedArticles) {
      try {
        const parsed = JSON.parse(savedArticles);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArticles(parsed);
        } else {
          const sampleData = sampleArticles();
          setArticles(sampleData);
          localStorage.setItem('interview_articles', JSON.stringify(sampleData));
        }
      } catch (error) {
        console.error('Error parsing saved articles:', error);
        const sampleData = sampleArticles();
        setArticles(sampleData);
        localStorage.setItem('interview_articles', JSON.stringify(sampleData));
      }
    } else {
      const sampleData = sampleArticles();
      setArticles(sampleData);
      localStorage.setItem('interview_articles', JSON.stringify(sampleData));
    }
  }, [sampleArticles]);

  useEffect(() => {
    // Save articles to localStorage
    localStorage.setItem('interview_articles', JSON.stringify(articles));
  }, [articles]);

  const handleCreateArticle = () => {
    setIsCreating(true);
    setEditTitle('');
    setEditContent('');
    setEditCategory('Basic Guide');
    setSelectedArticle(null);
  };

  const handleEditArticle = (article) => {
    setIsEditing(true);
    setEditTitle(article.title);
    setEditContent(article.content);
    setEditCategory(article.category);
    setSelectedArticle(article);
  };

  const handleSaveArticle = () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('Please enter both title and content.');
      return;
    }

    if (isCreating) {
      const newArticle = {
        id: Date.now(),
        title: editTitle,
        category: editCategory,
        content: editContent,
        author: 'Interviewer',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        views: 0,
        comments: 0,
        tags: [],
        lastActivity: 'Just now',
        lastUser: 'Interviewer'
      };
      setArticles(prev => [newArticle, ...prev]);
    } else if (isEditing && selectedArticle) {
      setArticles(prev => prev.map(article => 
        article.id === selectedArticle.id 
          ? { ...article, title: editTitle, content: editContent, category: editCategory, updatedAt: new Date().toISOString().split('T')[0] }
          : article
      ));
    }

    setIsCreating(false);
    setIsEditing(false);
    setEditTitle('');
    setEditContent('');
    setEditCategory('Basic Guide');
    setSelectedArticle(null);
  };

  const handleDeleteArticle = (articleId) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      setArticles(prev => prev.filter(article => article.id !== articleId));
      if (selectedArticle && selectedArticle.id === articleId) {
        setSelectedArticle(null);
      }
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditTitle('');
    setEditContent('');
    setEditCategory('Basic Guide');
    setSelectedArticle(null);
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchTerm === '' || 
                         article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortOrder === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortOrder === 'views') {
      return b.views - a.views;
    } else if (sortOrder === 'comments') {
      return b.comments - a.comments;
    }
    return 0;
  });

  const renderMarkdown = (content) => {
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="markdown-h1">{line.substring(2)}</h1>;
        } else if (line.startsWith('## ')) {
          return <h2 key={index} className="markdown-h2">{line.substring(3)}</h2>;
        } else if (line.startsWith('### ')) {
          return <h3 key={index} className="markdown-h3">{line.substring(4)}</h3>;
        } else if (line.startsWith('**') && line.endsWith('**')) {
          return <strong key={index} className="markdown-strong">{line.substring(2, line.length - 2)}</strong>;
        } else if (line.trim() === '') {
          return <br key={index} />;
        } else {
          return <p key={index} className="markdown-p">{line}</p>;
        }
      });
  };

  if (isCreating || isEditing) {
    return (
      <div className="reports-view">
        <div className="reports-header">
          <h1>{isCreating ? 'Create New Guide' : 'Edit Guide'}</h1>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveArticle}>Save</button>
          </div>
        </div>
        
        <div className="editor-container">
          <input
            type="text"
            className="title-input"
            placeholder="Enter guide title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          
          <div className="category-select-container">
            <label htmlFor="category-select" className="category-label">Category:</label>
            <select
              id="category-select"
              className="category-select"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
            >
              <option value="Basic Guide">Basic Guide</option>
              <option value="Technical Interview">Technical Interview</option>
              <option value="Behavioral Interview">Behavioral Interview</option>
              <option value="System Design">System Design</option>
            </select>
          </div>
          
          <textarea
            className="content-textarea"
            placeholder="Enter content in Markdown format..."
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={20}
          />
        </div>
      </div>
    );
  }

  if (selectedArticle) {
    return (
      <div className="reports-view">
        <div className="reports-header">
          <button className="btn btn-outline btn-sm" onClick={() => setSelectedArticle(null)}>
            ← Back to List
          </button>
          <div className="header-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => handleEditArticle(selectedArticle)}
            >
              Edit
            </button>
            <button 
              className="btn btn-outline btn-sm btn-danger"
              onClick={() => handleDeleteArticle(selectedArticle.id)}
            >
              Delete
            </button>
          </div>
        </div>
        
        <div className="article-view">
          <div className="article-header">
            <h2>{selectedArticle.title}</h2>
          </div>
          
          <div className="article-meta">
            <span className="meta-item">Category: {selectedArticle.category}</span>
            <span className="meta-item">Author: {selectedArticle.author}</span>
            <span className="meta-item">Created: {selectedArticle.createdAt}</span>
            <span className="meta-item">Views: {selectedArticle.views}</span>
            <span className="meta-item">Comments: {selectedArticle.comments}</span>
            {selectedArticle.updatedAt !== selectedArticle.createdAt && (
              <span className="meta-item">Updated: {selectedArticle.updatedAt}</span>
            )}
          </div>

          <div className="article-content">
            {renderMarkdown(selectedArticle.content)}
          </div>

          {selectedArticle.tags.length > 0 && (
            <div className="article-tags">
              {selectedArticle.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="reports-view">
      {/* Main Content */}
      <div className="main-content">
        {/* Section Title */}
        <div className="section-title">
          <h2>Browse Community</h2>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="search-section">
            <div className="search-container">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Filter and Sort Section */}
        <div className="filter-sort-section">
          <div className="filter-section">
            <div className="filter-header">
              <svg className="filter-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 4h18M6 10h12M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Filter</span>
            </div>
            <div className="filter-content">
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                <option value="Basic Guide">Basic Guide</option>
                <option value="Technical Interview">Technical Interview</option>
                <option value="Behavioral Interview">Behavioral Interview</option>
                <option value="System Design">System Design</option>
              </select>
            </div>
          </div>
          
          <div className="sort-section">
            <span>Recent Activity: {sortOrder === 'newest' ? 'Newest First' : sortOrder === 'oldest' ? 'Oldest First' : sortOrder === 'views' ? 'Most Viewed' : 'Most Commented'}</span>
            <div className="sort-dropdown">
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="views">Most Viewed</option>
                <option value="comments">Most Commented</option>
              </select>
              <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="articles-list">
          {sortedArticles.length === 0 ? (
            <div className="empty-message">
              <p>No guides found. Create your first guide!</p>
            </div>
          ) : (
            sortedArticles.map(article => (
              <div
                key={article.id}
                className="article-card"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="card-header">
                  <div className="card-category">{article.category}</div>
                  <div className="card-stats">
                    <div className="stat-item">
                      <svg className="stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span className="stat-number">{article.views}</span>
                    </div>
                    <div className="stat-item">
                      <svg className="stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span className="stat-number">{article.comments}</span>
                    </div>
                  </div>
                </div>
                
                <div className="card-content">
                  <h3 className="card-title">{article.title}</h3>
                  <div className="card-meta">
                    <span className="meta-author">By {article.author}</span>
                    <span className="meta-date">{article.createdAt}</span>
                  </div>
                </div>
                
                <div className="card-footer">
                  <div className="card-tags">
                    {article.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                    {article.tags.length > 2 && (
                      <span className="tag-more">+{article.tags.length - 2}</span>
                    )}
                  </div>
                  
                  <div className="last-activity">
                    <a href="#" className="activity-link">
                      {article.lastUser} {article.lastActivity}
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Guide Button */}
        <div className="create-guide-section">
          <button className="btn btn-primary create-guide-btn" onClick={handleCreateArticle}>
            Create New Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;



