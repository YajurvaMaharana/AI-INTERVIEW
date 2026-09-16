// ---------------------------------------------------------------------------
// /api/grounding/gap-analysis/route.ts — Gap Analysis API Endpoint
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server';
import { performGapAnalysis } from '@/lib/services/gap-analysis.service';
import { getUserById } from '@/lib/services/db.service';
import type { ResumeParsedData, JobDescriptionParsedData } from '@/lib/types/database.types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let { resumeData, jdData, userId } = body as {
      resumeData?: ResumeParsedData | null;
      jdData?: JobDescriptionParsedData | null;
      userId?: string;
    };

    // If data not directly passed, attempt lookup by userId
    if ((!resumeData || !jdData) && userId) {
      const user = await getUserById(userId);
      if (user) {
        if (!resumeData && user.resume_data) {
          resumeData = user.resume_data;
        }
        if (!jdData && user.saved_jd_data) {
          jdData = user.saved_jd_data;
        }
      }
    }

    // Default sample fallback if no resume/jd available yet
    if (!resumeData) {
      resumeData = {
        headline: 'Senior Full-Stack Engineer',
        summary: '5+ years building distributed web applications and high-throughput microservices.',
        skills: {
          languages: ['TypeScript', 'JavaScript', 'Go', 'Python', 'SQL'],
          frameworks: ['React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS'],
          databases: ['PostgreSQL', 'Redis', 'Supabase'],
          cloud_and_devops: ['Docker', 'AWS (S3, ECS, Lambda)', 'CI/CD GitHub Actions'],
          tools_and_architecture: ['Microservices', 'REST APIs', 'WebSockets', 'GraphQL', 'System Design'],
        },
        projects: [
          {
            name: 'Distributed Real-Time Messaging Hub',
            description: 'Scalable event-driven messaging service handling 80,000 WebSocket connections with sub-20ms latency.',
            technologies: ['TypeScript', 'Node.js', 'Redis Pub/Sub', 'PostgreSQL', 'Docker'],
            metrics_and_impact: ['Reduced P99 message delivery latency by 45%', 'Scaled to 5M messages daily without downtime'],
          },
          {
            name: 'Enterprise Design System & Dashboard',
            description: 'Full-featured analytics platform with customizable widget canvases and strict accessibility compliance.',
            technologies: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript'],
            metrics_and_impact: ['Accelerated cross-team UI delivery speed by 3x'],
          },
        ],
        experiences: [
          {
            company: 'TechFlow Systems',
            role: 'Senior Software Engineer',
            duration: '2022 - Present',
            responsibilities: [
              'Architected cloud backend services and real-time streaming endpoints.',
              'Mentored 4 junior engineers and led quarterly architecture reviews.',
            ],
            achievements: ['Decreased AWS cloud operational cost by 32% via query optimization.'],
            quantifiable_metrics: ['10M+ daily active requests', '99.99% service uptime SLA'],
            technologies: ['TypeScript', 'Next.js', 'PostgreSQL', 'AWS'],
          },
        ],
        education: [
          {
            institution: 'University of California, Berkeley',
            degree: 'B.S. in Computer Science',
            graduation_year: '2019',
          },
        ],
        grounding_summary: 'Senior full-stack candidate with proven distributed systems and real-time event pipeline experience.',
      };
    }

    if (!jdData) {
      jdData = {
        job_title: 'Senior Full-Stack & Distributed Systems Engineer',
        company_name: 'Apex Scale Cloud',
        seniority_level: 'Senior',
        domain_or_industry: 'Cloud Infrastructure & High-Scale Web Apps',
        required_skills: [
          'TypeScript',
          'React / Next.js',
          'Distributed Systems Design',
          'PostgreSQL & ACID Transactions',
          'High-Throughput Caching (Redis)',
          'REST & WebSocket Protocol Engineering',
        ],
        preferred_skills: [
          'Go / Rust',
          'Kubernetes Orchestration',
          'Kafka Event Streaming',
          'Multi-Region Database Replication',
          'Observability (Prometheus / Datadog)',
        ],
        core_responsibilities: [
          'Design and maintain low-latency APIs serving millions of concurrent requests.',
          'Lead technical architecture discussions, write RFCs, and drive zero-downtime migrations.',
          'Collaborate across product, design, and infrastructure teams to deliver high-impact features.',
        ],
        critical_keywords: ['CAP Theorem', 'Eventual Consistency', 'Sharding', 'WebSockets', 'P99 Latency', 'Rate Limiting', 'Idempotency'],
        evaluation_rubric_focus: [
          'Concurrency & Race Condition Mitigation',
          'System Design Scalability & Bottleneck Identification',
          'Code Modularity & Type Safety in TypeScript',
          'STAR Behavioral Communication & Ownership',
        ],
        calibration_summary: 'Evaluate the candidate on high-scale distributed architecture, caching strategies, and handling edge-case failure modes.',
      };
    }

    const gapAnalysis = await performGapAnalysis(resumeData, jdData);

    return NextResponse.json({
      success: true,
      analysis: gapAnalysis,
      source: {
        resumeHeadline: resumeData.headline || 'Resume Evidence Grounded',
        jobTitle: jdData.job_title,
        companyName: jdData.company_name || null,
      },
    });
  } catch (err: any) {
    console.error('[GapAnalysisRoute] Error executing gap analysis:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to perform gap analysis' },
      { status: 500 }
    );
  }
}
