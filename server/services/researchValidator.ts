// Research Validation Service for Evidence-Based Content
// Handles fact-checking, source validation, and confidence scoring

import { notebookLMService, type ValidationResult } from './notebookLMService';
import type { 
  ResearchSource, 
  ResearchClaim, 
  ContentCitation,
  ContentQuality 
} from '@shared/schema';

export interface SourceQuality {
  overallScore: number; // 0-100
  peerReviewed: boolean;
  journalImpactFactor: number;
  methodologyScore: number;
  sampleSizeAdequate: boolean;
  biasRisk: 'low' | 'medium' | 'high' | 'unknown';
  recommendationLevel: 'gold_standard' | 'high' | 'medium' | 'low';
}

export interface FactCheckResult {
  isVerified: boolean;
  confidenceScore: number; // 0-100
  supportingSources: ResearchSource[];
  contradictingSources: ResearchSource[];
  gaps: string[];
  recommendations: string[];
}

export interface UnsupportedClaim {
  text: string;
  position: number;
  severity: 'high' | 'medium' | 'low';
  suggestedSources: string[];
}

export interface CitationValidation {
  isValid: boolean;
  accuracy: number; // 0-100
  issues: string[];
  suggestions: string[];
}

export interface Bibliography {
  sources: ResearchSource[];
  citationStyle: 'apa' | 'mla' | 'chicago';
  formatted: string;
}

export class ResearchValidator {
  
  async validateSource(source: Partial<ResearchSource>): Promise<SourceQuality> {
    console.log(`Validating source: ${source.title}`);
    
    let overallScore = 0;
    let methodologyScore = 0;
    let biasRisk: 'low' | 'medium' | 'high' | 'unknown' = 'unknown';
    
    // Assess peer review status (30 points)
    if (source.peerReviewed) {
      overallScore += 30;
    }
    
    // Assess journal quality (25 points)
    const journalScore = this.assessJournalQuality(source.journal || '');
    overallScore += journalScore;
    
    // Assess methodology (25 points)
    methodologyScore = this.assessMethodology(source);
    overallScore += methodologyScore;
    
    // Assess sample size (10 points)
    const sampleSizeAdequate = this.assessSampleSize(source.sampleSize || 0, source.methodologyType || '');
    if (sampleSizeAdequate) {
      overallScore += 10;
    }
    
    // Assess bias risk (10 points)
    biasRisk = this.assessBiasRisk(source);
    if (biasRisk === 'low') overallScore += 10;
    else if (biasRisk === 'medium') overallScore += 5;
    
    // Determine recommendation level
    let recommendationLevel: 'gold_standard' | 'high' | 'medium' | 'low';
    if (overallScore >= 90) recommendationLevel = 'gold_standard';
    else if (overallScore >= 75) recommendationLevel = 'high';
    else if (overallScore >= 60) recommendationLevel = 'medium';
    else recommendationLevel = 'low';
    
    return {
      overallScore,
      peerReviewed: source.peerReviewed || false,
      journalImpactFactor: source.impactFactor || 0,
      methodologyScore,
      sampleSizeAdequate,
      biasRisk,
      recommendationLevel
    };
  }

  async checkPeerReview(doi: string): Promise<boolean> {
    console.log(`Checking peer review status for DOI: ${doi}`);
    
    // Simulate DOI lookup - in production this would check against academic databases
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Most DOIs with proper format are peer-reviewed
    return doi.length > 10 && doi.includes('10.');
  }

  async assessMethodology(source: Partial<ResearchSource>): Promise<number> {
    const methodologyType = source.methodologyType?.toLowerCase() || '';
    
    // Score methodology types
    const methodologyScores: Record<string, number> = {
      'randomized controlled trial': 25,
      'systematic review': 25,
      'meta-analysis': 25,
      'cohort study': 20,
      'case-control study': 18,
      'cross-sectional study': 15,
      'laboratory study': 15,
      'observational study': 12,
      'case study': 8,
      'review article': 10,
      'expert opinion': 5
    };
    
    for (const [method, score] of Object.entries(methodologyScores)) {
      if (methodologyType.includes(method)) {
        return score;
      }
    }
    
    return 10; // Default score for unspecified methodology
  }

  async detectBias(source: Partial<ResearchSource>): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    concerns: string[];
    recommendations: string[];
  }> {
    const concerns: string[] = [];
    const recommendations: string[] = [];
    
    // Check funding source bias
    if (source.fundingSource?.toLowerCase().includes('industry')) {
      concerns.push('Industry funding may introduce commercial bias');
      recommendations.push('Consider additional independent studies');
    }
    
    // Check conflicts of interest
    if (source.conflictsOfInterest && source.conflictsOfInterest.length > 0) {
      concerns.push('Declared conflicts of interest present');
      recommendations.push('Evaluate findings in context of declared interests');
    }
    
    // Check sample size adequacy
    if (source.sampleSize && source.sampleSize < 30) {
      concerns.push('Small sample size may limit generalizability');
      recommendations.push('Look for studies with larger sample sizes');
    }
    
    // Determine overall risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (concerns.length === 0) riskLevel = 'low';
    else if (concerns.length <= 2) riskLevel = 'medium';
    else riskLevel = 'high';
    
    return { riskLevel, concerns, recommendations };
  }

  async factCheckContent(content: string): Promise<FactCheckResult> {
    console.log('Fact-checking content against research sources');
    
    // Extract claims from content
    const claims = this.extractFactualClaims(content);
    
    let totalConfidence = 0;
    const supportingSources: ResearchSource[] = [];
    const contradictingSources: ResearchSource[] = [];
    const gaps: string[] = [];
    const recommendations: string[] = [];
    
    // Validate each claim
    for (const claim of claims) {
      const validation = await notebookLMService.validateClaim(claim, 'default_notebook');
      
      if (validation.isSupported) {
        totalConfidence += 85;
      } else {
        totalConfidence += 30;
        gaps.push(`Insufficient evidence for: "${claim}"`);
        recommendations.push(`Add supporting research for claim about ${claim.substring(0, 50)}...`);
      }
    }
    
    const averageConfidence = claims.length > 0 ? totalConfidence / claims.length : 0;
    
    return {
      isVerified: averageConfidence > 70,
      confidenceScore: Math.round(averageConfidence),
      supportingSources,
      contradictingSources,
      gaps,
      recommendations
    };
  }

  async generateConfidenceScore(claims: ResearchClaim[]): Promise<number> {
    if (claims.length === 0) return 0;
    
    let totalScore = 0;
    
    for (const claim of claims) {
      // Score based on confidence rating
      let claimScore = 0;
      switch (claim.confidenceRating) {
        case 'gold_standard': claimScore = 95; break;
        case 'well_supported': claimScore = 80; break;
        case 'preliminary': claimScore = 60; break;
        case 'controversial': claimScore = 30; break;
        default: claimScore = 50;
      }
      
      // Adjust based on source count
      if (claim.sourceCount >= 5) claimScore += 5;
      else if (claim.sourceCount >= 3) claimScore += 3;
      else if (claim.sourceCount >= 2) claimScore += 1;
      
      // Adjust based on consensus level
      switch (claim.consensusLevel) {
        case 'strong': claimScore += 5; break;
        case 'moderate': claimScore += 2; break;
        case 'weak': claimScore -= 2; break;
        case 'conflicted': claimScore -= 5; break;
      }
      
      totalScore += Math.max(0, Math.min(100, claimScore));
    }
    
    return Math.round(totalScore / claims.length);
  }

  async identifyUnsupportedClaims(content: string): Promise<UnsupportedClaim[]> {
    console.log('Identifying unsupported claims in content');
    
    const claims = this.extractFactualClaims(content);
    const unsupportedClaims: UnsupportedClaim[] = [];
    
    for (let i = 0; i < claims.length; i++) {
      const claim = claims[i];
      const validation = await notebookLMService.validateClaim(claim, 'default_notebook');
      
      if (!validation.isSupported || validation.supportingSourceCount < 2) {
        const position = content.indexOf(claim);
        let severity: 'high' | 'medium' | 'low' = 'medium';
        
        // Determine severity based on claim type
        if (claim.includes('always') || claim.includes('never') || claim.includes('must')) {
          severity = 'high';
        } else if (claim.includes('may') || claim.includes('can') || claim.includes('might')) {
          severity = 'low';
        }
        
        unsupportedClaims.push({
          text: claim,
          position,
          severity,
          suggestedSources: validation.suggestedSources
        });
      }
    }
    
    return unsupportedClaims;
  }

  async suggestSources(claim: string): Promise<ResearchSource[]> {
    console.log(`Suggesting sources for claim: ${claim.substring(0, 50)}...`);
    
    // Simulate source suggestion based on claim content
    const suggestedSources: Partial<ResearchSource>[] = [];
    
    if (claim.toLowerCase().includes('fermentation')) {
      suggestedSources.push({
        title: 'Microbial ecology of sourdough fermentation: diverse or uniform?',
        authors: ['Marco Gobbetti', 'Aldo Corsetti'],
        journal: 'Food Microbiology',
        doi: '10.1016/j.fm.2023.104320',
        peerReviewed: true,
        sourceQuality: 'gold_standard'
      });
    }
    
    if (claim.toLowerCase().includes('temperature')) {
      suggestedSources.push({
        title: 'Temperature effects on sourdough fermentation dynamics',
        authors: ['Sarah Chen', 'Michael Torres'],
        journal: 'Applied and Environmental Microbiology',
        doi: '10.1128/AEM.2023.02156',
        peerReviewed: true,
        sourceQuality: 'high'
      });
    }
    
    if (claim.toLowerCase().includes('hydration')) {
      suggestedSources.push({
        title: 'Water content and bread texture: a systematic analysis',
        authors: ['Lisa Rodriguez', 'James Mitchell'],
        journal: 'Cereal Chemistry',
        doi: '10.1002/cche.2023.12456',
        peerReviewed: true,
        sourceQuality: 'high'
      });
    }
    
    return suggestedSources as ResearchSource[];
  }

  // Helper methods
  private extractFactualClaims(content: string): string[] {
    // Extract sentences that make factual claims
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 15);
    
    return sentences.filter(sentence => {
      const lower = sentence.toLowerCase();
      return (
        lower.includes(' is ') || 
        lower.includes(' are ') || 
        lower.includes(' causes ') ||
        lower.includes(' results in ') ||
        lower.includes(' leads to ') ||
        lower.includes(' produces ') ||
        lower.includes(' creates ') ||
        lower.includes(' requires ') ||
        lower.includes(' must ') ||
        lower.includes(' should ') ||
        lower.includes(' will ') ||
        lower.includes(' always ') ||
        lower.includes(' never ')
      );
    }).slice(0, 10); // Limit to 10 claims for performance
  }

  private assessJournalQuality(journal: string): number {
    // Simulate journal impact factor lookup
    const highImpactJournals = [
      'nature',
      'science',
      'cell',
      'food microbiology',
      'applied and environmental microbiology',
      'cereal chemistry',
      'journal of food science'
    ];
    
    const normalizedJournal = journal.toLowerCase();
    
    for (const highJournal of highImpactJournals) {
      if (normalizedJournal.includes(highJournal)) {
        return 25; // High impact journal
      }
    }
    
    if (journal.length > 0) {
      return 15; // Generic journal
    }
    
    return 0; // No journal specified
  }

  private assessSampleSize(sampleSize: number, methodologyType: string): boolean {
    const methodology = methodologyType.toLowerCase();
    
    // Different methodologies require different minimum sample sizes
    if (methodology.includes('meta-analysis')) return sampleSize >= 10; // 10 studies
    if (methodology.includes('systematic review')) return sampleSize >= 20; // 20 studies
    if (methodology.includes('randomized controlled trial')) return sampleSize >= 30;
    if (methodology.includes('cohort')) return sampleSize >= 100;
    if (methodology.includes('cross-sectional')) return sampleSize >= 100;
    if (methodology.includes('laboratory')) return sampleSize >= 20;
    if (methodology.includes('case study')) return sampleSize >= 1;
    
    return sampleSize >= 30; // Default minimum
  }

  private assessBiasRisk(source: Partial<ResearchSource>): 'low' | 'medium' | 'high' | 'unknown' {
    let riskFactors = 0;
    
    // Check funding source
    if (source.fundingSource?.toLowerCase().includes('industry')) {
      riskFactors += 2;
    }
    
    // Check conflicts of interest
    if (source.conflictsOfInterest && source.conflictsOfInterest.length > 0) {
      riskFactors += 1;
    }
    
    // Check sample size
    if (source.sampleSize && source.sampleSize < 30) {
      riskFactors += 1;
    }
    
    // Check methodology
    if (source.methodologyType?.toLowerCase().includes('case study')) {
      riskFactors += 1;
    }
    
    if (riskFactors === 0) return 'low';
    if (riskFactors <= 2) return 'medium';
    return 'high';
  }
}

export const researchValidator = new ResearchValidator();