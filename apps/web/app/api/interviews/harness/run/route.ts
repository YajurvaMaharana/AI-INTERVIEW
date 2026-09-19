import { NextResponse } from 'next/server';
import { runEvaluationRegressionHarness, BENCHMARK_TEST_CASES } from '@/lib/services/ai-engine/evaluation-harness.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const report = runEvaluationRegressionHarness(3);
    return NextResponse.json({
      success: true,
      report,
      benchmarkCasesCount: BENCHMARK_TEST_CASES.length,
      message: 'Evaluation quality and test harness executed successfully with deterministic consistency checks.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to execute evaluation regression harness',
      },
      { status: 500 }
    );
  }
}
