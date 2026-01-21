const ClinicalReports = require('../src/models/ClinicalReports');

async function testClinicalReportsModel() {
  console.log('🧪 Testing ClinicalReports Model...\n');
  
  const clinicId = 1;
  const dateFrom = '2024-01-01';
  const dateTo = '2024-12-31';
  
  try {
    // Test 1: Common Diagnoses
    console.log('📋 Testing Common Diagnoses...');
    const commonDiagnoses = await ClinicalReports.getCommonDiagnoses(clinicId, dateFrom, dateTo, 5);
    console.log(`✅ Found ${commonDiagnoses.length} common diagnoses`);
    commonDiagnoses.forEach((diagnosis, index) => {
      console.log(`  ${index + 1}. ${diagnosis.diagnosis_name} (${diagnosis.diagnosis_code}): ${diagnosis.frequency} cases, ${diagnosis.percentage}%`);
    });
    
    // Test 2: Diagnosis Frequency Analysis
    console.log('\n📊 Testing Diagnosis Frequency Analysis...');
    const frequencyAnalysis = await ClinicalReports.getDiagnosisFrequencyAnalysis(clinicId, dateFrom, dateTo);
    console.log(`✅ Found ${frequencyAnalysis.length} frequency analysis records`);
    if (frequencyAnalysis.length > 0) {
      console.log(`  Sample: ${frequencyAnalysis[0].diagnosis_name} - ${frequencyAnalysis[0].age_group} ${frequencyAnalysis[0].gender}: ${frequencyAnalysis[0].frequency} cases`);
    }
    
    // Test 3: Seasonal Trends
    console.log('\n📈 Testing Seasonal Diagnosis Trends...');
    const seasonalTrends = await ClinicalReports.getSeasonalDiagnosisTrends(clinicId, 2024);
    console.log(`✅ Found ${seasonalTrends.length} seasonal trend groups`);
    if (seasonalTrends.length > 0) {
      console.log(`  Sample: ${seasonalTrends[0].diagnosis_name} has ${seasonalTrends[0].monthly_data.length} months of data`);
    }
    
    // Test 4: Disease Prevalence
    console.log('\n🦠 Testing Disease Prevalence...');
    const prevalence = await ClinicalReports.getDiseasePrevalence(clinicId);
    console.log(`✅ Found ${prevalence.length} diseases with prevalence data`);
    prevalence.slice(0, 3).forEach((disease, index) => {
      console.log(`  ${index + 1}. ${disease.diagnosis_name}: ${disease.affected_patients} patients (${disease.prevalence_rate}%)`);
    });
    
    // Test 5: Lab Test Volumes
    console.log('\n🧪 Testing Lab Test Volumes...');
    const labVolumes = await ClinicalReports.getLabTestVolumes(clinicId, dateFrom, dateTo);
    console.log(`✅ Found ${labVolumes.length} lab test volume records`);
    labVolumes.slice(0, 3).forEach((test, index) => {
      console.log(`  ${index + 1}. ${test.test_name} (${test.category}): ${test.requests_count} requests, ${test.completion_rate}% completed`);
    });
    
    // Test 6: Lab Revenue
    console.log('\n💰 Testing Lab Revenue...');
    const labRevenue = await ClinicalReports.getLabRevenue(clinicId, dateFrom, dateTo);
    console.log(`✅ Found ${labRevenue.length} lab revenue records`);
    labRevenue.slice(0, 3).forEach((test, index) => {
      console.log(`  ${index + 1}. ${test.test_name}: ₱${test.actual_revenue} actual / ₱${test.potential_revenue} potential (${test.revenue_realization_rate}%)`);
    });
    
    // Test 7: Clinic Overview
    console.log('\n🏥 Testing Clinic Overview...');
    const overview = await ClinicalReports.getClinicOverview(clinicId, dateFrom, dateTo);
    console.log('✅ Clinic Overview Generated');
    console.log(`  Total Patients: ${overview.basic_stats.total_patients}`);
    console.log(`  Total Visits: ${overview.basic_stats.total_visits}`);
    console.log(`  Total Diagnoses: ${overview.basic_stats.total_diagnoses}`);
    console.log(`  Total Lab Requests: ${overview.basic_stats.total_lab_requests}`);
    console.log(`  Top Diagnoses: ${overview.top_diagnoses.length} records`);
    console.log(`  Lab Performance: ${overview.lab_performance.length} records`);
    
    console.log('\n✅ All Clinical Reports Model tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing Clinical Reports Model:', error);
  }
}

testClinicalReportsModel();