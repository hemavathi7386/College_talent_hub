const { HfInference } = require('@huggingface/inference');
const { Matrix } = require('ml-matrix');
const natural = require('natural');
const pdfParse = require('pdf-parse');
const fs = require('fs');

// Initialize HuggingFace client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

class EmbeddingService {
  constructor() {
    this.model = 'sentence-transformers/all-MiniLM-L6-v2';
    this.embeddingDimension = 384;
  }

  // Preprocess text for better embeddings
  preprocessText(text) {
    if (!text) return '';
    
    // Clean and normalize text
    let cleaned = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();
    
    // Remove stop words
    const stopWords = natural.stopwords;
    const words = cleaned.split(' ').filter(word => 
      word.length > 2 && !stopWords.includes(word)
    );
    
    return words.join(' ');
  }

  // Generate embeddings using HuggingFace
  async generateEmbedding(text) {
    try {
      const processedText = this.preprocessText(text);
      
      if (!processedText) {
        throw new Error('Empty text after preprocessing');
      }

      const response = await hf.featureExtraction({
        model: this.model,
        inputs: processedText
      });

      // Ensure we get a proper embedding array
      if (!Array.isArray(response) || response.length !== this.embeddingDimension) {
        throw new Error('Invalid embedding response from HuggingFace');
      }

      return response;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  // Convert job description to embedding
  async jobToEmbedding(jobData) {
    try {
      const { title, description, requiredSkills = [] } = jobData;
      
      // Combine job information
      const jobText = [
        title,
        description,
        requiredSkills.join(' ')
      ].filter(Boolean).join(' ');

      const embedding = await this.generateEmbedding(jobText);
      
      return {
        embedding,
        metadata: {
          title,
          description,
          requiredSkills,
          generatedAt: new Date()
        }
      };
    } catch (error) {
      console.error('Error converting job to embedding:', error);
      throw error;
    }
  }

  // Extract text from PDF resume
  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw error;
    }
  }

  // Convert student profile to embedding
  async studentToEmbedding(studentData) {
    try {
      const { skills = [], experiences = [], resumePath } = studentData;
      
      let resumeText = '';
      
      // Extract resume text if available
      if (resumePath && fs.existsSync(resumePath)) {
        resumeText = await this.extractTextFromPDF(resumePath);
      }

      // Combine experience descriptions
      const experienceText = experiences
        .map(exp => `${exp.title} ${exp.company} ${exp.description || ''}`)
        .join(' ');

      // Combine all student information
      const studentText = [
        skills.join(' '),
        experienceText,
        resumeText
      ].filter(Boolean).join(' ');

      const embedding = await this.generateEmbedding(studentText);
      
      return {
        embedding,
        metadata: {
          skills,
          experienceCount: experiences.length,
          hasResume: !!resumePath,
          generatedAt: new Date()
        }
      };
    } catch (error) {
      console.error('Error converting student to embedding:', error);
      throw error;
    }
  }

  // Calculate cosine similarity between two embeddings
  calculateCosineSimilarity(embedding1, embedding2) {
    try {
      if (!Array.isArray(embedding1) || !Array.isArray(embedding2)) {
        throw new Error('Embeddings must be arrays');
      }

      if (embedding1.length !== embedding2.length) {
        throw new Error('Embeddings must have the same dimension');
      }

      const vec1 = new Matrix([embedding1]);
      const vec2 = new Matrix([embedding2]);
      
      // Calculate dot product
      const dotProduct = vec1.mmul(vec2.transpose()).get(0, 0);
      
      // Calculate magnitudes
      const magnitude1 = Math.sqrt(vec1.mmul(vec1.transpose()).get(0, 0));
      const magnitude2 = Math.sqrt(vec2.mmul(vec2.transpose()).get(0, 0));
      
      // Calculate cosine similarity
      const similarity = dotProduct / (magnitude1 * magnitude2);
      
      return Math.max(0, Math.min(1, similarity)); // Clamp between 0 and 1
    } catch (error) {
      console.error('Error calculating cosine similarity:', error);
      return 0;
    }
  }

  // Find matching students for a job
  async findMatchingStudents(jobEmbedding, studentEmbeddings, threshold = 0.75) {
    try {
      const matches = [];

      for (const student of studentEmbeddings) {
        const similarity = this.calculateCosineSimilarity(
          jobEmbedding,
          student.embedding
        );

        if (similarity >= threshold) {
          matches.push({
            studentId: student.studentId,
            similarity: similarity,
            metadata: student.metadata
          });
        }
      }

      // Sort by similarity (highest first)
      matches.sort((a, b) => b.similarity - a.similarity);
      
      return matches;
    } catch (error) {
      console.error('Error finding matching students:', error);
      return [];
    }
  }

  // Batch process multiple students
  async batchProcessStudents(students) {
    try {
      const results = [];
      
      for (const student of students) {
        try {
          const result = await this.studentToEmbedding(student);
          results.push({
            studentId: student.id,
            ...result
          });
        } catch (error) {
          console.error(`Error processing student ${student.id}:`, error);
          // Continue with other students
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error in batch processing:', error);
      throw error;
    }
  }
}

module.exports = new EmbeddingService();
