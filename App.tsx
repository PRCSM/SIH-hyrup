import React, { useState, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { MatchedInternship, UserData } from './types';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import UserInputForm from './components/UserInputForm';
import ResultsPage from './components/ResultsPage';
import SavedInternshipsPage from './components/SavedInternshipsPage';
import { MOCK_INTERNSHIPS } from './data/internships';
import { findMatchingInternships } from './services/matchingService';
import { getSkillGapSuggestions } from './services/geminiService';

// Component to handle the main app logic and routing context
const AppContent = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [matchedInternships, setMatchedInternships] = useState<MatchedInternship[]>([]);
  const [savedInternships, setSavedInternships] = useState<Set<number>>(new Set());
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleGetStarted = () => {
    navigate('/form');
  };

  const handleFormSubmit = async (data: UserData) => {
    setUserData(data);
    setIsAiLoading(true);
    navigate('/results'); 

    const recommendations = findMatchingInternships(data.skills, MOCK_INTERNSHIPS);
    setMatchedInternships(recommendations);
    
    try {
        const suggestions = await getSkillGapSuggestions(data.skills, recommendations);
        setSkillSuggestions(suggestions);
    } catch (error) {
        console.error("Failed to get skill suggestions:", error);
        setSkillSuggestions(["Error loading suggestions."]);
    } finally {
        setIsAiLoading(false);
    }
  };
  
  const handleToggleSave = useCallback((id: number) => {
    setSavedInternships(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleBackToForm = () => {
    navigate('/form');
    setMatchedInternships([]);
    setSkillSuggestions([]);
  };
  
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage onGetStarted={handleGetStarted} />} />
          <Route path="/form" element={<UserInputForm onSubmit={handleFormSubmit} />} />
          <Route path="/results" element={
            userData ? (
                <ResultsPage 
                  userName={userData.name}
                  userSkills={userData.skills}
                  internships={matchedInternships} 
                  savedInternships={savedInternships}
                  onToggleSave={handleToggleSave}
                  skillSuggestions={skillSuggestions}
                  isAiLoading={isAiLoading}
                  onBack={handleBackToForm}
                />
            ) : (
                <Navigate to="/form" replace />
            )
          } />
          <Route path="/saved" element={
            userData ? (
                <SavedInternshipsPage
                    userSkills={userData.skills}
                    allInternships={MOCK_INTERNSHIPS}
                    savedInternships={savedInternships}
                    onToggleSave={handleToggleSave}
                />
            ) : (
                <Navigate to="/form" replace />
            )
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
    return (
        <HashRouter>
            <AppContent />
        </HashRouter>
    );
}

export default App;
