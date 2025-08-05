const natural = require('natural');
const nlp = require('compromise');
const stringSimilarity = require('string-similarity');
const OpenAI = require('openai');

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Common tech skills dictionary
const TECH_SKILLS = {
  'programming': ['javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'typescript'],
  'frontend': ['react', 'vue', 'angular', 'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind', 'jquery'],
  'backend': ['node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'asp.net', 'fastapi'],
  'database': ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'sqlite'],
  'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'gitlab'],
  'mobile': ['react native', 'flutter', 'xamarin', 'ionic', 'swift', 'kotlin'],
  'ai_ml': ['tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'opencv', 'nlp'],
  'blockchain': ['ethereum', 'solidity', 'web3', 'polygon', 'solana', 'rust', 'smart contracts'],
  'devops': ['git', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'terraform', 'ansible'],
  'design': ['figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'ui/ux', 'wireframing']
};

class AIService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
    this.skillExtractor = this.createSkillExtractor();
  }

  // Create skill extractor using compromise
  createSkillExtractor() {
    return nlp;
  }

  // Extract skills from text using NLP
  async extractSkills(text) {
    try {
      // Use OpenAI for advanced skill extraction if available
      if (openai) {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a skill extraction expert. Extract technical skills, programming languages, frameworks, and tools from the given text. Return only the skills as a JSON array of strings, with no additional text."
            },
            {
              role: "user",
              content: `Extract skills from this text: ${text}`
            }
          ],
          temperature: 0.1,
          max_tokens: 200
        });

        const skills = JSON.parse(response.choices[0].message.content);
        return this.normalizeSkills(skills);
      } else {
        // Fall back to local extraction if OpenAI is not available
        return this.extractSkillsLocal(text);
      }
    } catch (error) {
      console.error('OpenAI skill extraction failed, falling back to local extraction:', error);
      return this.extractSkillsLocal(text);
    }
  }

  // Extract skills from profile data (bio, experience, etc.)
  async extractSkillsFromProfile(profileData) {
    try {
      const { bio, experience, education, linkedinUrl } = profileData;
      let combinedText = '';

      if (bio) combinedText += bio + ' ';
      if (experience) {
        experience.forEach(exp => {
          if (exp.title) combinedText += exp.title + ' ';
          if (exp.description) combinedText += exp.description + ' ';
        });
      }
      if (education) {
        education.forEach(edu => {
          if (edu.fieldOfStudy) combinedText += edu.fieldOfStudy + ' ';
          if (edu.degree) combinedText += edu.degree + ' ';
        });
      }

      if (!combinedText.trim()) {
        return [];
      }

      const extractedSkills = await this.extractSkills(combinedText);
      
      // Enhance skills with confidence levels
      return extractedSkills.map(skill => ({
        name: skill,
        level: 'intermediate', // Default level
        confidence: 0.8, // Default confidence
        source: 'ai_extraction'
      }));
    } catch (error) {
      console.error('Error extracting skills from profile:', error);
      return [];
    }
  }

  // Local skill extraction as fallback
  extractSkillsLocal(text) {
    const doc = this.skillExtractor(text.toLowerCase());
    const extractedSkills = new Set();

    // Extract skills using various methods
    Object.entries(TECH_SKILLS).forEach(([category, skills]) => {
      skills.forEach(skill => {
        if (text.toLowerCase().includes(skill.toLowerCase())) {
          extractedSkills.add(skill.toLowerCase());
        }
      });
    });

    // Extract using natural language processing
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    tokens.forEach(token => {
      if (token.length > 2) {
        Object.values(TECH_SKILLS).flat().forEach(skill => {
          if (skill.toLowerCase().includes(token) || token.includes(skill.toLowerCase())) {
            extractedSkills.add(skill.toLowerCase());
          }
        });
      }
    });

    return Array.from(extractedSkills);
  }

  // Normalize skill names
  normalizeSkills(skills) {
    const normalized = skills.map(skill => {
      const lower = skill.toLowerCase().trim();
      
      // Common variations
      const variations = {
        'js': 'javascript',
        'react.js': 'react',
        'nodejs': 'node.js',
        'postgres': 'postgresql',
        'ai': 'artificial intelligence',
        'ml': 'machine learning',
        'ui/ux': 'ui/ux design',
        'ui': 'ui design',
        'ux': 'ux design'
      };

      return variations[lower] || lower;
    });

    return [...new Set(normalized)];
  }

  // Calculate skill similarity between two skill sets
  calculateSkillSimilarity(skills1, skills2) {
    if (!skills1.length || !skills2.length) return 0;

    const normalized1 = skills1.map(s => s.toLowerCase());
    const normalized2 = skills2.map(s => s.toLowerCase());

    // Calculate Jaccard similarity
    const intersection = normalized1.filter(skill => normalized2.includes(skill));
    const union = [...new Set([...normalized1, ...normalized2])];
    
    return intersection.length / union.length;
  }

  // Calculate job-candidate matching score with enhanced analysis
  async calculateJobMatch(jobRequirements, candidateSkills, candidateProfile = {}) {
    try {
      if (openai) {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a job matching expert. Analyze the job requirements and candidate profile to provide a comprehensive matching score (0-100) and detailed feedback. Consider skills, experience level, and overall fit. Return a JSON object with 'score' (number), 'feedback' (string), 'matchedSkills' (array), 'missingSkills' (array), and 'recommendations' (array) fields."
            },
            {
              role: "user",
              content: `Job Requirements: ${JSON.stringify(jobRequirements)}\nCandidate Skills: ${JSON.stringify(candidateSkills)}\nCandidate Profile: ${JSON.stringify(candidateProfile)}`
            }
          ],
          temperature: 0.1,
          max_tokens: 500
        });

        return JSON.parse(response.choices[0].message.content);
      } else {
        // Use local matching if OpenAI is not available
        return this.calculateJobMatchLocal(jobRequirements, candidateSkills, candidateProfile);
      }
    } catch (error) {
      console.error('OpenAI job matching failed, using local matching:', error);
      return this.calculateJobMatchLocal(jobRequirements, candidateSkills, candidateProfile);
    }
  }

  // Local job matching as fallback with enhanced analysis
  calculateJobMatchLocal(jobRequirements, candidateSkills, candidateProfile = {}) {
    const requiredSkills = jobRequirements.skills || [];
    const candidateSkillNames = candidateSkills.map(s => s.name.toLowerCase());
    
    let matchedSkills = [];
    let missingSkills = [];
    let totalRequired = requiredSkills.length;
    
    requiredSkills.forEach(reqSkill => {
      const skillName = reqSkill.name.toLowerCase();
      if (candidateSkillNames.includes(skillName)) {
        matchedSkills.push(reqSkill.name);
      } else {
        missingSkills.push(reqSkill.name);
      }
    });

    const score = totalRequired > 0 ? (matchedSkills.length / totalRequired) * 100 : 0;
    
    let feedback = '';
    let recommendations = [];
    
    if (score >= 80) {
      feedback = 'Excellent match! You have most of the required skills for this position.';
      recommendations = ['Consider highlighting your relevant experience in your application', 'Your profile aligns well with this role'];
    } else if (score >= 60) {
      feedback = 'Good match. You have some required skills but may need to develop others.';
      recommendations = ['Focus on your transferable skills in your application', 'Consider taking courses in the missing skills'];
    } else if (score >= 40) {
      feedback = 'Partial match. Consider developing more of the required skills for this position.';
      recommendations = ['Consider similar roles that better match your current skills', 'Focus on upskilling in the missing areas'];
    } else {
      feedback = 'Low match. You may need to acquire more of the required skills for this position.';
      recommendations = ['Consider roles that better align with your current skills', 'Focus on building the required skill set'];
    }

    return { 
      score: Math.round(score), 
      feedback,
      matchedSkills,
      missingSkills,
      recommendations
    };
  }

  // Find similar jobs based on skills
  async findSimilarJobs(jobId, jobSkills, allJobs, limit = 5) {
    const similarities = [];

    for (const job of allJobs) {
      if (job._id.toString() === jobId.toString()) continue;
      
      const jobSkillNames = job.requirements.skills.map(s => s.name.toLowerCase());
      const similarity = this.calculateSkillSimilarity(jobSkills, jobSkillNames);
      
      similarities.push({
        job,
        similarity
      });
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .filter(item => item.similarity > 0.1);
  }

  // Generate job recommendations for a user
  async generateJobRecommendations(userSkills, availableJobs, limit = 10) {
    const recommendations = [];

    for (const job of availableJobs) {
      const jobSkillNames = job.requirements.skills.map(s => s.name.toLowerCase());
      const userSkillNames = userSkills.map(s => s.name.toLowerCase());
      
      const similarity = this.calculateSkillSimilarity(userSkillNames, jobSkillNames);
      
      if (similarity > 0.1) {
        recommendations.push({
          job,
          matchScore: Math.round(similarity * 100),
          matchedSkills: userSkillNames.filter(skill => jobSkillNames.includes(skill))
        });
      }
    }

    return recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  // Extract skills from resume text with enhanced parsing
  async extractSkillsFromResume(resumeText) {
    try {
      console.log('Starting resume skill extraction...');
      console.log('OpenAI available:', !!openai);
      
      if (openai) {
        console.log('Using OpenAI for skill extraction');
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Extract technical skills, programming languages, frameworks, tools, and technologies from this resume. Also identify experience level and years of experience for each skill. Return a JSON object with 'skills' (array of objects with name, level, yearsOfExperience), 'experienceLevel' (string), and 'keyHighlights' (array of strings)."
            },
            {
              role: "user",
              content: resumeText
            }
          ],
          temperature: 0.1,
          max_tokens: 400
        });

        console.log('OpenAI response received');
        const result = JSON.parse(response.choices[0].message.content);
        console.log('Parsed result:', result);
        
        return {
          skills: result.skills.map(skill => ({
            ...skill,
            name: this.normalizeSkills([skill.name])[0]
          })),
          experienceLevel: result.experienceLevel || 'intermediate',
          keyHighlights: result.keyHighlights || []
        };
      } else {
        console.log('Using local extraction (OpenAI not available)');
        // Use local extraction if OpenAI is not available
        const skills = this.extractSkillsLocal(resumeText);
        console.log('Local extraction result:', skills);
        
        return {
          skills: skills.map(skill => ({
            name: skill,
            level: 'intermediate',
            yearsOfExperience: 1
          })),
          experienceLevel: 'intermediate',
          keyHighlights: []
        };
      }
    } catch (error) {
      console.error('Resume skill extraction failed:', error);
      console.log('Falling back to local extraction');
      const skills = this.extractSkillsLocal(resumeText);
      return {
        skills: skills.map(skill => ({
          name: skill,
          level: 'intermediate',
          yearsOfExperience: 1
        })),
        experienceLevel: 'intermediate',
        keyHighlights: []
      };
    }
  }

  // Analyze job description and extract requirements
  async analyzeJobDescription(description) {
    try {
      if (openai) {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Analyze this job description and extract: 1) Required skills as JSON array, 2) Experience level (entry/mid/senior/lead), 3) Job category, 4) Key responsibilities. Return as JSON object."
            },
            {
              role: "user",
              content: description
            }
          ],
          temperature: 0.1,
          max_tokens: 400
        });

        return JSON.parse(response.choices[0].message.content);
      } else {
        // Use local analysis if OpenAI is not available
        return this.analyzeJobDescriptionLocal(description);
      }
    } catch (error) {
      console.error('Job description analysis failed:', error);
      return this.analyzeJobDescriptionLocal(description);
    }
  }

  // Local job description analysis as fallback
  analyzeJobDescriptionLocal(description) {
    const skills = this.extractSkillsLocal(description);
    
    // Simple experience level detection
    let experienceLevel = 'mid';
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('senior') || lowerDesc.includes('lead') || lowerDesc.includes('manager')) {
      experienceLevel = 'senior';
    } else if (lowerDesc.includes('entry') || lowerDesc.includes('junior') || lowerDesc.includes('intern')) {
      experienceLevel = 'entry';
    }

    // Simple category detection
    let category = 'general';
    if (lowerDesc.includes('frontend') || lowerDesc.includes('react') || lowerDesc.includes('vue')) {
      category = 'frontend';
    } else if (lowerDesc.includes('backend') || lowerDesc.includes('api') || lowerDesc.includes('server')) {
      category = 'backend';
    } else if (lowerDesc.includes('full stack') || lowerDesc.includes('fullstack')) {
      category = 'fullstack';
    }

    return {
      skills,
      experienceLevel,
      category,
      responsibilities: []
    };
  }

  // Generate personalized job alerts
  async generateJobAlerts(userProfile, availableJobs) {
    const userSkills = userProfile.skills.map(s => s.name.toLowerCase());
    const alerts = [];

    for (const job of availableJobs) {
      const jobSkills = job.requirements.skills.map(s => s.name.toLowerCase());
      const similarity = this.calculateSkillSimilarity(userSkills, jobSkills);
      
      if (similarity > 0.3) {
        alerts.push({
          job,
          matchScore: Math.round(similarity * 100),
          reason: `Matches ${Math.round(similarity * 100)}% of your skills`
        });
      }
    }

    return alerts
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  }

  // Generate smart suggestions for jobs and connections
  async generateSmartSuggestions(userProfile, availableJobs, availableUsers) {
    try {
      if (openai) {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a career advisor. Based on the user's profile and available opportunities, provide personalized suggestions for jobs and professional connections. Return a JSON object with 'jobSuggestions' (array of job recommendations with reasons), 'connectionSuggestions' (array of user recommendations with reasons), and 'careerAdvice' (array of general career tips)."
            },
            {
              role: "user",
              content: `User Profile: ${JSON.stringify(userProfile)}\nAvailable Jobs: ${JSON.stringify(availableJobs.slice(0, 10))}\nAvailable Users: ${JSON.stringify(availableUsers.slice(0, 10))}`
            }
          ],
          temperature: 0.3,
          max_tokens: 600
        });

        return JSON.parse(response.choices[0].message.content);
      } else {
        return this.generateSmartSuggestionsLocal(userProfile, availableJobs, availableUsers);
      }
    } catch (error) {
      console.error('Smart suggestions generation failed:', error);
      return this.generateSmartSuggestionsLocal(userProfile, availableJobs, availableUsers);
    }
  }

  // Local smart suggestions as fallback
  generateSmartSuggestionsLocal(userProfile, availableJobs, availableUsers) {
    const userSkills = userProfile.skills.map(s => s.name.toLowerCase());
    
    // Job suggestions based on skill matching
    const jobSuggestions = availableJobs
      .map(job => {
        const jobSkills = job.requirements.skills.map(s => s.name.toLowerCase());
        const similarity = this.calculateSkillSimilarity(userSkills, jobSkills);
        return {
          job,
          matchScore: Math.round(similarity * 100),
          reason: `Matches ${Math.round(similarity * 100)}% of your skills`
        };
      })
      .filter(suggestion => suggestion.matchScore > 30)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    // Connection suggestions based on skill similarity
    const connectionSuggestions = availableUsers
      .filter(user => user._id.toString() !== userProfile._id.toString())
      .map(user => {
        const userSkillNames = user.skills.map(s => s.name.toLowerCase());
        const similarity = this.calculateSkillSimilarity(userSkills, userSkillNames);
        return {
          user,
          matchScore: Math.round(similarity * 100),
          reason: `Shares ${Math.round(similarity * 100)}% of your skills`
        };
      })
      .filter(suggestion => suggestion.matchScore > 20)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    // Career advice based on profile analysis
    const careerAdvice = [];
    if (userSkills.length < 5) {
      careerAdvice.push('Consider adding more skills to your profile to increase job opportunities');
    }
    if (userProfile.experience && userProfile.experience.length < 2) {
      careerAdvice.push('Adding more work experience can help showcase your capabilities');
    }
    if (userProfile.education && userProfile.education.length < 1) {
      careerAdvice.push('Consider adding your educational background to complete your profile');
    }

    return {
      jobSuggestions,
      connectionSuggestions,
      careerAdvice
    };
  }

  // Analyze resume and suggest profile improvements
  async analyzeResumeAndSuggest(resumeText, currentProfile) {
    try {
      if (openai) {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Analyze this resume and compare it with the current profile. Suggest improvements and missing information. Return a JSON object with 'extractedSkills' (array), 'profileImprovements' (array of suggestions), 'missingInfo' (array), and 'strengths' (array)."
            },
            {
              role: "user",
              content: `Resume: ${resumeText}\nCurrent Profile: ${JSON.stringify(currentProfile)}`
            }
          ],
          temperature: 0.2,
          max_tokens: 500
        });

        return JSON.parse(response.choices[0].message.content);
      } else {
        return this.analyzeResumeAndSuggestLocal(resumeText, currentProfile);
      }
    } catch (error) {
      console.error('Resume analysis failed:', error);
      return this.analyzeResumeAndSuggestLocal(resumeText, currentProfile);
    }
  }

  // Local resume analysis as fallback
  analyzeResumeAndSuggestLocal(resumeText, currentProfile) {
    const extractedSkills = this.extractSkillsLocal(resumeText);
    const currentSkills = currentProfile.skills.map(s => s.name.toLowerCase());
    
    const profileImprovements = [];
    const missingInfo = [];
    const strengths = [];

    // Check for missing skills
    const missingSkills = extractedSkills.filter(skill => 
      !currentSkills.includes(skill.toLowerCase())
    );
    if (missingSkills.length > 0) {
      profileImprovements.push(`Add these skills to your profile: ${missingSkills.join(', ')}`);
    }

    // Check for missing profile sections
    if (!currentProfile.bio || currentProfile.bio.length < 50) {
      missingInfo.push('Add a comprehensive bio to your profile');
    }
    if (!currentProfile.experience || currentProfile.experience.length === 0) {
      missingInfo.push('Add your work experience to your profile');
    }
    if (!currentProfile.education || currentProfile.education.length === 0) {
      missingInfo.push('Add your educational background');
    }

    // Identify strengths
    if (extractedSkills.length > 5) {
      strengths.push('Strong technical skill set');
    }
    if (resumeText.length > 1000) {
      strengths.push('Comprehensive resume with detailed experience');
    }

    return {
      extractedSkills,
      profileImprovements,
      missingInfo,
      strengths
    };
  }
}

module.exports = AIService;