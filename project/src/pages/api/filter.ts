import type { APIRoute } from 'astro';
import FilterService from '../../logic/filter_service';
import type { InputParams, ResultStage1 } from '../../logic/algo.interface';
import DataSets from '../../logic/core/models/datasets.model';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { stage, inputParams, stage1Result } = body;
    
    console.log('FilterService API called - Stage:', stage);
    
    if (stage === 1) {
      console.log('Executing Stage 1 algorithm...');
      const result = await FilterService.run_stage1(inputParams as InputParams);
      console.log('Stage 1 complete:', result);
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } 
    
    if (stage === 2) {
      console.log('Executing Stage 2 spectrum algorithm...');
      
      // Reconstruct DataSets object from JSON
      const candidatesData = stage1Result.candidates;
      const reconstructedCandidates = new DataSets(
        candidatesData.NP_KDS || [],
        candidatesData.NP_LDS || [],
        candidatesData.VS_KDS || [],
        candidatesData.VS_LDS || []
      );
      
      // Create properly typed ResultStage1
      const typedStage1Result: ResultStage1 = {
        ids: stage1Result.ids,
        candidates: reconstructedCandidates,
        version: stage1Result.version
      };
      
      const result = await FilterService.run_stage2(
        inputParams as InputParams,
        typedStage1Result
      );
      console.log('Stage 2 spectrum analysis complete:', result);
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw new Error('Invalid stage parameter');
    
  } catch (error) {
    console.error('FilterService API Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ 
    message: 'FilterService API is running',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};